import { NextRequest, NextResponse } from "next/server";
import NodeCache from "node-cache";

// Initialize cache with 30-minute TTL (1800 seconds)
const flightCache = new NodeCache({ stdTTL: 1800, checkperiod: 120 });

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ callsign: string }> }
) {
  try {
    const { callsign } = await context.params;

    if (!callsign) {
      return NextResponse.json(
        { error: "Callsign is required" },
        { status: 400 }
      );
    }

    const cacheKey = `flight:${callsign.toUpperCase()}`;

    // Check cache first
    const cachedData = flightCache.get(cacheKey);
    if (cachedData) {
      console.log(`[FlightAware Cache HIT] ${callsign}`);
      return NextResponse.json(cachedData);
    }

    console.log(`[FlightAware Cache MISS] ${callsign} - Fetching from API...`);

    // Fetch from FlightAware AeroAPI v4
    const apiKey = process.env.FLIGHTAWARE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "FlightAware API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://aeroapi.flightaware.com/aeroapi/flights/${callsign}`,
      {
        headers: {
          "x-apikey": apiKey,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        // Flight not found - cache this result too to avoid repeated lookups
        const notFoundResult = { error: "Flight not found" };
        flightCache.set(cacheKey, notFoundResult, 300); // Cache 404s for 5 min only
        return NextResponse.json(notFoundResult, { status: 404 });
      }
      throw new Error(`FlightAware API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract first flight (most recent)
    const flight = data.flights?.[0];
    if (!flight) {
      const noDataResult = { error: "No flight data available" };
      flightCache.set(cacheKey, noDataResult, 300);
      return NextResponse.json(noDataResult, { status: 404 });
    }

    // Extract route information
    const routeData = {
      origin: {
        iata: flight.origin?.code_iata || flight.origin?.code_icao || "???",
        name: flight.origin?.name || "Unknown",
        city: flight.origin?.city || "",
        gate: flight.gate_origin || null,
        terminal: flight.terminal_origin || null,
      },
      destination: {
        iata:
          flight.destination?.code_iata ||
          flight.destination?.code_icao ||
          "???",
        name: flight.destination?.name || "Unknown",
        city: flight.destination?.city || "",
        gate: flight.gate_destination || null,
        terminal: flight.terminal_destination || null,
        baggage_claim: flight.baggage_claim || null,
      },
      times: {
        scheduled_out: flight.scheduled_out || null,
        estimated_out: flight.estimated_out || null,
        actual_out: flight.actual_out || null,
        scheduled_in: flight.scheduled_in || null,
        estimated_in: flight.estimated_in || null,
        actual_in: flight.actual_in || null,
      },
      status: flight.status || "Unknown",
      ident: flight.ident,
      aircraft_type: flight.aircraft_type,
      operator: flight.operator || null,
      codeshares: flight.codeshares || [],
      codeshares_iata: flight.codeshares_iata || [],
    };

    // Cache the result
    flightCache.set(cacheKey, routeData);
    console.log(
      `[FlightAware] Cached route for ${callsign}: ${routeData.origin.iata} → ${routeData.destination.iata} [${routeData.status}]`
    );

    return NextResponse.json(routeData);
  } catch (error) {
    console.error("[FlightAware API Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch flight data" },
      { status: 500 }
    );
  }
}

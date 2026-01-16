import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import next from "next";
import fetch from "node-fetch";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 8082;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// History store for trails
const historyStore: Record<string, Array<{ lat: number; lon: number }>> = {};
const MAX_HISTORY = 50;

// Statistics tracking (global for API access)
export const stats = {
  startTime: Date.now(),
  seenAircraft: new Set<string>(),
  messagesPerHour: Array(24)
    .fill(0)
    .map((_, i) => ({ hour: i, total: 0, adsb: 0, modeS: 0 })),
  coverage: Array(36)
    .fill(0)
    .map((_, i) => ({ angle: i * 10, maxDistance: 0, count: 0 })),
  messageTypes: {} as Record<string, number>,
  totalMessages: 0,
  maxDistance: 0,
};

// Helper: Calculate distance between two points (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper: Calculate bearing from receiver to aircraft
function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLon);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
    },
  });

  // Socket.IO connection handler
  io.on("connection", (socket) => {
    console.log("[Socket.IO] Client connected");
    socket.emit("aircraft-update", []);
  });

  // Initialize global stats for API access
  if (typeof global !== "undefined" && (global as any).setServerStats) {
    (global as any).setServerStats(stats);
  }

  // Fetch from dump1090 JSON API
  const dumpHost = process.env.DUMP1090_HOST || "192.168.3.7";
  const dumpPort = parseInt(process.env.DUMP1090_JSON_PORT || "8080");
  const dumpUrl = `http://${dumpHost}:${dumpPort}/data/aircraft.json`;

  // Broadcast loop - fetch JSON every second
  setInterval(async () => {
    try {
      const response = await fetch(dumpUrl);
      const data: any = await response.json();

      if (!data.aircraft || !Array.isArray(data.aircraft)) {
        return;
      }

      const formattedAircraft = data.aircraft.map((a: any) => {
        const hex = a.hex.toUpperCase();

        // Update history trail
        if (a.lat && a.lon) {
          if (!historyStore[hex]) historyStore[hex] = [];
          historyStore[hex].push({ lat: a.lat, lon: a.lon });
          if (historyStore[hex].length > MAX_HISTORY) {
            historyStore[hex].shift();
          }
        }

        return {
          hex: hex,
          lat: a.lat || 0,
          lon: a.lon || 0,
          altitude: a.altitude || 0,
          speed: a.speed || 0,
          heading: a.track || 0,
          callsign: (a.flight || "").trim(),
          vertRate: a.vert_rate || 0,
          squawk: a.squawk,
          category: a.category,
          messages: a.messages || 0,
          trace: historyStore[hex] || [],
        };
      });

      // Update statistics
      const receiverLat = parseFloat(
        process.env.LOCATION?.split(":")[0] || "0"
      );
      const receiverLon = parseFloat(
        process.env.LOCATION?.split(":")[1] || "0"
      );

      data.aircraft.forEach((a: any) => {
        if (!a.hex) return;

        // Track unique aircraft
        stats.seenAircraft.add(a.hex);

        // Update coverage pattern
        if (a.lat && a.lon && receiverLat && receiverLon) {
          const distance = calculateDistance(
            receiverLat,
            receiverLon,
            a.lat,
            a.lon
          );
          const bearing = calculateBearing(
            receiverLat,
            receiverLon,
            a.lat,
            a.lon
          );
          const angleIndex = Math.floor(bearing / 10);

          if (distance > stats.coverage[angleIndex].maxDistance) {
            stats.coverage[angleIndex].maxDistance = distance;
          }
          stats.coverage[angleIndex].count++;

          if (distance > stats.maxDistance) {
            stats.maxDistance = distance;
          }
        }
      });

      // Update messages per hour
      const currentHour = new Date().getHours();
      stats.messagesPerHour[currentHour].total += data.aircraft.length;
      stats.totalMessages += data.aircraft.length;

      // Update global stats for API
      if (typeof global !== "undefined" && (global as any).setServerStats) {
        (global as any).setServerStats(stats);
      }

      io.emit("aircraft-update", formattedAircraft);
    } catch (error) {
      console.error("[JSON API] Fetch error:", error);
    }
  }, 1000);

  io.on("connection", (socket) => {
    // Send immediate state on connection
    fetch(dumpUrl)
      .then((res: any) => res.json())
      .then((data: any) => {
        if (data.aircraft && Array.isArray(data.aircraft)) {
          const formattedAircraft = data.aircraft.map((a: any) => {
            const hex = a.hex.toUpperCase();
            return {
              hex: hex,
              lat: a.lat || 0,
              lon: a.lon || 0,
              altitude: a.altitude || 0,
              speed: a.speed || 0,
              heading: a.track || 0,
              callsign: (a.flight || "").trim(),
              vertRate: a.vert_rate || 0,
              squawk: a.squawk,
              category: a.category,
              messages: a.messages || 0,
              trace: historyStore[hex] || [],
            };
          });
          socket.emit("aircraft-update", formattedAircraft);
        }
      })
      .catch((err: any) =>
        console.error("[JSON API] Connection fetch error:", err)
      );
  });

  // Get location from env
  const locationStr = process.env.NEXT_PUBLIC_LOCATION || "55.75:37.61";
  const [lat, lng] = locationStr.split(":").map(Number);

  // Clean up old history periodically
  setInterval(() => {
    const now = Date.now();
    Object.keys(historyStore).forEach((hex) => {
      if (historyStore[hex].length === 0) {
        delete historyStore[hex];
      }
    });
  }, 60000);

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

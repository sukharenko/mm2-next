import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import net from "node:net";
// @ts-ignore
import ModeSDecoder from "mode-s-decoder";
// @ts-ignore
import AircraftStore from "mode-s-aircraft-store";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 8081;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Initialize Aircraft Store
const store = new AircraftStore({
  timeout: 60000,
});

// Auxiliary store for history/trace
// hex -> [lat, lon][]
const historyStore: Record<string, [number, number][]> = {};

// Extra data not stored by AircraftStore
// hex -> { vertRate, squawk, category, lastSeen }
const extraData: Record<
  string,
  { vertRate?: number; squawk?: string; category?: number; lastSeen: number }
> = {};

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  // Broadcast loop
  setInterval(() => {
    const aircraft = store.getAircrafts();
    const now = Date.now();

    // Clean up stale extraData
    for (const hex in extraData) {
      if (now - extraData[hex].lastSeen > 60000) {
        delete extraData[hex];
      }
    }

    const formattedAircraft = aircraft.map((a: any) => {
      // Fix: Convert decimal ICAO to Hex string
      const hex = Number(a.icao).toString(16).toUpperCase();
      const lat = a.lat;
      const lon = a.lng || a.lon;
      const extra = extraData[hex] || {};

      // Update history if we have a valid position
      if (lat && lon && hex) {
        if (!historyStore[hex]) historyStore[hex] = [];
        const path = historyStore[hex];
        const lastPos = path[path.length - 1];

        // Only add if moved significantly (approx 100m) to save bandwidth/mem
        // 0.001 deg is roughly 111m
        if (
          !lastPos ||
          Math.abs(lastPos[0] - lat) > 0.001 ||
          Math.abs(lastPos[1] - lon) > 0.001
        ) {
          path.push([lat, lon]);
          // Limit history to last 50 points
          if (path.length > 50) path.shift();
        }
      }

      return {
        ...a,
        hex: hex,
        lat: lat,
        lon: lon,
        messages: a.seen || 1,
        speed: a.speed,
        altitude: a.altitude,
        heading: a.heading,
        callsign: a.callsign,
        // Extended fields from extraData or store (store seems to track squawk maybe?)
        vertRate: extra.vertRate || a.vert_rate || 0,
        squawk: extra.squawk || a.squawk,
        category: extra.category || a.category,
        trace: historyStore[hex] || [],
      };
    });

    io.emit("aircraft-update", formattedAircraft);
  }, 1000);

  io.on("connection", (socket) => {
    console.log("Client connected");
    // Send immediate state
    const aircraft = store.getAircrafts();
    const formattedAircraft = aircraft.map((a: any) => {
      const hex = Number(a.icao).toString(16).toUpperCase();
      const extra = extraData[hex] || {};
      return {
        ...a,
        hex: hex,
        lat: a.lat,
        lon: a.lng || a.lon,
        speed: a.speed,
        altitude: a.altitude,
        heading: a.heading,
        callsign: a.callsign,
        vertRate: extra.vertRate || a.vert_rate || 0,
        squawk: extra.squawk || a.squawk,
        trace: historyStore[a.icao] || [],
      };
    });
    socket.emit("aircraft-update", formattedAircraft);
  });

  // Connect to dump1090
  const dumpHost = process.env.DUMP1090_HOST || "192.168.3.7";
  const dumpPort = parseInt(process.env.DUMP1090_PORT || "30005");

  console.log(`Connecting to dump1090 at ${dumpHost}:${dumpPort}...`);

  const client = new net.Socket();
  const decoder = new ModeSDecoder();
  let buffer = Buffer.alloc(0);

  client.connect(dumpPort, dumpHost, () => {
    console.log("Connected to dump1090!");
    // @ts-ignore
    const g = global as any;
    if (g.mockInterval) {
      clearInterval(g.mockInterval);
      g.mockInterval = null;
      g.mockStarted = false;
    }
  });

  client.on("data", (data) => {
    buffer = Buffer.concat([buffer, data]);

    while (buffer.length > 0) {
      const escapeIndex = buffer.indexOf(0x1a);
      if (escapeIndex === -1) {
        if (buffer.length > 4096) buffer = Buffer.alloc(0);
        break;
      }
      if (escapeIndex > 0) buffer = buffer.subarray(escapeIndex);
      if (buffer.length < 2) break;

      const type = buffer[1];
      if (![0x31, 0x32, 0x33, 0x34].includes(type)) {
        buffer = buffer.subarray(1);
        continue;
      }

      let neededDataBytes = 0;
      if (type === 0x32) neededDataBytes = 14;
      else if (type === 0x33) neededDataBytes = 21;
      else if (type === 0x31) neededDataBytes = 9;
      else if (type === 0x34) neededDataBytes = 7;

      const rawMessage = [];
      let readIdx = 2;
      let collected = 0;
      let possiblyIncomplete = false;

      while (readIdx < buffer.length && collected < neededDataBytes) {
        const b = buffer[readIdx];
        if (b === 0x1a) {
          if (readIdx + 1 >= buffer.length) {
            possiblyIncomplete = true;
            break;
          }
          if (buffer[readIdx + 1] === 0x1a) {
            rawMessage.push(0x1a);
            readIdx += 2;
          } else {
            break;
          }
        } else {
          rawMessage.push(b);
          readIdx++;
        }
        collected++;
      }

      if (collected < neededDataBytes || possiblyIncomplete) break;

      buffer = buffer.subarray(readIdx);
      const frameBytes = Buffer.from(rawMessage.slice(7));

      try {
        const messages = decoder.parse(frameBytes);
        if (Array.isArray(messages)) {
          messages.forEach((msg) => {
            if (msg) {
              // Manually extracting extra fields
              // Ensure we have an ICAO hex
              if (msg.icao) {
                // Fix conversion here too
                const hex = Number(msg.icao).toString(16).toUpperCase();
                if (!extraData[hex]) extraData[hex] = { lastSeen: Date.now() };

                const entry = extraData[hex];
                entry.lastSeen = Date.now();

                if (msg.vert_rate !== undefined) entry.vertRate = msg.vert_rate;
                if (msg.squawk !== undefined) entry.squawk = msg.squawk;
                if (msg.category !== undefined) entry.category = msg.category;
              }
              store.addMessage(msg);
            }
          });
        } else if (messages) {
          store.addMessage(messages);
          // Handle single message too
          if (messages.icao) {
            const hex = Number(messages.icao).toString(16).toUpperCase();
            if (!extraData[hex]) extraData[hex] = { lastSeen: Date.now() };
            const entry = extraData[hex];
            entry.lastSeen = Date.now();

            if (messages.vert_rate !== undefined)
              entry.vertRate = messages.vert_rate;
            if (messages.squawk !== undefined) entry.squawk = messages.squawk;
            if (messages.category !== undefined)
              entry.category = messages.category;
          }
        }
      } catch (e) {
        console.error("Decoder error:", e);
      }
    }
  });

  client.on("close", () => {
    setTimeout(() => client.connect(dumpPort, dumpHost), 5000);
  });

  client.on("error", (err) => {
    console.error("dump1090 error:", err.message);
    // @ts-ignore
    const g = global as any;
    if (!g.mockStarted) {
      g.mockStarted = true;
      startMockData();
    }
  });

  function startMockData() {
    const locationStr = process.env.NEXT_PUBLIC_LOCATION || "55.75:37.61";
    const [latStr, lonStr] = locationStr.split(":");
    const centerLat = parseFloat(latStr);
    const centerLon = parseFloat(lonStr);
    console.log(`Starting MOCK DATA at ${centerLat}, ${centerLon}`);

    const mockPlanes = Array.from({ length: 15 }).map((_, i) => ({
      hex: `MOCK${i.toString(16).padStart(2, "0")}`,
      lat: centerLat + (Math.random() - 0.5) * 0.5,
      lon: centerLon + (Math.random() - 0.5) * 0.5,
      heading: Math.random() * 360,
      speed: 150 + Math.random() * 300,
      altitude: 1000 + Math.random() * 30000,
      vert_rate: (Math.random() - 0.5) * 2000, // Mock vertical speed
      squawk: "1200",
      callsign: `TEST${i}`,
      messages: 0,
      lastSeen: Date.now(),
      icao: `MOCK${i.toString(16).padStart(2, "0")}`,
    }));

    // @ts-ignore
    const g = global as any;
    g.mockInterval = setInterval(() => {
      const updates: any[] = [];
      mockPlanes.forEach((p) => {
        const rad = (p.heading * Math.PI) / 180;
        p.lat += Math.cos(rad) * 0.0005;
        p.lon += Math.sin(rad) * 0.0005;
        p.lastSeen = Date.now();
        p.messages++;
        if (Math.abs(p.lat - centerLat) > 1)
          p.heading = (p.heading + 180) % 360;

        // Mock occasional V/S change
        if (Math.random() < 0.1) p.vert_rate = (Math.random() - 0.5) * 2000;

        updates.push({
          ...p,
          hex: p.icao,
          lon: p.lon,
          vertRate: p.vert_rate,
          trace: [], // Mock trace not implemented for simplicity here, but simple to add
        });
      });
      io.emit("aircraft-update", updates);
    }, 1000);
  }

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

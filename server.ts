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

"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface Aircraft {
  hex: string;
  callsign?: string;
  altitude?: number;
  speed?: number;
  heading?: number;
  lat?: number;
  lon?: number;
  vertRate?: number;
  squawk?: string;
  category?: string;
  trace?: { lat: number; lon: number }[];
  lastSeen: number;
  messages: number;
}

let socket: Socket;

export function useAircraft() {
  const [aircraft, setAircraft] = useState<Record<string, Aircraft>>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket
    // We connect to the same host/port as the Next.js app is serving
    // (since custom server handles both http and ws)
    const socketUrl = window.location.origin;

    if (!socket) {
      socket = io(socketUrl, {
        path: "/socket.io/", // default path
        transports: ["websocket"],
      });
    }

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onAircraftUpdate(data: Aircraft[]) {
      // console.log("Socket: Full Update", data.length, "planes", data);
      // Full update (e.g. on connect or cleanup)
      const nextState: Record<string, Aircraft> = {};
      data.forEach((p) => {
        nextState[p.hex] = p;
      });
      setAircraft(nextState);
    }

    function onSingleUpdate(plane: Aircraft) {
      // console.log("Socket: Single Update", plane.hex);
      setAircraft((prev) => ({
        ...prev,
        [plane.hex]: plane,
      }));
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("aircraft-update", onAircraftUpdate);
    socket.on("aircraft-single-update", onSingleUpdate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("aircraft-update", onAircraftUpdate);
      socket.off("aircraft-single-update", onSingleUpdate);
    };
  }, []);

  return { aircraft, isConnected };
}

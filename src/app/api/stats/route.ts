import { NextResponse } from "next/server";

// Note: This is a workaround to access server stats
// In production, you'd use a database or Redis
let serverStats: any = null;

// This will be called by server.ts to update stats
if (typeof global !== "undefined") {
  (global as any).getServerStats = () => serverStats;
  (global as any).setServerStats = (stats: any) => {
    serverStats = stats;
  };
}

export async function GET() {
  const stats = (global as any).getServerStats?.() || {
    seenAircraft: new Set(),
    messagesPerHour: Array(24)
      .fill(0)
      .map((_, i) => ({ hour: i, total: 0, adsb: 0, modeS: 0 })),
    coverage: Array(36)
      .fill(0)
      .map((_, i) => ({ angle: i * 10, maxDistance: 0, count: 0 })),
    messageTypes: {},
    totalMessages: 0,
    maxDistance: 0,
    startTime: Date.now(),
  };

  return NextResponse.json({
    contacts: [],
    messagesPerHour: stats.messagesPerHour,
    coverage: stats.coverage,
    messageTypes: stats.messageTypes,
    summary: {
      totalAircraft: stats.seenAircraft.size || 0,
      totalMessages: stats.totalMessages,
      maxDistance: stats.maxDistance,
      uptime: Math.floor((Date.now() - stats.startTime) / 1000),
    },
  });
}

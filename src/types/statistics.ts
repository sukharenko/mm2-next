export interface Statistics {
  // Contacts over time (last 24 hours, hourly buckets)
  contacts: {
    timestamp: number;
    count: number;
    maxDistance: number;
  }[];

  // Messages per hour (last 24 hours)
  messagesPerHour: {
    hour: number; // 0-23
    total: number;
    adsb: number;
    modeS: number;
  }[];

  // Coverage pattern (360° polar, 10° buckets)
  coverage: {
    angle: number; // 0-359
    maxDistance: number;
    count: number;
  }[];

  // Message types breakdown
  messageTypes: {
    [type: string]: number;
  };

  // Summary stats
  summary: {
    totalAircraft: number;
    totalMessages: number;
    maxDistance: number;
    uptime: number; // seconds
  };
}

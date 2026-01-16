"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

// Dynamic imports for Highcharts (avoid SSR issues)
let Highcharts: any;
let HighchartsReact: any;

interface StatsModalProps {
  onClose: () => void;
}

export function StatsModal({ onClose }: StatsModalProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    // Initialize Highcharts dynamically (client-side only)
    const initHighcharts = async () => {
      Highcharts = (await import("highcharts")).default;
      HighchartsReact = (await import("highcharts-react-official")).default;
      // Import highcharts-more for side effect (adds polar charts)
      await import("highcharts/highcharts-more");
      setChartsReady(true);
    };

    initHighcharts();

    // Fetch stats from API
    const fetchStats = () => {
      fetch("/api/stats")
        .then((res) => res.json())
        .then((data) => {
          setStats(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load stats:", err);
          setLoading(false);
        });
    };

    // Initial fetch
    fetchStats();

    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading || !chartsReady) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
        <div className="text-white text-xl">Loading statistics...</div>
      </div>
    );
  }

  // Coverage Pattern Chart (Polar - Multi-series style)
  const coverageOptions: Highcharts.Options = {
    chart: {
      polar: true,
      backgroundColor: "transparent",
    },
    title: {
      text: "Coverage Pattern (km)",
      style: {
        color: "#fff",
        fontSize: "18px",
        fontWeight: "600",
      },
    },
    pane: {
      startAngle: 0,
      endAngle: 360,
      size: "85%",
    },
    xAxis: {
      tickInterval: 45,
      min: 0,
      max: 360,
      labels: {
        style: { color: "#94a3b8", fontSize: "12px" },
        formatter: function () {
          return this.value + "°";
        },
      },
      gridLineColor: "#334155",
      lineColor: "#475569",
    },
    yAxis: {
      min: 0,
      labels: {
        style: { color: "#94a3b8" },
      },
      gridLineColor: "#334155",
      endOnTick: false,
      showLastLabel: true,
    },
    plotOptions: {
      series: {
        pointStart: 0,
        pointInterval: 10,
      },
    },
    series: [
      {
        type: "area",
        name: "Coverage Area",
        data: stats?.coverage?.map((c: any) => c.maxDistance) || [],
        color: "rgba(239, 68, 68, 0.3)",
        fillOpacity: 0.3,
        lineWidth: 0,
        marker: {
          enabled: false,
        },
      },
      {
        type: "line",
        name: "Max Distance",
        data: stats?.coverage?.map((c: any) => c.maxDistance) || [],
        color: "#ef4444",
        lineWidth: 3,
        marker: {
          enabled: false,
        },
      },
    ],
    legend: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      borderColor: "#ef4444",
      borderWidth: 2,
      style: {
        color: "#fff",
        fontSize: "13px",
      },
      shared: true,
      formatter: function () {
        return `<b>${this.x}°</b><br/>Max Distance: <b>${this.points?.[0]?.y?.toFixed(2)} km</b>`;
      },
    },
  };

  // Messages Per Hour Chart
  const messagesOptions: Highcharts.Options = {
    chart: {
      type: "column",
      backgroundColor: "transparent",
    },
    title: {
      text: "Messages / Hours",
      style: { color: "#fff" },
    },
    xAxis: {
      categories: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      labels: {
        style: { color: "#94a3b8" },
      },
      gridLineColor: "#334155",
    },
    yAxis: {
      min: 0,
      title: {
        text: "Messages",
        style: { color: "#94a3b8" },
      },
      labels: {
        style: { color: "#94a3b8" },
      },
      gridLineColor: "#334155",
    },
    plotOptions: {
      column: {
        stacking: "normal",
      },
    },
    series: [
      {
        type: "column",
        name: "ADS-B",
        data: stats?.messagesPerHour?.map((m: any) => m.adsb) || [],
        color: "#3b82f6",
      },
      {
        type: "column",
        name: "Mode-S",
        data: stats?.messagesPerHour?.map((m: any) => m.modeS) || [],
        color: "#ef4444",
      },
    ],
    legend: {
      itemStyle: { color: "#94a3b8" },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      borderColor: "#334155",
      style: { color: "#fff" },
      shared: true,
    },
    credits: {
      enabled: false,
    },
  };

  // Contacts / Distance Chart (Area)
  const contactsOptions: Highcharts.Options = {
    chart: {
      type: "area",
      backgroundColor: "transparent",
    },
    title: {
      text: "Contacts / Distance",
      style: { color: "#fff" },
    },
    xAxis: {
      categories: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      labels: {
        style: { color: "#94a3b8" },
      },
      gridLineColor: "#334155",
    },
    yAxis: [
      {
        title: {
          text: "Contacts",
          style: { color: "#3b82f6" },
        },
        labels: {
          style: { color: "#94a3b8" },
        },
        gridLineColor: "#334155",
      },
      {
        title: {
          text: "Distance (km)",
          style: { color: "#ef4444" },
        },
        labels: {
          style: { color: "#94a3b8" },
        },
        opposite: true,
        gridLineColor: "transparent",
      },
    ],
    series: [
      {
        type: "area",
        name: "Contacts",
        data: stats?.messagesPerHour?.map((m: any) => m.total / 100) || [],
        color: "#3b82f6",
        fillOpacity: 0.3,
        yAxis: 0,
      },
      {
        type: "line",
        name: "Max Distance",
        data: stats?.coverage?.map((c: any) => c.maxDistance) || [],
        color: "#ef4444",
        yAxis: 1,
      },
    ],
    legend: {
      itemStyle: { color: "#94a3b8" },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      borderColor: "#334155",
      style: { color: "#fff" },
      shared: true,
    },
    credits: {
      enabled: false,
    },
  };

  // Messages Breakdown (Pie)
  const breakdownOptions: Highcharts.Options = {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
    },
    title: {
      text: "Messages Breakdown",
      style: { color: "#fff" },
    },
    plotOptions: {
      pie: {
        innerSize: "60%",
        dataLabels: {
          enabled: true,
          format: "{point.name}: {point.percentage:.1f}%",
          style: {
            color: "#94a3b8",
          },
        },
      },
    },
    series: [
      {
        type: "pie",
        name: "Messages",
        data: [
          {
            name: "ADS-B",
            y:
              stats?.messagesPerHour?.reduce(
                (sum: number, m: any) => sum + m.adsb,
                0
              ) || 0,
            color: "#3b82f6",
          },
          {
            name: "Mode-S",
            y:
              stats?.messagesPerHour?.reduce(
                (sum: number, m: any) => sum + m.modeS,
                0
              ) || 0,
            color: "#ef4444",
          },
        ],
      },
    ],
    legend: {
      itemStyle: { color: "#94a3b8" },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      borderColor: "#334155",
      style: { color: "#fff" },
      pointFormat: "<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)",
    },
    credits: {
      enabled: false,
    },
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            Statistics Dashboard
          </h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="text-sm text-slate-400 mb-1">Total Aircraft</div>
            <div className="text-3xl font-bold text-white">
              {stats?.summary?.totalAircraft || 0}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="text-sm text-slate-400 mb-1">Total Messages</div>
            <div className="text-3xl font-bold text-white">
              {stats?.summary?.totalMessages?.toLocaleString() || 0}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="text-sm text-slate-400 mb-1">Max Distance</div>
            <div className="text-3xl font-bold text-white">
              {stats?.summary?.maxDistance?.toFixed(2) || 0} km
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="text-sm text-slate-400 mb-1">Uptime</div>
            <div className="text-3xl font-bold text-white">
              {Math.floor((stats?.summary?.uptime || 0) / 3600)}h
            </div>
          </div>
        </div>

        {/* Charts Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-6">
          {/* Coverage Pattern */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <HighchartsReact
              highcharts={Highcharts}
              options={coverageOptions}
            />
          </div>

          {/* Messages Per Hour */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <HighchartsReact
              highcharts={Highcharts}
              options={messagesOptions}
            />
          </div>

          {/* Contacts / Distance */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <HighchartsReact
              highcharts={Highcharts}
              options={contactsOptions}
            />
          </div>

          {/* Messages Breakdown */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <HighchartsReact
              highcharts={Highcharts}
              options={breakdownOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { MapContainer } from "@/components/Map/MapContainer";
import { AircraftMarker } from "@/components/Map/AircraftMarker";
import { RangeRings } from "@/components/Map/RangeRings";
import { useAircraft, Aircraft } from "@/hooks/useAircraft";
import { AircraftDetailPanel } from "@/components/AircraftDetailPanel";
import { Plane, SignalHigh, WifiOff, ArrowUp, ArrowDown } from "lucide-react";
import clsx from "clsx";

export default function Home() {
  const { aircraft, isConnected } = useAircraft();
  const planes = Object.values(aircraft);

  // Parse location for rings
  const [stationPos] = useState(() => {
    const loc = process.env.NEXT_PUBLIC_LOCATION;
    if (loc) {
      const [lat, lng] = loc.split(":").map(Number);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }
    return { lat: 55.75, lng: 37.61 };
  });

  const [selectedPlane, setSelectedPlane] = useState<Aircraft | null>(null);
  const [focusedLocation, setFocusedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handlePlaneClick = (plane: Aircraft) => {
    setSelectedPlane(plane);
    if (plane.lat && plane.lon) {
      setFocusedLocation({ lat: plane.lat, lng: plane.lon });
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden text-white bg-black">
      {/* Map Layer */}
      <MapContainer focusedLocation={focusedLocation}>
        <RangeRings center={stationPos} />
        {planes.map((plane) => (
          <AircraftMarker
            key={plane.hex}
            aircraft={plane}
            selected={selectedPlane?.hex === plane.hex}
            onClick={() => handlePlaneClick(plane)}
          />
        ))}
      </MapContainer>

      {/* Detail Panel */}
      <AircraftDetailPanel
        aircraft={selectedPlane}
        onClose={() => setSelectedPlane(null)}
      />

      {/* UI Overlay - Top Bar */}
      <div className="absolute top-4 left-4 right-4 h-16 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 flex items-center px-6 justify-between shadow-2xl z-10 transition-all hover:bg-black/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/20 rounded-lg text-sky-400">
            <Plane size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">mm2-next</h1>
            <p className="text-xs text-white/50 font-mono tracking-widest uppercase">
              Mode-S Mixer Reimagined
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-2xl font-light tabular-nums leading-none">
              {planes.length}
            </span>
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
              Active Aircraft
            </span>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors",
              isConnected
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            )}
          >
            {isConnected ? <SignalHigh size={14} /> : <WifiOff size={14} />}
            <span>{isConnected ? "LIVE FEED" : "DISCONNECTED"}</span>
          </div>
        </div>
      </div>

      {/* Sidebar - Aircraft List */}
      <div className="absolute top-24 bottom-4 left-4 w-80 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl z-10">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white/80">Aircraft List</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {planes
            .sort((a, b) => b.lastSeen - a.lastSeen)
            .map((plane) => (
              <div
                key={plane.hex}
                onClick={() => handlePlaneClick(plane)}
                className={clsx(
                  "group flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer border border-transparent",
                  "hover:bg-white/5 hover:border-white/5",
                  selectedPlane?.hex === plane.hex &&
                    "bg-white/10 border-white/10",
                  !plane.lat && "opacity-50 grayscale"
                )}
              >
                <div className="flex flex-col">
                  <span
                    className={clsx(
                      "font-mono font-bold flex items-center gap-2",
                      plane.lat ? "text-sky-400" : "text-white/40"
                    )}
                  >
                    {plane.callsign || plane.hex}
                    {/* V/S Arrows in List */}
                    {(plane.vertRate || 0) > 100 && (
                      <ArrowUp size={12} className="text-emerald-400" />
                    )}
                    {(plane.vertRate || 0) < -100 && (
                      <ArrowDown size={12} className="text-rose-400" />
                    )}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">
                    {plane.hex}
                    {!plane.lat && (
                      <span className="ml-2 text-rose-500 font-bold uppercase tracking-wider text-[8px]">
                        No Pos
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex flex-col items-end text-xs text-white/60 tabular-nums">
                  <span>
                    {plane.altitude
                      ? Math.round(plane.altitude) + " ft"
                      : "---"}
                  </span>
                  <span>
                    {plane.speed ? Math.round(plane.speed) + " kts" : "---"}
                  </span>
                </div>
              </div>
            ))}
          {planes.length === 0 && (
            <div className="p-8 text-center text-white/20 text-sm">
              No aircraft detected in range.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

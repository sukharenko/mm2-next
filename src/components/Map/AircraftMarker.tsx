"use client";

import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { useMemo } from "react";
import { Aircraft } from "@/hooks/useAircraft";
import { Plane } from "lucide-react";
import clsx from "clsx";
import { TrajectoryLine } from "./TrajectoryLine";
import { useSettings } from "@/contexts/SettingsContext";

export function AircraftMarker({
  aircraft,
  selected,
  onClick,
}: {
  aircraft: Aircraft;
  selected?: boolean;
  onClick?: () => void;
}) {
  const { formatAltitude } = useSettings();

  const position = useMemo(() => {
    if (aircraft.lat && aircraft.lon) {
      return { lat: aircraft.lat, lng: aircraft.lon };
    }
    // Fallback to last known position from trace
    if (aircraft.trace && aircraft.trace.length > 0) {
      const last = aircraft.trace[aircraft.trace.length - 1];
      return { lat: last.lat, lng: last.lon };
    }
    return null; // Or some default/error handling
  }, [aircraft.lat, aircraft.lon, aircraft.trace]);

  if (!position) return null;

  const isClimbing = (aircraft.vertRate || 0) > 100;
  const isDescending = (aircraft.vertRate || 0) < -100;

  return (
    <>
      {selected && aircraft.trace && aircraft.trace.length > 1 && (
        <TrajectoryLine
          path={aircraft.trace.map((p) => ({ lat: p.lat, lng: p.lon }))}
          color="#38bdf8"
        />
      )}
      <AdvancedMarker
        position={position}
        onClick={onClick}
        className="group"
        zIndex={selected ? 50 : 1}
      >
        <div
          className={clsx(
            "transition-all duration-1000 ease-linear relative",
            selected
              ? "text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.9)] scale-125"
              : "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
          )}
          style={{
            transform: `rotate(${(aircraft.heading || 0) - 47}deg) translateX(11px) translateY(-7px)`,
          }}
        >
          <Plane size={24} fill="currentColor" />
        </div>

        {/* V/S Indicator */}
        {(isClimbing || isDescending) && (
          <div
            className={clsx(
              "absolute top-0 -right-3 text-[10px] font-bold",
              isClimbing ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {isClimbing ? "↑" : "↓"}
          </div>
        )}

        {/* Label */}
        <div
          className={clsx(
            "absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-mono px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none transition-all",
            selected
              ? "bg-sky-500 text-white font-bold z-50 scale-110"
              : "text-white bg-black/50 group-hover:bg-black/70 group-hover:scale-110"
          )}
        >
          <div className="flex flex-col items-center leading-none gap-0.5">
            <span>{aircraft.callsign || aircraft.hex}</span>
            {selected && (
              <span className="text-[8px] opacity-80">
                {aircraft.altitude ? formatAltitude(aircraft.altitude) : ""}
              </span>
            )}
          </div>
        </div>
      </AdvancedMarker>
    </>
  );
}

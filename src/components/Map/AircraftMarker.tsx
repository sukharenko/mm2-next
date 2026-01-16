"use client";

import { useMemo } from "react";
import { CustomOverlay } from "./CustomOverlay";
import { Aircraft } from "@/hooks/useAircraft";
import clsx from "clsx";
import { TrajectoryLine } from "./TrajectoryLine";
import { useSettings } from "@/contexts/SettingsContext";
import { PlaneIcon } from "./PlaneIcon";

export function AircraftMarker({
  aircraft,
  selected,
  onSelect,
}: {
  aircraft: Aircraft;
  selected?: boolean;
  onSelect: (hex: string) => void;
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
    return null;
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

      <CustomOverlay position={position} zIndex={selected ? 100 : 10}>
        <div
          onClick={() => onSelect(aircraft.hex)}
          className={clsx(
            "cursor-pointer transition-all duration-1000 ease-linear relative",
            selected
              ? "text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.9)] scale-125"
              : "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
          )}
          style={{
            // Rotate around center - FA plane faces right, subtract 90
            transform: `rotate(${(aircraft.heading || 0) - 90}deg)`,
            transformOrigin: "50% 50%",
          }}
        >
          <PlaneIcon size={32} />

          {/* V/S Indicator */}
          {(isClimbing || isDescending) && (
            <div
              className={clsx(
                "absolute top-0 -right-3 text-[10px] font-bold",
                isClimbing ? "text-emerald-400" : "text-rose-400"
              )}
              style={{
                transform: `rotate(${90 - (aircraft.heading || 0)}deg)`,
              }}
            >
              {isClimbing ? "↑" : "↓"}
            </div>
          )}
        </div>

        {/* Callsign label - outside rotation */}
        {aircraft.callsign && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded pointer-events-none">
            {aircraft.callsign.trim()}
            {aircraft.altitude && (
              <span className="ml-1 text-[9px] text-sky-300">
                {formatAltitude(aircraft.altitude)}
              </span>
            )}
          </div>
        )}
      </CustomOverlay>
    </>
  );
}

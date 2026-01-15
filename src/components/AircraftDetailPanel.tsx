import { X, ArrowUp, ArrowDown, Plane } from "lucide-react";
import { Aircraft } from "@/hooks/useAircraft";
import { getCountryFromHex } from "@/utils/icao";
import { useState, useEffect } from "react";
import clsx from "clsx";

interface AircraftDetailPanelProps {
  aircraft: Aircraft | null;
  onClose: () => void;
}

export function DetailedStat({
  label,
  value,
  highlight,
  extra,
}: {
  label: string;
  value: string;
  highlight?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col p-4 bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
      <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">
        {label}
      </span>
      <div className="flex items-end gap-2">
        <span
          className={clsx(
            "text-xl font-mono tracking-tight",
            highlight ? highlight : "text-white/90"
          )}
        >
          {value}
        </span>
        {extra}
      </div>
    </div>
  );
}

export function AircraftDetailPanel({
  aircraft,
  onClose,
}: AircraftDetailPanelProps) {
  const [imageError, setImageError] = useState(false);

  // Reset image error when aircraft changes
  useEffect(() => {
    setImageError(false);
  }, [aircraft?.hex]);

  if (!aircraft) return null;

  const hexStr = String(aircraft.hex || "");
  const isMock = hexStr.startsWith("MOCK");
  const vertRate = aircraft.vertRate || 0;
  const isClimbing = vertRate > 100;
  const isDescending = vertRate < -100;
  const country = getCountryFromHex(hexStr);

  // Use JetPhotos CDN for real planes, might work for some
  const imageUrl = `https://cdn.jetphotos.com/full/5/12345_${hexStr}.jpg`;
  const placeholderUrl =
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop";

  return (
    <div className="absolute top-24 right-4 w-96 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl z-20 animate-in slide-in-from-right fade-in duration-300 ring-1 ring-white/10">
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex justify-between items-start bg-gradient-to-r from-sky-900/20 to-transparent">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl" title={country.name}>
              {country.flag}
            </span>
            <h2 className="text-3xl font-bold text-sky-400 font-mono tracking-tight">
              {aircraft.callsign || aircraft.hex}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-white/50 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
              {aircraft.hex}
            </span>
            {aircraft.squawk && (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                SQK {aircraft.squawk}
              </span>
            )}
            {country.name !== "Unknown" && (
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                {country.name}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-px bg-white/10 border-b border-white/10">
        <DetailedStat
          label="ALTITUDE"
          value={
            aircraft.altitude ? `${Math.round(aircraft.altitude)} ft` : "---"
          }
          extra={
            <>
              {isClimbing && (
                <ArrowUp size={16} className="text-emerald-400 animate-pulse" />
              )}
              {isDescending && (
                <ArrowDown size={16} className="text-rose-400 animate-pulse" />
              )}
            </>
          }
        />
        <DetailedStat
          label="SPEED"
          value={aircraft.speed ? `${Math.round(aircraft.speed)} kts` : "---"}
        />
        <DetailedStat
          label="HEADING"
          value={aircraft.heading ? `${Math.round(aircraft.heading)}°` : "---"}
        />
        <DetailedStat
          label="VERT RATE"
          value={vertRate !== 0 ? `${vertRate} fpm` : "Level"}
          highlight={
            isClimbing
              ? "text-emerald-400"
              : isDescending
                ? "text-rose-400"
                : undefined
          }
        />
      </div>

      {/* Image Area */}
      <div className="relative h-56 bg-black/50 overflow-hidden group">
        {!imageError ? (
          <img
            src={placeholderUrl}
            alt="Aircraft"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-3 bg-white/5">
            <div className="p-4 rounded-full bg-white/5">
              <Plane size={48} strokeWidth={1} />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest opacity-50">
              Visual Unavailable
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
          <div className="flex items-center gap-2 text-[10px] text-white/60 font-mono">
            <div className="flex flex-col">
              <span className="uppercase tracking-widest text-white/30">
                Category
              </span>
              <span className="text-white/80">
                {aircraft.category ? `CAT ${aircraft.category}` : "Unknown"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

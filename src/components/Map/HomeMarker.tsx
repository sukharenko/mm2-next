"use client";

import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { Radio } from "lucide-react";

export function HomeMarker({
  position,
}: {
  position: { lat: number; lng: number };
}) {
  return (
    <AdvancedMarker position={position} zIndex={100}>
      <div className="relative group">
        {/* Subtle pulsing ring */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse" />

        {/* Small receiver pin */}
        <div className="relative flex items-center justify-center w-6 h-6 bg-gradient-to-br from-emerald-500/80 to-emerald-600/80 rounded-full shadow-md border border-white/30 backdrop-blur-sm transition-transform group-hover:scale-125">
          <Radio size={12} className="text-white" strokeWidth={2.5} />
        </div>

        {/* Compact tooltip */}
        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          <div className="bg-black/90 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded border border-emerald-500/30 shadow-lg">
            <div className="font-bold text-emerald-400">📡 Receiver</div>
          </div>
        </div>
      </div>
    </AdvancedMarker>
  );
}

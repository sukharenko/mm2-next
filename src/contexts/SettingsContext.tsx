"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type UnitSystem = "metric" | "imperial";

interface SettingsContextType {
  units: UnitSystem;
  setUnits: (units: UnitSystem) => void;
  formatAltitude: (ft: number) => string;
  formatSpeed: (kts: number) => string;
  formatVertRate: (fpm: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [units, setUnitsState] = useState<UnitSystem>("metric");

  useEffect(() => {
    const saved = localStorage.getItem("mm2-units");
    if (saved === "metric" || saved === "imperial") {
      setUnitsState(saved);
    }
  }, []);

  const setUnits = (u: UnitSystem) => {
    setUnitsState(u);
    localStorage.setItem("mm2-units", u);
  };

  const formatAltitude = (ft: number) => {
    if (units === "imperial") {
      return `${Math.round(ft).toLocaleString()} ft`;
    }
    // ft -> meters
    const m = Math.round(ft * 0.3048);
    return `${m.toLocaleString()} m`;
  };

  const formatSpeed = (kts: number) => {
    if (units === "imperial") {
      return `${Math.round(kts)} kts`;
    }
    // kts -> km/h
    const kmh = Math.round(kts * 1.852);
    return `${kmh} km/h`;
  };

  const formatVertRate = (fpm: number) => {
    if (units === "imperial") {
      return `${fpm} fpm`;
    }
    // fpm -> m/s (approx check, or usually m/min? Aviation metric uses m/s usually for V/S, or m/min)
    // User asked for "meters/kilometers per hour" generally for "metric".
    // Vertical speed in metric aviation is often meters per second (m/s).
    // Let's use m/s for V/S.
    // 1 fpm = 0.00508 m/s
    const ms = (fpm * 0.00508).toFixed(1);
    return `${ms} m/s`;
  };

  return (
    <SettingsContext.Provider
      value={{ units, setUnits, formatAltitude, formatSpeed, formatVertRate }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

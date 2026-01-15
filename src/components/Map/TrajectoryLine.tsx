"use client";

import { useMap } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

export function TrajectoryLine({
  path,
  color = "#fbbf24",
}: {
  path: { lat: number; lng: number }[];
  color?: string;
}) {
  const map = useMap();
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;

    const line = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      map,
    });

    setPolyline(line);

    return () => {
      line.setMap(null);
    };
  }, [map]);

  useEffect(() => {
    if (polyline) {
      polyline.setPath(path);
      polyline.setOptions({ strokeColor: color });
    }
  }, [polyline, path, color]);

  return null;
}

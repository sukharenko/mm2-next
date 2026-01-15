"use client";

import { useMap } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

export function TrajectoryLine({
  path,
  color = "#fbbf24",
  opacity = 0.8,
}: {
  path: { lat: number; lng: number }[];
  color?: string;
  opacity?: number;
}) {
  const map = useMap();
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;

    // Filter out invalid coordinates (0, undefined, null, NaN)
    const validPath = path.filter(
      (point) =>
        point &&
        typeof point.lat === "number" &&
        typeof point.lng === "number" &&
        isFinite(point.lat) &&
        isFinite(point.lng) &&
        point.lat !== 0 &&
        point.lng !== 0
    );

    // Don't create polyline if no valid points
    if (validPath.length < 2) {
      if (polyline) {
        polyline.setMap(null);
        setPolyline(null);
      }
      return;
    }

    const line = new google.maps.Polyline({
      path: validPath,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: opacity,
      strokeWeight: 2,
      map,
    });

    setPolyline(line);

    return () => {
      line.setMap(null);
    };
  }, [map, path, color, opacity]);

  useEffect(() => {
    if (polyline) {
      // Filter out invalid coordinates (0, undefined, null, NaN) for updates
      const validPath = path.filter(
        (point) =>
          point &&
          typeof point.lat === "number" &&
          typeof point.lng === "number" &&
          isFinite(point.lat) &&
          isFinite(point.lng) &&
          point.lat !== 0 &&
          point.lng !== 0
      );

      if (validPath.length < 2) {
        polyline.setMap(null);
        setPolyline(null);
        return;
      }

      polyline.setPath(validPath);
      polyline.setOptions({ strokeColor: color, strokeOpacity: opacity });
    }
  }, [polyline, path, color, opacity]);

  return null;
}

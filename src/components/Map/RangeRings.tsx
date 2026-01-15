import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

interface RangeRingsProps {
  center: { lat: number; lng: number };
}

export function RangeRings({ center }: RangeRingsProps) {
  const map = useMap();
  const maps = useMapsLibrary("maps");
  const [elements, setElements] = useState<any[]>([]);

  useEffect(() => {
    if (!map || !maps || !center) return;

    // Clear previous elements
    elements.forEach((el) => el.setMap(null));
    const newElements: any[] = [];

    // Settings
    const ringColor = "#4ade80"; // green-400
    const radialColor = "#4ade80"; // green-400
    const opacity = 0.2;
    const distancesKm = [50, 100, 150, 200, 250, 300];
    const earthRadiusKm = 6371;

    // Create Rings
    distancesKm.forEach((distKm) => {
      const circle = new google.maps.Circle({
        strokeColor: ringColor,
        strokeOpacity: opacity,
        strokeWeight: 1,
        fillColor: "transparent",
        map: map,
        center: center,
        radius: distKm * 1000, // meters
        clickable: false,
      });
      newElements.push(circle);
    });

    // Create Radials (lines every 30 degrees)
    const radials = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
    const maxDistKm = 300; // Length of the line

    radials.forEach((angle) => {
      // Calculate end point
      // Formula:
      // lat2 = asin(sin(lat1)*cos(d/R) + cos(lat1)*sin(d/R)*cos(brng))
      // lon2 = lon1 + atan2(sin(brng)*sin(d/R)*cos(lat1), cos(d/R)-sin(lat1)*sin(lat2))

      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const toDeg = (rad: number) => (rad * 180) / Math.PI;

      const lat1 = toRad(center.lat);
      const lon1 = toRad(center.lng);
      const brng = toRad(angle);
      const d = maxDistKm;
      const R = earthRadiusKm;

      const lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(d / R) +
          Math.cos(lat1) * Math.sin(d / R) * Math.cos(brng)
      );
      const lon2 =
        lon1 +
        Math.atan2(
          Math.sin(brng) * Math.sin(d / R) * Math.cos(lat1),
          Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2)
        );

      const path = [center, { lat: toDeg(lat2), lng: toDeg(lon2) }];

      const line = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: radialColor,
        strokeOpacity: opacity,
        strokeWeight: 1,
        map: map,
        clickable: false,
      });
      newElements.push(line);
    });

    setElements(newElements);

    return () => {
      newElements.forEach((el) => el.setMap(null));
    };
  }, [map, maps, center.lat, center.lng]);

  return null;
}

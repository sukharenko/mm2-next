"use client";

import {
  APIProvider,
  Map,
  MapCameraChangedEvent,
  useMap,
} from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useState } from "react";

const MAP_API_KEY = process.env.NEXT_PUBLIC_MAPS_API_KEY || "";

const mapStyles = [
  {
    elementType: "geometry",
    stylers: [{ color: "#242f3e" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242f3e" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

// Helper component to access map instance
function MapUpdater({
  center,
}: {
  center?: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
  }, [map, center]);
  return null;
}

export function MapContainer({
  children,
  focusedLocation,
}: {
  children?: React.ReactNode;
  focusedLocation?: { lat: number; lng: number } | null;
}) {
  const [zoom, setZoom] = useState(10);
  const [center, setCenter] = useState(() => {
    const loc = process.env.NEXT_PUBLIC_LOCATION;
    if (loc) {
      const [lat, lng] = loc.split(":").map(Number);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }
    return { lat: 55.75, lng: 37.61 };
  });

  const onCameraChanged = useCallback((ev: MapCameraChangedEvent) => {
    // console.log("camera changed", ev);
  }, []);

  return (
    <div className="w-full h-screen absolute top-0 left-0 z-0">
      <APIProvider apiKey={MAP_API_KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
          styles={mapStyles}
          className="w-full h-full"
          onCameraChanged={onCameraChanged}
          mapId="DEMO_MAP_ID"
        >
          <MapUpdater center={focusedLocation} />
          {children}
        </Map>
      </APIProvider>
    </div>
  );
}

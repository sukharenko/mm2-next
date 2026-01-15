"use client";

import {
  APIProvider,
  Map,
  MapCameraChangedEvent,
  useMap,
} from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useState } from "react";
import { HomeMarker } from "./HomeMarker";
import { useConfig } from "@/hooks/useConfig";

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
  const { config, loading } = useConfig();
  const [zoom, setZoom] = useState(10);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });

  // Update center when config loads
  useEffect(() => {
    if (config?.location) {
      const [lat, lng] = config.location.split(":").map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        setCenter({ lat, lng });
      }
    }
  }, [config]);

  const onCameraChanged = useCallback((ev: MapCameraChangedEvent) => {
    // console.log("camera changed", ev);
  }, []);

  if (loading || !config) {
    return (
      <div className="w-full h-screen bg-slate-900 flex items-center justify-center text-white">
        Loading map...
      </div>
    );
  }

  return (
    <div className="w-full h-screen absolute top-0 left-0 z-0">
      <APIProvider apiKey={config.googleMapsApiKey}>
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
          onCameraChanged={onCameraChanged}
          mapId="DEMO_MAP_ID"
        >
          <style jsx global>{`
            /* Force Dark Mode via CSS Filter */
            /* Targets Vector Map (Canvas) and Raster Map (Divs/Images) */
            .gm-style > div:first-child > div:first-child {
              filter: invert(90%) hue-rotate(180deg) brightness(90%)
                contrast(110%) !important;
            }
            /* Exclude UI controls from inversion if possible, though strict selection is hard without IDs */
            .gmnoprint,
            .gm-style-cc {
              filter: invert(100%) hue-rotate(180deg) !important; /* Re-invert controls to look normal */
            }
            /* Specific fix for images/tiles if the above layout differs */
            img[src*="googleapis"] {
              filter: invert(90%) hue-rotate(180deg) !important;
            }
          `}</style>
          <MapUpdater center={focusedLocation} />
          <HomeMarker position={center} />
          {children}
        </Map>
      </APIProvider>
    </div>
  );
}

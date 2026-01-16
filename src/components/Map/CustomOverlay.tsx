import { useEffect, useRef, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { createPortal } from "react-dom";

interface CustomOverlayProps {
  position: google.maps.LatLngLiteral;
  children: React.ReactNode;
  zIndex?: number;
}

export function CustomOverlay({
  position,
  children,
  zIndex = 0,
}: CustomOverlayProps) {
  const map = useMap();
  const overlayRef = useRef<google.maps.OverlayView | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!map) return;

    class CustomOverlayView extends google.maps.OverlayView {
      private position: google.maps.LatLng;
      private containerDiv: HTMLDivElement | null = null;

      constructor(position: google.maps.LatLngLiteral) {
        super();
        this.position = new google.maps.LatLng(position.lat, position.lng);
      }

      onAdd() {
        this.containerDiv = document.createElement("div");
        this.containerDiv.style.position = "absolute";
        this.containerDiv.style.zIndex = zIndex.toString();

        const panes = this.getPanes();
        if (panes) {
          panes.overlayMouseTarget.appendChild(this.containerDiv);
          setContainer(this.containerDiv);
        }
      }

      draw() {
        if (!this.containerDiv) return;

        const projection = this.getProjection();
        if (!projection) return;

        const point = projection.fromLatLngToDivPixel(this.position);

        if (point) {
          this.containerDiv.style.left = point.x + "px";
          this.containerDiv.style.top = point.y + "px";
          this.containerDiv.style.transform = "translate(-50%, -50%)";
        }
      }

      onRemove() {
        setContainer(null);
        if (this.containerDiv && this.containerDiv.parentNode) {
          this.containerDiv.parentNode.removeChild(this.containerDiv);
        }
        this.containerDiv = null;
      }

      updatePosition(newPosition: google.maps.LatLngLiteral) {
        this.position = new google.maps.LatLng(
          newPosition.lat,
          newPosition.lng
        );
        this.draw();
      }
    }

    const overlay = new CustomOverlayView(position);
    overlay.setMap(map);
    overlayRef.current = overlay;

    return () => {
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
        overlayRef.current = null;
      }
    };
  }, [map, zIndex]);

  useEffect(() => {
    if (overlayRef.current && (overlayRef.current as any).updatePosition) {
      (overlayRef.current as any).updatePosition(position);
    }
  }, [position]);

  if (!container) return null;

  return createPortal(children, container);
}

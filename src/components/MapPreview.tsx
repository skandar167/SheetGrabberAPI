"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Set default icon to avoid broken image links in Next.js
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = customIcon;

export interface ClientData {
  lat: number;
  lng: number;
  name: string;
}

interface MapPreviewProps {
  clients: ClientData[];
}

export default function MapPreview({ clients }: MapPreviewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      // Initialize map
      mapRef.current = L.map(mapContainerRef.current).setView([28.0339, 1.6596], 5); // Default to Algeria
      
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const bounds = L.latLngBounds([]);
    let hasValidPoints = false;

    clients.forEach((client) => {
      if (!isNaN(client.lat) && !isNaN(client.lng) && client.lat !== 0 && client.lng !== 0) {
        const marker = L.marker([client.lat, client.lng]).addTo(map);
        marker.bindPopup(`<strong>${client.name || 'Unknown Client'}</strong>`);
        bounds.extend([client.lat, client.lng]);
        hasValidPoints = true;
      }
    });

    if (hasValidPoints && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

    // Cleanup on unmount (important for strict mode)
    return () => {
      // We don't necessarily want to destroy the map on every re-render of the effect,
      // so we keep the instance in the ref and just clear markers.
    };
  }, [clients]);

  // Clean up the entire map instance only when component unmounts
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="map-wrapper" style={{ position: "relative", zIndex: 1 }}>
      <div 
        ref={mapContainerRef} 
        style={{ 
          height: "400px", 
          width: "100%", 
          borderRadius: "var(--radius)", 
          border: "1px solid var(--border)",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
        }} 
      />
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";

// Load the entire map UI dynamically to avoid Leaflet's
// "window is not defined" error during SSR prerendering.
const MapPageContent = dynamic(
  () => import("../../components/MapPageContent"),
  { ssr: false }
);

export default function MapPage() {
  return <MapPageContent />;
}

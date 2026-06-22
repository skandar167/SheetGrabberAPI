"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, Map, Users, Info } from "lucide-react";
import Link from "next/link";

interface ClientData {
  lat: number;
  lng: number;
  name: string;
}

// Custom marker icon
const buildIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        width: 32px; height: 32px;
        background: ${color};
        border: 2px solid rgba(255,255,255,0.9);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });

const defaultIcon = buildIcon("linear-gradient(135deg,#4facfe,#00f2fe)");

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");

  // Load data from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("mapClients");
      if (raw) {
        setClients(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  }, []);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView([28.0339, 1.6596], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Add zoom control top-right
    L.control.zoom({ position: "topright" }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Render markers whenever clients change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    const bounds = L.latLngBounds([]);
    let hasValid = false;

    clients.forEach((client) => {
      if (isNaN(client.lat) || isNaN(client.lng)) return;

      const marker = L.marker([client.lat, client.lng], { icon: defaultIcon }).addTo(map);
      marker.bindPopup(
        `<div style="font-family: sans-serif; min-width: 140px;">
          <div style="font-size: 1rem; font-weight: 700; color: #00f2fe; margin-bottom: 4px;">${client.name || "—"}</div>
          <div style="font-size: 0.75rem; color: #94a3b8;">
            ${client.lat.toFixed(5)}, ${client.lng.toFixed(5)}
          </div>
        </div>`,
        { className: "custom-popup" }
      );

      marker.on("click", () => setSelectedClient(client));
      bounds.extend([client.lat, client.lng]);
      hasValid = true;
    });

    if (hasValid && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  }, [clients]);

  // Fly to client when selected from sidebar
  const flyTo = (client: ClientData) => {
    mapRef.current?.flyTo([client.lat, client.lng], 14, { duration: 1 });
    setSelectedClient(client);
  };

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: "#0b0f19" }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? "320px" : "0px",
        minWidth: sidebarOpen ? "320px" : "0px",
        overflow: "hidden",
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
        background: "rgba(22, 30, 49, 0.97)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        zIndex: 1000,
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                fontSize: "0.8rem", color: "var(--text-secondary)",
                textDecoration: "none", padding: "0.4rem 0.75rem",
                background: "rgba(255,255,255,0.05)", borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.08)",
                transition: "background 0.2s"
              }}
            >
              <ArrowLeft size={13} /> Retour
            </Link>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "0.35rem",
              fontSize: "0.75rem", color: "#4facfe",
              background: "rgba(79,172,254,0.1)", padding: "0.3rem 0.6rem",
              borderRadius: "20px", border: "1px solid rgba(79,172,254,0.2)"
            }}>
              <Users size={12} /> {clients.length} clients
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <Map size={18} style={{ color: "#00f2fe" }} />
            <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
              Client Map
            </h1>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "0.6rem 0.9rem",
              background: "rgba(13,19,33,0.85)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px", color: "#f8fafc",
              fontSize: "0.85rem", outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* Client List */}
        <div style={{ overflowY: "auto", flex: 1, padding: "0.5rem" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
              Aucun client trouvé
            </div>
          ) : (
            filtered.map((client, idx) => (
              <button
                key={idx}
                onClick={() => flyTo(client)}
                style={{
                  display: "flex", flexDirection: "column", gap: "0.2rem",
                  width: "100%", textAlign: "left",
                  padding: "0.75rem 1rem", borderRadius: "8px",
                  background: selectedClient === client
                    ? "rgba(79,172,254,0.12)"
                    : "transparent",
                  border: selectedClient === client
                    ? "1px solid rgba(79,172,254,0.3)"
                    : "1px solid transparent",
                  cursor: "pointer", marginBottom: "2px",
                  transition: "all 0.15s ease",
                  color: "inherit", fontFamily: "inherit"
                }}
                onMouseEnter={(e) => {
                  if (selectedClient !== client) {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedClient !== client) {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }
                }}
              >
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {client.name || "—"}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#64748b", fontFamily: "monospace" }}>
                  {client.lat.toFixed(4)}, {client.lng.toFixed(4)}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Selected client info */}
        {selectedClient && (
          <div style={{
            padding: "1rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(0,242,254,0.04)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem", color: "#00f2fe", fontSize: "0.75rem", fontWeight: 600 }}>
              <Info size={12} /> Sélectionné
            </div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f8fafc", marginBottom: "4px" }}>
              {selectedClient.name}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "monospace" }}>
              {selectedClient.lat.toFixed(6)}, {selectedClient.lng.toFixed(6)}
            </div>
          </div>
        )}

        {/* Author credit */}
        <div style={{
          padding: "0.75rem 1.25rem",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          textAlign: "center",
          fontSize: "0.72rem",
          color: "#475569",
          lineHeight: 1.6,
        }}>
          Développé par<br />
          <span style={{ color: "#00f2fe", fontWeight: 600, fontSize: "0.78rem" }}>
            AOUATI Abdellatif Skander
          </span>
        </div>
      </aside>

      {/* Sidebar toggle button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "absolute", left: sidebarOpen ? "320px" : "0px",
          top: "50%", transform: "translateY(-50%)",
          zIndex: 1001, background: "rgba(22,30,49,0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderLeft: sidebarOpen ? "none" : "1px solid rgba(255,255,255,0.1)",
          color: "#94a3b8", cursor: "pointer",
          padding: "0.5rem 0.3rem", borderRadius: sidebarOpen ? "0 6px 6px 0" : "0 6px 6px 0",
          transition: "left 0.3s ease", fontSize: "0.8rem",
          lineHeight: 1,
        }}
        title={sidebarOpen ? "Masquer la liste" : "Afficher la liste"}
      >
        {sidebarOpen ? "◀" : "▶"}
      </button>

      {/* Map */}
      <div style={{ flex: 1, position: "relative" }}>
        {clients.length === 0 && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 10,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "rgba(11,15,25,0.9)",
            color: "#64748b", gap: "1rem"
          }}>
            <Map size={48} style={{ opacity: 0.3 }} />
            <p style={{ fontSize: "1rem" }}>Aucune donnée à afficher.</p>
            <Link href="/" style={{
              color: "#4facfe", textDecoration: "none", fontSize: "0.875rem",
              border: "1px solid rgba(79,172,254,0.3)", padding: "0.5rem 1rem", borderRadius: "8px"
            }}>
              ← Retourner sur SheetGrabber
            </Link>
          </div>
        )}
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Map as MapIcon, Users, Info } from "lucide-react";

interface ClientData {
  lat: number;
  lng: number;
  name: string;
}

const buildIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `<div style="width:32px;height:32px;background:${color};border:2px solid rgba(255,255,255,0.9);border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(0,0,0,0.4);"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });

const defaultIcon = buildIcon("linear-gradient(135deg,#4facfe,#00f2fe)");

interface ShareMapContentProps {
  token: string;
}

export default function ShareMapContent({ token }: ShareMapContentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [label, setLabel] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [state, setState] = useState<"loading" | "inactive" | "error" | "ok">("loading");

  // Fetch share link data — uses window.location.origin so it works on any host
  useEffect(() => {
    if (!token) return;
    const base = typeof window !== "undefined" ? window.location.origin : "";
    fetch(`${base}/api/sharelinks/${token}`)
      .then(async (res) => {
        if (res.status === 410) {
          setState("inactive");
          return;
        }
        if (!res.ok) {
          setState("error");
          return;
        }
        const data = await res.json();
        setClients(data.clients || []);
        setLabel(data.label || "");
        setState("ok");
      })
      .catch(() => setState("error"));
  }, [token]);

  // Init map
  useEffect(() => {
    if (state !== "ok") return;
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, { zoomControl: false }).setView([28.0339, 1.6596], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapRef.current);

    L.control.zoom({ position: "topright" }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [state]);

  // Render markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || clients.length === 0) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    const bounds = L.latLngBounds([]);
    let hasValid = false;

    clients.forEach((client) => {
      if (isNaN(client.lat) || isNaN(client.lng)) return;
      const marker = L.marker([client.lat, client.lng], { icon: defaultIcon }).addTo(map);
      marker.bindPopup(
        `<div style="font-family:sans-serif;min-width:140px;">
          <div style="font-size:1rem;font-weight:700;color:#00f2fe;margin-bottom:4px;">${client.name || "—"}</div>
          <div style="font-size:0.75rem;color:#94a3b8;">${client.lat.toFixed(5)}, ${client.lng.toFixed(5)}</div>
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

  const flyTo = (client: ClientData) => {
    mapRef.current?.flyTo([client.lat, client.lng], 14, { duration: 1 });
    setSelectedClient(client);
  };

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (state === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0f19", color: "#64748b", fontFamily: "sans-serif" }}>
        <MapIcon size={40} style={{ opacity: 0.3 }} />
        <p style={{ marginLeft: "1rem" }}>Chargement de la carte...</p>
      </div>
    );
  }

  if (state === "inactive") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0b0f19", color: "#f8fafc", fontFamily: "var(--font-outfit, sans-serif)", gap: "1rem" }}>
        <div style={{ fontSize: "3rem" }}>🔒</div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Lien désactivé</h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem", textAlign: "center", maxWidth: "360px" }}>
          Ce lien de partage a été désactivé par son propriétaire. Contactez l&apos;auteur pour un nouvel accès.
        </p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0b0f19", color: "#f8fafc", fontFamily: "var(--font-outfit, sans-serif)", gap: "1rem" }}>
        <div style={{ fontSize: "3rem" }}>❌</div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Lien introuvable</h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Ce lien n&apos;existe pas ou a été supprimé.</p>
      </div>
    );
  }

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
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "0.35rem",
              fontSize: "0.7rem", color: "#fbbf24",
              background: "rgba(251,191,36,0.1)", padding: "0.3rem 0.6rem",
              borderRadius: "20px", border: "1px solid rgba(251,191,36,0.2)",
            }}>
              👁️ Vue en lecture seule
            </span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "0.35rem",
              fontSize: "0.75rem", color: "#4facfe",
              background: "rgba(79,172,254,0.1)", padding: "0.3rem 0.6rem",
              borderRadius: "20px", border: "1px solid rgba(79,172,254,0.2)",
            }}>
              <Users size={12} /> {clients.length} clients
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <MapIcon size={18} style={{ color: "#00f2fe" }} />
            <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
              {label || "Client Map"}
            </h1>
          </div>
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
              fontFamily: "inherit", boxSizing: "border-box",
            }}
          />
        </div>

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
                  background: selectedClient === client ? "rgba(79,172,254,0.12)" : "transparent",
                  border: selectedClient === client ? "1px solid rgba(79,172,254,0.3)" : "1px solid transparent",
                  cursor: "pointer", marginBottom: "2px",
                  transition: "all 0.15s ease",
                  color: "inherit", fontFamily: "inherit",
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

        {selectedClient && (
          <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,242,254,0.04)" }}>
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

        <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center", fontSize: "0.72rem", color: "#475569", lineHeight: 1.6 }}>
          Développé par<br />
          <span style={{ color: "#00f2fe", fontWeight: 600, fontSize: "0.78rem" }}>AOUATI Abdellatif Skander</span>
        </div>
      </aside>

      {/* Toggle sidebar */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "absolute", left: sidebarOpen ? "320px" : "0px",
          top: "50%", transform: "translateY(-50%)",
          zIndex: 1001, background: "rgba(22,30,49,0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderLeft: sidebarOpen ? "none" : "1px solid rgba(255,255,255,0.1)",
          color: "#94a3b8", cursor: "pointer",
          padding: "0.5rem 0.3rem", borderRadius: "0 6px 6px 0",
          transition: "left 0.3s ease", fontSize: "0.8rem", lineHeight: 1,
        }}
      >
        {sidebarOpen ? "◀" : "▶"}
      </button>

      {/* Map */}
      <div style={{ flex: 1, position: "relative" }}>
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}

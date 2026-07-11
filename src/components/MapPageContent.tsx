"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, Map, Users, Info, Share2, Check, Copy, X, ToggleLeft, ToggleRight, Plus } from "lucide-react";
import Link from "next/link";

interface ClientData {
  lat: number;
  lng: number;
  name: string;
}

interface ShareLinkRecord {
  _id: string;
  token: string;
  label: string;
  active: boolean;
  createdAt: string;
}

// --- Custom marker icons ---
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
const selectedIcon = buildIcon("linear-gradient(135deg,#f59e0b,#f97316)");

// Map from client index → leaflet marker (so we can swap icons)
type MarkerMap = Map<number, L.Marker>;

export default function MapPageContent() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<MarkerMap>(new Map());

  const [clients, setClients] = useState<ClientData[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");

  // Share panel state
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLinks, setShareLinks] = useState<ShareLinkRecord[]>([]);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareLabel, setShareLabel] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  // Load data from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("mapClients");
      if (raw) setClients(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  // Init map
  useEffect(() => {
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
  }, []);

  // Render markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current.clear();

    const bounds = L.latLngBounds([]);
    let hasValid = false;

    clients.forEach((client, idx) => {
      if (isNaN(client.lat) || isNaN(client.lng)) return;

      const isSelected = idx === selectedIdx;
      const marker = L.marker([client.lat, client.lng], {
        icon: isSelected ? selectedIcon : defaultIcon,
      }).addTo(map);

      marker.bindPopup(
        `<div style="font-family: sans-serif; min-width: 140px;">
          <div style="font-size: 1rem; font-weight: 700; color: #00f2fe; margin-bottom: 4px;">${client.name || "—"}</div>
          <div style="font-size: 0.75rem; color: #94a3b8;">
            ${client.lat.toFixed(5)}, ${client.lng.toFixed(5)}
          </div>
        </div>`,
        { className: "custom-popup" }
      );

      marker.on("click", () => {
        setSelectedIdx(idx);
      });

      markersRef.current.set(idx, marker);
      bounds.extend([client.lat, client.lng]);
      hasValid = true;
    });

    if (hasValid && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients]);

  // Update marker icons when selection changes without re-rendering all markers
  useEffect(() => {
    markersRef.current.forEach((marker, idx) => {
      marker.setIcon(idx === selectedIdx ? selectedIcon : defaultIcon);
    });
  }, [selectedIdx]);

  // Fly to client when selected from sidebar
  const flyTo = (client: ClientData, idx: number) => {
    mapRef.current?.flyTo([client.lat, client.lng], 14, { duration: 1 });
    setSelectedIdx(idx);
  };

  const filtered = clients.reduce<Array<{ client: ClientData; idx: number }>>((acc, client, idx) => {
    if (client.name.toLowerCase().includes(search.toLowerCase())) {
      acc.push({ client, idx });
    }
    return acc;
  }, []);

  // --- Share link functions ---
  const fetchShareLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/sharelinks");
      if (res.ok) {
        const data = await res.json();
        setShareLinks(data.links || []);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (shareOpen) fetchShareLinks();
  }, [shareOpen, fetchShareLinks]);

  const createShareLink = async () => {
    if (clients.length === 0) return;
    setShareLoading(true);
    try {
      const res = await fetch("/api/sharelinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientsData: clients,
          label: shareLabel || undefined,
        }),
      });
      if (res.ok) {
        setShareLabel("");
        await fetchShareLinks();
      }
    } finally {
      setShareLoading(false);
    }
  };

  const toggleLink = async (token: string, current: boolean) => {
    setToggleLoading(token);
    try {
      const res = await fetch(`/api/sharelinks/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !current }),
      });
      if (res.ok) {
        setShareLinks((prev) =>
          prev.map((l) => (l.token === token ? { ...l, active: !current } : l))
        );
      }
    } finally {
      setToggleLoading(null);
    }
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const selectedClient = selectedIdx !== null ? clients[selectedIdx] : null;

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
                transition: "background 0.2s",
              }}
            >
              <ArrowLeft size={13} /> Retour
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "0.35rem",
                fontSize: "0.75rem", color: "#4facfe",
                background: "rgba(79,172,254,0.1)", padding: "0.3rem 0.6rem",
                borderRadius: "20px", border: "1px solid rgba(79,172,254,0.2)",
              }}>
                <Users size={12} /> {clients.length} clients
              </span>
              {/* Share button */}
              <button
                onClick={() => setShareOpen(true)}
                title="Partager la carte"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.3rem",
                  fontSize: "0.75rem", color: "#fbbf24",
                  background: "rgba(251,191,36,0.1)", padding: "0.3rem 0.6rem",
                  borderRadius: "20px", border: "1px solid rgba(251,191,36,0.25)",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <Share2 size={12} /> Partager
              </button>
            </div>
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
              fontFamily: "inherit", boxSizing: "border-box",
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
            filtered.map(({ client, idx }) => {
              const isSelected = idx === selectedIdx;
              return (
                <button
                  key={idx}
                  onClick={() => flyTo(client, idx)}
                  style={{
                    display: "flex", flexDirection: "column", gap: "0.2rem",
                    width: "100%", textAlign: "left",
                    padding: "0.75rem 1rem", borderRadius: "8px",
                    background: isSelected
                      ? "rgba(245,158,11,0.12)"
                      : "transparent",
                    border: isSelected
                      ? "1px solid rgba(245,158,11,0.35)"
                      : "1px solid transparent",
                    cursor: "pointer", marginBottom: "2px",
                    transition: "all 0.15s ease",
                    color: "inherit", fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    }
                  }}
                >
                  <div style={{
                    fontSize: "0.875rem", fontWeight: 600,
                    color: isSelected ? "#f59e0b" : "#f8fafc",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {isSelected && "● "}{client.name || "—"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", fontFamily: "monospace" }}>
                    {client.lat.toFixed(4)}, {client.lng.toFixed(4)}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Selected client info */}
        {selectedClient && (
          <div style={{
            padding: "1rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(245,158,11,0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem", color: "#f59e0b", fontSize: "0.75rem", fontWeight: 600 }}>
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
          textAlign: "center", fontSize: "0.72rem", color: "#475569", lineHeight: 1.6,
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
          transition: "left 0.3s ease", fontSize: "0.8rem", lineHeight: 1,
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
            background: "rgba(11,15,25,0.9)", color: "#64748b", gap: "1rem",
          }}>
            <Map size={48} style={{ opacity: 0.3 }} />
            <p style={{ fontSize: "1rem" }}>Aucune donnée à afficher.</p>
            <Link href="/" style={{
              color: "#4facfe", textDecoration: "none", fontSize: "0.875rem",
              border: "1px solid rgba(79,172,254,0.3)", padding: "0.5rem 1rem", borderRadius: "8px",
            }}>
              ← Retourner sur SheetGrabber
            </Link>
          </div>
        )}
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* ============================================================
          SHARE PANEL (modal overlay)
      ============================================================ */}
      {shareOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 2000,
            background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShareOpen(false); }}
        >
          <div style={{
            width: "100%", maxWidth: "520px",
            background: "rgba(22,30,49,0.98)",
            border: "1px solid rgba(79,172,254,0.15)",
            borderRadius: "18px",
            boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
            overflow: "hidden",
          }}>
            {/* Panel header */}
            <div style={{
              padding: "1.25rem 1.5rem",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Share2 size={18} style={{ color: "#fbbf24" }} />
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
                  Partager la carte
                </h2>
              </div>
              <button
                onClick={() => setShareOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px", padding: "0.35rem 0.5rem", cursor: "pointer",
                  color: "#94a3b8",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Create new link */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ color: "#94a3b8", fontSize: "0.82rem", marginBottom: "0.9rem" }}>
                Créez un lien temporaire pour que des visiteurs puissent consulter cette carte en lecture seule.
              </p>
              <div style={{ display: "flex", gap: "0.6rem" }}>
                <input
                  type="text"
                  placeholder={`Carte du ${new Date().toLocaleDateString("fr-FR")}`}
                  value={shareLabel}
                  onChange={(e) => setShareLabel(e.target.value)}
                  style={{
                    flex: 1, padding: "0.65rem 0.9rem",
                    background: "rgba(13,19,33,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px", color: "#f8fafc",
                    fontSize: "0.85rem", outline: "none", fontFamily: "inherit",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(251,191,36,0.4)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                <button
                  onClick={createShareLink}
                  disabled={shareLoading || clients.length === 0}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.4rem",
                    padding: "0.65rem 1.1rem",
                    background: shareLoading ? "rgba(251,191,36,0.2)" : "linear-gradient(135deg,#f59e0b,#f97316)",
                    border: "none", borderRadius: "8px",
                    color: shareLoading ? "rgba(255,255,255,0.4)" : "#0b0f19",
                    fontWeight: 700, fontSize: "0.85rem",
                    cursor: shareLoading ? "not-allowed" : "pointer",
                    fontFamily: "inherit", whiteSpace: "nowrap",
                  }}
                >
                  <Plus size={15} />
                  {shareLoading ? "..." : "Créer"}
                </button>
              </div>
            </div>

            {/* Links list */}
            <div style={{ maxHeight: "320px", overflowY: "auto" }}>
              {shareLinks.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#475569", fontSize: "0.85rem" }}>
                  Aucun lien créé pour le moment.
                </div>
              ) : (
                shareLinks.map((link) => (
                  <div
                    key={link.token}
                    style={{
                      padding: "1rem 1.5rem",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      display: "flex", alignItems: "center", gap: "0.75rem",
                    }}
                  >
                    {/* Active indicator */}
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                      background: link.active ? "#22c55e" : "#475569",
                      boxShadow: link.active ? "0 0 6px #22c55e" : "none",
                    }} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#f8fafc", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {link.label || "Carte partagée"}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#64748b", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        /share/{link.token}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                      {/* Copy */}
                      <button
                        onClick={() => copyLink(link.token)}
                        title="Copier le lien"
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: "32px", height: "32px",
                          background: copiedToken === link.token ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                          border: `1px solid ${copiedToken === link.token ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
                          borderRadius: "7px", cursor: "pointer",
                          color: copiedToken === link.token ? "#22c55e" : "#94a3b8",
                        }}
                      >
                        {copiedToken === link.token ? <Check size={14} /> : <Copy size={14} />}
                      </button>

                      {/* Toggle active */}
                      <button
                        onClick={() => toggleLink(link.token, link.active)}
                        disabled={toggleLoading === link.token}
                        title={link.active ? "Désactiver" : "Activer"}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: "32px", height: "32px",
                          background: link.active ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                          border: `1px solid ${link.active ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.2)"}`,
                          borderRadius: "7px", cursor: toggleLoading === link.token ? "not-allowed" : "pointer",
                          color: link.active ? "#22c55e" : "#ef4444",
                          opacity: toggleLoading === link.token ? 0.5 : 1,
                        }}
                      >
                        {link.active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

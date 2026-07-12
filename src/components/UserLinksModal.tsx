import React, { useState, useEffect, useCallback } from "react";
import { Share2, X, Copy, Check, ToggleLeft, ToggleRight, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ShareLinkRecord {
  _id: string;
  token: string;
  label: string;
  active: boolean;
  createdAt: string;
}

interface UserLinksModalProps {
  onClose: () => void;
}

export default function UserLinksModal({ onClose }: UserLinksModalProps) {
  const [shareLinks, setShareLinks] = useState<ShareLinkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const fetchShareLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/sharelinks");
      if (res.ok) {
        const data = await res.json();
        setShareLinks(data.links || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShareLinks();
  }, [fetchShareLinks]);

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

  const deleteLink = async (token: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce lien ?")) return;
    setToggleLoading(token);
    try {
      const res = await fetch(`/api/sharelinks/${token}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setShareLinks((prev) => prev.filter((l) => l.token !== token));
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

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 3000,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
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
              Mes Liens de Partage
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px", padding: "0.35rem 0.5rem", cursor: "pointer",
              color: "#94a3b8",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Links list */}
        <div style={{ maxHeight: "400px", overflowY: "auto", padding: "0.5rem 0" }}>
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#475569", fontSize: "0.85rem" }}>
              Chargement...
            </div>
          ) : shareLinks.length === 0 ? (
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
                  <div style={{ fontSize: "0.7rem", color: "#475569", marginTop: "2px" }}>
                    Créé le: {new Date(link.createdAt).toLocaleString("fr-FR")}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                  {/* Open Link */}
                  <Link href={`/share/${link.token}`} target="_blank" style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "32px", height: "32px", background: "rgba(79,172,254,0.1)",
                    border: "1px solid rgba(79,172,254,0.2)", borderRadius: "7px",
                    color: "#4facfe", cursor: "pointer", transition: "all 0.2s"
                  }} title="Ouvrir le lien">
                    <ExternalLink size={14} />
                  </Link>

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

                  {/* Delete */}
                  <button
                    onClick={() => deleteLink(link.token)}
                    disabled={toggleLoading === link.token}
                    title="Supprimer"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: "32px", height: "32px",
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      borderRadius: "7px", cursor: toggleLoading === link.token ? "not-allowed" : "pointer",
                      color: "#ef4444",
                      opacity: toggleLoading === link.token ? 0.5 : 1,
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

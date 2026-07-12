"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Share2, ToggleLeft, ToggleRight, ExternalLink, Trash2 } from "lucide-react";

interface ShareLinkRecord {
  _id: string;
  token: string;
  label: string;
  active: boolean;
  createdAt: string;
  createdBy: {
    _id: string;
    username: string;
  };
}

export default function AdminLinksPage() {
  const [links, setLinks] = useState<ShareLinkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch("/api/admin/sharelinks");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de chargement");
      setLinks(data.links || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLink = async (token: string, currentStatus: boolean) => {
    setToggleLoading(token);
    try {
      const res = await fetch(`/api/sharelinks/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentStatus }),
      });
      if (res.ok) {
        setLinks((prev) =>
          prev.map((l) => (l.token === token ? { ...l, active: !currentStatus } : l))
        );
      } else {
        const data = await res.json();
        alert(`Erreur: ${data.error}`);
      }
    } catch (err) {
      alert("Erreur réseau");
    } finally {
      setToggleLoading(null);
    }
  };

  const deleteLink = async (token: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce lien de façon permanente ?")) return;
    setToggleLoading(token);
    try {
      const res = await fetch(`/api/sharelinks/${token}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLinks((prev) => prev.filter((l) => l.token !== token));
      } else {
        const data = await res.json();
        alert(`Erreur: ${data.error}`);
      }
    } catch (err) {
      alert("Erreur réseau");
    } finally {
      setToggleLoading(null);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0b0f19",
      color: "#f8fafc",
      fontFamily: "var(--font-outfit, sans-serif)",
      padding: "2rem",
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/admin" style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              fontSize: "0.85rem", color: "#94a3b8", textDecoration: "none",
              padding: "0.5rem 0.8rem", background: "rgba(255,255,255,0.05)",
              borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <ArrowLeft size={16} /> Panneau Admin
            </Link>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Share2 style={{ color: "#4facfe" }} />
              Gestion des Liens
            </h1>
          </div>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", padding: "1rem", borderRadius: "10px", color: "#fca5a5", marginBottom: "2rem" }}>
            {error}
          </div>
        )}

        <div style={{
          background: "rgba(22, 30, 49, 0.6)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          overflow: "hidden",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: "0.85rem", color: "#94a3b8" }}>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Nom du lien</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Créateur</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Date de création</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Statut</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>Chargement...</td></tr>
              ) : links.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>Aucun lien de partage trouvé.</td></tr>
              ) : (
                links.map((link) => (
                  <tr key={link._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "#f8fafc", marginBottom: "4px" }}>
                        {link.label || "Carte sans nom"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "monospace" }}>
                        /share/{link.token}
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", fontSize: "0.9rem", color: "#cbd5e1" }}>
                      {link.createdBy?.username || "Inconnu"}
                    </td>
                    <td style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", color: "#94a3b8" }}>
                      {new Date(link.createdAt).toLocaleString("fr-FR")}
                    </td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      {link.active ? (
                        <span style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)", padding: "0.25rem 0.6rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600 }}>
                          Actif
                        </span>
                      ) : (
                        <span style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", padding: "0.25rem 0.6rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600 }}>
                          Désactivé
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "1rem 1.5rem", display: "flex", gap: "0.5rem" }}>
                      <Link href={`/share/${link.token}`} target="_blank" style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: "36px", height: "36px", background: "rgba(79,172,254,0.1)",
                        border: "1px solid rgba(79,172,254,0.2)", borderRadius: "8px",
                        color: "#4facfe", cursor: "pointer", transition: "all 0.2s"
                      }} title="Ouvrir le lien">
                        <ExternalLink size={16} />
                      </Link>
                      
                      <button
                        onClick={() => toggleLink(link.token, link.active)}
                        disabled={toggleLoading === link.token}
                        title={link.active ? "Désactiver" : "Activer"}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: "36px", height: "36px",
                          background: link.active ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
                          border: `1px solid ${link.active ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
                          borderRadius: "8px", cursor: toggleLoading === link.token ? "not-allowed" : "pointer",
                          color: link.active ? "#f87171" : "#4ade80", opacity: toggleLoading === link.token ? 0.5 : 1,
                        }}
                      >
                        {link.active ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
                      </button>

                      <button
                        onClick={() => deleteLink(link.token)}
                        disabled={toggleLoading === link.token}
                        title="Supprimer"
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: "36px", height: "36px",
                          background: "rgba(239,68,68,0.1)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          borderRadius: "8px", cursor: toggleLoading === link.token ? "not-allowed" : "pointer",
                          color: "#f87171", opacity: toggleLoading === link.token ? 0.5 : 1,
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

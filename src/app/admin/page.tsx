"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, Clock, Users, ShieldCheck, RefreshCw } from "lucide-react";

interface UserRecord {
  _id: string;
  username: string;
  status: "pending" | "approved" | "rejected";
  role: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: "rgba(251,191,36,0.1)", color: "#fbbf24", label: "En attente" },
  approved: { bg: "rgba(34,197,94,0.1)", color: "#22c55e", label: "Approuvé" },
  rejected: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", label: "Rejeté" },
};

export default function AdminPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const updateStatus = async (userId: string, status: string) => {
    setActionLoading(userId + status);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, status: status as UserRecord["status"] } : u))
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filter === "all" ? users : users.filter((u) => u.status === filter);
  const pendingCount = users.filter((u) => u.status === "pending").length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 15% 40%, rgba(79,172,254,0.06) 0%, transparent 55%), #0b0f19",
      fontFamily: "var(--font-outfit, sans-serif)",
      color: "#f8fafc",
    }}>
      {/* Header */}
      <header style={{
        padding: "1.25rem 2rem",
        background: "rgba(22,30,49,0.9)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            fontSize: "0.8rem", color: "#94a3b8", textDecoration: "none",
            padding: "0.4rem 0.75rem",
            background: "rgba(255,255,255,0.05)", borderRadius: "6px",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <ArrowLeft size={13} /> Accueil
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <ShieldCheck size={20} style={{ color: "#4facfe" }} />
            <h1 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
              Admin — Gestion des utilisateurs
            </h1>
          </div>
        </div>
        <button
          onClick={fetchUsers}
          style={{
            display: "flex", alignItems: "center", gap: "0.4rem",
            padding: "0.5rem 1rem",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px", color: "#94a3b8",
            cursor: "pointer", fontFamily: "inherit", fontSize: "0.8rem",
          }}
        >
          <RefreshCw size={13} /> Actualiser
        </button>
      </header>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Total", value: users.length, color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
            { label: "En attente", value: pendingCount, color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
            { label: "Approuvés", value: users.filter(u => u.status === "approved").length, color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: "rgba(22,30,49,0.8)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "14px", padding: "1.25rem 1.5rem",
              display: "flex", flexDirection: "column", gap: "0.3rem",
            }}>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>{stat.label}</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "0.45rem 1rem",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: filter === f ? "rgba(79,172,254,0.4)" : "rgba(255,255,255,0.08)",
                background: filter === f ? "rgba(79,172,254,0.12)" : "rgba(255,255,255,0.03)",
                color: filter === f ? "#4facfe" : "#64748b",
                cursor: "pointer", fontFamily: "inherit", fontSize: "0.82rem", fontWeight: 500,
              }}
            >
              {f === "all" ? "Tous" : STATUS_STYLES[f].label}
              {f === "pending" && pendingCount > 0 && (
                <span style={{
                  marginLeft: "0.5rem", background: "#fbbf24", color: "#0b0f19",
                  borderRadius: "20px", padding: "0.1rem 0.45rem", fontSize: "0.72rem", fontWeight: 700,
                }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Users table */}
        <div style={{
          background: "rgba(22,30,49,0.8)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "16px", overflow: "hidden",
        }}>
          {loading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
              <RefreshCw size={24} style={{ opacity: 0.4, marginBottom: "0.75rem", display: "block", margin: "0 auto 0.75rem" }} />
              Chargement...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
              <Users size={32} style={{ opacity: 0.3, marginBottom: "0.75rem", display: "block", margin: "0 auto 0.75rem" }} />
              Aucun utilisateur
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Utilisateur", "Statut", "Créé le", "Actions"].map((h) => (
                    <th key={h} style={{
                      padding: "0.9rem 1.25rem", textAlign: "left",
                      fontSize: "0.75rem", fontWeight: 600, color: "#64748b",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, idx) => {
                  const st = STATUS_STYLES[user.status];
                  return (
                    <tr
                      key={user._id}
                      style={{
                        borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                    >
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                          <div style={{
                            width: "34px", height: "34px",
                            background: "linear-gradient(135deg, rgba(79,172,254,0.2), rgba(0,242,254,0.1))",
                            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.85rem", fontWeight: 700, color: "#4facfe",
                            border: "1px solid rgba(79,172,254,0.2)",
                            flexShrink: 0,
                          }}>
                            {user.username[0].toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>@{user.username}</span>
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "0.3rem",
                          padding: "0.3rem 0.75rem", borderRadius: "20px",
                          background: st.bg, color: st.color,
                          fontSize: "0.78rem", fontWeight: 600,
                        }}>
                          {user.status === "pending" && <Clock size={11} />}
                          {user.status === "approved" && <Check size={11} />}
                          {user.status === "rejected" && <X size={11} />}
                          {st.label}
                        </span>
                      </td>
                      <td style={{ padding: "1rem 1.25rem", color: "#64748b", fontSize: "0.82rem" }}>
                        {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          {user.status !== "approved" && (
                            <button
                              onClick={() => updateStatus(user._id, "approved")}
                              disabled={!!actionLoading}
                              style={{
                                display: "flex", alignItems: "center", gap: "0.3rem",
                                padding: "0.4rem 0.85rem",
                                background: "rgba(34,197,94,0.12)",
                                border: "1px solid rgba(34,197,94,0.3)",
                                borderRadius: "8px", color: "#22c55e",
                                cursor: actionLoading ? "not-allowed" : "pointer",
                                fontSize: "0.8rem", fontWeight: 600, fontFamily: "inherit",
                                opacity: actionLoading === user._id + "approved" ? 0.5 : 1,
                              }}
                            >
                              <Check size={13} /> Approuver
                            </button>
                          )}
                          {user.status !== "rejected" && (
                            <button
                              onClick={() => updateStatus(user._id, "rejected")}
                              disabled={!!actionLoading}
                              style={{
                                display: "flex", alignItems: "center", gap: "0.3rem",
                                padding: "0.4rem 0.85rem",
                                background: "rgba(239,68,68,0.1)",
                                border: "1px solid rgba(239,68,68,0.25)",
                                borderRadius: "8px", color: "#ef4444",
                                cursor: actionLoading ? "not-allowed" : "pointer",
                                fontSize: "0.8rem", fontWeight: 600, fontFamily: "inherit",
                                opacity: actionLoading === user._id + "rejected" ? 0.5 : 1,
                              }}
                            >
                              <X size={13} /> Rejeter
                            </button>
                          )}
                          {user.status !== "pending" && (
                            <button
                              onClick={() => updateStatus(user._id, "pending")}
                              disabled={!!actionLoading}
                              style={{
                                display: "flex", alignItems: "center", gap: "0.3rem",
                                padding: "0.4rem 0.85rem",
                                background: "rgba(251,191,36,0.08)",
                                border: "1px solid rgba(251,191,36,0.2)",
                                borderRadius: "8px", color: "#fbbf24",
                                cursor: actionLoading ? "not-allowed" : "pointer",
                                fontSize: "0.8rem", fontWeight: 600, fontFamily: "inherit",
                              }}
                            >
                              <Clock size={13} /> Mettre en attente
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

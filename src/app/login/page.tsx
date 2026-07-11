"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        router.push(redirect);
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 20% 50%, rgba(79,172,254,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,242,254,0.06) 0%, transparent 60%), #0b0f19",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-outfit, sans-serif)",
      padding: "1rem",
    }}>
      {/* Decorative orbs */}
      <div style={{ position: "fixed", top: "-10%", left: "-5%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(79,172,254,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-10%", right: "-5%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(0,242,254,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{
        width: "100%",
        maxWidth: "420px",
        background: "rgba(22, 30, 49, 0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(79,172,254,0.15)",
        borderRadius: "20px",
        padding: "2.5rem",
        boxShadow: "0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03) inset",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "60px", height: "60px", margin: "0 auto 1rem",
            background: "linear-gradient(135deg, #4facfe, #00f2fe)",
            borderRadius: "16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.75rem",
            boxShadow: "0 8px 24px rgba(79,172,254,0.35)",
          }}>
            📍
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#f8fafc", margin: 0, letterSpacing: "-0.02em" }}>
            SheetGrabber
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.4rem" }}>
            Connectez-vous à votre espace
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {/* Error */}
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "10px", padding: "0.75rem 1rem",
              color: "#fca5a5", fontSize: "0.85rem",
              display: "flex", alignItems: "center", gap: "0.5rem"
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Username */}
          <div>
            <label style={{ display: "block", color: "#94a3b8", fontSize: "0.8rem", marginBottom: "0.4rem", fontWeight: 500 }}>
              Nom d&apos;utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="skander"
              required
              autoComplete="username"
              style={{
                width: "100%", padding: "0.75rem 1rem",
                background: "rgba(13,19,33,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px", color: "#f8fafc",
                fontSize: "0.95rem", outline: "none",
                fontFamily: "inherit", boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(79,172,254,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ display: "block", color: "#94a3b8", fontSize: "0.8rem", marginBottom: "0.4rem", fontWeight: 500 }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={{
                width: "100%", padding: "0.75rem 1rem",
                background: "rgba(13,19,33,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px", color: "#f8fafc",
                fontSize: "0.95rem", outline: "none",
                fontFamily: "inherit", boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(79,172,254,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "0.85rem",
              background: loading
                ? "rgba(79,172,254,0.3)"
                : "linear-gradient(135deg, #4facfe, #00f2fe)",
              border: "none", borderRadius: "10px",
              color: loading ? "rgba(255,255,255,0.5)" : "#0b0f19",
              fontWeight: 700, fontSize: "0.95rem",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "opacity 0.2s, transform 0.1s",
              transform: loading ? "none" : undefined,
              boxShadow: loading ? "none" : "0 4px 20px rgba(79,172,254,0.3)",
            }}
          >
            {loading ? "Connexion en cours..." : "Se connecter →"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.5rem 0" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
          <span style={{ color: "#475569", fontSize: "0.78rem" }}>ou</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
        </div>

        <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>
          Pas encore de compte ?{" "}
          <Link href="/signup" style={{ color: "#4facfe", textDecoration: "none", fontWeight: 600 }}>
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}

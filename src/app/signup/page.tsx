"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 20% 50%, rgba(79,172,254,0.08) 0%, transparent 60%), #0b0f19",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-outfit, sans-serif)", padding: "1rem",
      }}>
        <div style={{
          maxWidth: "420px", width: "100%",
          background: "rgba(22, 30, 49, 0.9)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: "20px", padding: "2.5rem",
          textAlign: "center",
          boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
          <h2 style={{ color: "#f8fafc", fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            Compte créé !
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
            Votre compte <strong style={{ color: "#4facfe" }}>@{username}</strong> a été créé avec succès.<br />
            Il est en attente d&apos;approbation par l&apos;administrateur. Vous serez contacté une fois approuvé.
          </p>
          <Link href="/login" style={{
            display: "inline-block", padding: "0.7rem 1.5rem",
            background: "linear-gradient(135deg, #4facfe, #00f2fe)",
            borderRadius: "10px", color: "#0b0f19",
            fontWeight: 700, textDecoration: "none", fontSize: "0.9rem",
          }}>
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 80% 30%, rgba(0,242,254,0.06) 0%, transparent 60%), radial-gradient(ellipse at 20% 70%, rgba(79,172,254,0.08) 0%, transparent 60%), #0b0f19",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-outfit, sans-serif)", padding: "1rem",
    }}>
      <div style={{
        width: "100%", maxWidth: "420px",
        background: "rgba(22, 30, 49, 0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(79,172,254,0.15)",
        borderRadius: "20px", padding: "2.5rem",
        boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "60px", height: "60px", margin: "0 auto 1rem",
            background: "linear-gradient(135deg, #4facfe, #00f2fe)",
            borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.75rem", boxShadow: "0 8px 24px rgba(79,172,254,0.35)",
          }}>📍</div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#f8fafc", margin: 0, letterSpacing: "-0.02em" }}>
            Créer un compte
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.4rem" }}>
            Votre compte sera soumis à approbation
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "10px", padding: "0.75rem 1rem",
              color: "#fca5a5", fontSize: "0.85rem",
            }}>
              ⚠️ {error}
            </div>
          )}

          <div>
            <label style={{ display: "block", color: "#94a3b8", fontSize: "0.8rem", marginBottom: "0.4rem", fontWeight: 500 }}>
              Nom d&apos;utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="john_doe"
              required
              style={{
                width: "100%", padding: "0.75rem 1rem",
                background: "rgba(13,19,33,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px", color: "#f8fafc",
                fontSize: "0.95rem", outline: "none",
                fontFamily: "inherit", boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(79,172,254,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

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
              style={{
                width: "100%", padding: "0.75rem 1rem",
                background: "rgba(13,19,33,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px", color: "#f8fafc",
                fontSize: "0.95rem", outline: "none",
                fontFamily: "inherit", boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(79,172,254,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          <div>
            <label style={{ display: "block", color: "#94a3b8", fontSize: "0.8rem", marginBottom: "0.4rem", fontWeight: 500 }}>
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%", padding: "0.75rem 1rem",
                background: "rgba(13,19,33,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px", color: "#f8fafc",
                fontSize: "0.95rem", outline: "none",
                fontFamily: "inherit", boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(79,172,254,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "0.85rem",
              background: loading ? "rgba(79,172,254,0.3)" : "linear-gradient(135deg, #4facfe, #00f2fe)",
              border: "none", borderRadius: "10px",
              color: loading ? "rgba(255,255,255,0.5)" : "#0b0f19",
              fontWeight: 700, fontSize: "0.95rem",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              boxShadow: loading ? "none" : "0 4px 20px rgba(79,172,254,0.3)",
            }}
          >
            {loading ? "Création du compte..." : "Créer mon compte →"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.5rem 0" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
          <span style={{ color: "#475569", fontSize: "0.78rem" }}>ou</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
        </div>

        <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>
          Déjà un compte ?{" "}
          <Link href="/login" style={{ color: "#4facfe", textDecoration: "none", fontWeight: 600 }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

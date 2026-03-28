"use client";
import Link from "next/link";

export default function ERPLandingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #05050e 0%, #0f0518 50%, #05050e 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', 'Outfit', sans-serif",
        padding: "40px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute",
        top: "20%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "600px",
        height: "600px",
        background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Back to portfolio */}
      <Link
        href="/"
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          color: "#888",
          textDecoration: "none",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transition: "color 0.2s",
        }}
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Portfolio
      </Link>

      <div style={{ textAlign: "center", maxWidth: "600px", position: "relative" }}>
        {/* Logo mark */}
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          fontWeight: 800,
          color: "#fff",
          margin: "0 auto 32px",
          boxShadow: "0 0 40px rgba(167,139,250,0.4)",
        }}>
          E
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 60px)",
          fontWeight: 800,
          margin: "0 0 16px",
          background: "linear-gradient(135deg, #fff 30%, #a78bfa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1.1,
        }}>
          Company ERP
        </h1>

        <p style={{
          fontSize: "17px",
          color: "#888",
          margin: "0 0 48px",
          lineHeight: 1.7,
        }}>
          Internal workspace for team management, task tracking, and attendance — all in one place.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/erp/login"
            style={{
              padding: "14px 36px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "16px",
              textDecoration: "none",
              boxShadow: "0 4px 24px rgba(124,58,237,0.4)",
              transition: "all 0.2s",
            }}
          >
            Login to ERP →
          </Link>
        </div>

        {/* Feature pills */}
        <div style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: "56px",
        }}>
          {["Dashboard", "Task Management", "Attendance", "Member Invite", "Notifications"].map((f) => (
            <span key={f} style={{
              padding: "6px 14px",
              borderRadius: "9999px",
              background: "rgba(167,139,250,0.08)",
              border: "1px solid rgba(167,139,250,0.2)",
              color: "#a78bfa",
              fontSize: "13px",
              fontWeight: 500,
            }}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}

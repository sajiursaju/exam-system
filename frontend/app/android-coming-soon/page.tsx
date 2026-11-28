import Link from "next/link";
import Navbar from "@/components/landing/Navbar";

export default function AndroidComingSoonPage() {
  return (
    <>
      <Navbar />
      <main style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #0d2d1a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "560px", width: "100%" }}>

          {/* Android Icon */}
          <div style={{
            width: "100px", height: "100px",
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            borderRadius: "28px",
            display: "flex", alignItems: "center",
            justifyContent: "center",
            fontSize: "52px",
            margin: "0 auto 32px",
            boxShadow: "0 16px 48px rgba(34,197,94,0.3)",
          }}>
            🤖
          </div>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: "999px",
            padding: "6px 20px",
            fontSize: "12px", fontWeight: 700,
            color: "#22c55e",
            marginBottom: "24px",
            textTransform: "uppercase", letterSpacing: "0.1em",
          }}>
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: "#22c55e",
              display: "inline-block",
              animation: "pulse 1.5s ease-in-out infinite",
            }} />
            In Development
          </div>

          <h1 style={{
            fontSize: "clamp(28px, 5vw, 46px)",
            fontWeight: 900,
            color: "#fff",
            fontFamily: "serif",
            margin: "0 0 16px",
            lineHeight: 1.2,
          }}>
            Android App<br />
            <span style={{ color: "#22c55e" }}>Coming Soon</span>
          </h1>

          <p style={{
            fontSize: "16px",
            color: "#94a3b8",
            lineHeight: 1.8,
            marginBottom: "40px",
          }}>
            We are building the official <strong style={{ color: "#fff" }}>Mr Exam Mentor Mainul</strong> Android app.
            Practice exams, watch tutorials, check results and get notifications — all from your phone.
          </p>

          {/* Feature pills */}
          <div style={{
            display: "flex", flexWrap: "wrap",
            gap: "10px", justifyContent: "center",
            marginBottom: "40px",
          }}>
            {[
              "📝 Online Exams",
              "🎬 Video Tutorials",
              "📊 Result Analytics",
              "📢 Notice Alerts",
              "🔐 Secure Login",
              "📱 Offline Mode",
            ].map((f) => (
              <span key={f} style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "999px",
                padding: "7px 16px",
                fontSize: "13px",
                color: "#cbd5e1",
                fontWeight: 500,
              }}>{f}</span>
            ))}
          </div>

          {/* Google Play placeholder button */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "14px",
            background: "#1e293b",
            border: "1.5px solid #22c55e33",
            borderRadius: "14px",
            padding: "16px 32px",
            marginBottom: "32px",
            opacity: 0.7,
          }}>
            <div style={{
              width: "44px", height: "44px",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              borderRadius: "10px",
              display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "24px",
            }}>🤖</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Get it on
              </div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                Google Play
              </div>
              <div style={{ fontSize: "11px", color: "#22c55e", fontWeight: 600, marginTop: "3px" }}>
                Available soon
              </div>
            </div>
          </div>

          <p style={{ fontSize: "13px", color: "#475569", marginBottom: "32px" }}>
            iOS version will follow after the Android launch.
          </p>

          {/* Back button */}
          <div>
            <Link href="/" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(45,212,191,0.1)",
              border: "1px solid rgba(45,212,191,0.3)",
              color: "#2dd4bf",
              padding: "12px 28px",
              borderRadius: "10px",
              fontSize: "14px", fontWeight: 600,
              textDecoration: "none",
            }}>
              ← Back to Home
            </Link>
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.5); }
          }
        `}</style>
      </main>
    </>
  );
}
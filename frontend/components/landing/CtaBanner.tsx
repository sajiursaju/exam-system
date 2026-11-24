import Link from "next/link";

export default function CtaBanner() {
  return (
    <section style={{
      background: "linear-gradient(135deg, #0d5c5c 0%, #0f172a 100%)",
      padding: "72px 24px", textAlign: "center",
    }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <h2 style={{
          fontSize: "clamp(26px, 4vw, 42px)",
          fontWeight: 800, color: "#fff",
          fontFamily: "serif", margin: 0,
        }}>
          Ready to ace your next exam?
        </h2>
        <p style={{
          color: "rgba(255,255,255,0.7)", fontSize: "17px",
          marginTop: "16px", lineHeight: 1.7,
        }}>
          Join thousands of students already preparing with Mentor Mainul. Register today and start your first free exam.
        </p>
        <div style={{
          display: "flex", gap: "16px",
          justifyContent: "center", marginTop: "36px", flexWrap: "wrap",
        }}>
          <Link href="/login" style={{
            background: "#2dd4bf", color: "#0f172a",
            padding: "14px 36px", borderRadius: "10px",
            fontWeight: 700, fontSize: "16px",
            textDecoration: "none", display: "inline-block",
          }}>
            Get Started Free →
          </Link>
          <Link href="/#demo" style={{
            background: "rgba(255,255,255,0.1)",
            border: "1.5px solid rgba(255,255,255,0.3)",
            color: "#fff", padding: "14px 36px",
            borderRadius: "10px", fontWeight: 600,
            fontSize: "16px", textDecoration: "none",
            display: "inline-block",
          }}>
            Request Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
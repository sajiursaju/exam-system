import Link from "next/link";
import { navLinks } from "@/lib/siteConfig";
import { categories } from "@/lib/tutorialData";

export default function Footer() {
  const academic = categories.filter((c) => c.group === "academic");
  const job = categories.filter((c) => c.group === "job");

  const linkStyle = {
    fontSize: "13px",
    color: "#64748b",
    textDecoration: "none",
    transition: "color 0.2s ease",
  };

  return (
    <>
      <style>{`
        .footer-link:hover { color: #2dd4bf !important; }
        .footer-credit:hover { color: #5eead4 !important; text-decoration: underline !important; }
        .footer-social:hover { background: #0d5c5c !important; border-color: #2dd4bf !important; transform: translateY(-2px); }
        .android-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(45,212,191,0.25) !important; }
      `}</style>

      {/* REQUEST DEMO SECTION */}
      <section
        id="demo"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #0d5c5c 100%)",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <span style={{
            display: "inline-block",
            background: "rgba(45,212,191,0.15)",
            border: "1px solid rgba(45,212,191,0.3)",
            borderRadius: "999px",
            padding: "6px 18px",
            fontSize: "13px",
            fontWeight: 600,
            color: "#2dd4bf",
            marginBottom: "24px",
          }}>
            🎬 Free Demo Available
          </span>

          <h2 style={{
            fontSize: "clamp(26px, 4vw, 40px)",
            fontWeight: 800,
            color: "#fff",
            fontFamily: "serif",
            margin: 0,
          }}>
            Want to see it in action?
          </h2>

          <p style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: "17px",
            marginTop: "16px",
            lineHeight: 1.7,
          }}>
            Request a free demo and we will show you exactly how
            the platform works — live exams, analytics, and more.
          </p>

          <div style={{
            display: "flex",
            gap: "14px",
            justifyContent: "center",
            marginTop: "36px",
            flexWrap: "wrap",
          }}>
            <a
              href="https://www.facebook.com/mainulhmoni11"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "#2dd4bf",
                color: "#0f172a",
                padding: "14px 36px",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "15px",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              🎬 Request Demo
            </a>

            <Link href="/login" style={{
              background: "rgba(255,255,255,0.1)",
              border: "1.5px solid rgba(255,255,255,0.25)",
              color: "#fff",
              padding: "14px 36px",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "15px",
              textDecoration: "none",
              display: "inline-block",
            }}>
              🔐 Login
            </Link>
          </div>
        </div>
      </section>

      {/* ── ANDROID APP COMING SOON BANNER ── */}
      <section style={{
        background: "#020617",
        padding: "40px 24px",
        textAlign: "center",
        borderTop: "1px solid #0f172a",
        borderBottom: "1px solid #1e293b",
      }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>

          {/* Label */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(45,212,191,0.08)",
            border: "1px solid rgba(45,212,191,0.2)",
            borderRadius: "999px",
            padding: "5px 16px",
            fontSize: "12px",
            fontWeight: 700,
            color: "#2dd4bf",
            marginBottom: "20px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}>
            <span style={{
              width: "7px", height: "7px",
              borderRadius: "50%",
              background: "#2dd4bf",
              animation: "ping 1.5s ease-in-out infinite",
              display: "inline-block",
            }} />
            Coming Soon
          </div>

          <p style={{
            fontSize: "15px",
            color: "#94a3b8",
            marginBottom: "24px",
            lineHeight: 1.6,
          }}>
            Our official Android app is on the way! <br />
            Practice exams, watch tutorials and track results — right from your phone.
          </p>

          {/* Android Download Button */}
          <Link
            href="/android-coming-soon"
            className="android-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "14px",
              background: "linear-gradient(135deg, #1e293b, #0f172a)",
              border: "1.5px solid #334155",
              borderRadius: "14px",
              padding: "14px 28px",
              textDecoration: "none",
              transition: "all 0.25s ease",
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            }}
          >
            {/* Android Robot Icon */}
            <div style={{
              width: "48px",
              height: "48px",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              flexShrink: 0,
            }}>
              🤖
            </div>

            <div style={{ textAlign: "left" }}>
              <div style={{
                fontSize: "11px",
                color: "#64748b",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "3px",
              }}>
                Download on
              </div>
              <div style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1,
              }}>
                Google Play
              </div>
              <div style={{
                fontSize: "11px",
                color: "#22c55e",
                fontWeight: 600,
                marginTop: "4px",
              }}>
                Android App — Coming Soon
              </div>
            </div>
          </Link>

          <p style={{
            fontSize: "12px",
            color: "#334155",
            marginTop: "16px",
          }}>
            iOS version will follow after the Android launch.
          </p>
        </div>

        <style>{`
          @keyframes ping {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.4); }
          }
        `}</style>
      </section>

      {/* MAIN FOOTER */}
      <footer style={{ background: "#0f172a", color: "#94a3b8" }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "64px 24px 40px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "40px",
        }}>
          {/* COLUMN 1 — BRAND */}
          <div>
            <div style={{
              display: "flex", alignItems: "center",
              gap: "10px", marginBottom: "16px",
            }}>
              <div style={{
                width: "36px", height: "36px",
                background: "linear-gradient(135deg, #0d5c5c, #0f766e)",
                borderRadius: "10px", display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>
                <span style={{
                  fontSize: "18px", fontFamily: "serif",
                  fontWeight: 900, color: "#fff",
                }}>M</span>
              </div>
              <span style={{
                fontSize: "15px", fontWeight: 800,
                color: "#fff", fontFamily: "serif",
              }}>Mentor Mainul</span>
            </div>

            <p style={{ fontSize: "13px", color: "#2dd4bf", fontWeight: 600, marginBottom: "12px" }}>
              Online Exams • Tutorials • Job Prep
            </p>

            <p style={{ fontSize: "13px", lineHeight: 1.7, color: "#64748b" }}>
              Bangladesh's trusted online exam preparation
              platform for BCS, bank jobs, SSC, HSC, and more.
            </p>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <a href="https://www.facebook.com/mainulhmoni11" target="_blank"
                rel="noopener noreferrer" aria-label="Facebook"
                className="footer-social"
                style={{
                  width: "36px", height: "36px", borderRadius: "9px",
                  background: "#1e293b", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "16px",
                  textDecoration: "none", border: "1px solid #334155",
                  transition: "all 0.2s ease",
                }}>📘</a>

              <a href="tel:+8801755488844" aria-label="Call"
                className="footer-social"
                style={{
                  width: "36px", height: "36px", borderRadius: "9px",
                  background: "#1e293b", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "16px",
                  textDecoration: "none", border: "1px solid #334155",
                  transition: "all 0.2s ease",
                }}>📞</a>
            </div>
          </div>

          {/* COLUMN 2 — QUICK LINKS */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "16px" }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Features",           href: "/features" },
                { label: "Online Exams",       href: "/online-exams" },
                { label: "Tutorials",          href: "/tutorials" },
                { label: "Pricing",            href: "/pricing" },
                { label: "Career Opportunities", href: "/career" },
                { label: "Management Team",    href: "/management-team" },
                { label: "FAQ",                href: "/faq" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="footer-link" style={linkStyle}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3 — ACADEMIC */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "16px" }}>
              <Link href="/tutorials" style={{ color: "#fff", textDecoration: "none" }}>Academic</Link>
            </h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {academic.map((c) => (
                <li key={c.slug}>
                  <Link href={`/tutorials/${c.slug}`} className="footer-link" style={linkStyle}>
                    {c.icon} {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4 — JOB PREPARATION */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "16px" }}>
              <Link href="/tutorials" style={{ color: "#fff", textDecoration: "none" }}>Job Preparation</Link>
            </h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {job.map((c) => (
                <li key={c.slug}>
                  <Link href={`/tutorials/${c.slug}`} className="footer-link" style={linkStyle}>
                    {c.icon} {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 5 — CONTACT */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "16px" }}>Contact</h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
              <li>
                <a href="https://www.facebook.com/mainulhmoni11" target="_blank"
                  rel="noopener noreferrer" className="footer-link"
                  style={{ display: "flex", alignItems: "center", gap: "10px", ...linkStyle }}>
                  <span style={{
                    width: "32px", height: "32px", background: "#1e293b",
                    borderRadius: "8px", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "14px",
                    flexShrink: 0, border: "1px solid #334155",
                  }}>📘</span>
                  Facebook Profile
                </a>
              </li>
              <li>
                <a href="tel:+8801755488844" className="footer-link"
                  style={{ display: "flex", alignItems: "center", gap: "10px", ...linkStyle }}>
                  <span style={{
                    width: "32px", height: "32px", background: "#1e293b",
                    borderRadius: "8px", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "14px",
                    flexShrink: 0, border: "1px solid #334155",
                  }}>📞</span>
                  01755488844
                </a>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                <span style={{
                  width: "32px", height: "32px", background: "#1e293b",
                  borderRadius: "8px", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "14px",
                  flexShrink: 0, border: "1px solid #334155",
                }}>📍</span>
                Dinajpur, Bangladesh
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div style={{
          borderTop: "1px solid #1e293b",
          padding: "20px 24px",
          textAlign: "center",
          fontSize: "13px",
          color: "#64748b",
        }}>
          <div style={{
            maxWidth: "1200px", margin: "0 auto",
            display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: "12px",
          }}>
            <span>© {new Date().getFullYear()} Mr Exam Mentor Mainul. All rights reserved.</span>
            <span>
              Developed with ❤️ by{" "}
              <a href="https://sajiur.mystrikingly.com/" target="_blank"
                rel="noopener noreferrer" className="footer-credit"
                style={{ color: "#2dd4bf", fontWeight: 700, textDecoration: "none", transition: "color 0.2s ease" }}>
                Sajiur Rahman
              </a>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
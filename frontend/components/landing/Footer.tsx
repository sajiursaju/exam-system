
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
        .footer-link:hover {
          color: #2dd4bf !important;
        }

        .footer-credit:hover {
          color: #5eead4 !important;
          text-decoration: underline !important;
        }

        .footer-social:hover {
          background: #0d5c5c !important;
          border-color: #2dd4bf !important;
          transform: translateY(-2px);
        }
      `}</style>

      {/* REQUEST DEMO SECTION */}
      <section
        id="demo"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #0d5c5c 100%)",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <span
            style={{
              display: "inline-block",
              background: "rgba(45,212,191,0.15)",
              border: "1px solid rgba(45,212,191,0.3)",
              borderRadius: "999px",
              padding: "6px 18px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#2dd4bf",
              marginBottom: "24px",
            }}
          >
            🎬 Free Demo Available
          </span>

          <h2
            style={{
              fontSize: "clamp(26px, 4vw, 40px)",
              fontWeight: 800,
              color: "#fff",
              fontFamily: "serif",
              margin: 0,
            }}
          >
            Want to see it in action?
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: "17px",
              marginTop: "16px",
              lineHeight: 1.7,
            }}
          >
            Request a free demo and we will show you exactly how
            the platform works — live exams, analytics, and more.
          </p>

          <div
            style={{
              display: "flex",
              gap: "14px",
              justifyContent: "center",
              marginTop: "36px",
              flexWrap: "wrap",
            }}
          >
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

            <Link
              href="/login"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1.5px solid rgba(255,255,255,0.25)",
                color: "#fff",
                padding: "14px 36px",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "15px",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              🔐 Login
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN FOOTER */}
      <footer
        style={{
          background: "#0f172a",
          color: "#94a3b8",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "64px 24px 40px",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "40px",
          }}
        >
          {/* COLUMN 1 — BRAND */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  background:
                    "linear-gradient(135deg, #0d5c5c, #0f766e)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "18px",
                    fontFamily: "serif",
                    fontWeight: 900,
                    color: "#fff",
                  }}
                >
                  M
                </span>
              </div>

              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#fff",
                  fontFamily: "serif",
                }}
              >
                Mentor Mainul
              </span>
            </div>

            <p
              style={{
                fontSize: "13px",
                color: "#2dd4bf",
                fontWeight: 600,
                marginBottom: "12px",
              }}
            >
              Online Exams • Tutorials • Job Prep
            </p>

            <p
              style={{
                fontSize: "13px",
                lineHeight: 1.7,
                color: "#64748b",
              }}
            >
              Bangladesh's trusted online exam preparation
              platform for BCS, bank jobs, SSC, HSC, and more.
            </p>

            {/* SOCIAL LINKS */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <a
                href="https://www.facebook.com/mainulhmoni11"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="footer-social"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "9px",
                  background: "#1e293b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  textDecoration: "none",
                  border: "1px solid #334155",
                  transition: "all 0.2s ease",
                }}
              >
                📘
              </a>

              <a
                href="tel:+8801755488844"
                aria-label="Call"
                className="footer-social"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "9px",
                  background: "#1e293b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  textDecoration: "none",
                  border: "1px solid #334155",
                  transition: "all 0.2s ease",
                }}
              >
                📞
              </a>
            </div>
          </div>

          
{/* COLUMN 2 — QUICK LINKS */}
<div>
  <h4
    style={{
      fontSize: "14px",
      fontWeight: 700,
      color: "#fff",
      marginBottom: "16px",
    }}
  >
    Quick Links
  </h4>

  <ul
    style={{
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    }}
  >
    {[
      { label: "Features", href: "/features" },
      { label: "Online Exams", href: "/online-exams" },
      { label: "Tutorials", href: "/tutorials" },
      { label: "Pricing", href: "/pricing" },
      { label: "Career Opportunities", href: "/career" },
      { label: "Management Team", href: "/management-team" },
      { label: "FAQ", href: "/faq" },
      
    ].map((link) => (
      <li key={link.label}>
        <Link
          href={link.href}
          className="footer-link"
          style={linkStyle}
        >
          {link.label}
        </Link>
      </li>
    ))}
  </ul>
</div>

          {/* COLUMN 3 — ACADEMIC */}
          <div>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "16px",
              }}
            >
              <Link
                href="/tutorials"
                style={{
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                Academic
              </Link>
            </h4>

            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {academic.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/tutorials/${c.slug}`}
                    className="footer-link"
                    style={linkStyle}
                  >
                    {c.icon} {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4 — JOB PREPARATION */}
          <div>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "16px",
              }}
            >
              <Link
                href="/tutorials"
                style={{
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                Job Preparation
              </Link>
            </h4>

            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {job.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/tutorials/${c.slug}`}
                    className="footer-link"
                    style={linkStyle}
                  >
                    {c.icon} {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 5 — CONTACT */}
          <div>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "16px",
              }}
            >
              Contact
            </h4>

            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <li>
                <a
                  href="https://www.facebook.com/mainulhmoni11"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    ...linkStyle,
                  }}
                >
                  <span
                    style={{
                      width: "32px",
                      height: "32px",
                      background: "#1e293b",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      flexShrink: 0,
                      border: "1px solid #334155",
                    }}
                  >
                    📘
                  </span>
                  Facebook Profile
                </a>
              </li>

              <li>
                <a
                  href="tel:+8801755488844"
                  className="footer-link"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    ...linkStyle,
                  }}
                >
                  <span
                    style={{
                      width: "32px",
                      height: "32px",
                      background: "#1e293b",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      flexShrink: 0,
                      border: "1px solid #334155",
                    }}
                  >
                    📞
                  </span>
                  01755488844
                </a>
              </li>

              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13px",
                }}
              >
                <span
                  style={{
                    width: "32px",
                    height: "32px",
                    background: "#1e293b",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    flexShrink: 0,
                    border: "1px solid #334155",
                  }}
                >
                  📍
                </span>
                Dinajpur, Bangladesh
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT & DEVELOPER CREDIT */}
        <div
          style={{
            borderTop: "1px solid #1e293b",
            padding: "20px 24px",
            textAlign: "center",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <span>
              © {new Date().getFullYear()} Mr Exam Mentor Mainul.
              All rights reserved.
            </span>

            <span>
              Developed with ❤️ by{" "}
              <a
                href="https://sajiur.mystrikingly.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-credit"
                style={{
                  color: "#2dd4bf",
                  fontWeight: 700,
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                }}
              >
                Sajiur Rahman
              </a>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}

const features = [
    {
      icon: "⏱️", title: "Timed Mock Exams",
      desc: "Real exam conditions with auto-submit, live timer, and question navigator.",
      color: "#2563eb", bg: "#dbeafe",
    },
    {
      icon: "📊", title: "Instant Analytics",
      desc: "Get detailed score breakdown, correct/wrong answers, and performance trends.",
      color: "#16a34a", bg: "#dcfce7",
    },
    {
      icon: "🛡️", title: "Anti-Cheating System",
      desc: "Tab-switch detection and auto-submit keeps exams fair for everyone.",
      color: "#dc2626", bg: "#fee2e2",
    },
    {
      icon: "📱", title: "Mobile Friendly",
      desc: "Study anywhere on any device — phone, tablet, or desktop.",
      color: "#7c3aed", bg: "#ede9fe",
    },
    {
      icon: "🎯", title: "Target Exam Focus",
      desc: "See only the exams that match your target — BCS, bank job, SSC, and more.",
      color: "#d97706", bg: "#fef3c7",
    },
    {
      icon: "✅", title: "Admin Approval",
      desc: "Verified student accounts ensure a trusted learning community.",
      color: "#0891b2", bg: "#cffafe",
    },
  ];
  
  export default function Features() {
    return (
      <section style={{ background: "#fff", padding: "72px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span style={{
              background: "#dcfce7", color: "#15803d",
              borderRadius: "999px", padding: "6px 18px",
              fontSize: "13px", fontWeight: 700,
              display: "inline-block", marginBottom: "16px",
            }}>
              Why Choose Us
            </span>
            <h2 style={{
              fontSize: "clamp(26px, 4vw, 40px)",
              fontWeight: 800, color: "#0f172a",
              margin: 0, fontFamily: "serif",
            }}>
              Everything you need to succeed
            </h2>
          </div>
  
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "24px",
          }}>
            {features.map((f) => (
              <div key={f.title} style={{
                background: "#f8fafc",
                border: "1.5px solid #e2e8f0",
                borderRadius: "16px", padding: "28px",
                display: "flex", gap: "18px",
              }}>
                <div style={{
                  width: "52px", height: "52px", flexShrink: 0,
                  background: f.bg, borderRadius: "14px",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "26px",
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                    {f.title}
                  </div>
                  <div style={{ fontSize: "14px", color: "#64748b", marginTop: "6px", lineHeight: 1.6 }}>
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
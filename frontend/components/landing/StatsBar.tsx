const stats = [
    { value: "50,000+", label: "Students Enrolled", icon: "🎓" },
    { value: "1,200+", label: "Practice Exams", icon: "📝" },
    { value: "98%", label: "Success Rate", icon: "🏆" },
    { value: "150+", label: "Expert Teachers", icon: "👨‍🏫" },
  ];
  
  export default function StatsBar() {
    return (
      <section style={{ background: "#0f172a", padding: "28px 24px" }}>
        <div style={{
          maxWidth: "1200px", margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "24px",
        }}>
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", marginBottom: "4px" }}>{s.icon}</div>
              <div style={{ fontSize: "26px", fontWeight: 800, color: "#2dd4bf" }}>{s.value}</div>
              <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    );
  }
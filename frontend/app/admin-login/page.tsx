// frontend/app/admin-login/page.tsx
import AuthLoginForm from "@/components/AuthLoginForm";

export default function AdminLoginPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", flexWrap: "wrap" }}>

      {/* Left branding panel */}
      <div style={{
        flex: "1 1 45%",
        background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: "60px 40px", textAlign: "center",
        minHeight: "300px",
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: "20px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
          boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
        }}>
          <span style={{ fontSize: "36px" }}>🎓</span>
        </div>

        <h1 style={{
          fontSize: "34px", fontWeight: 900,
          color: "#fff", fontFamily: "serif", margin: 0,
        }}>
          Mentor Mainul
        </h1>

        <p style={{
          fontSize: "14px", color: "rgba(255,255,255,0.5)",
          marginTop: "10px", maxWidth: "260px", lineHeight: 1.6,
        }}>
          Staff & Admin Portal — secure access only
        </p>

        <div style={{
          marginTop: "40px", display: "flex",
          flexDirection: "column", gap: "12px",
          width: "100%", maxWidth: "240px",
        }}>
          {["Manage exams & questions", "Approve student accounts", "View results & analytics"].map((t) => (
            <div key={t} style={{
              display: "flex", alignItems: "center", gap: "10px",
              fontSize: "13px", color: "rgba(255,255,255,0.6)",
            }}>
              <span style={{ color: "#818cf8" }}>✓</span> {t}
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: "1 1 55%",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: "40px 24px",
        background: "#f8fafc",
        minHeight: "300px",
      }}>
        <AuthLoginForm
          allowedRoles={["ADMIN", "TEACHER"]}
          themeColor="#6366f1"
          title="Staff Sign In"
          subtitle="Admin and Teacher accounts only"
          redirectPath="/admin/dashboard"
          studentLoginPath="/login"
        />
      </div>

    </div>
  );
}
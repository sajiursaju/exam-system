
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import { Loading } from "@/components/ui";

const UserContext = createContext<User | null>(null);

export function useUser(): User {
  const user = useContext(UserContext);
  if (!user) throw new Error("useUser must be used inside <Shell>");
  return user;
}

type NavItem = { label: string; href: string; icon: string };

function adminNav(): NavItem[] {
  return [
    { label: "Dashboard", href: "/admin/dashboard", icon: "🏠" },
    { label: "Exams", href: "/admin/exams", icon: "📝" },
    { label: "Students", href: "/admin/students", icon: "🎓" },
    { label: "Teachers", href: "/admin/teachers", icon: "👨‍🏫" },
    { label: "Study Materials", href: "/admin/materials", icon: "📚" },
    { label: "Notice Board", href: "/admin/notices", icon: "📢" }, // ← added
    { label: "Settings", href: "/admin/settings", icon: "⚙️" },
  ];
}

function teacherNav(): NavItem[] {
  return [
    { label: "Dashboard", href: "/admin/dashboard", icon: "🏠" },
    { label: "New Exam", href: "/admin/exams/new", icon: "➕" },
    { label: "Students", href: "/admin/students", icon: "🎓" },
    { label: "Settings", href: "/admin/settings", icon: "⚙️" },
  ];
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function Avatar({ user, size = 32 }: { user: User; size?: number }) {
  const [imgError, setImgError] = useState(false);

  return user.avatarUrl && !imgError ? (
    <img
      src={user.avatarUrl}
      alt={user.name}
      onError={() => setImgError(true)}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
      }}
    />
  ) : (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--accent)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4 + "px",
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {getInitials(user.name)}
    </div>
  );
}

// ─── Student layout ───────────────────────
function StudentShell({
  user,
  logout,
  children,
}: {
  user: User;
  logout: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Student navigation
  const links = [
    { label: "My Exams", href: "/student/dashboard" },
    { label: "My Results", href: "/student/dashboard#results" },
    { label: "Materials", href: "/student/materials" },
    { label: "Profile", href: "/student/profile" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--line)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 20px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "var(--accent)",
                fontFamily: "serif",
              }}
            >
              Mr Exam Mentor Mainul
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav
            style={{ display: "flex", gap: "4px", flex: 1 }}
            className="student-desktop-nav"
          >
            {links.map((l) => {
              const active =
                pathname === l.href.split("#")[0] &&
                (l.label === "My Exams" || l.label === "My Results"
                  ? l.label === "My Exams"
                  : true);

              return (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    padding: "6px 14px",
                    fontSize: "14px",
                    fontWeight: active ? 600 : 400,
                    color: active ? "var(--accent)" : "var(--fg)",
                    textDecoration: "none",
                    borderRadius: "6px",
                    background: active
                      ? "var(--accent-soft, #f0f4ff)"
                      : "transparent",
                  }}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* User profile and logout */}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <Link
              href="/student/profile"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                color: "var(--fg)",
              }}
            >
              <Avatar user={user} size={34} />

              <div
                className="student-desktop-nav"
                style={{ lineHeight: 1.2 }}
              >
                <div style={{ fontSize: "13px", fontWeight: 600 }}>
                  {user.name}
                </div>

                {user.targetExam && (
                  <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                    {user.targetExam}
                  </div>
                )}
              </div>
            </Link>

            <button
              onClick={logout}
              className="btn btn-sm"
              style={{ fontSize: "12px" }}
            >
              Logout
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="student-mobile-menu-btn"
              style={{
                background: "none",
                border: "none",
                fontSize: "22px",
                cursor: "pointer",
                color: "var(--fg)",
                display: "none",
              }}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {menuOpen && (
          <div
            className="student-mobile-menu"
            style={{
              borderTop: "1px solid var(--line)",
              padding: "8px 20px 12px",
              display: "none",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: "10px 12px",
                  fontSize: "14px",
                  color:
                    pathname === l.href.split("#")[0]
                      ? "var(--accent)"
                      : "var(--fg)",
                  textDecoration: "none",
                  borderRadius: "6px",
                  display: "block",
                }}
              >
                {l.label}
              </Link>
            ))}

            <button
              onClick={logout}
              style={{
                marginTop: "8px",
                padding: "10px 12px",
                fontSize: "14px",
                color: "#b91c1c",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                borderRadius: "6px",
              }}
            >
              Logout
            </button>
          </div>
        )}
      </header>

      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "28px 20px",
        }}
      >
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .student-desktop-nav {
            display: none !important;
          }

          .student-mobile-menu-btn {
            display: block !important;
          }

          .student-mobile-menu {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Staff layout: sidebar ────────────────────────────────────────
function StaffShell({
  user,
  logout,
  children,
}: {
  user: User;
  logout: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = user.role === "ADMIN" ? adminNav() : teacherNav();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg)",
      }}
    >
      <aside
        style={{
          width: "240px",
          flexShrink: 0,
          background: "var(--surface)",
          borderRight: "1px solid var(--line)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
        className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}
      >
        <div
          style={{
            padding: "24px 20px 16px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--accent)",
                fontFamily: "serif",
              }}
            >
              Mr Exam Mentor Mainul
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                marginTop: "2px",
              }}
            >
              {user.role === "ADMIN" ? "Admin Panel" : "Teacher Panel"}
            </div>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: "12px 0" }}>
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="nav-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 20px",
                  fontSize: "14px",
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--accent)" : "var(--fg)",
                  background: active
                    ? "var(--accent-soft, #f0f4ff)"
                    : "transparent",
                  borderLeft: active
                    ? "3px solid var(--accent)"
                    : "3px solid transparent",
                  textDecoration: "none",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Avatar user={user} size={36} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.name}
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "var(--muted)",
                textTransform: "capitalize",
              }}
            >
              {user.role.toLowerCase()}
            </div>
          </div>
        </div>
      </aside>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <header
          style={{
            background: "var(--surface)",
            borderBottom: "1px solid var(--line)",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hamburger-btn"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              display: "none",
            }}
          >
            ☰
          </button>

          <span style={{ fontSize: "14px", color: "var(--muted)" }}>
            Welcome back,{" "}
            <strong style={{ color: "var(--fg)" }}>{user.name}</strong>
          </span>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Link
              href="/admin/profile"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                textDecoration: "none",
              }}
            >
              <Avatar user={user} size={28} />

              <span
                className="hide-mobile"
                style={{
                  fontSize: "13px",
                  color: "var(--fg)",
                  fontWeight: 500,
                }}
              >
                {user.name}
              </span>
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <span>🚪</span>
              Logout
            </button>
          </div>
        </header>

        <main
          style={{
            flex: 1,
            padding: "28px 32px",
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 20,
            display: "none",
          }}
          className="mobile-overlay"
        />
      )}

      <style>{`
        .nav-link:hover {
          background-color: var(--bg) !important;
          color: var(--accent) !important;
        }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed !important;
            left: -240px;
            top: 0;
            height: 100vh;
            z-index: 30;
            transition: left 0.25s ease;
          }

          .sidebar.sidebar-open {
            left: 0 !important;
          }

          .hamburger-btn {
            display: block !important;
          }

          .mobile-overlay {
            display: block !important;
          }

          .hide-mobile {
            display: none;
          }

          main {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Main Shell export ────────────────────────────────────────────
export default function Shell({
  area,
  children,
}: {
  area: "staff" | "student";
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let alive = true;

    api<{ user: User }>("/auth/me")
      .then(({ user }) => {
        if (!alive) return;

        const isStaff = user.role !== "STUDENT";

        if (area === "staff" && !isStaff) {
          router.replace("/student/dashboard");
        } else if (area === "student" && isStaff) {
          router.replace("/admin/dashboard");
        } else {
          setUser(user);
        }
      })
      .catch(() => {
        if (alive) {
          router.replace(area === "staff" ? "/admin/login" : "/login");
        }
      });

    return () => {
      alive = false;
    };
  }, [area, router]);

  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => {});

    const isStaff =
      user?.role === "ADMIN" || user?.role === "TEACHER";

    router.replace(isStaff ? "/admin/login" : "/login");
    router.refresh();
  }

  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loading />
      </div>
    );
  }

  const focusMode = pathname.startsWith("/student/attempt/");

  if (focusMode) {
    return (
      <UserContext.Provider value={user}>
        <main>{children}</main>
      </UserContext.Provider>
    );
  }

  return (
    <UserContext.Provider value={user}>
      {area === "student" ? (
        <StudentShell user={user} logout={logout}>
          {children}
        </StudentShell>
      ) : (
        <StaffShell user={user} logout={logout}>
          {children}
        </StaffShell>
      )}
    </UserContext.Provider>
  );
}

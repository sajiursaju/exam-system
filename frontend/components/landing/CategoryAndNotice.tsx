
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const categories = [
  { label: "Class 9-10", slug: "class-9-10", icon: "📗", color: "#2563eb", bg: "#dbeafe" },
  { label: "HSC 11-12", slug: "hsc-11-12", icon: "📘", color: "#7c3aed", bg: "#ede9fe" },
  { label: "English", slug: "english", icon: "🔤", color: "#db2777", bg: "#fce7f3" },
  { label: "Admission", slug: "admission", icon: "🎓", color: "#d97706", bg: "#fef3c7" },
  { label: "Nursing", slug: "nursing", icon: "🏥", color: "#0891b2", bg: "#cffafe" },
  { label: "Primary Teacher", slug: "primary", icon: "🏫", color: "#16a34a", bg: "#dcfce7" },
  { label: "BCS", slug: "bcs", icon: "🏛️", color: "#dc2626", bg: "#fee2e2" },
  { label: "Bank Job", slug: "bank-job", icon: "🏦", color: "#0d5c5c", bg: "#ccfbf1" },
  { label: "Niyogon", slug: "niyogon", icon: "📋", color: "#9333ea", bg: "#f3e8ff" },
  { label: "All Job Prep", slug: "all-job", icon: "💼", color: "#ea580c", bg: "#ffedd5" },
];

type Notice = {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
};

const NOTICES_PER_PAGE = 5;

export default function CategoryAndNotice() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);

    check();

    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  // Fetch public notices (no login required)
  useEffect(() => {
    let cancelled = false;

    async function fetchNotices() {
      try {
        setLoading(true);
        setError(false);

        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        if (!API_URL) {
          throw new Error("API URL is not configured");
        }

        const response = await fetch(
          `${API_URL.replace(/\/$/, "")}/notices/public`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch notices");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid notice response");
        }

        if (!cancelled) {
          setNotices(data);
          setCurrentPage(1);
        }
      } catch (err) {
        console.error("Notice fetch error:", err);

        if (!cancelled) {
          setError(true);
          setNotices([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchNotices();

    return () => {
      cancelled = true;
    };
  }, []);

  // Time ago
  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();

    if (isNaN(diff) || diff < 0) return "Recently";

    const days = Math.floor(diff / 86400000);

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";

    return `${days} days ago`;
  }

  // Pagination
  const totalPages = Math.ceil(notices.length / NOTICES_PER_PAGE);

  const startIndex = (currentPage - 1) * NOTICES_PER_PAGE;

  const currentNotices = notices.slice(
    startIndex,
    startIndex + NOTICES_PER_PAGE
  );

  // Notice Board
  const NoticeBoard = (
    <div
      style={{
        background: "#0f172a",
        borderRadius: "16px",
        padding: "20px",
        border: "1.5px solid #1e293b",
        boxSizing: "border-box",
        width: "100%",
        height: "560px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "16px",
          paddingBottom: "12px",
          borderBottom: "1px solid #1e293b",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            background: "#0d5c5c",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            flexShrink: 0,
          }}
        >
          📢
        </div>

        <div>
          <div
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            Notice Board
          </div>

          <div
            style={{
              fontSize: "11px",
              color: "#64748b",
            }}
          >
            Latest announcements
          </div>
        </div>
      </div>

      {/* Content area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
        }}
      >
        {/* Loading */}
        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  height: "62px",
                  borderRadius: "10px",
                  background: "#1e293b",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                marginBottom: "8px",
              }}
            >
              ⚠️
            </div>

            Could not load notices
          </div>
        )}

        {/* Empty */}
        {!loading && !error && notices.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                marginBottom: "8px",
              }}
            >
              📭
            </div>

            No notices yet
          </div>
        )}

        {/* Notices list */}
        {!loading && !error && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {currentNotices.map((n) => (
              <div
                key={n.id}
                style={{
                  background: n.isPinned
                    ? "rgba(45,212,191,0.07)"
                    : "#1e293b",
                  border: n.isPinned
                    ? "1.5px solid rgba(45,212,191,0.3)"
                    : "1.5px solid transparent",
                  borderRadius: "10px",
                  padding: "11px 13px",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
              >
                {/* Pinned */}
                {n.isPinned && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "10px",
                      color: "#2dd4bf",
                      fontWeight: 700,
                      marginBottom: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    📌 Pinned
                  </div>
                )}

                {/* Title */}
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#f1f5f9",
                    lineHeight: 1.4,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {n.title}
                </div>

                {/* Date */}
                <div
                  style={{
                    fontSize: "11px",
                    color: "#475569",
                    marginTop: "5px",
                  }}
                >
                  {timeAgo(n.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination + View All */}
      {!loading && !error && notices.length > 0 && (
        <div
          style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid #1e293b",
            flexShrink: 0,
          }}
        >
          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
                gap: "8px",
              }}
            >
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.max(1, p - 1))
                }
                disabled={currentPage === 1}
                style={{
                  background:
                    currentPage === 1 ? "#1e293b" : "#0d5c5c",
                  color:
                    currentPage === 1 ? "#475569" : "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor:
                    currentPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                ← Prev
              </button>

              <span
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                }}
              >
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(totalPages, p + 1)
                  )
                }
                disabled={currentPage === totalPages}
                style={{
                  background:
                    currentPage === totalPages
                      ? "#1e293b"
                      : "#0d5c5c",
                  color:
                    currentPage === totalPages
                      ? "#475569"
                      : "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor:
                    currentPage === totalPages
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Next →
              </button>
            </div>
          )}

          {/* View All */}
          <Link
            href="/notices"
            style={{
              display: "block",
              textAlign: "center",
              fontSize: "13px",
              color: "#2dd4bf",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            View All Notices →
          </Link>
        </div>
      )}
    </div>
  );

  // Category Grid
  const CategoryGrid = (
    <div
      style={{
        width: "100%",
        minWidth: 0,
      }}
    >
      <div
        style={{
          marginBottom: "24px",
        }}
      >
        <span
          style={{
            background: "#dbeafe",
            color: "#1d4ed8",
            borderRadius: "999px",
            padding: "6px 18px",
            fontSize: "13px",
            fontWeight: 700,
            display: "inline-block",
            marginBottom: "12px",
          }}
        >
          Explore Categories
        </span>

        <h2
          style={{
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 800,
            color: "#0f172a",
            margin: 0,
            fontFamily: "serif",
          }}
        >
          What do you want to prepare for?
        </h2>

        <p
          style={{
            color: "#64748b",
            marginTop: "8px",
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          Choose your exam category and start practicing.
        </p>
      </div>

      {/* Category Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "repeat(2, minmax(0, 1fr))"
            : "repeat(auto-fill, minmax(175px, 1fr))",
          gap: "16px",
          width: "100%",
        }}
      >
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/tutorials/${c.slug}`}
            style={{
              textDecoration: "none",
              minWidth: 0,
            }}
          >
            <div
              style={{
                background: "#fff",
                border: "1.5px solid #e2e8f0",
                borderRadius: "14px",
                padding: isMobile
                  ? "18px 12px"
                  : "22px 18px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                transition: "all 0.2s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                minHeight: "125px",
                boxSizing: "border-box",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = c.color;
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = `0 8px 24px ${c.color}22`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Top Color Line */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: c.color,
                  borderRadius: "12px 12px 0 0",
                }}
              />

              {/* Icon */}
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  background: c.bg,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "23px",
                  flexShrink: 0,
                }}
              >
                {c.icon}
              </div>

              {/* Category Name */}
              <div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 750,
                    color: "#0f172a",
                    lineHeight: 1.4,
                  }}
                >
                  {c.label}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: c.color,
                    fontWeight: 600,
                    marginTop: "4px",
                  }}
                >
                  Explore →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  // Main Layout
  return (
    <section
      style={{
        background: "#f8fafc",
        padding: isMobile ? "40px 16px" : "64px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : "minmax(0, 3fr) minmax(300px, 1fr)",
          gap: isMobile ? "32px" : "24px",
          paddingRight: isMobile ? "0" : "12px",
          alignItems: "start",
          boxSizing: "border-box",
        }}
      >
        {isMobile ? (
          <>
            {NoticeBoard}
            {CategoryGrid}
          </>
        ) : (
          <>
            {CategoryGrid}
            {NoticeBoard}
          </>
        )}
      </div>
    </section>
  );
}

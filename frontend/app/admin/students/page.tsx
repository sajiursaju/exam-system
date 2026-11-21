// frontend/app/admin/students/page.tsx
"use client";

import UsersPanel from "@/components/UsersPanel";

export default function AdminStudentsPage() {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Manage Students</h1>
        <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>
          Approve pending accounts, deactivate users, or view their assigned target exams.
        </p>
      </div>
      
      <UsersPanel />
    </div>
  );
}
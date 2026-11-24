
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, ApiError } from "@/lib/api";

type Material = {
  id: number;
  title: string;
  category: string;
  originalName: string;
  fileSize: number;
  createdAt: string;
};

const CATEGORIES = [
  "Class 9-10",
  "HSC 11-12",
  "English (Basic to Advance)",
  "Admission",
  "Nursing",
  "Primary Teacher",
  "BCS",
  "Bank Job",
  "Niyogon",
  "All Job Preparation",
];

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadMaterials = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api<{ materials: Material[] }>("/materials");
      setMaterials(data.materials);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not load study materials."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  async function handleUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim() || !category || !file) {
      setError("Please fill in all fields and select a PDF.");
      return;
    }

    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("PDF must be 10 MB or smaller.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("category", category);
    formData.append("file", file);

    setUploading(true);

    try {
      await api("/materials", {
        method: "POST",
        body: formData,
      });

      setTitle("");
      setCategory("");
      setFile(null);

      const input = document.getElementById(
        "material-pdf"
      ) as HTMLInputElement | null;

      if (input) input.value = "";

      setSuccess("Study material uploaded successfully.");
      await loadMaterials();
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(material: Material) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${material.title}"?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(material.id);

    try {
      await api(`/materials/${material.id}`, {
        method: "DELETE",
      });

      setMaterials((previous) =>
        previous.filter((item) => item.id !== material.id)
      );

      setSuccess("Study material deleted successfully.");
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not delete study material."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function openPDF(id: number) {
    window.open(
      `/api/materials/${id}/download`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function formatSize(bytes: number) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7">

      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          📚 Study Materials
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload and manage category-wise PDF study materials.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Upload form */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-5 text-lg font-bold text-slate-800">
          Upload New Material
        </h2>

        <form onSubmit={handleUpload} className="space-y-5">

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Material Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Example: BCS Preliminary Mathematics"
                maxLength={200}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Exam Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
              >
                <option value="">Select category</option>

                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              PDF File
            </label>

            <input
              id="material-pdf"
              type="file"
              accept=".pdf,application/pdf"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full rounded-lg border border-slate-300 p-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:font-semibold file:text-indigo-700"
            />

            <p className="mt-2 text-xs text-slate-500">
              PDF only. Maximum file size: 10 MB.
            </p>

            {file && (
              <p className="mt-2 text-sm text-green-700">
                Selected: {file.name} ({formatSize(file.size)})
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "⬆ Upload Study Material"}
          </button>

        </form>
      </section>

      {/* Materials list */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Uploaded Materials
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Total: {materials.length} PDF files
            </p>
          </div>

          <button
            type="button"
            onClick={loadMaterials}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Loading materials...
          </p>
        ) : materials.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-4xl">📄</div>
            <p className="mt-3 font-semibold text-slate-700">
              No materials uploaded yet.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Upload your first PDF using the form above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Material</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Size</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {materials.map((material) => (
                  <tr key={material.id}>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">
                        {material.title}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {material.originalName}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                        {material.category}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatSize(material.fileSize)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(material.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openPDF(material.id)}
                          className="font-semibold text-indigo-600 hover:underline"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === material.id}
                          onClick={() => handleDelete(material)}
                          className="font-semibold text-red-600 hover:underline disabled:opacity-50"
                        >
                          {deletingId === material.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </section>
    </div>
  );
}


"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Pin,
  PinOff,
  Eye,
  EyeOff,
  Bell,
  RefreshCw,
  X,
  Save,
  Loader2,
} from "lucide-react";

type Notice = {
  id: number;
  title: string;
  content: string;
  isPublished: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
};

// API base URL. Your .env.local should include /api.
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminNoticePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setIsPublished(false);
    setIsPinned(false);
    setEditingId(null);
    setShowForm(false);
  };

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/notices/admin`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load notices");
      }

      setNotices(Array.isArray(data) ? data : data.notices || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Please enter both title and notice content.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const url = editingId
        ? `${API_URL}/notices/${editingId}`
        : `${API_URL}/notices`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          isPublished,
          isPinned,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save notice");
      }

      setSuccess(
        editingId
          ? "Notice updated successfully!"
          : "Notice created successfully!"
      );

      resetForm();
      await fetchNotices();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingId(notice.id);
    setTitle(notice.title);
    setContent(notice.content);
    setIsPublished(notice.isPublished);
    setIsPinned(notice.isPinned);
    setShowForm(true);
    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/notices/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete notice");
      }

      setSuccess("Notice deleted successfully!");
      await fetchNotices();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  };

  const handlePublish = async (id: number) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/notices/${id}/publish`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update publish status");
      }

      setSuccess("Notice status updated successfully!");
      await fetchNotices();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  };

  const handlePin = async (id: number) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/notices/${id}/pin`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update pin status");
      }

      setSuccess("Notice pin status updated!");
      await fetchNotices();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  };

  const publishedCount = notices.filter(
    (notice) => notice.isPublished
  ).length;

  const pinnedCount = notices.filter(
    (notice) => notice.isPinned
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="h-7 w-7 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
                Notice Management
              </h1>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Create, manage and publish important announcements.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchNotices}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
                setError("");
                setSuccess("");
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus size={18} />
              Create Notice
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={() => setError("")}>
              <X size={18} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <span>{success}</span>
            <button onClick={() => setSuccess("")}>
              <X size={18} />
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Notices
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-800">
              {notices.length}
            </h2>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Published
            </p>
            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {publishedCount}
            </h2>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Pinned Notices
            </p>
            <h2 className="mt-2 text-3xl font-bold text-blue-600">
              {pinnedCount}
            </h2>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? "Edit Notice" : "Create New Notice"}
              </h2>

              <button
                onClick={resetForm}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Notice Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  placeholder="Enter notice title"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Notice Content
                </label>

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  placeholder="Write your notice here..."
                  required
                  className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  Publish immediately
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  Pin this notice
                </label>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Notice"
                      : "Save Notice"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notices List */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-800">
              All Notices
            </h2>

            <span className="text-sm text-slate-500">
              {notices.length} notices
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : notices.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Bell className="mx-auto h-12 w-12 text-slate-300" />

              <h3 className="mt-4 font-semibold text-slate-700">
                No notices found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create your first notice to get started.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className="p-5 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="wrap-break-word text-base font-bold text-slate-800">
                          {notice.title}
                        </h3>

                        {notice.isPinned && (
                          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            Pinned
                          </span>
                        )}

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            notice.isPublished
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {notice.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>

                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                        {notice.content}
                      </p>

                      <p className="mt-3 text-xs text-slate-400">
                        Created:{" "}
                        {new Date(notice.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        onClick={() => handlePublish(notice.id)}
                        title={notice.isPublished ? "Unpublish" : "Publish"}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        {notice.isPublished ? (
                          <>
                            <EyeOff size={15} /> Unpublish
                          </>
                        ) : (
                          <>
                            <Eye size={15} /> Publish
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handlePin(notice.id)}
                        title={notice.isPinned ? "Unpin" : "Pin"}
                        className="flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                      >
                        {notice.isPinned ? (
                          <>
                            <PinOff size={15} /> Unpin
                          </>
                        ) : (
                          <>
                            <Pin size={15} /> Pin
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleEdit(notice)}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <Pencil size={15} /> Edit
                      </button>

                      <button
                        onClick={() => handleDelete(notice.id)}
                        className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

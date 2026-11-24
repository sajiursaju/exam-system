
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

type Material = {
    id: number;
    title: string;
    category: string;
    originalName: string;
    fileSize: number;
    createdAt: string;
};

export default function StudentMaterialsPage() {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadMaterials() {
            try {
                setLoading(true);
                setError("");

                // Check logged-in user
                const profileResponse = await api<{ user: User }>(
                    "/profile/me"
                );

                if (cancelled) return;

                const currentUser = profileResponse.user;

                // Only students can access this page
                if (currentUser.role !== "STUDENT") {
                    router.replace("/admin/dashboard");
                    return;
                }

                setUser(currentUser);

                // Load study materials for this student's category
                const materialsResponse = await api<{
                    materials: Material[];
                }>("/materials");

                if (cancelled) return;

                setMaterials(materialsResponse.materials || []);
            } catch (err) {
                if (cancelled) return;

                if (err instanceof ApiError && err.status === 401) {
                    router.replace("/login");
                    return;
                }

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load study materials."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadMaterials();

        return () => {
            cancelled = true;
        };
    }, [router]);

    // Open PDF in a new browser tab
    function viewMaterial(id: number) {
        window.open(
            `/api/materials/${id}/download`,
            "_blank",
            "noopener,noreferrer"
        );
    }

    // Download PDF to the device
    function downloadMaterial(id: number) {
        const link = document.createElement("a");

        link.href = `/api/materials/${id}/download?download=true`;
        link.download = "";

        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    // Format file size
    function formatFileSize(bytes: number) {
        if (!bytes || bytes <= 0) return "Unknown size";

        if (bytes < 1024) {
            return `${bytes} Bytes`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                    <p className="text-sm font-medium text-gray-500">
                        Loading study materials...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

            {/* Page Header */}
            <div className="mb-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                            Study Materials
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Access and download your study materials and PDF
                            documents.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                        <span className="text-xl">📚</span>
                        <div>
                            <p className="text-xs font-medium text-blue-600">
                                Your Category
                            </p>
                            <p className="text-sm font-bold text-blue-900">
                                {user?.targetExam || "Not specified"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Materials Count */}
            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                    Available Materials
                </h2>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {materials.length} {materials.length === 1 ? "File" : "Files"}
                </span>
            </div>

            {/* Empty State */}
            {!error && materials.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                    <div className="mb-4 text-5xl">📂</div>

                    <h3 className="text-lg font-bold text-gray-800">
                        No Study Materials Available
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                        There are currently no study materials available for
                        your category. Please check again later.
                    </p>
                </div>
            )}

            {/* Materials List */}
            {materials.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="divide-y divide-gray-100">
                        {materials.map((material) => (
                            <div
                                key={material.id}
                                className="flex flex-col gap-4 p-4 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                            >
                                {/* Material Information */}
                                <div className="flex min-w-0 items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-2xl">
                                        📄
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="break-words text-sm font-bold text-gray-900 sm:text-base">
                                            {material.title}
                                        </h3>

                                        <p className="mt-1 break-all text-xs text-gray-500">
                                            {material.originalName}
                                        </p>

                                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                            <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                                                {material.category}
                                            </span>

                                            <span>
                                                {formatFileSize(material.fileSize)}
                                            </span>

                                            <span>
                                                {new Date(
                                                    material.createdAt
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* View and Download Buttons */}
                                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            viewMaterial(material.id)
                                        }
                                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        👁 View
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            downloadMaterial(material.id)
                                        }
                                        className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                    >
                                        ⬇ Download
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer Note */}
            <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">
                    <strong>Note:</strong> These study materials are provided
                    by your administrator for your exam preparation.
                </p>
            </div>
        </div>
    );
}

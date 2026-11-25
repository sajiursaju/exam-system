
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Exam {
  id: number;
  title: string;
  targetExam: string;
}

interface ExamAccess {
  id: number;
  exam: Exam;
}

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  targetExam: string;
  avatarUrl: string | null;
}

interface PaymentRequest {
  id: number;
  method: string;
  transactionId: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  student: Student;
  examAccesses: ExamAccess[];
}

interface PaymentStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalEarned: number;
}

const initialStats: PaymentStats = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  totalEarned: 0,
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("PENDING");

  const [stats, setStats] = useState<PaymentStats>(initialStats);

  const [approveModal, setApproveModal] = useState<PaymentRequest | null>(null);
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [selectedExamIds, setSelectedExamIds] = useState<number[]>([]);
  const [examLoading, setExamLoading] = useState(false);

  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState<number | null>(null);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const [paymentsData, statsData] = await Promise.all([
        api<PaymentRequest[]>(
          `/payments/all?status=${filterStatus}`
        ),
        api<PaymentStats>("/payments/stats"),
      ]);

      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setStats(statsData);
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Unable to load payment requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const openApproveModal = async (payment: PaymentRequest) => {
    setApproveModal(payment);
    setSelectedExamIds([]);
    setAllExams([]);
    setErrorMsg("");
    setExamLoading(true);

    try {
      const data = await api<{ exams: Exam[] }>("/exams");

      setAllExams(
        Array.isArray(data.exams) ? data.exams : []
      );
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Unable to load exams."
      );
    } finally {
      setExamLoading(false);
    }
  };

  const matchingExams = approveModal
    ? allExams.filter(
        (exam) =>
          String(exam.targetExam).toLowerCase() ===
          String(approveModal.student.targetExam).toLowerCase()
      )
    : [];

  const toggleExam = (examId: number) => {
    setSelectedExamIds((previous) =>
      previous.includes(examId)
        ? previous.filter((id) => id !== examId)
        : [...previous, examId]
    );
  };

  const handleApprove = async () => {
    if (!approveModal) return;

    if (selectedExamIds.length === 0) {
      setErrorMsg("Please select at least one exam to unlock.");
      return;
    }

    setApproveLoading(true);
    setErrorMsg("");

    try {
      await api(`/payments/approve/${approveModal.id}`, {
        method: "PUT",
        body: {
          examIds: selectedExamIds,
        },
      });

      setSuccessMsg(
        `Payment approved and exams unlocked for ${approveModal.student.name}.`
      );

      setApproveModal(null);
      setSelectedExamIds([]);

      await loadData();

      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Unable to approve payment."
      );
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = async (
    id: number,
    studentName: string
  ) => {
    const confirmed = window.confirm(
      `Reject payment from ${studentName}?`
    );

    if (!confirmed) return;

    setRejectLoading(id);
    setErrorMsg("");

    try {
      await api(`/payments/reject/${id}`, {
        method: "PUT",
      });

      setSuccessMsg(`Payment from ${studentName} rejected.`);

      await loadData();

      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Unable to reject payment."
      );
    } finally {
      setRejectLoading(null);
    }
  };

  const statusBadge = (status: string) => {
    if (status === "APPROVED") {
      return (
        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
          Approved
        </span>
      );
    }

    if (status === "REJECTED") {
      return (
        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
          Rejected
        </span>
      );
    }

    return (
      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
        Pending
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-800">
        💳 Payment Requests
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        Review student payments, verify transaction IDs, and unlock exams.
      </p>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-slate-800">
            {stats.total}
          </p>
          <p className="text-xs text-slate-500">Total Requests</p>
        </div>

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-yellow-700">
            {stats.pending}
          </p>
          <p className="text-xs text-yellow-600">Pending</p>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-green-700">
            {stats.approved}
          </p>
          <p className="text-xs text-green-600">Approved</p>
        </div>

        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-teal-700">
            ৳{Number(stats.totalEarned || 0).toLocaleString("en-BD")}
          </p>
          <p className="text-xs text-teal-600">Total Earned</p>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          ✅ {successMsg}
        </div>
      )}

      {errorMsg && !approveModal && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          ❌ {errorMsg}
        </div>
      )}

      {/* Status Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {["PENDING", "APPROVED", "REJECTED"].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilterStatus(status)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filterStatus === status
                ? "bg-teal-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {status === "PENDING" && `⏳ Pending (${stats.pending})`}
            {status === "APPROVED" && `✅ Approved (${stats.approved})`}
            {status === "REJECTED" && `❌ Rejected (${stats.rejected})`}
          </button>
        ))}
      </div>

      {/* Payment List */}
      <div className="mt-4">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">
              Loading payment requests...
            </p>
          </div>
        ) : payments.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">
              No {filterStatus.toLowerCase()} payments found.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Student Information */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                        {(payment.student?.name || "S")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800">
                          {payment.student?.name || "Unknown Student"}
                        </p>

                        <p className="break-all text-xs text-slate-500">
                          {payment.student?.email || "No email"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                      <span>
                        📱 {payment.student?.phone || "No phone"}
                      </span>

                      <span>
                        🎯 {payment.student?.targetExam || "No target"}
                      </span>

                      <span>
                        {payment.method.toLowerCase() === "bkash"
                          ? "🟣 bKash"
                          : "🟠 Nagad"}
                        {" — "}
                        <strong className="text-slate-700">
                          {payment.transactionId}
                        </strong>
                      </span>

                      <span>
                        📅{" "}
                        {new Date(payment.createdAt).toLocaleString("en-BD", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    {/* Previously Unlocked Exams */}
                    {payment.examAccesses?.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-1 text-xs font-semibold text-slate-500">
                          Unlocked Exams
                        </p>

                        <div className="flex flex-wrap gap-1">
                          {payment.examAccesses.map((access) => (
                            <span
                              key={access.id}
                              className="rounded-full bg-teal-50 px-2 py-1 text-xs text-teal-700"
                            >
                              {access.exam?.title || "Exam"}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Amount and Actions */}
                  <div className="flex shrink-0 flex-row items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">
                        ৳{Number(payment.amount).toLocaleString("en-BD")}
                      </span>

                      {statusBadge(payment.status)}
                    </div>

                    {payment.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openApproveModal(payment)}
                          className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          ✅ Approve
                        </button>

                        <button
                          type="button"
                          disabled={rejectLoading === payment.id}
                          onClick={() =>
                            handleReject(
                              payment.id,
                              payment.student?.name || "this student"
                            )
                          }
                          className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50"
                        >
                          {rejectLoading === payment.id
                            ? "Rejecting..."
                            : "❌ Reject"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {approveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-800">
              Approve Payment
            </h2>

            <div className="mt-3 rounded-xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">
                {approveModal.student.name}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {approveModal.student.email}
              </p>

              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <span>
                  Amount:{" "}
                  <strong>৳{approveModal.amount}</strong>
                </span>

                <span>
                  Transaction ID:{" "}
                  <strong>{approveModal.transactionId}</strong>
                </span>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold text-slate-800">
                Select Exams to Unlock
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Only exams matching the student's target category are shown.
              </p>

              {examLoading ? (
                <p className="mt-5 text-center text-sm text-slate-500">
                  Loading exams...
                </p>
              ) : matchingExams.length === 0 ? (
                <div className="mt-4 rounded-lg bg-orange-50 p-4 text-sm text-orange-700">
                  No exams found for this student's target category:
                  {" "}
                  <strong>
                    {approveModal.student.targetExam || "Not specified"}
                  </strong>
                  .
                </div>
              ) : (
                <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
                  {matchingExams.map((exam) => {
                    const alreadyUnlocked =
                      approveModal.examAccesses?.some(
                        (access) => access.exam?.id === exam.id
                      );

                    return (
                      <label
                        key={exam.id}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-3 ${
                          alreadyUnlocked
                            ? "cursor-not-allowed border-teal-200 bg-teal-50"
                            : "cursor-pointer border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={
                            alreadyUnlocked ||
                            selectedExamIds.includes(exam.id)
                          }
                          disabled={alreadyUnlocked}
                          onChange={() => toggleExam(exam.id)}
                          className="h-4 w-4 accent-teal-600"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-700">
                            {exam.title}
                          </p>

                          <p className="text-xs text-slate-400">
                            {exam.targetExam}
                          </p>
                        </div>

                        {alreadyUnlocked && (
                          <span className="text-xs font-medium text-teal-700">
                            Already unlocked
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {approveModal && errorMsg && (
              <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {errorMsg}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleApprove}
                disabled={
                  approveLoading ||
                  examLoading ||
                  selectedExamIds.length === 0
                }
                className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {approveLoading
                  ? "Approving..."
                  : "✅ Approve & Unlock"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setApproveModal(null);
                  setSelectedExamIds([]);
                  setErrorMsg("");
                }}
                disabled={approveLoading}
                className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

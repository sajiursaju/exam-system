
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";

interface PaymentSettings {
  bkash?: string;
  nagad?: string;
  free_trial_enabled?: string | boolean;
  free_trial_days?: string | number;
}

interface TrialStatus {
  enabled?: boolean;
  days?: number;
  used?: boolean;
  active?: boolean;
  expired?: boolean;
  startedAt?: string | null;
  endsAt?: string | null;
  trialStartedAt?: string | null;
  trialEndsAt?: string | null;
  trialUsed?: boolean;
  message?: string;
}

interface ExamAccess {
  id: number;
  exam: {
    id: number;
    title: string;
    targetExam: string;
  };
}

interface PaymentRequest {
  id: number;
  method: string;
  transactionId: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  examAccesses: ExamAccess[];
}

export default function PaymentPage() {
  const [settings, setSettings] = useState<PaymentSettings>({});
  const [trial, setTrial] = useState<TrialStatus>({});

  const [method, setMethod] = useState<"bkash" | "nagad">("bkash");
  const [transactionId, setTransactionId] = useState("");

  const [loading, setLoading] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [trialLoadingStatus, setTrialLoadingStatus] = useState(true);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [trialError, setTrialError] = useState("");
  const [trialSuccess, setTrialSuccess] = useState("");

  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState("");

  const trialEnabled =
    settings.free_trial_enabled === true ||
    String(settings.free_trial_enabled).toLowerCase() === "true";

  const trialDays = Math.max(
    1,
    Number(settings.free_trial_days || trial.days || 7)
  );

  const bkashAvailable = Boolean(settings.bkash?.trim());
  const nagadAvailable = Boolean(settings.nagad?.trim());

  const anyPaymentAvailable = bkashAvailable || nagadAvailable;

  const selectedMethodAvailable =
    method === "bkash" ? bkashAvailable : nagadAvailable;

  const trialStarted =
    Boolean(trial.used) ||
    Boolean(trial.trialUsed) ||
    Boolean(trial.startedAt) ||
    Boolean(trial.trialStartedAt);

  const trialEndsAt = trial.endsAt || trial.trialEndsAt || null;

  const trialActive =
    Boolean(trial.active) ||
    (Boolean(trialStarted) &&
      Boolean(trialEndsAt) &&
      new Date(trialEndsAt).getTime() > Date.now());

  const trialExpired =
    Boolean(trial.expired) ||
    (Boolean(trialStarted) &&
      Boolean(trialEndsAt) &&
      new Date(trialEndsAt).getTime() <= Date.now());

  const loadPayments = useCallback(async () => {
    setPaymentsLoading(true);
    setPaymentsError("");

    try {
      const data = await api<PaymentRequest[]>("/payments/my-payments");
      setPayments(Array.isArray(data) ? data : []);
    } catch (e) {
      setPaymentsError(
        e instanceof Error ? e.message : "Could not load payment history."
      );
    } finally {
      setPaymentsLoading(false);
    }
  }, []);

  const loadTrialStatus = useCallback(async () => {
    setTrialLoadingStatus(true);

    try {
      const data = await api<TrialStatus>("/payments/trial-status");
      setTrial(data || {});
    } catch {
      setTrial({});
    } finally {
      setTrialLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    api<PaymentSettings>("/payments/settings")
      .then((data) => {
        const paymentSettings = data || {};
        setSettings(paymentSettings);

        if (paymentSettings.bkash?.trim()) {
          setMethod("bkash");
        } else if (paymentSettings.nagad?.trim()) {
          setMethod("nagad");
        }
      })
      .catch(() => {
        setSettings({});
      })
      .finally(() => setSettingsLoading(false));

    loadPayments();
    loadTrialStatus();
  }, [loadPayments, loadTrialStatus]);

  const handleStartTrial = async () => {
    setTrialError("");
    setTrialSuccess("");
    setTrialLoading(true);

    try {
      await api("/payments/start-trial", {
        method: "POST",
      });

      await loadTrialStatus();

      setTrialSuccess(
        `Your ${trialDays}-day free trial has been activated successfully!`
      );
    } catch (e) {
      if (e instanceof ApiError) {
        setTrialError(e.message);
      } else if (e instanceof Error) {
        setTrialError(e.message);
      } else {
        setTrialError("Could not activate your free trial.");
      }

      await loadTrialStatus();
    } finally {
      setTrialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!anyPaymentAvailable || !selectedMethodAvailable) {
      setError("This payment method is currently unavailable.");
      return;
    }

    if (!transactionId.trim()) {
      setError("Please enter your transaction ID.");
      return;
    }

    setLoading(true);

    try {
      await api("/payments/submit", {
        method: "POST",
        body: {
          method,
          transactionId: transactionId.trim(),
        },
      });

      setTransactionId("");
      setSuccess(true);
      await loadPayments();
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
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

  const formatDate = (date?: string | null) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/student/dashboard"
        className="text-sm font-medium text-indigo-600 hover:underline"
      >
        ← Back to Dashboard
      </Link>

      <div className="mt-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Exam Access
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Start your free trial or purchase individual exam access.
        </p>
      </div>

      {/* Free Trial */}
      <section className="mt-6 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-700">
              FREE ACCESS
            </span>

            <h2 className="mt-3 text-xl font-bold text-slate-800">
              {trialDays}-Day Free Trial
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Try available exams in your assigned category without making a
              payment.
            </p>
          </div>

          <div className="text-4xl">🎁</div>
        </div>

        {trialLoadingStatus ? (
          <p className="mt-4 text-sm text-slate-500">
            Checking your trial status...
          </p>
        ) : !trialEnabled ? (
          <div className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
            Free trial is currently unavailable.
          </div>
        ) : trialActive ? (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="font-semibold text-green-700">
              Your free trial is active!
            </p>
            <p className="mt-1 text-sm text-green-700">
              Trial expires: {formatDate(trialEndsAt)}
            </p>
            <p className="mt-2 text-xs text-green-600">
              You can access eligible exams until your trial expires.
            </p>
          </div>
        ) : trialExpired || trialStarted ? (
          <div className="mt-4 rounded-lg bg-orange-50 p-4">
            <p className="font-semibold text-orange-700">
              Your free trial has ended.
            </p>
            <p className="mt-1 text-sm text-orange-600">
              You cannot activate another free trial on this account. Purchase
              exam access to continue.
            </p>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-slate-600">
              Your free trial has not been used yet. Activate it whenever you
              are ready.
            </p>

            <button
              type="button"
              onClick={handleStartTrial}
              disabled={trialLoading}
              className="mt-4 w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
            >
              {trialLoading
                ? "Activating Trial..."
                : `Start ${trialDays}-Day Free Trial`}
            </button>
          </div>
        )}

        {trialError && (
          <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {trialError}
          </div>
        )}

        {trialSuccess && (
          <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {trialSuccess}
          </div>
        )}
      </section>

      {/* Individual Exam Payment */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-800">
          Buy Individual Exam Access
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Pay ৳99 and submit your transaction ID. Admin approval is required.
        </p>

        {settingsLoading ? (
          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500">
            Loading payment settings...
          </div>
        ) : !anyPaymentAvailable ? (
          <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-5">
            <p className="font-semibold text-orange-800">
              Online payment is currently unavailable.
            </p>
            <p className="mt-1 text-sm text-orange-700">
              No payment method has been configured yet. Please contact the
              administrator.
            </p>
          </div>
        ) : (
          <>
            {/* Configured Payment Methods */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {bkashAvailable && (
                <button
                  type="button"
                  onClick={() => setMethod("bkash")}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    method === "bkash"
                      ? "border-pink-500 bg-pink-50"
                      : "border-slate-200 bg-white hover:border-pink-300"
                  }`}
                >
                  <p className="text-2xl">🟣</p>
                  <p className="mt-2 font-bold text-slate-800">bKash</p>
                  <p className="mt-1 break-all text-sm font-semibold text-pink-600">
                    {settings.bkash}
                  </p>
                </button>
              )}

              {nagadAvailable && (
                <button
                  type="button"
                  onClick={() => setMethod("nagad")}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    method === "nagad"
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 bg-white hover:border-orange-300"
                  }`}
                >
                  <p className="text-2xl">🟠</p>
                  <p className="mt-2 font-bold text-slate-800">Nagad</p>
                  <p className="mt-1 break-all text-sm font-semibold text-orange-600">
                    {settings.nagad}
                  </p>
                </button>
              )}
            </div>

            {/* Payment Instructions */}
            <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-700">
                How to pay:
              </p>

              <ol className="mt-2 list-decimal space-y-1 pl-4">
                <li>
                  Send{" "}
                  <strong className="text-teal-600">৳99</strong> to the{" "}
                  <strong
                    className={
                      method === "bkash"
                        ? "text-pink-600"
                        : "text-orange-600"
                    }
                  >
                    {method === "bkash"
                      ? "bKash"
                      : "Nagad"} Personal Number
                  </strong>{" "}
                  using <strong>Send Money</strong>.
                </li>
                <li>
                  Copy the Transaction ID from your payment confirmation.
                </li>
                <li>Paste it below and submit.</li>
                <li>Admin will review and unlock your exam access.</li>
              </ol>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Payment Method
                </label>

                <div
                  className={`rounded-xl border-2 px-4 py-3 font-semibold ${
                    method === "bkash"
                      ? "border-pink-400 bg-pink-50 text-pink-700"
                      : "border-orange-400 bg-orange-50 text-orange-700"
                  }`}
                >
                  {method === "bkash" ? "🟣 bKash" : "🟠 Nagad"}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Transaction ID
                </label>

                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter your transaction ID"
                  required
                  disabled={!selectedMethodAvailable}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
                />
              </div>

              <div className="rounded-xl bg-teal-50 px-4 py-3 text-sm">
                <span className="text-slate-600">Amount: </span>
                <span className="font-bold text-teal-700">৳99</span>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !selectedMethodAvailable}
                className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Payment"}
              </button>
            </form>
          </>
        )}
      </section>

      {/* Payment Success */}
      {success && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="font-semibold text-green-700">
            🎉 Payment submitted successfully!
          </p>
          <p className="mt-1 text-sm text-green-600">
            Admin will review your payment shortly.
          </p>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="mt-2 text-sm font-semibold text-green-700 underline"
          >
            Close
          </button>
        </div>
      )}

      {/* Payment History */}
      <section className="mt-12">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              💳 Payment History
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Track your payment requests and unlocked exams.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPayments}
            disabled={paymentsLoading}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            ↻ Refresh
          </button>
        </div>

        {paymentsLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
            <p className="text-sm text-slate-500">
              Loading payment history...
            </p>
          </div>
        ) : paymentsError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
            <p className="text-sm text-red-600">{paymentsError}</p>
            <button
              type="button"
              onClick={loadPayments}
              className="mt-2 text-sm font-semibold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        ) : payments.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-3xl">💳</p>
            <p className="mt-3 font-semibold text-slate-700">
              No payment history yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Your submitted payments will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-700">
                      {payment.method === "bkash" ? "🟣 bKash" : "🟠 Nagad"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      TrxID: {payment.transactionId}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(payment.createdAt).toLocaleDateString(
                        "en-BD",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-700">
                      ৳{payment.amount}
                    </span>
                    {statusBadge(payment.status)}
                  </div>
                </div>

                {payment.examAccesses?.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="mb-2 text-xs font-medium text-slate-500">
                      Unlocked Exams:
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {payment.examAccesses.map((access) => (
                        <span
                          key={access.id}
                          className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700"
                        >
                          {access.exam.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {payment.status === "PENDING" && (
                  <div className="mt-3 rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
                    ⏳ Your payment is under review.
                  </div>
                )}

                {payment.status === "REJECTED" && (
                  <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                    ❌ This payment was rejected. Please contact admin.
                  </div>
                )}

                {payment.status === "APPROVED" && (
                  <div className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
                    ✅ Your payment has been approved.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

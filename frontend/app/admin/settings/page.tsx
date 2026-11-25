
"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";

interface PaymentSettings {
  bkash?: string;
  nagad?: string;
  free_trial_enabled?: string | boolean;
  free_trial_days?: string | number;
}

export default function AdminSettingsPage() {
  const [bkash, setBkash] = useState("");
  const [nagad, setNagad] = useState("");

  const [trialEnabled, setTrialEnabled] = useState(true);
  const [trialDays, setTrialDays] = useState("7");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await api<PaymentSettings>("/payments/settings");

        setBkash(data.bkash || "");
        setNagad(data.nagad || "");

        setTrialEnabled(
          data.free_trial_enabled === true ||
            String(data.free_trial_enabled).toLowerCase() === "true"
        );

        setTrialDays(String(data.free_trial_days || 7));
      } catch (error) {
        setErrorMsg(
          error instanceof Error
            ? error.message
            : "Could not load payment settings."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMsg("");
    setSuccessMsg("");

    const days = Number(trialDays);

    if (!Number.isInteger(days) || days < 1 || days > 3650) {
      setErrorMsg("Trial duration must be between 1 and 3650 days.");
      return;
    }

    setSaving(true);

    try {
      await api("/payments/settings", {
        method: "PUT",
        body: {
          bkash: bkash.trim(),
          nagad: nagad.trim(),
          free_trial_enabled: trialEnabled,
          free_trial_days: days,
        },
      });

      setSuccessMsg("Payment and free trial settings saved successfully!");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMsg(error.message);
      } else if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg("Something went wrong while saving settings.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          ⚙️ Admin Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage student payment methods and free trial access.
        </p>
      </div>

      {loading ? (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading settings...
        </div>
      ) : (
        <form onSubmit={handleSave}>
          {/* Payment Settings */}
          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                💳 Payment Settings
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Configure the mobile payment numbers students will use.
              </p>
            </div>

            {/* Payment Preview */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border-2 border-pink-200 bg-pink-50 p-4">
                <p className="text-2xl">🟣</p>
                <p className="mt-2 font-bold text-slate-800">bKash</p>
                <p className="mt-1 break-all text-sm font-semibold text-pink-600">
                  {bkash.trim() || "Not configured"}
                </p>
              </div>

              <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-4">
                <p className="text-2xl">🟠</p>
                <p className="mt-2 font-bold text-slate-800">Nagad</p>
                <p className="mt-1 break-all text-sm font-semibold text-orange-600">
                  {nagad.trim() || "Not configured"}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  🟣 bKash Number
                </label>
                <input
                  type="text"
                  value={bkash}
                  onChange={(e) => setBkash(e.target.value)}
                  placeholder="e.g. 01XXXXXXXXX"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  🟠 Nagad Number
                </label>
                <input
                  type="text"
                  value={nagad}
                  onChange={(e) => setNagad(e.target.value)}
                  placeholder="e.g. 01XXXXXXXXX"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div className="rounded-lg bg-teal-50 p-4">
                <p className="text-sm font-semibold text-teal-800">
                  Individual Exam Access Price
                </p>
                <p className="mt-1 text-xl font-bold text-teal-700">
                  ৳99
                </p>
                <p className="mt-1 text-xs text-teal-700">
                  Current fixed payment amount. Students submit their
                  transaction ID for admin approval.
                </p>
              </div>
            </div>
          </section>

          {/* Free Trial Settings */}
          <section className="mt-6 rounded-2xl border border-teal-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  🎁 Free Trial Settings
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Control whether students can activate a free trial.
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  trialEnabled
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {trialEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>

            {/* Enable / Disable */}
            <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <div>
                <p className="font-semibold text-slate-800">
                  Enable Free Trial
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Allow eligible students to activate a free trial.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={trialEnabled}
                onClick={() => setTrialEnabled(!trialEnabled)}
                className={`relative h-7 w-12 rounded-full transition ${
                  trialEnabled ? "bg-teal-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    trialEnabled ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Trial Duration */}
            <div className="mt-5">
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Free Trial Duration (Days)
              </label>

              <input
                type="number"
                min="1"
                max="3650"
                step="1"
                value={trialDays}
                onChange={(e) => setTrialDays(e.target.value)}
                disabled={!trialEnabled}
                placeholder="Enter number of days"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />

              <p className="mt-2 text-xs text-slate-500">
                You can set 1, 3, 7, 15, 30, 60, 90 days, or any whole number
                up to 3650.
              </p>
            </div>

            {trialEnabled && (
              <div className="mt-5 rounded-xl border border-teal-100 bg-teal-50 p-4">
                <p className="text-sm font-semibold text-teal-800">
                  Current Trial Configuration
                </p>
                <p className="mt-1 text-sm text-teal-700">
                  Students will receive {trialDays || "0"} days of free access
                  when they activate their trial.
                </p>
              </div>
            )}

            {!trialEnabled && (
              <div className="mt-5 rounded-xl bg-orange-50 p-4">
                <p className="text-sm font-semibold text-orange-800">
                  Free trial is disabled.
                </p>
                <p className="mt-1 text-xs text-orange-700">
                  New students will not be able to activate a free trial.
                </p>
              </div>
            )}
          </section>

          {/* Messages */}
          {successMsg && (
            <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              ✅ {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              ❌ {errorMsg}
            </div>
          )}

          {/* Save */}
          <button
            type="submit"
            disabled={saving || loading}
            className="mt-6 w-full rounded-xl bg-teal-600 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving Settings..." : "💾 Save All Settings"}
          </button>
        </form>
      )}

      {/* Information */}
      <div className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">
          ℹ️ How these settings work
        </p>

        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            Students see configured bKash and Nagad numbers on their payment
            page.
          </li>
          <li>
            Clearing both numbers temporarily disables online payment
            submissions.
          </li>
          <li>
            Students submit their transaction ID and wait for admin approval.
          </li>
          <li>
            Free trial duration applies when a student activates their trial.
          </li>
          <li>
            Disabling free trial prevents new trial activations. Existing
            active trials are not automatically cancelled by this setting.
          </li>
        </ul>
      </div>
    </div>
  );
}

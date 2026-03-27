"use client";

import { useState, useEffect, useCallback } from "react";
import AppNav from "@/components/ui/AppNav";

interface ConsentData {
  journalingAnalysis: boolean;
  voiceUpload: boolean;
  voiceFeatureExtract: boolean;
  clinicianSharing: boolean;
  dataRetentionDays: number;
}

export default function SettingsPage() {
  const [consent, setConsent] = useState<ConsentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const fetchConsent = useCallback(async () => {
    const res = await fetch("/api/consent");
    if (res.ok) {
      const data = await res.json();
      setConsent(data.consent);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConsent();
  }, [fetchConsent]);

  async function handleSave() {
    if (!consent) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/consent", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consent),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed to save settings.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function toggle(key: keyof ConsentData) {
    setConsent((c) => c ? { ...c, [key]: !c[key] } : c);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <AppNav />
        <main className="ml-64 flex-1 p-8 flex items-center justify-center">
          <p className="text-slate-400">Loading settings…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppNav />
      <main className="ml-64 flex-1 p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Privacy & Consent Settings ⚙️</h1>
          <p className="text-slate-500 text-sm mt-1">
            Control exactly how your data is used. You can change these at any time.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
        )}
        {saved && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            ✓ Settings saved successfully.
          </div>
        )}

        <div className="space-y-4">
          <ConsentToggle
            title="Journal NLP Analysis"
            description="Allow MindLens to analyze your journal entries for sentiment and emotional patterns. This powers personalized companion suggestions."
            enabled={consent?.journalingAnalysis ?? false}
            onToggle={() => toggle("journalingAnalysis")}
            icon="📓"
            risk="Low"
          />
          <ConsentToggle
            title="Voice Note Upload"
            description="Allow uploading voice recordings. These are stored encrypted and are only accessible by you."
            enabled={consent?.voiceUpload ?? false}
            onToggle={() => toggle("voiceUpload")}
            icon="🎙️"
            risk="Low"
          />
          <ConsentToggle
            title="Voice Feature Extraction"
            description="Allow MindLens to extract acoustic features (speech rate, energy) from voice notes to enrich risk scoring."
            enabled={consent?.voiceFeatureExtract ?? false}
            onToggle={() => toggle("voiceFeatureExtract")}
            icon="🔊"
            risk="Medium"
            dependency={consent?.voiceUpload ? undefined : "Requires Voice Upload to be enabled"}
          />
          <ConsentToggle
            title="Clinician Data Sharing"
            description="Allow your linked clinician to view your check-ins, risk scores, and journal analysis summaries. They cannot see raw journal text unless you explicitly share it."
            enabled={consent?.clinicianSharing ?? false}
            onToggle={() => toggle("clinicianSharing")}
            icon="🩺"
            risk="High"
          />

          {consent && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">🗑️</span>
                <div>
                  <h3 className="font-semibold text-slate-900">Data Retention</h3>
                  <p className="text-sm text-slate-500">How long to keep your data</p>
                </div>
              </div>
              <select
                value={consent.dataRetentionDays}
                onChange={(e) => setConsent((c) => c ? { ...c, dataRetentionDays: parseInt(e.target.value) } : c)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
              >
                <option value={90}>90 days</option>
                <option value={180}>180 days</option>
                <option value={365}>1 year</option>
                <option value={730}>2 years</option>
                <option value={36500}>Indefinitely</option>
              </select>
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-8 w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-300 text-white font-semibold rounded-xl transition-colors"
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>

        <div className="mt-6 p-4 bg-slate-100 rounded-xl text-xs text-slate-500">
          <strong>Your rights:</strong> You can delete your account and all associated data at any time.
          Your data is never sold to third parties. All sensitive data is encrypted at rest.
        </div>
      </main>
    </div>
  );
}

function ConsentToggle({
  title,
  description,
  enabled,
  onToggle,
  icon,
  risk,
  dependency,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  icon: string;
  risk: "Low" | "Medium" | "High";
  dependency?: string;
}) {
  const riskColors = { Low: "text-green-600 bg-green-50", Medium: "text-orange-600 bg-orange-50", High: "text-red-600 bg-red-50" };

  return (
    <div className={`bg-white rounded-2xl border p-6 transition-colors ${enabled ? "border-teal-200" : "border-slate-100"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl mt-0.5">{icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskColors[risk]}`}>
                {risk} privacy impact
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">{description}</p>
            {dependency && (
              <p className="text-xs text-orange-600 mt-1.5">⚠️ {dependency}</p>
            )}
          </div>
        </div>
        <button
          onClick={onToggle}
          disabled={!!dependency}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-40 flex-shrink-0 ${
            enabled ? "bg-teal-500" : "bg-slate-200"
          }`}
          aria-pressed={enabled}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

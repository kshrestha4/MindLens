"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = ["About You", "Sleep & Energy", "Mood & Stress", "Validated Scales"];

interface FormData {
  sleepHours: string;
  sleepQuality: string;
  stressLevel: string;
  moodBaseline: string;
  energyLevel: string;
  phq9Score: string;
  gad7Score: string;
  wellbeingScore: string;
  notes: string;
}

function ScaleInput({
  label,
  name,
  value,
  onChange,
  low,
  high,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, val: string) => void;
  low: string;
  high: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-teal-600 font-bold text-sm">{value || "–"}/10</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value || "5"}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full accent-teal-500"
      />
      <div className="flex justify-between text-xs text-slate-400">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    sleepHours: "7",
    sleepQuality: "6",
    stressLevel: "5",
    moodBaseline: "6",
    energyLevel: "6",
    phq9Score: "",
    gad7Score: "",
    wellbeingScore: "",
    notes: "",
  });

  function update(name: string, val: string) {
    setForm((f) => ({ ...f, [name]: val }));
  }

  async function handleFinish() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/baseline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sleepHours: parseFloat(form.sleepHours),
        sleepQuality: parseInt(form.sleepQuality),
        stressLevel: parseInt(form.stressLevel),
        moodBaseline: parseInt(form.moodBaseline),
        energyLevel: parseInt(form.energyLevel),
        phq9Score: form.phq9Score ? parseInt(form.phq9Score) : null,
        gad7Score: form.gad7Score ? parseInt(form.gad7Score) : null,
        wellbeingScore: form.wellbeingScore ? parseInt(form.wellbeingScore) : null,
        notes: form.notes || null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed to save.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-teal-900 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{STEPS[step]}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full">
            <div
              className="h-2 bg-teal-500 rounded-full transition-all"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        {/* Step 0: About */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Welcome to MindLens 🧠</h2>
            <p className="text-slate-500 text-sm">
              Let&apos;s establish your baseline so we can track meaningful changes. This takes about 3 minutes.
              All data is private and encrypted.
            </p>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-sm text-teal-800">
              <strong>Why a baseline?</strong> Without knowing your normal, we can&apos;t identify what&apos;s unusual.
              Your baseline helps our risk engine detect meaningful deviations.
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Any notes about your current situation? (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 text-sm resize-none"
                placeholder="e.g. I've been under work pressure recently..."
              />
            </div>
          </div>
        )}

        {/* Step 1: Sleep & Energy */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Sleep & Energy</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Average sleep hours per night</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={2}
                  max={14}
                  step={0.5}
                  value={form.sleepHours}
                  onChange={(e) => update("sleepHours", e.target.value)}
                  className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
                <span className="text-slate-500 text-sm">hours</span>
              </div>
            </div>
            <ScaleInput label="Sleep quality" name="sleepQuality" value={form.sleepQuality} onChange={update} low="Very poor" high="Excellent" />
            <ScaleInput label="Typical energy level" name="energyLevel" value={form.energyLevel} onChange={update} low="Exhausted" high="Very energetic" />
          </div>
        )}

        {/* Step 2: Mood & Stress */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Mood & Stress</h2>
            <ScaleInput label="Typical mood" name="moodBaseline" value={form.moodBaseline} onChange={update} low="Very low" high="Excellent" />
            <ScaleInput label="Typical stress level" name="stressLevel" value={form.stressLevel} onChange={update} low="Very calm" high="Extremely stressed" />
          </div>
        )}

        {/* Step 3: Validated Scales */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-slate-900">Validated Screening Scales</h2>
            <p className="text-slate-500 text-sm">Optional — helps calibrate risk scoring. These are standard clinical screening tools.</p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">PHQ-9 Score (0–27) — Depression screening</label>
              <input
                type="number"
                min={0}
                max={27}
                value={form.phq9Score}
                onChange={(e) => update("phq9Score", e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                placeholder="Leave blank if not taken"
              />
              <p className="text-xs text-slate-400">0–4: minimal, 5–9: mild, 10–14: moderate, 15+: severe</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">GAD-7 Score (0–21) — Anxiety screening</label>
              <input
                type="number"
                min={0}
                max={21}
                value={form.gad7Score}
                onChange={(e) => update("gad7Score", e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                placeholder="Leave blank if not taken"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">WEMWBS Score (0–35) — General wellbeing</label>
              <input
                type="number"
                min={0}
                max={35}
                value={form.wellbeingScore}
                onChange={(e) => update("wellbeingScore", e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                placeholder="Leave blank if not taken"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="px-5 py-2.5 border border-slate-300 text-slate-600 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-300 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? "Saving…" : "Complete Setup →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppNav from "@/components/ui/AppNav";

interface SliderProps {
  label: string;
  description: string;
  name: string;
  value: number;
  onChange: (name: string, val: number) => void;
  low: string;
  high: string;
  emoji: string;
}

function Slider({ label, description, name, value, onChange, low, high, emoji }: SliderProps) {
  const getColor = (v: number) => {
    if (name === "stress") {
      if (v >= 8) return "accent-red-500";
      if (v >= 6) return "accent-orange-500";
      return "accent-teal-500";
    }
    if (v <= 3) return "accent-red-500";
    if (v <= 5) return "accent-orange-500";
    return "accent-teal-500";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <span className="font-medium text-slate-900">{label}</span>
        </div>
        <span className={`text-2xl font-bold ${value <= 3 ? "text-red-500" : value <= 5 ? "text-orange-500" : "text-teal-500"}`}>
          {value}
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-3">{description}</p>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(name, parseInt(e.target.value))}
        className={`w-full ${getColor(value)}`}
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

export default function CheckInPage() {
  const router = useRouter();
  const [values, setValues] = useState({
    mood: 5,
    stress: 5,
    energy: 5,
    sleepQuality: 5,
    sleepHours: "7",
    reflection: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(name: string, val: number) {
    setValues((v) => ({ ...v, [name]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mood: values.mood,
        stress: values.stress,
        energy: values.energy,
        sleepQuality: values.sleepQuality,
        sleepHours: parseFloat(values.sleepHours) || null,
        reflection: values.reflection || null,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed to save check-in.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppNav />
      <main className="ml-64 flex-1 p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Daily Check-In ✅</h1>
          <p className="text-slate-500 text-sm mt-1">
            How are you feeling today? This takes about 60 seconds.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Slider
            label="Mood"
            description="Overall emotional wellbeing"
            name="mood"
            value={values.mood}
            onChange={update}
            low="Very low"
            high="Excellent"
            emoji="😊"
          />
          <Slider
            label="Stress"
            description="Current stress or pressure level"
            name="stress"
            value={values.stress}
            onChange={update}
            low="Very calm"
            high="Extremely stressed"
            emoji="😰"
          />
          <Slider
            label="Energy"
            description="Physical and mental energy"
            name="energy"
            value={values.energy}
            onChange={update}
            low="Exhausted"
            high="Energized"
            emoji="⚡"
          />
          <Slider
            label="Sleep Quality"
            description="How well did you sleep last night?"
            name="sleepQuality"
            value={values.sleepQuality}
            onChange={update}
            low="Very poor"
            high="Excellent"
            emoji="😴"
          />

          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <label className="block font-medium text-slate-900 mb-1">
              🕐 Sleep Hours
            </label>
            <p className="text-xs text-slate-400 mb-3">How many hours did you sleep?</p>
            <input
              type="number"
              min={0}
              max={16}
              step={0.5}
              value={values.sleepHours}
              onChange={(e) => setValues((v) => ({ ...v, sleepHours: e.target.value }))}
              className="w-28 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <label className="block font-medium text-slate-900 mb-1">
              ✍️ Reflection <span className="text-slate-400 font-normal text-sm">(optional)</span>
            </label>
            <p className="text-xs text-slate-400 mb-3">Anything notable about your day?</p>
            <textarea
              value={values.reflection}
              onChange={(e) => setValues((v) => ({ ...v, reflection: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 text-sm resize-none"
              placeholder="e.g. Had a difficult meeting but managed to relax in the evening..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-300 text-white font-semibold rounded-xl transition-colors text-lg"
          >
            {loading ? "Saving…" : "Save Check-In →"}
          </button>
        </form>
      </main>
    </div>
  );
}

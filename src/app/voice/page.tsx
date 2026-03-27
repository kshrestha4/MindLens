"use client";

import { useState } from "react";
import AppNav from "@/components/ui/AppNav";

export default function VoicePage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("audio", file);

    const res = await fetch("/api/voice", {
      method: "POST",
      body: formData,
    });

    setUploading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Upload failed.");
      return;
    }

    setMessage("Voice note uploaded successfully! Feature extraction is queued.");
    e.target.value = "";
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppNav />
      <main className="ml-64 flex-1 p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Voice Notes 🎙️</h1>
          <p className="text-slate-500 text-sm mt-1">
            Record your thoughts and feelings. Acoustic features help enrich wellbeing analysis.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">✓ {message}</div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
          <div className="text-6xl mb-4">🎙️</div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Upload a Voice Note</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            Upload an audio recording (MP3, WAV, M4A). We&apos;ll analyze acoustic features with your consent.
          </p>

          <label className="inline-block cursor-pointer">
            <input
              type="file"
              accept="audio/*"
              onChange={handleUpload}
              className="hidden"
            />
            <span className={`px-6 py-3 rounded-xl text-white font-medium transition-colors ${uploading ? "bg-teal-300 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-500"}`}>
              {uploading ? "Uploading…" : "Choose Audio File"}
            </span>
          </label>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h3 className="font-medium text-blue-900 text-sm mb-1">What we analyze</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Speech rate & pace</li>
              <li>• Energy / volume patterns</li>
              <li>• Pause ratios</li>
              <li>• Vocal sentiment</li>
            </ul>
          </div>
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
            <h3 className="font-medium text-teal-900 text-sm mb-1">Privacy</h3>
            <ul className="text-xs text-teal-700 space-y-1">
              <li>• Encrypted at rest</li>
              <li>• Never shared without consent</li>
              <li>• Deletable any time</li>
              <li>• Feature extraction is optional</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-xl text-sm text-orange-800">
          <strong>Note:</strong> Voice feature extraction requires consent in{" "}
          <a href="/settings" className="underline">Settings → Privacy</a>.
        </div>
      </main>
    </div>
  );
}

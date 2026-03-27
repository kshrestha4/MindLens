"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppNav from "@/components/ui/AppNav";

export default function NewJournalPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError("Please write something before saving.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() || null, content: content.trim() }),
    });

    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed to save entry.");
      return;
    }

    router.push("/journal");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppNav />
      <main className="ml-64 flex-1 p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">New Journal Entry ✍️</h1>
          <p className="text-slate-500 text-sm mt-1">
            Write freely. Your thoughts are private and encrypted.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full px-6 py-4 text-xl font-semibold text-slate-900 border-b border-slate-100 focus:outline-none placeholder-slate-300"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              placeholder="What's on your mind today? Write freely — there's no right or wrong way to journal..."
              className="w-full px-6 py-4 text-slate-700 leading-relaxed resize-none focus:outline-none text-[15px]"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>🔒 Encrypted & private</span>
              {content.length > 0 && (
                <>
                  <span>·</span>
                  <span>{content.split(/\s+/).filter(Boolean).length} words</span>
                </>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/journal")}
                className="px-5 py-2.5 border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-300 text-white font-medium rounded-xl transition-colors"
              >
                {loading ? "Saving…" : "Save Entry"}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-8 p-4 bg-teal-50 border border-teal-100 rounded-xl text-sm text-teal-800">
          <strong>💡 Journaling tips:</strong>
          <ul className="mt-2 space-y-1 text-teal-700 text-xs">
            <li>• Write about feelings, not just events — "I felt anxious when..." is more useful than "I had a meeting"</li>
            <li>• Don&apos;t edit or censor yourself — this is for you only</li>
            <li>• If you have consent for NLP analysis enabled, patterns will be detected automatically</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

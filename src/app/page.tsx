import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-teal-900 to-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <span className="text-xl font-bold text-teal-300">MindLens</span>
        </div>
        <div className="flex gap-4">
          <Link href="/auth/signin" className="px-4 py-2 text-sm text-teal-200 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/auth/signup" className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-sm font-medium rounded-lg transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-8 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 bg-teal-900/50 text-teal-300 text-sm px-4 py-2 rounded-full mb-8 border border-teal-700">
          <span>🔒</span>
          <span>Privacy-first. Your data stays yours.</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Understand your mind.<br />
          <span className="text-teal-400">Before it overwhelms you.</span>
        </h1>

        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12">
          MindLens uses predictive analytics and CBT techniques to help you monitor mood trends,
          identify early warning signs, and build mental resilience — all with full privacy control.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <Link href="/auth/signup" className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-xl text-lg transition-all shadow-lg shadow-teal-500/25">
            Start Free — No card needed
          </Link>
          <Link href="/auth/signin" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-lg transition-all border border-white/20">
            Sign In
          </Link>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-16">
          {[
            {
              icon: "📊",
              title: "Mood & Risk Tracking",
              desc: "Daily check-ins feed a predictive risk engine that spots concerning trends before they become crises.",
            },
            {
              icon: "📓",
              title: "Private Journaling",
              desc: "Write freely. Optional NLP analysis detects emotional patterns — only with your explicit consent.",
            },
            {
              icon: "🤖",
              title: "CBT Companion",
              desc: "Personalized micro-interventions — breathing exercises, cognitive reframing, behavioral activation.",
            },
            {
              icon: "🩺",
              title: "Clinician Portal",
              desc: "Optionally share your data with your therapist. You control exactly what they can see.",
            },
            {
              icon: "🔐",
              title: "Full Consent Control",
              desc: "Granular consent settings for every feature. Revoke access any time. Your data, your rules.",
            },
            {
              icon: "📈",
              title: "Trend Visualizations",
              desc: "Interactive charts showing your mood, sleep, and stress patterns over 7, 14, and 30 days.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-colors">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-slate-500 text-sm">
        <p>MindLens — Built for mental health awareness. Not a substitute for professional care.</p>
      </footer>
    </div>
  );
}

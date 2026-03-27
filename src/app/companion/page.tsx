import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AppNav from "@/components/ui/AppNav";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const TYPE_CONFIG: Record<string, { emoji: string; color: string }> = {
  BREATHING: { emoji: "🌬️", color: "bg-blue-50 border-blue-200 text-blue-800" },
  COGNITIVE_REFRAMING: { emoji: "🔄", color: "bg-purple-50 border-purple-200 text-purple-800" },
  BEHAVIORAL_ACTIVATION: { emoji: "🚀", color: "bg-orange-50 border-orange-200 text-orange-800" },
  SLEEP_HYGIENE: { emoji: "😴", color: "bg-indigo-50 border-indigo-200 text-indigo-800" },
  MINDFULNESS: { emoji: "🧘", color: "bg-teal-50 border-teal-200 text-teal-800" },
  GRATITUDE: { emoji: "🙏", color: "bg-yellow-50 border-yellow-200 text-yellow-800" },
};

export default async function CompanionPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const userId = (session.user as { id: string }).id;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });

  const suggestions = await prisma.companionSuggestion.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const pending = suggestions.filter((s) => !s.isCompleted);
  const completed = suggestions.filter((s) => s.isCompleted);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppNav userName={user?.name} />
      <main className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Companion 🤖</h1>
            <p className="text-slate-500 text-sm mt-1">Personalized CBT micro-interventions based on your patterns</p>
          </div>
          <RefreshButton />
        </div>

        {suggestions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🤖</p>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">No suggestions yet</h2>
            <p className="text-slate-400 text-sm mb-6">Complete a check-in first to receive personalized companion suggestions.</p>
            <Link href="/checkin" className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-500 transition-colors">
              Do a Check-In
            </Link>
          </div>
        ) : (
          <div className="max-w-3xl space-y-8">
            {pending.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Suggested for you</h2>
                <div className="space-y-4">
                  {pending.map((s) => (
                    <SuggestionCard key={s.id} suggestion={s} />
                  ))}
                </div>
              </section>
            )}

            {completed.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Completed</h2>
                <div className="space-y-3">
                  {completed.map((s) => (
                    <div key={s.id} className="bg-white rounded-2xl border border-slate-100 p-4 opacity-60">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{TYPE_CONFIG[s.interventionType]?.emoji ?? "💡"}</span>
                        <div className="flex-1">
                          <p className="font-medium text-slate-700 text-sm line-through">{s.title}</p>
                          <p className="text-xs text-slate-400">
                            Completed {formatDistanceToNow(new Date(s.completedAt!))} ago
                            {s.isHelpful !== null && (
                              <span className="ml-2">{s.isHelpful ? "· Helpful ✓" : "· Not helpful"}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function SuggestionCard({ suggestion }: { suggestion: { id: string; interventionType: string; title: string; content: string; createdAt: Date } }) {
  const config = TYPE_CONFIG[suggestion.interventionType] ?? { emoji: "💡", color: "bg-slate-50 border-slate-200 text-slate-800" };

  return (
    <div className={`rounded-2xl border p-6 ${config.color}`}>
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{config.emoji}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-base">{suggestion.title}</h3>
          <p className="text-xs opacity-70 mt-0.5">
            {suggestion.interventionType.replace(/_/g, " ").toLowerCase()}
          </p>
        </div>
      </div>
      <div className="prose prose-sm max-w-none opacity-90">
        {suggestion.content.split("\n").map((line, i) => (
          <p key={i} className="text-sm mb-1">{line}</p>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <form action={`/api/companion/${suggestion.id}/complete`} method="POST">
          <button
            type="submit"
            className="px-4 py-2 bg-white/50 hover:bg-white/80 text-sm font-medium rounded-lg transition-colors"
          >
            ✓ Mark Complete
          </button>
        </form>
      </div>
    </div>
  );
}

function RefreshButton() {
  return (
    <form action="/api/companion" method="POST">
      <button
        type="submit"
        className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-xl transition-colors text-sm"
      >
        ↻ Get New Suggestions
      </button>
    </form>
  );
}

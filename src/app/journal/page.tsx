import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AppNav from "@/components/ui/AppNav";
import Link from "next/link";
import { format } from "date-fns";

export default async function JournalPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const userId = (session.user as { id: string }).id;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });

  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { analysis: true },
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppNav userName={user?.name} />
      <main className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Journal 📓</h1>
            <p className="text-slate-500 text-sm mt-1">{entries.length} entries</p>
          </div>
          <Link
            href="/journal/new"
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-xl transition-colors text-sm"
          >
            + New Entry
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📓</p>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">No journal entries yet</h2>
            <p className="text-slate-400 text-sm mb-6">Writing regularly helps track emotional patterns and supports mental wellbeing.</p>
            <Link href="/journal/new" className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-500 transition-colors">
              Write your first entry
            </Link>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-teal-200 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {entry.title ?? format(new Date(entry.createdAt), "MMMM d, yyyy")}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {format(new Date(entry.createdAt), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  {entry.analysis && (
                    <div className="flex gap-2 flex-shrink-0 ml-4">
                      <EmotionBadge emotion={entry.analysis.emotion} />
                      <SentimentBadge score={entry.analysis.sentimentScore} />
                    </div>
                  )}
                </div>
                <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                  {entry.content}
                </p>
                {entry.analysis?.keywords && entry.analysis.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {entry.analysis.keywords.slice(0, 5).map((kw) => (
                      <span key={kw} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmotionBadge({ emotion }: { emotion: string }) {
  const colors: Record<string, string> = {
    anxiety: "bg-orange-100 text-orange-700",
    sadness: "bg-blue-100 text-blue-700",
    anger: "bg-red-100 text-red-700",
    joy: "bg-yellow-100 text-yellow-700",
    hope: "bg-teal-100 text-teal-700",
    gratitude: "bg-green-100 text-green-700",
    fatigue: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-medium ${colors[emotion] ?? "bg-slate-100 text-slate-600"}`}>
      {emotion}
    </span>
  );
}

function SentimentBadge({ score }: { score: number }) {
  if (score > 0.2) return <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-medium">Positive</span>;
  if (score < -0.2) return <span className="text-xs bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-medium">Negative</span>;
  return <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">Neutral</span>;
}

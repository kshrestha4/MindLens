import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AppNav from "@/components/ui/AppNav";
import RiskBadge from "@/components/ui/RiskBadge";
import MoodTrendChart from "@/components/charts/MoodTrendChart";
import WellbeingRadar from "@/components/charts/WellbeingRadar";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const userId = (session.user as { id: string }).id;

  const [user, latestRisk, checkIns, recentAlerts, baseline, suggestions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, createdAt: true } }),
    prisma.riskScore.findFirst({
      where: { userId },
      orderBy: { computedAt: "desc" },
      include: { explanations: true },
    }),
    prisma.dailyCheckIn.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 30,
    }),
    prisma.alert.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.baselineAssessment.findUnique({ where: { userId } }),
    prisma.companionSuggestion.findMany({
      where: { userId, isCompleted: false },
      orderBy: { createdAt: "desc" },
      take: 2,
    }),
  ]);

  if (!baseline) redirect("/onboarding");

  const latestCheckIn = checkIns[checkIns.length - 1];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppNav userName={user?.name} />
      <main className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Good {getGreeting()}, {user?.name?.split(" ")[0] ?? "there"} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">Here&apos;s your mental health overview</p>
          </div>
          <Link
            href="/checkin"
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-xl transition-colors text-sm"
          >
            + Daily Check-In
          </Link>
        </div>

        {/* Alerts */}
        {recentAlerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-4 rounded-xl border ${
                  alert.severity === "HIGH" || alert.severity === "CRITICAL"
                    ? "bg-red-50 border-red-200"
                    : "bg-orange-50 border-orange-200"
                }`}
              >
                <span className="text-lg mt-0.5">
                  {alert.severity === "CRITICAL" ? "🚨" : alert.severity === "HIGH" ? "⚠️" : "ℹ️"}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 text-sm">{alert.title}</p>
                  <p className="text-slate-600 text-xs mt-0.5">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Scores */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Risk Assessment</h2>
              {latestRisk ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {[
                      { label: "Depression Risk", value: latestRisk.depressionRisk, color: "teal" },
                      { label: "Stress Risk", value: latestRisk.stressRisk, color: "orange" },
                      { label: "General Risk", value: latestRisk.generalRisk, color: "blue" },
                    ].map((r) => (
                      <div key={r.label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-600">{r.label}</span>
                          <RiskBadge score={r.value} size="sm" />
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full">
                          <div
                            className={`h-2 rounded-full ${getRiskBarColor(r.value)}`}
                            style={{ width: `${r.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    Computed {formatDistanceToNow(new Date(latestRisk.computedAt))} ago
                  </p>
                  <form action="/api/risk/compute" method="POST">
                    <button
                      type="submit"
                      className="w-full text-xs py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                    >
                      Recompute Risk
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-400 text-sm mb-3">No risk score yet</p>
                  <form action="/api/risk/compute" method="POST">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-500"
                    >
                      Compute Now
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Latest Check-in */}
            {latestCheckIn && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="font-semibold text-slate-900 mb-3">Latest Check-In</h2>
                <WellbeingRadar
                  mood={latestCheckIn.mood}
                  stress={latestCheckIn.stress}
                  energy={latestCheckIn.energy}
                  sleep={latestCheckIn.sleepQuality}
                />
                <p className="text-xs text-slate-400 text-center mt-2">
                  {formatDistanceToNow(new Date(latestCheckIn.createdAt))} ago
                </p>
              </div>
            )}
          </div>

          {/* Trend Chart */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">Mood & Wellbeing Trends</h2>
                <span className="text-xs text-slate-400">{checkIns.length} check-ins</span>
              </div>
              <MoodTrendChart data={checkIns.map(c => ({ ...c, createdAt: c.createdAt.toISOString() }))} days={14} />
            </div>

            {/* Risk Explanations */}
            {latestRisk?.explanations && latestRisk.explanations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Risk Factors</h2>
                <div className="space-y-3">
                  {latestRisk.explanations.map((f) => (
                    <div key={f.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-2 h-2 rounded-full mt-1.5 bg-teal-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{f.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{f.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Companion Suggestions */}
            {suggestions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-900">Today&apos;s Companion Suggestions</h2>
                  <Link href="/companion" className="text-xs text-teal-600 hover:underline">View all →</Link>
                </div>
                <div className="space-y-3">
                  {suggestions.map((s) => (
                    <div key={s.id} className="p-4 bg-teal-50 border border-teal-100 rounded-xl">
                      <p className="text-sm font-medium text-teal-900">{s.title}</p>
                      <p className="text-xs text-teal-700 mt-1 line-clamp-2">{s.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function getRiskBarColor(score: number) {
  if (score >= 70) return "bg-red-500";
  if (score >= 50) return "bg-orange-500";
  if (score >= 30) return "bg-yellow-500";
  return "bg-green-500";
}

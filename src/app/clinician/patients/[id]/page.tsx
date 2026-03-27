import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AppNav from "@/components/ui/AppNav";
import RiskBadge from "@/components/ui/RiskBadge";
import MoodTrendChart from "@/components/charts/MoodTrendChart";
import { format, formatDistanceToNow } from "date-fns";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const clinicianId = (session.user as { id: string; role?: string }).id;
  const role = (session.user as { id: string; role?: string }).role;
  if (role !== "CLINICIAN" && role !== "ADMIN") redirect("/dashboard");

  const { id: patientId } = await params;

  // Verify the clinician has access to this patient
  const link = await prisma.clinicianLink.findFirst({
    where: { clinicianId, patientId, status: "ACTIVE" },
  });
  if (!link) notFound();

  // Audit log this access
  await prisma.auditLog.create({
    data: {
      actorId: clinicianId,
      targetId: patientId,
      action: "VIEW_PATIENT_DETAIL",
      resource: "User",
      resourceId: patientId,
    },
  });

  const clinicianUser = await prisma.user.findUnique({ where: { id: clinicianId }, select: { name: true } });

  const [patient, checkIns, riskScores, consent] = await Promise.all([
    prisma.user.findUnique({
      where: { id: patientId },
      include: {
        baseline: true,
        alerts: { orderBy: { createdAt: "desc" }, take: 5 },
        consentSettings: true,
      },
    }),
    prisma.dailyCheckIn.findMany({
      where: { userId: patientId },
      orderBy: { createdAt: "asc" },
      take: 30,
    }),
    prisma.riskScore.findMany({
      where: { userId: patientId },
      orderBy: { computedAt: "desc" },
      take: 5,
      include: { explanations: true },
    }),
    prisma.consentSettings.findUnique({ where: { userId: patientId } }),
  ]);

  if (!patient) notFound();

  const latestRisk = riskScores[0];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppNav userName={clinicianUser?.name} />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <a href="/clinician/dashboard" className="hover:text-teal-600">← Patients</a>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{patient.name ?? patient.email}</h1>
              <p className="text-slate-500 text-sm">{patient.email}</p>
              {consent?.clinicianSharing ? (
                <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  ✓ Data sharing enabled
                </span>
              ) : (
                <span className="inline-block mt-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  ✕ Data sharing disabled by patient
                </span>
              )}
            </div>
            {latestRisk && (
              <div className="text-right">
                <RiskBadge score={latestRisk.generalRisk} label="Overall Risk" size="lg" />
                <p className="text-xs text-slate-400 mt-1">
                  {formatDistanceToNow(new Date(latestRisk.computedAt))} ago
                </p>
              </div>
            )}
          </div>
        </div>

        {!consent?.clinicianSharing ? (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-orange-800">
            <h2 className="font-semibold mb-2">⚠️ Limited Access</h2>
            <p className="text-sm">
              This patient has not enabled clinician data sharing. Only basic information is visible.
              Ask them to enable sharing in their Settings → Privacy page.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Scores */}
            <div className="space-y-4">
              {latestRisk && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h2 className="font-semibold text-slate-900 mb-4">Risk Assessment</h2>
                  <div className="space-y-3">
                    {[
                      { label: "Depression Risk", value: latestRisk.depressionRisk },
                      { label: "Stress Risk", value: latestRisk.stressRisk },
                      { label: "General Risk", value: latestRisk.generalRisk },
                    ].map((r) => (
                      <div key={r.label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-600">{r.label}</span>
                          <RiskBadge score={r.value} size="sm" />
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full">
                          <div
                            className={`h-2 rounded-full ${r.value >= 70 ? "bg-red-500" : r.value >= 50 ? "bg-orange-500" : r.value >= 30 ? "bg-yellow-500" : "bg-green-500"}`}
                            style={{ width: `${r.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {latestRisk.explanations.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h3 className="text-xs font-medium text-slate-600 uppercase tracking-wide">Risk Factors</h3>
                      {latestRisk.explanations.map((f) => (
                        <div key={f.id} className="text-xs bg-slate-50 rounded-lg p-2">
                          <span className="font-medium">{f.label}</span>: {f.description}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Baseline */}
              {patient.baseline && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h2 className="font-semibold text-slate-900 mb-4">Baseline Assessment</h2>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: "Mood Baseline", value: `${patient.baseline.moodBaseline ?? "—"}/10` },
                      { label: "Stress Level", value: `${patient.baseline.stressLevel ?? "—"}/10` },
                      { label: "Sleep Quality", value: `${patient.baseline.sleepQuality ?? "—"}/10` },
                      { label: "Sleep Hours", value: `${patient.baseline.sleepHours ?? "—"} hrs` },
                      { label: "PHQ-9", value: patient.baseline.phq9Score?.toString() ?? "Not taken" },
                      { label: "GAD-7", value: patient.baseline.gad7Score?.toString() ?? "Not taken" },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between">
                        <span className="text-slate-500">{row.label}</span>
                        <span className="font-medium text-slate-900">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Trend Chart + Alerts */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="font-semibold text-slate-900 mb-4">30-Day Trends</h2>
                <MoodTrendChart
                  data={checkIns.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))}
                  days={30}
                />
              </div>

              {patient.alerts.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h2 className="font-semibold text-slate-900 mb-4">Recent Alerts</h2>
                  <div className="space-y-3">
                    {patient.alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`flex items-start gap-3 p-3 rounded-xl ${
                          alert.severity === "HIGH" || alert.severity === "CRITICAL"
                            ? "bg-red-50"
                            : "bg-orange-50"
                        }`}
                      >
                        <span>{alert.severity === "CRITICAL" ? "🚨" : "⚠️"}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{alert.title}</p>
                          <p className="text-xs text-slate-500">{alert.message}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {format(new Date(alert.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Check-in summary table */}
              {checkIns.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h2 className="font-semibold text-slate-900 mb-4">Recent Check-ins</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-slate-400 border-b border-slate-100">
                          <th className="text-left pb-2">Date</th>
                          <th className="text-center pb-2">Mood</th>
                          <th className="text-center pb-2">Stress</th>
                          <th className="text-center pb-2">Energy</th>
                          <th className="text-center pb-2">Sleep</th>
                        </tr>
                      </thead>
                      <tbody>
                        {checkIns.slice(-7).reverse().map((c) => (
                          <tr key={c.id} className="border-b border-slate-50 last:border-0">
                            <td className="py-2 text-slate-500 text-xs">
                              {format(new Date(c.createdAt), "MMM d")}
                            </td>
                            <td className="py-2 text-center">
                              <ScoreCell value={c.mood} isStress={false} />
                            </td>
                            <td className="py-2 text-center">
                              <ScoreCell value={c.stress} isStress={true} />
                            </td>
                            <td className="py-2 text-center">
                              <ScoreCell value={c.energy} isStress={false} />
                            </td>
                            <td className="py-2 text-center">
                              <ScoreCell value={c.sleepQuality} isStress={false} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ScoreCell({ value, isStress }: { value: number; isStress: boolean }) {
  const isGood = isStress ? value <= 4 : value >= 7;
  const isBad = isStress ? value >= 7 : value <= 4;
  return (
    <span className={`font-medium ${isGood ? "text-green-600" : isBad ? "text-red-600" : "text-slate-700"}`}>
      {value}
    </span>
  );
}

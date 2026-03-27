import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AppNav from "@/components/ui/AppNav";
import RiskBadge from "@/components/ui/RiskBadge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function ClinicianDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const userId = (session.user as { id: string; role?: string }).id;
  const role = (session.user as { id: string; role?: string }).role;
  if (role !== "CLINICIAN" && role !== "ADMIN") redirect("/dashboard");

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });

  const links = await prisma.clinicianLink.findMany({
    where: { clinicianId: userId, status: "ACTIVE" },
    include: {
      patient: {
        include: {
          riskScores: { orderBy: { computedAt: "desc" }, take: 1 },
          checkIns: { orderBy: { createdAt: "desc" }, take: 1 },
          alerts: { where: { isRead: false }, take: 3 },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppNav userName={user?.name} />
      <main className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Clinician Dashboard 🩺</h1>
            <p className="text-slate-500 text-sm mt-1">
              Monitoring {links.length} patient{links.length !== 1 ? "s" : ""}
            </p>
          </div>
          <InviteButton />
        </div>

        {links.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">👥</p>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">No patients yet</h2>
            <p className="text-slate-400 text-sm mb-6">
              Invite patients by email to link them to your clinician profile.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {links.map((link) => {
              const latestRisk = link.patient.riskScores[0];
              const latestCheckIn = link.patient.checkIns[0];
              const unreadAlerts = link.patient.alerts.length;

              return (
                <Link
                  key={link.id}
                  href={`/clinician/patients/${link.patient.id}`}
                  className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-teal-200 hover:shadow-md transition-all block"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{link.patient.name ?? link.patient.email}</h3>
                      <p className="text-xs text-slate-400">{link.patient.email}</p>
                    </div>
                    {unreadAlerts > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        {unreadAlerts} alert{unreadAlerts > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {latestRisk ? (
                    <div className="space-y-2">
                      <RiskBadge score={latestRisk.generalRisk} label="Overall" size="sm" />
                      <div className="text-xs text-slate-400">
                        Assessed {formatDistanceToNow(new Date(latestRisk.computedAt))} ago
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No risk score yet</p>
                  )}

                  {latestCheckIn && (
                    <p className="text-xs text-slate-400 mt-2">
                      Last check-in: {formatDistanceToNow(new Date(latestCheckIn.createdAt))} ago
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function InviteButton() {
  return (
    <form action="/api/clinician/invite" method="POST" className="flex gap-2">
      <input
        type="email"
        name="email"
        placeholder="patient@example.com"
        required
        className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 w-56"
      />
      <button
        type="submit"
        className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-xl transition-colors text-sm"
      >
        Invite Patient
      </button>
    </form>
  );
}

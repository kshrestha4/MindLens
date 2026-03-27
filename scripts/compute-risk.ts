/**
 * Background job to compute risk scores for all users
 * Run with: npx ts-node --project tsconfig.json scripts/compute-risk.ts
 * Or add to a cron job (e.g., daily at 2 AM)
 */

import { PrismaClient } from "@prisma/client";
import { computeAndSaveRisk } from "../src/lib/risk-engine";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Starting risk computation job...");

  const users = await prisma.user.findMany({
    select: { id: true, email: true },
    where: {
      // Only process users who have checked in recently
      checkIns: {
        some: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
    },
  });

  console.log(`Found ${users.length} active users to process`);

  const results = { success: 0, failed: 0 };

  for (const user of users) {
    try {
      const risk = await computeAndSaveRisk(user.id);
      console.log(`✓ ${user.email}: general=${risk.generalRisk}, depression=${risk.depressionRisk}, stress=${risk.stressRisk}`);
      results.success++;
    } catch (err) {
      console.error(`✗ ${user.email}: ${err instanceof Error ? err.message : String(err)}`);
      results.failed++;
    }

    // Small delay to avoid DB overload
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\n✅ Done: ${results.success} succeeded, ${results.failed} failed`);
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

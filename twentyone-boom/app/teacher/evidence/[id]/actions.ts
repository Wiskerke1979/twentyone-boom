"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function reviewEvidence(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") redirect("/login");

  const evidenceId = formData.get("evidenceId") as string;
  const action = formData.get("action") as string;
  const reviewerNote = ((formData.get("reviewerNote") as string) || "").trim() || null;

  const status = action === "approve" ? "GOEDGEKEURD" : "AFGEWEZEN";

  const evidence = await prisma.evidence.update({
    where: { id: evidenceId },
    data: {
      status,
      reviewerId: session.user.id,
      reviewerNote,
      reviewedAt: new Date(),
    },
    include: { links: { include: { indicator: true } } },
  });

  // If approved: re-evaluate which levels are now achieved.
  if (status === "GOEDGEKEURD") {
    await recomputeAchievements(evidence.userId);
    // Award XP
    await prisma.tree.update({
      where: { userId: evidence.userId },
      data: { xpTotal: { increment: 25 } },
    });
  }

  redirect("/teacher/inbox");
}

/**
 * Recompute level achievements:
 * A level is achieved for a competence when ALL indicators at that level
 * have at least one approved evidence-link.
 */
async function recomputeAchievements(userId: string) {
  const competences = await prisma.competence.findMany({
    include: { indicators: true },
  });

  const approvedLinks = await prisma.evidenceLink.findMany({
    where: { evidence: { userId, status: "GOEDGEKEURD" } },
  });
  const approvedIndicatorIds = new Set(approvedLinks.map((l) => l.indicatorId));

  for (const c of competences) {
    for (const lvl of ["BASIS", "GEVORDERD", "EXPERT"] as const) {
      const indsAtLevel = c.indicators.filter((i) => i.level === lvl);
      if (indsAtLevel.length === 0) continue;
      const allProven = indsAtLevel.every((i) => approvedIndicatorIds.has(i.id));

      const existing = await prisma.levelAchievement.findUnique({
        where: { userId_competenceSlug_level: { userId, competenceSlug: c.slug, level: lvl } },
      });

      if (allProven && !existing) {
        await prisma.levelAchievement.create({
          data: { userId, competenceSlug: c.slug, level: lvl },
        });
        await prisma.tree.update({
          where: { userId },
          data: { xpTotal: { increment: 100 } },
        });
      } else if (!allProven && existing) {
        // (Optional) keep historical achievements rather than removing.
        // Comment out below if you prefer to preserve once-earned achievements.
        // await prisma.levelAchievement.delete({ where: { id: existing.id } });
      }
    }
  }
}

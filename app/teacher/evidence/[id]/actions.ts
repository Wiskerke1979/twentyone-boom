"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { sendEmail, templates } from "@/lib/email";
import { awardBadges } from "@/lib/badges";

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
    include: {
      user: true,
      links: { include: { indicator: true, competence: true } },
    },
  });

  if (status === "GOEDGEKEURD") {
    await recomputeAchievements(evidence.userId);
    await prisma.tree.update({
      where: { userId: evidence.userId },
      data: { xpTotal: { increment: 25 } },
    });
    // Ken eventuele nieuwe badges toe
    await awardBadges(evidence.userId);
  }

  // E-mail naar leerling
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const competenceName = evidence.links[0]?.competence.name || "een competentie";
  const indicators = evidence.links.map((l) => l.indicator.text);

  if (status === "GOEDGEKEURD") {
    const tpl = templates.evidenceApproved(
      evidence.user.name,
      competenceName,
      indicators,
      reviewerNote,
      `${baseUrl}/student/dashboard`
    );
    sendEmail({ to: evidence.user.email, ...tpl }).catch(() => {});
  } else {
    const tpl = templates.evidenceRejected(
      evidence.user.name,
      competenceName,
      reviewerNote,
      `${baseUrl}/student/competentie/${evidence.links[0]?.competence.slug || ""}`
    );
    sendEmail({ to: evidence.user.email, ...tpl }).catch(() => {});
  }

  redirect("/teacher/inbox");
}

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
      }
    }
  }
}

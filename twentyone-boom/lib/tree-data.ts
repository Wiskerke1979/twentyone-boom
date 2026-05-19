import { prisma } from "@/lib/db";
import type { LevelKey, TreeBranchData } from "./types";

/**
 * Compute the current "state" of a student's tree:
 * For each competence, the highest approved level + indicator coverage.
 */
export async function getTreeData(userId: string): Promise<TreeBranchData[]> {
  const competences = await prisma.competence.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      indicators: true,
    },
  });

  const achievements = await prisma.levelAchievement.findMany({
    where: { userId },
  });

  const selfScores = await prisma.selfScore.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const links = await prisma.evidenceLink.findMany({
    where: { evidence: { userId, status: "GOEDGEKEURD" } },
  });

  const result: TreeBranchData[] = competences.map((c) => {
    const myAchievements = achievements.filter((a) => a.competenceSlug === c.slug);
    let currentLevel: LevelKey | null = null;
    if (myAchievements.some((a) => a.level === "EXPERT")) currentLevel = "EXPERT";
    else if (myAchievements.some((a) => a.level === "GEVORDERD")) currentLevel = "GEVORDERD";
    else if (myAchievements.some((a) => a.level === "BASIS")) currentLevel = "BASIS";

    const latestSelf = selfScores.find((s) => s.competenceSlug === c.slug);
    const selfIndicated = latestSelf ? (latestSelf.calculatedLevel as LevelKey) : null;

    const approved = new Set(
      links.filter((l) => l.competenceSlug === c.slug).map((l) => l.indicatorId)
    );

    return {
      competenceSlug: c.slug,
      name: c.name,
      icon: c.icon,
      currentLevel,
      selfIndicated,
      approvedIndicatorCount: approved.size,
      totalIndicatorCount: c.indicators.length,
    };
  });

  return result;
}

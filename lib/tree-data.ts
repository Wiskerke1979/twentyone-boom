import { prisma } from "@/lib/db";
import type { LevelKey, TreeBranchData } from "./types";

/** Average score (0-3) → level */
function avgToLevel(avg: number): LevelKey | null {
  if (Number.isNaN(avg)) return null;
  if (avg >= 2.5) return "EXPERT";
  if (avg >= 1.5) return "GEVORDERD";
  if (avg >= 0.5) return "BASIS";
  return null;
}

/**
 * Compute the current "state" of a student's tree:
 * For each competence, the highest approved level + indicator coverage + peer aggregate.
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

  // Peer scores received by this user (joined via PeerRequest where targetUserId = userId)
  const peerScores = await prisma.peerScore.findMany({
    where: { request: { targetUserId: userId } },
    select: {
      competenceSlug: true,
      peerUserId: true,
      answers: true,
    },
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

    // Peer aggregate for this competence
    const myPeerScores = peerScores.filter((p) => p.competenceSlug === c.slug);
    const uniquePeers = new Set(myPeerScores.map((p) => p.peerUserId));
    const allAnswers: number[] = [];
    for (const p of myPeerScores) {
      try {
        const arr = JSON.parse(p.answers) as number[];
        if (Array.isArray(arr)) allAnswers.push(...arr);
      } catch {
        // ignore parse errors
      }
    }
    const avg = allAnswers.length === 0 ? NaN : allAnswers.reduce((a, b) => a + b, 0) / allAnswers.length;

    return {
      competenceSlug: c.slug,
      name: c.name,
      icon: c.icon,
      currentLevel,
      selfIndicated,
      approvedIndicatorCount: approved.size,
      totalIndicatorCount: c.indicators.length,
      peerCount: uniquePeers.size,
      peerAverageLevel: avgToLevel(avg),
    };
  });

  return result;
}

import { prisma } from "@/lib/db";

/**
 * Herbereken welke badges een leerling verdiend heeft.
 * Idempotent: kun je altijd aanroepen — voegt alleen nieuwe badges toe.
 *
 * Aanroepen na:
 * - Evidence goedgekeurd
 * - LevelAchievement aangemaakt
 * - PeerScore gegeven (om peer-helper te tellen)
 */
export async function awardBadges(userId: string): Promise<string[]> {
  const newBadges: string[] = [];

  const [
    approvedEvidenceCount,
    achievements,
    peerScoresGiven,
    competenceCount,
    alreadyEarned,
  ] = await Promise.all([
    prisma.evidence.count({ where: { userId, status: "GOEDGEKEURD" } }),
    prisma.levelAchievement.findMany({ where: { userId } }),
    prisma.peerScore.count({ where: { peerUserId: userId } }),
    prisma.competence.count(),
    prisma.userBadge.findMany({
      where: { userId },
      select: { badgeSlug: true },
    }),
  ]);

  const earned = new Set(alreadyEarned.map((b) => b.badgeSlug));

  const give = async (slug: string) => {
    if (earned.has(slug)) return;
    try {
      await prisma.userBadge.create({ data: { userId, badgeSlug: slug } });
      newBadges.push(slug);
      earned.add(slug);
    } catch {
      // race condition — al toegekend
    }
  };

  // 🌱 Eerste blad — eerste goedgekeurde bewijs
  if (approvedEvidenceCount >= 1) await give("eerste-blad");

  // 🌳 Hele boom Basis — alle 9 competenties op BASIS
  const basisCount = achievements.filter((a) => a.level === "BASIS").length;
  if (basisCount >= competenceCount) await give("hele-boom-basis");

  // 🌲 Hele boom Gevorderd
  const gevorderdCount = achievements.filter(
    (a) => a.level === "GEVORDERD" || a.level === "EXPERT"
  ).length;
  if (gevorderdCount >= competenceCount) await give("hele-boom-gevorderd");

  // 🏆 Expert × 3
  const expertCount = achievements.filter((a) => a.level === "EXPERT").length;
  if (expertCount >= 3) await give("expert-x3");

  // 🤝 Peer-helper — 5 peer-scores gegeven
  if (peerScoresGiven >= 5) await give("peer-helper");

  // 🔥 Streak ×7 — Tree.streakDays >= 7
  const tree = await prisma.tree.findUnique({ where: { userId } });
  if (tree && tree.streakDays >= 7) await give("streak-7");

  return newBadges;
}

/**
 * Haal recent verdiende, nog niet getoonde badges op voor popup.
 */
export async function getUnnotifiedBadges(userId: string) {
  return prisma.userBadge.findMany({
    where: { userId, notifiedAt: null },
    include: { badge: true },
    orderBy: { earnedAt: "desc" },
  });
}

export async function markBadgesNotified(userId: string, badgeIds: string[]) {
  if (badgeIds.length === 0) return;
  await prisma.userBadge.updateMany({
    where: { userId, id: { in: badgeIds } },
    data: { notifiedAt: new Date() },
  });
}

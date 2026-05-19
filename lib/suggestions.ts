import { prisma } from "@/lib/db";
import { getTreeData } from "./tree-data";
import { getAssignmentsForStudent } from "./assignments";

export interface SuggestionItem {
  id: string;
  text: string;
  type: string; // TIP | OPDRACHT | CHALLENGE
  level: string;
  suggestedEvidence: string | null;
  competence: {
    slug: string;
    name: string;
    icon: string;
  };
  reason: "assignment" | "claimed-no-proof" | "fresh";
}

/**
 * Pakt slimme suggesties voor een leerling.
 * Prioriteit:
 *   1. Tips voor klaargezette competenties (op streefniveau of BASIS)
 *   2. Tips voor competenties met zelfscan maar geen bewijs
 *   3. BASIS-tips voor nog niet gestarte competenties
 *
 * Filtert weggeklikte tips eruit. Stabiele volgorde op basis van userId-day-seed
 * zodat dismiss → volgende suggestie schuift in (geen volledige shuffle).
 */
export async function getSuggestionsForStudent(
  userId: string,
  count = 4
): Promise<SuggestionItem[]> {
  const dismissed = await prisma.dismissedTip.findMany({
    where: { userId },
    select: { tipId: true },
  });
  const dismissedSet = new Set(dismissed.map((d) => d.tipId));

  const assignments = await getAssignmentsForStudent(userId);
  const branches = await getTreeData(userId);
  const branchBySlug = new Map(branches.map((b) => [b.competenceSlug, b]));

  const candidates: Array<{ tip: any; priority: number; reason: SuggestionItem["reason"] }> = [];

  // Pool A: tips voor klaargezette competenties (highest priority)
  for (const a of assignments) {
    const branch = branchBySlug.get(a.competenceSlug);
    // Skip if al bewezen op streefniveau of hoger
    if (branch?.currentLevel === "EXPERT") continue;
    if (a.targetLevel === "BASIS" && branch?.currentLevel) continue;
    if (a.targetLevel === "GEVORDERD" && branch?.currentLevel === "GEVORDERD") continue;

    const tips = await prisma.tip.findMany({
      where: {
        competenceSlug: a.competenceSlug,
        level: a.targetLevel || "BASIS",
      },
      include: { competence: true },
    });
    for (const t of tips) {
      if (dismissedSet.has(t.id)) continue;
      candidates.push({ tip: t, priority: 100, reason: "assignment" });
    }
  }

  // Pool B: zelfscan zonder bewijs → bewijs leveren voor dit niveau
  const claimedBranches = branches.filter((b) => b.selfIndicated && !b.currentLevel);
  for (const b of claimedBranches) {
    const tips = await prisma.tip.findMany({
      where: { competenceSlug: b.competenceSlug, level: b.selfIndicated! },
      include: { competence: true },
    });
    for (const t of tips) {
      if (dismissedSet.has(t.id)) continue;
      candidates.push({ tip: t, priority: 50, reason: "claimed-no-proof" });
    }
  }

  // Pool C: nog-niet-gestart op BASIS
  const freshBranches = branches.filter((b) => !b.selfIndicated && !b.currentLevel);
  for (const b of freshBranches) {
    const tips = await prisma.tip.findMany({
      where: { competenceSlug: b.competenceSlug, level: "BASIS" },
      include: { competence: true },
    });
    for (const t of tips) {
      if (dismissedSet.has(t.id)) continue;
      candidates.push({ tip: t, priority: 20, reason: "fresh" });
    }
  }

  // Dedup op tip id (een tip kan in meerdere pools belanden)
  const seen = new Set<string>();
  const unique: typeof candidates = [];
  for (const c of candidates) {
    if (seen.has(c.tip.id)) continue;
    seen.add(c.tip.id);
    unique.push(c);
  }

  // Sort: priority desc, then deterministic by tipId for stable ordering
  unique.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.tip.id.localeCompare(b.tip.id);
  });

  return unique.slice(0, count).map((c) => ({
    id: c.tip.id,
    text: c.tip.text,
    type: c.tip.type,
    level: c.tip.level,
    suggestedEvidence: c.tip.suggestedEvidence ?? null,
    competence: {
      slug: c.tip.competence.slug,
      name: c.tip.competence.name,
      icon: c.tip.competence.icon,
    },
    reason: c.reason,
  }));
}

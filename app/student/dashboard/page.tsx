import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getTreeData } from "@/lib/tree-data";
import { getAssignmentsForStudent } from "@/lib/assignments";
import { getSuggestionsForStudent } from "@/lib/suggestions";
import { getUnnotifiedBadges, markBadgesNotified } from "@/lib/badges";
import { Tree } from "@/components/Tree";
import { SuggestionCard } from "@/components/SuggestionCard";
import { BadgePopup } from "@/components/BadgePopup";
import { OnboardingTour } from "@/components/OnboardingTour";

export default async function StudentDashboard() {
  const session = await auth();
  const userId = session!.user.id;

  const [branches, pendingPeerRequests, recentApproved, assignments, suggestions, allBadges, userBadges, tree, unnotifiedBadges] = await Promise.all([
    getTreeData(userId),
    prisma.peerRequest.count({ where: { peerUserId: userId, status: "OPEN" } }),
    prisma.evidence.findMany({
      where: { userId, status: "GOEDGEKEURD" },
      orderBy: { reviewedAt: "desc" },
      take: 3,
      include: { links: { include: { competence: true } } },
    }),
    getAssignmentsForStudent(userId),
    getSuggestionsForStudent(userId, 4),
    prisma.badge.findMany(),
    prisma.userBadge.findMany({ where: { userId }, include: { badge: true } }),
    prisma.tree.findUnique({ where: { userId } }),
    getUnnotifiedBadges(userId),
  ]);

  // Markeer popup-badges meteen als gezien (server-side)
  if (unnotifiedBadges.length > 0) {
    await markBadgesNotified(userId, unnotifiedBadges.map((b) => b.id));
  }

  const verified = branches.filter((b) => b.currentLevel).length;
  const claimed = branches.filter((b) => !b.currentLevel && b.selfIndicated).length;
  const gevorderd = branches.filter((b) => b.currentLevel === "GEVORDERD" || b.currentLevel === "EXPERT").length;
  const expert = branches.filter((b) => b.currentLevel === "EXPERT").length;

  const xp = tree?.xpTotal || 0;
  const xpToNext = Math.max(0, 100 - (xp % 100));
  const xpProgress = (xp % 100) / 100;

  const earnedSet = new Set(userBadges.map((ub) => ub.badgeSlug));

  const seen = new Set<string>();
  const uniqueAssignments = assignments.filter((a) => {
    if (seen.has(a.competenceSlug)) return false;
    seen.add(a.competenceSlug);
    return true;
  });

  // Onboarding alleen tonen als de leerling 'm nog niet heeft afgerond.
  // Een leerling wordt geboarded zodra ze 'm afsluiten (zie OnboardingTour).
  const showOnboarding = !session!.user.id; // gebruik localStorage in client component

  return (
    <div className="max-w-5xl mx-auto">
      <OnboardingTour />
      <BadgePopup
        badges={unnotifiedBadges.map((b) => ({
          id: b.id,
          slug: b.badge.slug,
          name: b.badge.name,
          icon: b.badge.icon,
          description: b.badge.description,
        }))}
      />

      <div className="mb-8">
        <p className="text-sm text-forest font-semibold uppercase tracking-wider">Welkom terug</p>
        <h1 className="text-4xl font-serif mt-1">{session!.user.name.split(" ")[0]}</h1>
        <p className="text-muted mt-1">
          {verified} bewezen · {claimed} zelfscan · {gevorderd} Gevorderd · {expert} Expert
        </p>
      </div>

      {/* XP-meter + badges */}
      <div className="card mb-6 flex items-center gap-6">
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl text-forest">{xp}</span>
            <span className="text-sm text-muted">XP</span>
            {tree && tree.streakDays > 0 && (
              <span className="ml-3 text-sm">🔥 {tree.streakDays} dagen</span>
            )}
          </div>
          <div className="mt-2 h-2 bg-paper rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-basis to-forest rounded-full transition-all"
              style={{ width: `${xpProgress * 100}%` }}
            />
          </div>
          <div className="text-xs text-muted mt-1">{xpToNext} XP tot volgend level-up</div>
        </div>
        <div className="flex gap-1.5 flex-wrap max-w-[200px] justify-end">
          {allBadges.map((b) => {
            const earned = earnedSet.has(b.slug);
            return (
              <span
                key={b.slug}
                title={`${b.name} — ${b.description}${earned ? "" : " (nog niet behaald)"}`}
                className={`text-2xl ${earned ? "" : "grayscale opacity-30"}`}
              >
                {b.icon}
              </span>
            );
          })}
        </div>
      </div>

      {/* Klaargezet door docent */}
      {uniqueAssignments.length > 0 && (
        <div className="mb-8">
          <h2 className="font-serif text-xl mb-3">📌 Door je docent klaargezet</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {uniqueAssignments.slice(0, 3).map((a) => (
              <Link
                key={a.id}
                href={`/student/scan/${a.competenceSlug}`}
                className="card border-l-4 border-l-gevorderd hover:border-forest transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{a.competence.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{a.competence.name}</div>
                    <div className="text-xs text-muted">
                      {a.targetLevel ? `streef: ${a.targetLevel.toLowerCase()}` : "open"}
                      {a.dueDate && ` · voor ${new Date(a.dueDate).toLocaleDateString("nl-NL")}`}
                    </div>
                  </div>
                </div>
                {a.message && <p className="text-xs italic text-muted mt-2 line-clamp-2">"{a.message}"</p>}
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link
        href="/student/scan"
        className="block card mb-6 bg-gradient-to-br from-leaf to-forest text-cream hover:from-forest hover:to-leaf transition"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-3xl">✍️</div>
            <h2 className="font-serif text-2xl mt-2">Doe een zelfscan</h2>
            <p className="text-cream/80 mt-1 text-sm">
              Beantwoord 5 vragen per competentie en krijg een eerste indicatie van je niveau.
              Levert bruine bladeren op — bewijs maakt ze groen.
            </p>
          </div>
          <span className="text-3xl shrink-0">→</span>
        </div>
      </Link>

      <div className="card mb-6">
        <Tree branches={branches} />
      </div>

      {/* SUGGESTIES */}
      {suggestions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-end justify-between mb-3">
            <div>
              <h2 className="font-serif text-2xl">Actiepunten voor in de les</h2>
              <p className="text-sm text-muted">Concrete dingen die je vandaag al kunt doen. Klik op × om een suggestie weg te halen — er komt direct een nieuwe.</p>
            </div>
            <Link href="/student/tips" className="text-sm text-forest underline shrink-0">
              alle tips →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestions.map((s) => (
              <SuggestionCard key={s.id} s={s} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/student/peer/new" className="card hover:border-forest transition">
          <div className="text-2xl">🤝</div>
          <div className="font-serif text-lg mt-1">Vraag een peer</div>
          <div className="text-sm text-muted mt-1">Laat groepsgenoten scoren.</div>
        </Link>
        <Link href="/student/bewijs/new" className="card hover:border-forest transition">
          <div className="text-2xl">📎</div>
          <div className="font-serif text-lg mt-1">Upload bewijs</div>
          <div className="text-sm text-muted mt-1">Een tekst, foto, of link — alles kan.</div>
        </Link>
        <Link href="/student/peer/inbox" className="card hover:border-forest transition relative">
          <div className="text-2xl">📩</div>
          <div className="font-serif text-lg mt-1">Peer-verzoeken</div>
          <div className="text-sm text-muted mt-1">
            {pendingPeerRequests > 0 ? `${pendingPeerRequests} openstaand` : "Geen openstaande verzoeken"}
          </div>
          {pendingPeerRequests > 0 && (
            <span className="absolute top-3 right-3 inline-flex items-center justify-center w-6 h-6 rounded-full bg-expert text-cream text-xs">
              {pendingPeerRequests}
            </span>
          )}
        </Link>
      </div>

      {recentApproved.length > 0 && (
        <>
          <h2 className="text-2xl font-serif mb-4">Recent goedgekeurd</h2>
          <ul className="space-y-2 mb-10">
            {recentApproved.map((e) => (
              <li key={e.id} className="card text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{e.links[0]?.competence.icon} {e.links[0]?.competence.name}</div>
                    <div className="text-muted mt-1">{e.reflection.slice(0, 100)}{e.reflection.length > 100 ? "…" : ""}</div>
                  </div>
                  <div className="text-xs text-muted">
                    {e.reviewedAt ? new Date(e.reviewedAt).toLocaleDateString("nl-NL") : ""}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="text-2xl font-serif mb-4">Mijn 9 competenties</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branches.map((b) => (
          <Link
            key={b.competenceSlug}
            href={`/student/competentie/${b.competenceSlug}`}
            className="card hover:border-forest transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{b.icon}</span>
              {b.currentLevel ? (
                <span className={`pill pill-${b.currentLevel.toLowerCase()}`}>{b.currentLevel.toLowerCase()}</span>
              ) : b.selfIndicated ? (
                <span className="pill" style={{ background: "#A57B47", color: "white" }}>{b.selfIndicated.toLowerCase()} zelfscan</span>
              ) : (
                <span className="pill pill-locked">nog niet</span>
              )}
            </div>
            <div className="font-serif text-lg mt-3">{b.name}</div>
            <div className="text-xs text-muted mt-1">
              {b.approvedIndicatorCount} van {b.totalIndicatorCount} indicatoren bewezen
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

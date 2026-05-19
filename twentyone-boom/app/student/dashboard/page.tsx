import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getTreeData } from "@/lib/tree-data";
import { Tree } from "@/components/Tree";

export default async function StudentDashboard() {
  const session = await auth();
  const userId = session!.user.id;

  const branches = await getTreeData(userId);
  const basis = branches.filter((b) => b.currentLevel).length;
  const gevorderd = branches.filter((b) => b.currentLevel === "GEVORDERD" || b.currentLevel === "EXPERT").length;
  const expert = branches.filter((b) => b.currentLevel === "EXPERT").length;

  const pendingPeerRequests = await prisma.peerRequest.count({
    where: { peerUserId: userId, status: "OPEN" },
  });

  const recentApproved = await prisma.evidence.findMany({
    where: { userId, status: "GOEDGEKEURD" },
    orderBy: { reviewedAt: "desc" },
    take: 3,
    include: { links: { include: { competence: true } } },
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-forest font-semibold uppercase tracking-wider">Welkom terug</p>
        <h1 className="text-4xl font-serif mt-1">{session!.user.name.split(" ")[0]}</h1>
        <p className="text-muted mt-1">{basis} takken bewezen · {gevorderd} op Gevorderd · {expert} op Expert</p>
      </div>

      <div className="card mb-6">
        <Tree branches={branches} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/student/peer/new" className="card hover:border-forest transition">
          <div className="text-2xl">🤝</div>
          <div className="font-serif text-lg mt-1">Vraag een peer</div>
          <div className="text-sm text-muted mt-1">Laat groepsgenoten scoren.</div>
        </Link>
        <Link href="/student/bewijs/new" className="card hover:border-forest transition">
          <div className="text-2xl">📎</div>
          <div className="font-serif text-lg mt-1">Upload bewijs</div>
          <div className="text-sm text-muted mt-1">Laat zien wat je kunt.</div>
        </Link>
        <Link href="/student/peer/inbox" className="card hover:border-forest transition relative">
          <div className="text-2xl">📩</div>
          <div className="font-serif text-lg mt-1">Peer-verzoeken</div>
          <div className="text-sm text-muted mt-1">
            {pendingPeerRequests > 0
              ? `${pendingPeerRequests} openstaand`
              : "Geen openstaande verzoeken"}
          </div>
          {pendingPeerRequests > 0 && (
            <span className="absolute top-3 right-3 inline-flex items-center justify-center w-6 h-6 rounded-full bg-expert text-cream text-xs">
              {pendingPeerRequests}
            </span>
          )}
        </Link>
      </div>

      <h2 className="text-2xl font-serif mb-4">Recent goedgekeurd</h2>
      {recentApproved.length === 0 ? (
        <p className="text-muted text-sm">Nog geen goedgekeurd bewijs. Upload je eerste!</p>
      ) : (
        <ul className="space-y-2">
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
      )}

      <h2 className="text-2xl font-serif mt-10 mb-4">Mijn 9 competenties</h2>
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

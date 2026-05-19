import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export default async function CompetencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const competence = await prisma.competence.findUnique({
    where: { slug },
    include: { indicators: { orderBy: { orderIndex: "asc" } } },
  });
  if (!competence) notFound();

  // Approved indicator ids for this user + competence
  const approvedLinks = await prisma.evidenceLink.findMany({
    where: {
      competenceSlug: slug,
      evidence: { userId, status: "GOEDGEKEURD" },
    },
  });
  const approvedIds = new Set(approvedLinks.map((l) => l.indicatorId));

  const pendingLinks = await prisma.evidenceLink.findMany({
    where: {
      competenceSlug: slug,
      evidence: { userId, status: "INGEDIEND" },
    },
  });
  const pendingIds = new Set(pendingLinks.map((l) => l.indicatorId));

  const latestSelf = await prisma.selfScore.findFirst({
    where: { userId, competenceSlug: slug },
    orderBy: { createdAt: "desc" },
  });

  const myEvidence = await prisma.evidence.findMany({
    where: {
      userId,
      links: { some: { competenceSlug: slug } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const tips = await prisma.tip.findMany({
    where: { competenceSlug: slug },
    take: 3,
  });

  const levels: Array<"BASIS" | "GEVORDERD" | "EXPERT"> = ["BASIS", "GEVORDERD", "EXPERT"];

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/student/dashboard" className="text-sm text-muted hover:text-ink">← Terug naar boom</Link>
      <div className="mt-4 flex items-start gap-4">
        <div className="text-6xl">{competence.icon}</div>
        <div>
          <h1 className="text-4xl font-serif">{competence.name}</h1>
          <p className="text-muted mt-1">{competence.description}</p>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Link href={`/student/scan/${slug}`} className="btn btn-primary">
          ✍️ Start zelfscan
        </Link>
        <Link href={`/student/bewijs/new?competence=${slug}`} className="btn btn-ghost">
          📎 Upload bewijs
        </Link>
        <Link href={`/student/peer/new?competence=${slug}`} className="btn btn-ghost">
          🤝 Vraag peer
        </Link>
      </div>

      {latestSelf && (
        <div className="card mt-6">
          <div className="text-xs uppercase tracking-wider text-forest font-semibold">Jouw zelfindicatie</div>
          <div className="font-serif text-xl mt-1">
            <span className={`pill pill-${latestSelf.calculatedLevel.toLowerCase()}`}>
              {latestSelf.calculatedLevel.toLowerCase()}
            </span>
            <span className="text-sm text-muted ml-2">
              op basis van {new Date(latestSelf.createdAt).toLocaleDateString("nl-NL")}
            </span>
          </div>
          <p className="text-sm text-muted mt-2">
            Een zelfscan is een eerste beeld. Een officieel niveau telt pas wanneer bewijs is goedgekeurd door je docent.
          </p>
        </div>
      )}

      <h2 className="text-2xl font-serif mt-10 mb-4">Indicatoren</h2>
      <div className="space-y-6">
        {levels.map((lvl) => {
          const inds = competence.indicators.filter((i) => i.level === lvl);
          const approvedCount = inds.filter((i) => approvedIds.has(i.id)).length;
          return (
            <div key={lvl}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-serif text-xl`}>
                  <span className={`pill pill-${lvl.toLowerCase()} mr-2`}>{lvl.toLowerCase()}</span>
                </h3>
                <span className="text-xs text-muted">{approvedCount}/{inds.length} bewezen</span>
              </div>
              <ul className="space-y-1.5">
                {inds.map((i) => {
                  const approved = approvedIds.has(i.id);
                  const pending = pendingIds.has(i.id);
                  return (
                    <li key={i.id} className="card flex items-start gap-3 py-3">
                      <span className="text-lg">
                        {approved ? "✅" : pending ? "⏳" : "○"}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm">{i.text}</div>
                        {pending && <div className="text-xs text-gevorderd mt-1">Bewijs wacht op review</div>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {tips.length > 0 && (
        <>
          <h2 className="text-2xl font-serif mt-10 mb-4">Tips &amp; opdrachten</h2>
          <ul className="space-y-2">
            {tips.map((t) => (
              <li key={t.id} className="card">
                <div className="text-xs text-muted">{t.type} · {t.level.toLowerCase()}</div>
                <div className="mt-1">{t.text}</div>
              </li>
            ))}
          </ul>
        </>
      )}

      {myEvidence.length > 0 && (
        <>
          <h2 className="text-2xl font-serif mt-10 mb-4">Mijn bewijs voor deze competentie</h2>
          <ul className="space-y-2">
            {myEvidence.map((e) => (
              <li key={e.id} className="card text-sm">
                <div className="flex items-center justify-between">
                  <span className={`pill pill-${e.status === "GOEDGEKEURD" ? "basis" : e.status === "INGEDIEND" ? "gevorderd" : "locked"}`}>
                    {e.status === "GOEDGEKEURD" ? "goedgekeurd" : e.status === "INGEDIEND" ? "wacht op review" : e.status.toLowerCase()}
                  </span>
                  <span className="text-xs text-muted">{new Date(e.createdAt).toLocaleDateString("nl-NL")}</span>
                </div>
                <div className="mt-2 text-ink">{e.reflection}</div>
                {e.reviewerNote && (
                  <div className="mt-2 text-xs text-muted italic">"Docent: {e.reviewerNote}"</div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

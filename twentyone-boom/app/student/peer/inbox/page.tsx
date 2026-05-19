import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function PeerInbox() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const open = await prisma.peerRequest.findMany({
    where: { peerUserId: session.user.id, status: "OPEN" },
    orderBy: { createdAt: "desc" },
    include: { target: true },
  });

  const completed = await prisma.peerRequest.findMany({
    where: { peerUserId: session.user.id, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { target: true },
  });

  const competences = await prisma.competence.findMany();
  const compMap = new Map(competences.map((c) => [c.slug, c]));

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-serif">Peer-verzoeken</h1>
      <p className="text-muted mt-2">Klasgenoten hebben jou gevraagd om hen te scoren.</p>

      <h2 className="font-serif text-xl mt-8 mb-3">Openstaand ({open.length})</h2>
      {open.length === 0 ? (
        <p className="text-sm text-muted">Geen openstaande verzoeken. 🌿</p>
      ) : (
        <ul className="space-y-2">
          {open.map((r) => {
            const c = compMap.get(r.competenceSlug);
            return (
              <li key={r.id} className="card flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">
                    {c?.icon} <strong>{r.target.name}</strong> vraagt jou voor <em>{c?.name}</em>
                  </div>
                  {r.message && <div className="text-sm text-muted italic mt-1">"{r.message}"</div>}
                  <div className="text-xs text-muted mt-1">{new Date(r.createdAt).toLocaleDateString("nl-NL")}</div>
                </div>
                <Link href={`/student/peer/score/${r.id}`} className="btn btn-primary shrink-0">
                  Beantwoorden →
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <h2 className="font-serif text-xl mt-10 mb-3">Recent gegeven</h2>
      {completed.length === 0 ? (
        <p className="text-sm text-muted">Nog niets gegeven.</p>
      ) : (
        <ul className="space-y-2">
          {completed.map((r) => {
            const c = compMap.get(r.competenceSlug);
            return (
              <li key={r.id} className="card text-sm">
                {c?.icon} {r.target.name} · {c?.name} <span className="text-muted ml-2 text-xs">{new Date(r.createdAt).toLocaleDateString("nl-NL")}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

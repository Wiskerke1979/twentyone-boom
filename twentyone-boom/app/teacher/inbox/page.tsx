import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function TeacherInbox() {
  const items = await prisma.evidence.findMany({
    where: { status: "INGEDIEND" },
    orderBy: { createdAt: "asc" },
    include: {
      user: true,
      links: { include: { competence: true, indicator: true } },
    },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-serif">Bewijs-inbox</h1>
      <p className="text-muted mt-2">{items.length} {items.length === 1 ? "item" : "items"} wachten op je oordeel.</p>

      {items.length === 0 ? (
        <div className="card mt-6 text-center text-muted">
          <div className="text-4xl mb-2">🌿</div>
          Geen openstaand bewijs. Even ademhalen.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((e) => {
            const firstComp = e.links[0]?.competence;
            return (
              <li key={e.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">
                      {firstComp?.icon} <strong>{e.user.name}</strong>
                      <span className="text-muted text-sm ml-2">· {firstComp?.name || "—"}</span>
                    </div>
                    <div className="text-sm text-muted mt-1 line-clamp-2">
                      "{e.reflection.slice(0, 140)}{e.reflection.length > 140 ? "…" : ""}"
                    </div>
                    <div className="text-xs text-muted mt-1">
                      {new Date(e.createdAt).toLocaleString("nl-NL")} · {e.links.length} indicator(en)
                    </div>
                  </div>
                  <Link href={`/teacher/evidence/${e.id}`} className="btn btn-primary shrink-0">
                    Beoordelen →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

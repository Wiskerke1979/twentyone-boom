import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminHelpPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || "OPEN";

  const requests = await prisma.helpRequest.findMany({
    where: status === "ALL" ? {} : { status },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, email: true, className: true } } },
  });

  const counts = await prisma.helpRequest.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const countMap = new Map(counts.map((c) => [c.status, c._count._all]));

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-serif">Hulpvragen</h1>
      <p className="text-muted mt-2">Berichten verstuurd via de helpknop in de app.</p>

      <div className="mt-6 flex gap-1.5 flex-wrap">
        {[
          { v: "OPEN", l: "Open" },
          { v: "IN_PROGRESS", l: "Bezig" },
          { v: "RESOLVED", l: "Opgelost" },
          { v: "ALL", l: "Alle" },
        ].map((s) => (
          <Link
            key={s.v}
            href={`/admin/help?status=${s.v}`}
            className={`pill ${status === s.v ? "bg-forest text-cream" : "bg-paper text-muted hover:text-ink"}`}
          >
            {s.l} {countMap.has(s.v) ? `(${countMap.get(s.v)})` : ""}
          </Link>
        ))}
      </div>

      <ul className="mt-6 space-y-2">
        {requests.map((r) => (
          <li key={r.id}>
            <Link href={`/admin/help/${r.id}`} className="card block hover:border-forest transition">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="font-medium">
                  {r.fromName}
                  <span className="text-muted text-sm ml-2">{r.fromEmail}</span>
                  {r.fromRole && <span className="pill pill-locked ml-2 text-xs">{r.fromRole.toLowerCase()}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`pill ${r.status === "OPEN" ? "pill-expert" : r.status === "IN_PROGRESS" ? "pill-gevorderd" : "pill-basis"}`}>
                    {r.status.toLowerCase().replace("_", " ")}
                  </span>
                  <span className="text-xs text-muted">{new Date(r.createdAt).toLocaleString("nl-NL")}</span>
                </div>
              </div>
              <p className="text-sm line-clamp-2">{r.message}</p>
            </Link>
          </li>
        ))}
      </ul>

      {requests.length === 0 && (
        <p className="text-muted text-sm mt-6">Geen hulpvragen in deze categorie. 🌿</p>
      )}
    </div>
  );
}

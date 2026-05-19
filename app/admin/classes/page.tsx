import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminClassesPage() {
  // Aggregate students per className
  const groups = await prisma.user.groupBy({
    by: ["className"],
    where: { role: "STUDENT", className: { not: null } },
    _count: { _all: true },
  });

  // Sort by class name
  groups.sort((a, b) => (a.className || "").localeCompare(b.className || ""));

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/admin/dashboard" className="text-sm text-muted hover:text-ink">← Terug</Link>
      <h1 className="text-4xl font-serif mt-4">Klassen</h1>
      <p className="text-muted mt-2">
        Overzicht van alle klasnamen die in gebruik zijn. Klasnamen worden bepaald door
        het veld op de leerling. Wijzig een naam via de leerling-detailpagina.
      </p>

      {groups.length === 0 ? (
        <p className="text-muted text-sm mt-8">
          Nog geen klassen. <Link href="/admin/users/import" className="underline text-forest">Importeer een klas</Link>.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {groups.map((g) => (
            <li key={g.className || ""} className="card">
              <Link
                href={`/admin/users?className=${encodeURIComponent(g.className || "")}`}
                className="flex items-center justify-between"
              >
                <div>
                  <div className="font-serif text-xl">{g.className}</div>
                  <div className="text-xs text-muted mt-1">
                    {g._count._all} {g._count._all === 1 ? "leerling" : "leerlingen"}
                  </div>
                </div>
                <span className="text-forest">Bekijken →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

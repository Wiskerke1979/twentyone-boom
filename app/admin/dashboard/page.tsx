import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminDashboard() {
  const [totalUsers, students, teachers, admins, totalEvidence, pendingEvidence, totalPeerScores, classGroups] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.evidence.count(),
    prisma.evidence.count({ where: { status: "INGEDIEND" } }),
    prisma.peerScore.count(),
    prisma.user.groupBy({
      by: ["className"],
      where: { role: "STUDENT", className: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const recentlyActive = await prisma.user.findMany({
    where: { lastLoginAt: { not: null } },
    orderBy: { lastLoginAt: "desc" },
    take: 8,
    select: { id: true, name: true, email: true, role: true, className: true, lastLoginAt: true },
  });

  return (
    <div className="max-w-5xl mx-auto">
      <p className="text-sm text-forest font-semibold uppercase tracking-wider">Admin</p>
      <h1 className="text-4xl font-serif mt-1">Overzicht</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <Stat label="Totaal gebruikers" value={totalUsers} />
        <Stat label="Leerlingen" value={students} />
        <Stat label="Docenten" value={teachers} />
        <Stat label="Admins" value={admins} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        <Stat label="Bewijs items" value={totalEvidence} />
        <Stat label="Wacht op review" value={pendingEvidence} tone={pendingEvidence > 0 ? "warn" : "ok"} />
        <Stat label="Peer-scores gegeven" value={totalPeerScores} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <Link href="/admin/users" className="card hover:border-forest transition">
          <div className="text-2xl">👥</div>
          <div className="font-serif text-lg mt-1">Gebruikers</div>
          <div className="text-sm text-muted mt-1">Zoeken, wachtwoord resetten, rol wisselen.</div>
        </Link>
        <Link href="/admin/users/import" className="card hover:border-forest transition">
          <div className="text-2xl">📥</div>
          <div className="font-serif text-lg mt-1">Bulk-import</div>
          <div className="text-sm text-muted mt-1">CSV-upload van een hele klas in één keer.</div>
        </Link>
        <Link href="/admin/classes" className="card hover:border-forest transition">
          <div className="text-2xl">🏫</div>
          <div className="font-serif text-lg mt-1">Klassen ({classGroups.length})</div>
          <div className="text-sm text-muted mt-1">Overzicht per klasnaam.</div>
        </Link>
      </div>

      <h2 className="text-2xl font-serif mt-10 mb-3">Recent ingelogd</h2>
      {recentlyActive.length === 0 ? (
        <p className="text-muted text-sm">Nog niemand heeft ingelogd.</p>
      ) : (
        <ul className="space-y-1.5">
          {recentlyActive.map((u) => (
            <li key={u.id} className="card text-sm">
              <Link href={`/admin/users/${u.id}`} className="block">
                <div className="flex justify-between">
                  <span>
                    <strong>{u.name}</strong>
                    <span className="text-muted ml-2">{u.email}</span>
                    <span className="pill pill-locked ml-2">{u.role.toLowerCase()}</span>
                    {u.className && <span className="pill pill-locked ml-2">{u.className}</span>}
                  </span>
                  <span className="text-xs text-muted">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("nl-NL") : "—"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "warn" | "ok" }) {
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wider text-muted font-semibold">{label}</div>
      <div
        className={`font-serif text-3xl mt-1 ${
          tone === "warn" ? "text-expert" : tone === "ok" ? "text-basis" : "text-ink"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

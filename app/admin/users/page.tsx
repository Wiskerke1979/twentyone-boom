import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; className?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const roleFilter = params.role || "";
  const classFilter = params.className || "";

  const users = await prisma.user.findMany({
    where: {
      ...(q && {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
        ],
      }),
      ...(roleFilter && { role: roleFilter }),
      ...(classFilter && { className: classFilter }),
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
    take: 100,
  });

  const classNames = await prisma.user.findMany({
    where: { className: { not: null } },
    select: { className: true },
    distinct: ["className"],
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-serif">Gebruikers</h1>
        <Link href="/admin/users/import" className="btn btn-primary">📥 Bulk-import</Link>
      </div>

      <form className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-2" method="GET">
        <input
          name="q"
          type="text"
          placeholder="Zoek naam of e-mail"
          defaultValue={q}
          className="input md:col-span-2"
        />
        <select name="role" defaultValue={roleFilter} className="input">
          <option value="">Alle rollen</option>
          <option value="STUDENT">Leerlingen</option>
          <option value="TEACHER">Docenten</option>
          <option value="ADMIN">Admins</option>
        </select>
        <select name="className" defaultValue={classFilter} className="input">
          <option value="">Alle klassen</option>
          {classNames.map((c) => (
            <option key={c.className} value={c.className!}>{c.className}</option>
          ))}
        </select>
        <button type="submit" className="btn btn-ghost md:col-span-4">Filter toepassen</button>
      </form>

      <div className="mt-6 text-sm text-muted">
        {users.length} {users.length === 1 ? "gebruiker" : "gebruikers"} gevonden
        {users.length === 100 && " (eerste 100 — verfijn je zoekopdracht)"}
      </div>

      <ul className="mt-3 space-y-1.5">
        {users.map((u) => (
          <li key={u.id}>
            <Link href={`/admin/users/${u.id}`} className="card block hover:border-forest transition text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <strong>{u.name}</strong>
                  <span className="text-muted ml-2">{u.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`pill ${u.role === "ADMIN" ? "pill-expert" : u.role === "TEACHER" ? "pill-gevorderd" : "pill-basis"}`}>
                    {u.role.toLowerCase()}
                  </span>
                  {u.className && <span className="pill pill-locked">{u.className}</span>}
                  {u.lastLoginAt && (
                    <span className="text-xs text-muted">
                      {new Date(u.lastLoginAt).toLocaleDateString("nl-NL")}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {users.length === 0 && (
        <p className="text-muted text-sm mt-6">Geen gebruikers gevonden. Verander je filters of <Link href="/admin/users/import" className="underline text-forest">importeer een klas</Link>.</p>
      )}
    </div>
  );
}

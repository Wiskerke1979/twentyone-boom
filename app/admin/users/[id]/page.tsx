import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { resetUserPassword, changeUserRole, deleteUser, updateUserClass } from "./actions";

export default async function AdminUserDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string; tempPw?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: { evidence: true, selfScores: true, peerScoresGiven: true },
      },
    },
  });
  if (!user) notFound();

  const classes = await prisma.user.findMany({
    where: { className: { not: null } },
    select: { className: true },
    distinct: ["className"],
  });

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/admin/users" className="text-sm text-muted hover:text-ink">← Terug</Link>
      <h1 className="text-4xl font-serif mt-4">{user.name}</h1>
      <p className="text-muted">{user.email}</p>

      <div className="flex items-center gap-2 mt-2">
        <span className={`pill ${user.role === "ADMIN" ? "pill-expert" : user.role === "TEACHER" ? "pill-gevorderd" : "pill-basis"}`}>
          {user.role.toLowerCase()}
        </span>
        {user.className && <span className="pill pill-locked">{user.className}</span>}
        {user.lastLoginAt && (
          <span className="text-xs text-muted">
            laatst ingelogd: {new Date(user.lastLoginAt).toLocaleString("nl-NL")}
          </span>
        )}
      </div>

      {sp.msg === "pw-reset" && (
        <div className="mt-4 p-4 bg-basis/10 border border-basis rounded-md text-sm">
          ✓ Wachtwoord gereset.
          {sp.tempPw && (
            <div className="mt-2">
              <strong>Nieuw tijdelijk wachtwoord:</strong>{" "}
              <code className="bg-white px-2 py-0.5 rounded font-mono">{sp.tempPw}</code>
              <span className="text-muted ml-2">(geef dit door aan de gebruiker)</span>
            </div>
          )}
        </div>
      )}
      {sp.msg === "role-changed" && (
        <div className="mt-4 p-3 bg-basis/10 text-basis rounded-md text-sm">✓ Rol bijgewerkt.</div>
      )}
      {sp.msg === "class-updated" && (
        <div className="mt-4 p-3 bg-basis/10 text-basis rounded-md text-sm">✓ Klas bijgewerkt.</div>
      )}

      <div className="grid grid-cols-3 gap-3 mt-8">
        <Stat label="Bewijs" value={user._count.evidence} />
        <Stat label="Zelfscans" value={user._count.selfScores} />
        <Stat label="Peer-scores gegeven" value={user._count.peerScoresGiven} />
      </div>

      <h2 className="text-2xl font-serif mt-10 mb-3">Wachtwoord resetten</h2>
      <form action={resetUserPassword} className="card flex items-end gap-3">
        <input type="hidden" name="userId" value={user.id} />
        <button type="submit" className="btn btn-primary">
          Genereer nieuw tijdelijk wachtwoord
        </button>
        <p className="text-sm text-muted">Bestaande wachtwoord wordt direct ongeldig.</p>
      </form>

      <h2 className="text-2xl font-serif mt-10 mb-3">Rol wisselen</h2>
      <form action={changeUserRole} className="card space-y-3">
        <input type="hidden" name="userId" value={user.id} />
        <select name="role" defaultValue={user.role} className="input">
          <option value="STUDENT">Leerling</option>
          <option value="TEACHER">Docent</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button type="submit" className="btn btn-primary">Rol opslaan</button>
      </form>

      <h2 className="text-2xl font-serif mt-10 mb-3">Klas wijzigen</h2>
      <form action={updateUserClass} className="card space-y-3">
        <input type="hidden" name="userId" value={user.id} />
        <input
          name="className"
          type="text"
          list="classnames"
          placeholder="bv. O&O 3A — leeg = geen klas"
          defaultValue={user.className || ""}
          className="input"
        />
        <datalist id="classnames">
          {classes.map((c) => (
            <option key={c.className} value={c.className!} />
          ))}
        </datalist>
        <button type="submit" className="btn btn-primary">Klas opslaan</button>
      </form>

      <h2 className="text-2xl font-serif mt-10 mb-3 text-expert">Gevaarlijke zone</h2>
      <form action={deleteUser} className="card border-expert">
        <input type="hidden" name="userId" value={user.id} />
        <p className="text-sm mb-3">
          Verwijder deze gebruiker permanent. Alle bewijs, zelfscans en peer-feedback gaan ook weg.
        </p>
        <button type="submit" className="btn btn-danger">
          Verwijder {user.name}
        </button>
      </form>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card text-center">
      <div className="text-xs uppercase tracking-wider text-muted font-semibold">{label}</div>
      <div className="font-serif text-2xl mt-1">{value}</div>
    </div>
  );
}

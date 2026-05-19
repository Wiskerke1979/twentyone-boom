import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { teacherResetPassword } from "./actions";

export default async function TeacherManageUser({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tempPw?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") redirect("/");
  const { id } = await params;
  const sp = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, className: true, lastLoginAt: true },
  });
  if (!user || user.role !== "STUDENT") notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/teacher/manage" className="text-sm text-muted hover:text-ink">← Terug</Link>
      <h1 className="text-4xl font-serif mt-4">{user.name}</h1>
      <p className="text-muted">{user.email}{user.className && ` · ${user.className}`}</p>

      {sp.tempPw && (
        <div className="mt-4 p-4 bg-basis/10 border border-basis rounded-md text-sm">
          ✓ Wachtwoord gereset. Nieuw tijdelijk wachtwoord:{" "}
          <code className="bg-white px-2 py-0.5 rounded font-mono">{sp.tempPw}</code>
          <div className="text-muted mt-1 text-xs">
            Geef dit door aan de leerling. De leerling kan zelf een nieuw wachtwoord kiezen na inloggen.
          </div>
        </div>
      )}

      <h2 className="text-2xl font-serif mt-8 mb-3">Wachtwoord resetten</h2>
      <form action={teacherResetPassword} className="card">
        <input type="hidden" name="userId" value={user.id} />
        <p className="text-sm mb-3">Het oude wachtwoord wordt direct ongeldig.</p>
        <button type="submit" className="btn btn-primary">
          Genereer nieuw tijdelijk wachtwoord
        </button>
      </form>
    </div>
  );
}

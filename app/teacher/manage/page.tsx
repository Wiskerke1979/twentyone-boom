import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function TeacherManagePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") redirect("/");

  // Docent ziet leerlingen — geen andere docenten of admins.
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: [{ className: "asc" }, { name: "asc" }],
    select: {
      id: true, name: true, email: true, className: true, lastLoginAt: true,
    },
  });

  // Groepeer per klas
  const byClass = new Map<string, typeof students>();
  for (const s of students) {
    const key = s.className || "(geen klas)";
    if (!byClass.has(key)) byClass.set(key, []);
    byClass.get(key)!.push(s);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <p className="text-sm text-forest font-semibold uppercase tracking-wider">Klasbeheer</p>
      <h1 className="text-4xl font-serif mt-1">Wachtwoord resetten</h1>
      <p className="text-muted mt-2 max-w-xl">
        Heeft een leerling zijn wachtwoord vergeten? Klik op de leerling om direct een nieuw tijdelijk wachtwoord te genereren.
      </p>

      {[...byClass.entries()].map(([className, list]) => (
        <section key={className} className="mt-8">
          <h2 className="font-serif text-2xl mb-3">{className}</h2>
          <ul className="space-y-1.5">
            {list.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/teacher/manage/${s.id}`}
                  className="card block hover:border-forest transition text-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>{s.name}</strong>
                      <span className="text-muted ml-2">{s.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.lastLoginAt ? (
                        <span className="text-xs text-muted">
                          laatst: {new Date(s.lastLoginAt).toLocaleDateString("nl-NL")}
                        </span>
                      ) : (
                        <span className="pill pill-locked text-xs">nog niet ingelogd</span>
                      )}
                      <span className="text-forest text-sm">→</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {students.length === 0 && (
        <p className="text-muted text-sm mt-8">Geen leerlingen gevonden.</p>
      )}
    </div>
  );
}

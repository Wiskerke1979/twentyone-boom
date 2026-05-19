import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createAssignment, deleteAssignment } from "./actions";

export default async function AssignPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") redirect("/login");

  const competences = await prisma.competence.findMany({ orderBy: { orderIndex: "asc" } });
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: [{ className: "asc" }, { name: "asc" }],
  });

  // Distinct classnames
  const classNames = Array.from(new Set(students.map((s) => s.className).filter((c): c is string => !!c)));

  const existing = await prisma.competenceAssignment.findMany({
    where: { assignedById: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      competence: true,
      student: { select: { name: true, className: true } },
    },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <p className="text-sm text-forest font-semibold uppercase tracking-wider">Docent</p>
      <h1 className="text-4xl font-serif mt-1">Competenties klaarzetten</h1>
      <p className="text-muted mt-2 max-w-xl">
        Zet een competentie klaar voor één leerling of een hele klas. Leerlingen zien hem prominent op hun dashboard en in hun zelfscan-lijst.
      </p>

      <form action={createAssignment} className="mt-8 space-y-5 card">
        <div>
          <label className="label">Welke competentie?</label>
          <select name="competenceSlug" required className="input">
            <option value="" disabled>Kies een competentie</option>
            {competences.map((c) => (
              <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Voor wie?</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <label className="card flex items-start gap-3 cursor-pointer hover:border-forest border-line">
              <input type="radio" name="targetType" value="student" defaultChecked className="mt-1" />
              <div>
                <div className="font-medium">Eén leerling</div>
                <div className="text-xs text-muted">Specifiek doel voor deze leerling.</div>
              </div>
            </label>
            <label className="card flex items-start gap-3 cursor-pointer hover:border-forest border-line">
              <input type="radio" name="targetType" value="class" className="mt-1" />
              <div>
                <div className="font-medium">Hele klas</div>
                <div className="text-xs text-muted">Geldt voor iedereen in de klas.</div>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="label">Kies leerling (als 'één leerling') of klas</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select name="studentId" className="input">
              <option value="">— Kies leerling —</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.className || "—"})</option>
              ))}
            </select>
            <select name="className" className="input">
              <option value="">— Kies klas —</option>
              {classNames.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-muted mt-1">
            Eén van de twee invullen (matchend met de keuze hierboven).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Streefniveau (optioneel)</label>
            <select name="targetLevel" className="input">
              <option value="">Geen specifiek niveau</option>
              <option value="BASIS">Basis</option>
              <option value="GEVORDERD">Gevorderd</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
          <div>
            <label className="label">Deadline (optioneel)</label>
            <input type="date" name="dueDate" className="input" />
          </div>
        </div>

        <div>
          <label className="label">Bericht (optioneel)</label>
          <textarea
            name="message"
            rows={3}
            placeholder="Bijv. 'Werk deze maand aan samenwerken. Vraag mij om hulp als je vastloopt.'"
            className="input"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Klaarzetten
        </button>
      </form>

      <h2 className="font-serif text-2xl mt-12 mb-4">Recent klaargezet</h2>
      {existing.length === 0 ? (
        <p className="text-muted text-sm">Nog niets klaargezet.</p>
      ) : (
        <ul className="space-y-2">
          {existing.map((a) => (
            <li key={a.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">
                    {a.competence.icon} {a.competence.name}
                  </div>
                  <div className="text-sm text-muted mt-1">
                    Voor: {a.student
                      ? <strong>{a.student.name}</strong>
                      : <strong>klas {a.className}</strong>}
                    {a.targetLevel && <> · streef: <span className={`pill pill-${a.targetLevel.toLowerCase()}`}>{a.targetLevel.toLowerCase()}</span></>}
                    {a.dueDate && <> · voor {new Date(a.dueDate).toLocaleDateString("nl-NL")}</>}
                  </div>
                  {a.message && <p className="text-sm italic text-muted mt-2">"{a.message}"</p>}
                </div>
                <form action={deleteAssignment}>
                  <input type="hidden" name="id" value={a.id} />
                  <button type="submit" className="text-xs text-muted hover:text-expert underline shrink-0">
                    Verwijder
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

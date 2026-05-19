import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTreeData } from "@/lib/tree-data";
import { getAssignmentsForStudent } from "@/lib/assignments";

export default async function ScanLandingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const branches = await getTreeData(session.user.id);
  const assignments = await getAssignmentsForStudent(session.user.id);

  // Map: competenceSlug → latest assignment (if any)
  const assignmentBySlug = new Map<string, (typeof assignments)[number]>();
  for (const a of assignments) {
    if (!assignmentBySlug.has(a.competenceSlug)) assignmentBySlug.set(a.competenceSlug, a);
  }

  // Split: assigned competences first, then rest
  const assigned = branches.filter((b) => assignmentBySlug.has(b.competenceSlug));
  const unassigned = branches.filter((b) => !assignmentBySlug.has(b.competenceSlug));
  const notScanned = unassigned.filter((b) => !b.selfIndicated && !b.currentLevel);
  const scanned = unassigned.filter((b) => b.selfIndicated || b.currentLevel);

  return (
    <div className="max-w-4xl mx-auto">
      <p className="text-sm text-forest font-semibold uppercase tracking-wider">Zelfscan</p>
      <h1 className="text-4xl font-serif mt-1">Welke competentie wil je scannen?</h1>
      <p className="text-muted mt-2 max-w-2xl">
        Met een zelfscan beantwoord je 5 korte vragen en krijg je een indicatie van je huidige niveau. Levert bruine bladeren op — bewijs maakt ze groen.
      </p>

      {assigned.length > 0 && (
        <section className="mt-8">
          <h2 className="font-serif text-xl mb-3">📌 Door je docent klaargezet</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assigned.map((b) => {
              const a = assignmentBySlug.get(b.competenceSlug)!;
              return (
                <Link
                  key={b.competenceSlug}
                  href={`/student/scan/${b.competenceSlug}`}
                  className="card hover:border-forest transition border-l-4 border-l-gevorderd"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{b.icon}</span>
                      <div>
                        <div className="font-serif text-lg">{b.name}</div>
                        <div className="text-xs text-muted">
                          door {a.assignedBy.name}
                          {a.targetLevel && <> · streef: <strong>{a.targetLevel.toLowerCase()}</strong></>}
                          {a.dueDate && <> · voor {new Date(a.dueDate).toLocaleDateString("nl-NL")}</>}
                        </div>
                      </div>
                    </div>
                    <Status branch={b} />
                  </div>
                  {a.message && (
                    <p className="text-sm italic text-muted mt-2">"{a.message}"</p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {notScanned.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-xl mb-3">🌱 Nog niet gescand</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {notScanned.map((b) => (
              <Link
                key={b.competenceSlug}
                href={`/student/scan/${b.competenceSlug}`}
                className="card hover:border-forest transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{b.icon}</span>
                  <div>
                    <div className="font-serif text-lg">{b.name}</div>
                    <div className="text-xs text-muted">Start zelfscan →</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {scanned.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-xl mb-3">✓ Al eerder gescand</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {scanned.map((b) => (
              <Link
                key={b.competenceSlug}
                href={`/student/scan/${b.competenceSlug}`}
                className="card hover:border-forest transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{b.icon}</span>
                    <div>
                      <div className="font-serif text-lg">{b.name}</div>
                      <div className="text-xs text-muted">Opnieuw scannen →</div>
                    </div>
                  </div>
                  <Status branch={b} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Status({ branch }: { branch: { currentLevel: any; selfIndicated: any } }) {
  if (branch.currentLevel) {
    return <span className={`pill pill-${branch.currentLevel.toLowerCase()}`}>{branch.currentLevel.toLowerCase()} bewezen</span>;
  }
  if (branch.selfIndicated) {
    return (
      <span className="pill" style={{ background: "#A57B47", color: "white" }}>
        {branch.selfIndicated.toLowerCase()} zelfscan
      </span>
    );
  }
  return <span className="pill pill-locked">nog niet</span>;
}

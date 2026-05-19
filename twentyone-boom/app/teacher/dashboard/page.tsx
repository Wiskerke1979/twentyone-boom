import Link from "next/link";
import { prisma } from "@/lib/db";
import { getTreeData } from "@/lib/tree-data";

export default async function TeacherDashboard() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: [{ className: "asc" }, { name: "asc" }],
  });

  // Group by class
  const byClass = new Map<string, typeof students>();
  for (const s of students) {
    const key = s.className || "(zonder klas)";
    if (!byClass.has(key)) byClass.set(key, []);
    byClass.get(key)!.push(s);
  }

  // Pending evidence count
  const pending = await prisma.evidence.count({ where: { status: "INGEDIEND" } });

  // Pre-compute tree-summary per student (lightweight: only counts)
  const summaries = new Map<string, { basis: number; gevorderd: number; expert: number; totalApprovedIndicators: number }>();
  for (const s of students) {
    const branches = await getTreeData(s.id);
    summaries.set(s.id, {
      basis: branches.filter((b) => b.currentLevel === "BASIS").length,
      gevorderd: branches.filter((b) => b.currentLevel === "GEVORDERD").length,
      expert: branches.filter((b) => b.currentLevel === "EXPERT").length,
      totalApprovedIndicators: branches.reduce((sum, b) => sum + b.approvedIndicatorCount, 0),
    });
  }

  return (
    <div className="max-w-6xl mx-auto">
      <p className="text-sm text-forest font-semibold uppercase tracking-wider">Docent</p>
      <h1 className="text-4xl font-serif mt-1">Mijn klassen</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Link href="/teacher/inbox" className="card hover:border-forest transition">
          <div className="text-2xl">📨</div>
          <div className="font-serif text-lg mt-1">Bewijs-inbox</div>
          <div className="text-sm text-muted mt-1">
            {pending} {pending === 1 ? "item wacht" : "items wachten"} op review
          </div>
        </Link>
        <div className="card">
          <div className="text-2xl">🌲</div>
          <div className="font-serif text-lg mt-1">{students.length} leerlingen</div>
          <div className="text-sm text-muted mt-1">{byClass.size} {byClass.size === 1 ? "klas" : "klassen"}</div>
        </div>
      </div>

      {[...byClass.entries()].map(([className, list]) => (
        <section key={className} className="mt-10">
          <h2 className="text-2xl font-serif mb-3">{className}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {list.map((s) => {
              const sum = summaries.get(s.id)!;
              return (
                <Link
                  key={s.id}
                  href={`/teacher/student/${s.id}`}
                  className="card hover:border-forest transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted">{s.email}</div>
                    </div>
                    <div className="text-3xl">
                      {sum.expert > 0 ? "🌳" : sum.gevorderd + sum.basis > 4 ? "🌲" : "🌱"}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 text-xs">
                    {sum.basis > 0 && <span className="pill pill-basis">{sum.basis} basis</span>}
                    {sum.gevorderd > 0 && <span className="pill pill-gevorderd">{sum.gevorderd} gev</span>}
                    {sum.expert > 0 && <span className="pill pill-expert">{sum.expert} exp</span>}
                  </div>
                  <div className="mt-2 text-xs text-muted">
                    {sum.totalApprovedIndicators} indicatoren bewezen
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      {students.length === 0 && (
        <p className="text-muted text-sm mt-8">
          Nog geen leerlingen. Laat hen zich registreren via <code>/register</code>.
        </p>
      )}
    </div>
  );
}

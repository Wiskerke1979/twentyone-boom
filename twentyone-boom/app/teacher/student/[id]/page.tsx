import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getTreeData } from "@/lib/tree-data";
import { Tree } from "@/components/Tree";

export default async function TeacherStudentProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const student = await prisma.user.findUnique({
    where: { id },
    include: { tree: true },
  });
  if (!student || student.role !== "STUDENT") notFound();

  const branches = await getTreeData(student.id);

  const evidenceItems = await prisma.evidence.findMany({
    where: { userId: student.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { links: { include: { competence: true } } },
  });

  const selfScores = await prisma.selfScore.findMany({
    where: { userId: student.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { competence: true },
  });

  return (
    <div className="max-w-5xl mx-auto">
      <Link href="/teacher/dashboard" className="text-sm text-muted hover:text-ink">← Terug naar klas</Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif">{student.name}</h1>
          <p className="text-muted mt-1">{student.email} · {student.className || "geen klas"}</p>
          {student.tree && (
            <p className="text-sm mt-2">
              <strong>{student.tree.xpTotal} XP</strong>
              {student.tree.streakDays > 0 && <span className="ml-3">🔥 {student.tree.streakDays} dagen streak</span>}
            </p>
          )}
        </div>
      </div>

      <div className="card mt-6">
        <Tree branches={branches} />
      </div>

      <h2 className="text-2xl font-serif mt-10 mb-4">Tijdlijn</h2>
      <ul className="space-y-2">
        {evidenceItems.map((e) => (
          <li key={e.id} className="card text-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">
                  {e.links[0]?.competence.icon} {e.links[0]?.competence.name}
                  <span className={`pill ml-2 pill-${e.status === "GOEDGEKEURD" ? "basis" : e.status === "AFGEWEZEN" ? "expert" : "gevorderd"}`}>
                    {e.status.toLowerCase()}
                  </span>
                </div>
                <div className="text-muted mt-1">{e.reflection.slice(0, 140)}{e.reflection.length > 140 ? "…" : ""}</div>
              </div>
              <div className="text-xs text-muted shrink-0">{new Date(e.createdAt).toLocaleDateString("nl-NL")}</div>
            </div>
            {e.status === "INGEDIEND" && (
              <div className="mt-2">
                <Link href={`/teacher/evidence/${e.id}`} className="btn btn-primary text-xs">
                  Beoordelen →
                </Link>
              </div>
            )}
          </li>
        ))}
        {evidenceItems.length === 0 && (
          <p className="text-muted text-sm">Nog geen bewijs ingediend.</p>
        )}
      </ul>

      <h2 className="text-2xl font-serif mt-10 mb-4">Recente zelfscans</h2>
      {selfScores.length === 0 ? (
        <p className="text-muted text-sm">Geen zelfscans gedaan.</p>
      ) : (
        <ul className="space-y-1.5">
          {selfScores.map((s) => (
            <li key={s.id} className="card text-sm flex items-center justify-between">
              <span>
                {s.competence.icon} {s.competence.name}
                <span className={`pill ml-3 pill-${s.calculatedLevel.toLowerCase()}`}>
                  zelfindicatie: {s.calculatedLevel.toLowerCase()}
                </span>
              </span>
              <span className="text-xs text-muted">{new Date(s.createdAt).toLocaleDateString("nl-NL")}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

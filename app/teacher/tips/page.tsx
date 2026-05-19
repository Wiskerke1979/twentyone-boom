import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

const TYPE_META: Record<string, { icon: string; label: string; bg: string; fg: string }> = {
  TIP: { icon: "💡", label: "Tip", bg: "#FFF6E0", fg: "#A67B14" },
  OPDRACHT: { icon: "📋", label: "Opdracht", bg: "#E8F0F0", fg: "#2D5043" },
  CHALLENGE: { icon: "🎯", label: "Challenge", bg: "#F9E5E0", fg: "#C74E3A" },
};

export default async function TeacherTipsPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    redirect("/");
  }

  const competences = await prisma.competence.findMany({ orderBy: { orderIndex: "asc" } });
  const tips = await prisma.tip.findMany({
    orderBy: [{ competenceSlug: "asc" }, { level: "asc" }],
    include: { competence: true, createdBy: { select: { name: true } } },
  });

  const grouped = new Map<string, typeof tips>();
  for (const t of tips) {
    if (!grouped.has(t.competenceSlug)) grouped.set(t.competenceSlug, []);
    grouped.get(t.competenceSlug)!.push(t);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <p className="text-sm text-forest font-semibold uppercase tracking-wider">Beheer tips & opdrachten</p>
      <div className="flex items-center justify-between mt-1">
        <h1 className="text-4xl font-serif">Bibliotheek</h1>
        <Link href="/teacher/tips/new" className="btn btn-primary">+ Tip toevoegen</Link>
      </div>
      <p className="text-muted mt-2 max-w-2xl">
        Voeg eigen tips, opdrachten of challenges toe voor je leerlingen. Bestaande tips kunnen worden bewerkt of verwijderd.
      </p>

      {[...grouped.entries()].map(([slug, items]) => {
        const c = competences.find((x) => x.slug === slug);
        return (
          <section key={slug} className="mt-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{c?.icon}</span>
              <h2 className="font-serif text-2xl">{c?.name}</h2>
              <span className="text-xs text-muted">· {items.length} {items.length === 1 ? "item" : "items"}</span>
            </div>
            <ul className="space-y-2">
              {items.map((t) => {
                const m = TYPE_META[t.type] || TYPE_META.TIP;
                return (
                  <li key={t.id}>
                    <Link href={`/teacher/tips/${t.id}`} className="card block hover:border-forest transition">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="pill" style={{ background: m.bg, color: m.fg }}>
                          {m.icon} {m.label}
                        </span>
                        <span className={`pill pill-${t.level.toLowerCase()}`}>{t.level.toLowerCase()}</span>
                        {t.createdBy && (
                          <span className="pill pill-locked text-xs">door {t.createdBy.name}</span>
                        )}
                      </div>
                      <p className="text-sm">{t.text}</p>
                      {t.suggestedEvidence && (
                        <p className="text-xs text-muted mt-2">📎 {t.suggestedEvidence}</p>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

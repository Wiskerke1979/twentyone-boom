import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

const TYPE_META: Record<string, { icon: string; label: string; bg: string; fg: string }> = {
  TIP: { icon: "💡", label: "Tip", bg: "#FFF6E0", fg: "#A67B14" },
  OPDRACHT: { icon: "📋", label: "Opdracht", bg: "#E8F0F0", fg: "#2D5043" },
  CHALLENGE: { icon: "🎯", label: "Challenge", bg: "#F9E5E0", fg: "#C74E3A" },
};

export default async function TipsLibrary({
  searchParams,
}: {
  searchParams: Promise<{ competence?: string; type?: string; level?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const competenceFilter = params.competence || "";
  const typeFilter = params.type || "";
  const levelFilter = params.level || "";

  const competences = await prisma.competence.findMany({ orderBy: { orderIndex: "asc" } });

  const tips = await prisma.tip.findMany({
    where: {
      ...(competenceFilter && { competenceSlug: competenceFilter }),
      ...(typeFilter && { type: typeFilter }),
      ...(levelFilter && { level: levelFilter }),
    },
    include: { competence: true },
    orderBy: [{ competenceSlug: "asc" }, { level: "asc" }],
  });

  // Welke heeft de leerling weggeklikt
  const dismissed = await prisma.dismissedTip.findMany({
    where: { userId: session.user.id },
    select: { tipId: true },
  });
  const dismissedSet = new Set(dismissed.map((d) => d.tipId));

  // Groepeer per competentie
  const grouped = new Map<string, typeof tips>();
  for (const t of tips) {
    const key = t.competenceSlug;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(t);
  }

  function filterLink(updates: Partial<{ competence: string; type: string; level: string }>) {
    const next = new URLSearchParams();
    const c = updates.competence ?? competenceFilter;
    const ty = updates.type ?? typeFilter;
    const lv = updates.level ?? levelFilter;
    if (c) next.set("competence", c);
    if (ty) next.set("type", ty);
    if (lv) next.set("level", lv);
    return `/student/tips${next.toString() ? `?${next.toString()}` : ""}`;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <p className="text-sm text-forest font-semibold uppercase tracking-wider">Bibliotheek</p>
      <h1 className="text-4xl font-serif mt-1">Alle tips &amp; opdrachten</h1>
      <p className="text-muted mt-2 max-w-2xl">
        Concrete dingen om in je project of in de les te doen, met daarbij wat voor bewijs je daarvoor kunt inleveren. Klik op "Lever bewijs in" om direct te beginnen.
      </p>

      {/* Filters */}
      <div className="mt-6 mb-8 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted self-center mr-2 font-medium">Competentie:</span>
          <Link href={filterLink({ competence: "" })} className={`pill ${!competenceFilter ? "bg-forest text-cream" : "bg-paper text-muted"}`}>
            alle
          </Link>
          {competences.map((c) => (
            <Link
              key={c.slug}
              href={filterLink({ competence: c.slug })}
              className={`pill ${competenceFilter === c.slug ? "bg-forest text-cream" : "bg-paper text-muted hover:text-ink"}`}
            >
              {c.icon} {c.name}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted self-center mr-2 font-medium">Type:</span>
          <Link href={filterLink({ type: "" })} className={`pill ${!typeFilter ? "bg-forest text-cream" : "bg-paper text-muted"}`}>
            alle
          </Link>
          {["TIP", "OPDRACHT", "CHALLENGE"].map((t) => {
            const m = TYPE_META[t];
            return (
              <Link key={t} href={filterLink({ type: t })} className={`pill ${typeFilter === t ? "bg-forest text-cream" : "bg-paper text-muted hover:text-ink"}`}>
                {m.icon} {m.label}
              </Link>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted self-center mr-2 font-medium">Niveau:</span>
          <Link href={filterLink({ level: "" })} className={`pill ${!levelFilter ? "bg-forest text-cream" : "bg-paper text-muted"}`}>
            alle
          </Link>
          {["BASIS", "GEVORDERD", "EXPERT"].map((l) => (
            <Link key={l} href={filterLink({ level: l })} className={`pill ${levelFilter === l ? `pill-${l.toLowerCase()}` : "bg-paper text-muted hover:text-ink"}`}>
              {l.toLowerCase()}
            </Link>
          ))}
        </div>
      </div>

      {tips.length === 0 ? (
        <p className="text-muted text-sm">Geen tips gevonden met deze filter — pas het aan.</p>
      ) : (
        Array.from(grouped.entries()).map(([slug, items]) => {
          const c = items[0]?.competence;
          return (
            <section key={slug} className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{c?.icon}</span>
                <h2 className="font-serif text-2xl">{c?.name}</h2>
                <span className="text-xs text-muted">· {items.length} {items.length === 1 ? "item" : "items"}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((t) => {
                  const m = TYPE_META[t.type] || TYPE_META.TIP;
                  const isDismissed = dismissedSet.has(t.id);
                  return (
                    <div key={t.id} className={`card ${isDismissed ? "opacity-50" : ""}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="pill" style={{ background: m.bg, color: m.fg }}>
                          {m.icon} {m.label}
                        </span>
                        <span className={`pill pill-${t.level.toLowerCase()}`}>{t.level.toLowerCase()}</span>
                        {isDismissed && <span className="pill pill-locked">verborgen</span>}
                      </div>
                      <p className="text-sm text-ink leading-relaxed">{t.text}</p>
                      {t.suggestedEvidence && (
                        <div className="mt-3 text-xs text-muted bg-paper rounded-md p-2">
                          <span className="font-medium text-ink">📎 Bewijs idee: </span>
                          {t.suggestedEvidence}
                        </div>
                      )}
                      <div className="mt-3 flex justify-end">
                        <Link
                          href={`/student/bewijs/new?competence=${t.competenceSlug}`}
                          className="btn btn-primary text-xs"
                        >
                          📎 Lever bewijs in →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

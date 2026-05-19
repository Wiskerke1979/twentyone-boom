import Link from "next/link";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateTip, deleteTip } from "./actions";

export default async function EditTipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    redirect("/");
  }

  const { id } = await params;
  const tip = await prisma.tip.findUnique({
    where: { id },
    include: { competence: true, createdBy: { select: { name: true } } },
  });
  if (!tip) notFound();

  const competences = await prisma.competence.findMany({ orderBy: { orderIndex: "asc" } });

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/teacher/tips" className="text-sm text-muted hover:text-ink">← Terug</Link>
      <h1 className="text-4xl font-serif mt-4">Tip bewerken</h1>
      {tip.createdBy && (
        <p className="text-sm text-muted mt-1">Aangemaakt door {tip.createdBy.name}</p>
      )}
      {!tip.createdBy && (
        <p className="text-sm text-muted mt-1">Originele seed-tip — aanpassen mag.</p>
      )}

      <form action={updateTip} className="card mt-6 space-y-4">
        <input type="hidden" name="id" value={tip.id} />

        <div>
          <label className="label">Competentie</label>
          <select name="competenceSlug" required defaultValue={tip.competenceSlug} className="input">
            {competences.map((c) => (
              <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Niveau</label>
          <select name="level" required defaultValue={tip.level} className="input">
            <option value="BASIS">Basis</option>
            <option value="GEVORDERD">Gevorderd</option>
            <option value="EXPERT">Expert</option>
          </select>
        </div>

        <div>
          <label className="label">Type</label>
          <select name="type" required defaultValue={tip.type} className="input">
            <option value="TIP">💡 Tip</option>
            <option value="OPDRACHT">📋 Opdracht</option>
            <option value="CHALLENGE">🎯 Challenge</option>
          </select>
        </div>

        <div>
          <label className="label">Tekst</label>
          <textarea name="text" required rows={3} defaultValue={tip.text} className="input" />
        </div>

        <div>
          <label className="label">Bewijs-suggestie</label>
          <textarea
            name="suggestedEvidence"
            rows={2}
            defaultValue={tip.suggestedEvidence || ""}
            className="input"
          />
        </div>

        <button type="submit" className="btn btn-primary">Wijzigingen opslaan</button>
      </form>

      <form action={deleteTip} className="card mt-6 border-expert">
        <input type="hidden" name="id" value={tip.id} />
        <h2 className="font-serif text-lg text-expert mb-2">Verwijderen</h2>
        <p className="text-sm mb-3">Deze tip wordt direct verwijderd — dit kan niet ongedaan gemaakt worden.</p>
        <button type="submit" className="btn btn-danger">Verwijder tip</button>
      </form>
    </div>
  );
}

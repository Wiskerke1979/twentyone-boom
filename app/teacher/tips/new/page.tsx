import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createTip } from "./actions";

export default async function NewTipPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    redirect("/");
  }

  const competences = await prisma.competence.findMany({ orderBy: { orderIndex: "asc" } });

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/teacher/tips" className="text-sm text-muted hover:text-ink">← Terug</Link>
      <h1 className="text-4xl font-serif mt-4">Nieuwe tip toevoegen</h1>

      <form action={createTip} className="card mt-6 space-y-4">
        <div>
          <label className="label">Competentie</label>
          <select name="competenceSlug" required className="input">
            <option value="" disabled>Kies competentie</option>
            {competences.map((c) => (
              <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Niveau</label>
          <select name="level" required className="input">
            <option value="BASIS">Basis</option>
            <option value="GEVORDERD">Gevorderd</option>
            <option value="EXPERT">Expert</option>
          </select>
        </div>

        <div>
          <label className="label">Type</label>
          <select name="type" required className="input">
            <option value="TIP">💡 Tip — lichte aanmoediging (30 sec)</option>
            <option value="OPDRACHT">📋 Opdracht — concreet (15–30 min)</option>
            <option value="CHALLENGE">🎯 Challenge — projectuitdaging (1–4 weken)</option>
          </select>
        </div>

        <div>
          <label className="label">Tekst van de tip</label>
          <textarea
            name="text"
            required
            rows={3}
            placeholder="Bijv. 'Schrijf voor je volgende projectles 3 afspraken op die je team gaat naleven.'"
            className="input"
          />
        </div>

        <div>
          <label className="label">Bewijs-suggestie (optioneel)</label>
          <textarea
            name="suggestedEvidence"
            rows={2}
            placeholder="Bijv. 'Foto van de afspraken op het bord, of een korte tekst met de drie afspraken.'"
            className="input"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Tip opslaan
        </button>
      </form>
    </div>
  );
}

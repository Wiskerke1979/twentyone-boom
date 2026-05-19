import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { submitEvidence } from "./actions";

export default async function NewEvidencePage({
  searchParams,
}: {
  searchParams: Promise<{ competence?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const competences = await prisma.competence.findMany({
    orderBy: { orderIndex: "asc" },
    include: { indicators: { orderBy: { orderIndex: "asc" } } },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/student/dashboard" className="text-sm text-muted hover:text-ink">← Terug</Link>
      <h1 className="text-3xl font-serif mt-4">Bewijs uploaden</h1>
      <p className="text-muted mt-2">
        Laat zien wat je hebt gedaan. Koppel het aan één of meer indicatoren en schrijf in eigen woorden wat het bewijst.
      </p>

      <form action={submitEvidence} encType="multipart/form-data" className="mt-8 space-y-6 card">
        <div>
          <label className="label">Type bewijs</label>
          <select name="fileType" className="input" required>
            <option value="image">📸 Foto</option>
            <option value="pdf">📄 PDF / document</option>
            <option value="video">🎥 Video</option>
            <option value="link">🔗 Link (bv. Figma, GitHub)</option>
            <option value="text">✍️ Alleen reflectie (geen bestand)</option>
          </select>
        </div>

        <div>
          <label className="label">Bestand (foto/pdf/video)</label>
          <input
            type="file"
            name="file"
            accept="image/*,application/pdf,video/*"
            className="input"
          />
          <p className="text-xs text-muted mt-1">Optioneel als je een link of alleen reflectie indient.</p>
        </div>

        <div>
          <label className="label">Of een link</label>
          <input type="url" name="linkUrl" placeholder="https://…" className="input" />
        </div>

        <div>
          <label className="label">Kies competentie en indicator(en)</label>
          <div className="space-y-3 mt-2">
            {competences.map((c) => (
              <details key={c.slug} open={params.competence === c.slug} className="border border-line rounded-md">
                <summary className="cursor-pointer px-3 py-2 select-none hover:bg-paper">
                  {c.icon} {c.name}
                </summary>
                <div className="px-3 py-2 space-y-1">
                  {c.indicators.map((i) => (
                    <label key={i.id} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="indicatorIds"
                        value={i.id}
                        className="mt-1"
                      />
                      <span>
                        <span className={`pill pill-${i.level.toLowerCase()} mr-2`}>{i.level.toLowerCase()}</span>
                        {i.text}
                      </span>
                    </label>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Mijn reflectie (verplicht, minstens 50 tekens)</label>
          <textarea
            name="reflection"
            required
            minLength={50}
            rows={6}
            placeholder="Wat heb je gedaan, wat heb je geleerd, en waarom is dit bewijs voor de gekozen indicator(en)?"
            className="input"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Indienen bij docent
        </button>
      </form>
    </div>
  );
}

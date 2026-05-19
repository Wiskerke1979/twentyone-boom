import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { resolveFileUrl } from "@/lib/storage";
import { reviewEvidence } from "./actions";

export default async function EvidenceReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const evidence = await prisma.evidence.findUnique({
    where: { id },
    include: {
      user: true,
      links: { include: { indicator: true, competence: true } },
    },
  });
  if (!evidence) notFound();

  const fileUrl = evidence.fileUrl ? await resolveFileUrl(evidence.fileUrl) : null;

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/teacher/inbox" className="text-sm text-muted hover:text-ink">← Terug naar inbox</Link>

      <div className="mt-4">
        <p className="text-sm text-forest font-semibold uppercase tracking-wider">Beoordelen</p>
        <h1 className="text-3xl font-serif mt-1">{evidence.user.name}</h1>
        <p className="text-muted text-sm mt-1">{evidence.user.email} · {evidence.user.className || "—"}</p>
      </div>

      {/* Preview */}
      <div className="card mt-6">
        <h2 className="font-serif text-lg mb-3">Bewijs</h2>
        {fileUrl && evidence.fileType === "image" && (
          <img src={fileUrl} alt="bewijs" className="max-h-96 rounded-md border border-line" />
        )}
        {fileUrl && evidence.fileType === "pdf" && (
          <iframe src={fileUrl} className="w-full h-96 rounded-md border border-line" />
        )}
        {fileUrl && evidence.fileType === "video" && (
          <video src={fileUrl} controls className="max-h-96 rounded-md border border-line" />
        )}
        {fileUrl && evidence.fileType !== "image" && evidence.fileType !== "pdf" && evidence.fileType !== "video" && (
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="underline text-forest">
            📎 Open bestand
          </a>
        )}
        {evidence.linkUrl && (
          <a href={evidence.linkUrl} target="_blank" rel="noopener noreferrer" className="underline text-forest block mt-2">
            🔗 {evidence.linkUrl}
          </a>
        )}
        {!fileUrl && !evidence.linkUrl && (
          <p className="text-muted text-sm italic">Alleen reflectietekst, geen bijlage.</p>
        )}
      </div>

      <div className="card mt-4">
        <h2 className="font-serif text-lg mb-2">Reflectie leerling</h2>
        <p className="whitespace-pre-wrap">{evidence.reflection}</p>
      </div>

      <div className="card mt-4">
        <h2 className="font-serif text-lg mb-3">Gekoppelde indicatoren ({evidence.links.length})</h2>
        <ul className="space-y-2">
          {evidence.links.map((l) => (
            <li key={l.id} className="flex items-start gap-2">
              <span className="text-lg">{l.competence.icon}</span>
              <span className="text-sm">
                <span className={`pill pill-${l.indicator.level.toLowerCase()} mr-2`}>
                  {l.indicator.level.toLowerCase()}
                </span>
                {l.indicator.text}
                <span className="text-muted ml-2 text-xs">· {l.competence.name}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {evidence.status !== "INGEDIEND" ? (
        <div className="card mt-6 bg-paper">
          <strong>Status: {evidence.status.toLowerCase()}</strong>
          {evidence.reviewerNote && <p className="text-sm mt-2 italic">"{evidence.reviewerNote}"</p>}
        </div>
      ) : (
        <form action={reviewEvidence} className="mt-6 space-y-4">
          <input type="hidden" name="evidenceId" value={evidence.id} />
          <div className="card">
            <label className="label">Feedback aan leerling (optioneel)</label>
            <textarea
              name="reviewerNote"
              rows={4}
              placeholder="Goed gedaan! Bij volgende keer kun je ook…"
              className="input"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" name="action" value="approve" className="btn btn-primary">
              ✓ Goedkeuren
            </button>
            <button type="submit" name="action" value="reject" className="btn btn-danger">
              ✗ Afwijzen
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { submitPeerScore } from "./actions";

// Generic peer questions per level — 5 questions, Likert 0-3
const QUESTIONS = [
  "Toont basisgedrag voor deze competentie tijdens lessen en projecten.",
  "Werkt zelfstandig en bewust aan deze competentie.",
  "Helpt of inspireert anderen op dit gebied.",
  "Reflecteert hardop of in tekst op deze competentie.",
  "Komt met eigen ideeën of verbeteringen rondom deze competentie.",
];

export default async function PeerScorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const request = await prisma.peerRequest.findUnique({
    where: { id },
    include: { target: true, peerScore: true },
  });
  if (!request) notFound();
  if (request.peerUserId !== session.user.id) {
    redirect("/student/peer/inbox");
  }
  if (request.status !== "OPEN") {
    redirect("/student/peer/inbox");
  }

  const competence = await prisma.competence.findUnique({
    where: { slug: request.competenceSlug },
  });
  if (!competence) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/student/peer/inbox" className="text-sm text-muted hover:text-ink">← Terug naar inbox</Link>
      <div className="mt-4 flex items-center gap-3">
        <span className="text-4xl">{competence.icon}</span>
        <div>
          <p className="text-sm text-forest font-semibold uppercase tracking-wider">Peer-feedback voor</p>
          <h1 className="text-3xl font-serif">{request.target.name}</h1>
          <p className="text-muted">Competentie: {competence.name}</p>
        </div>
      </div>

      {request.message && (
        <div className="mt-6 p-4 bg-paper rounded-md text-sm italic">"{request.message}"</div>
      )}

      <form action={submitPeerScore} className="mt-8 space-y-6">
        <input type="hidden" name="requestId" value={request.id} />

        {QUESTIONS.map((q, idx) => (
          <div key={idx} className="card">
            <div className="text-xs text-muted mb-2">Vraag {idx + 1} van {QUESTIONS.length}</div>
            <div className="font-medium mb-3">{q}</div>
            <div className="grid grid-cols-4 gap-2">
              {["Oneens", "Soms", "Vaak", "Altijd"].map((label, valueIdx) => (
                <label
                  key={valueIdx}
                  className="flex flex-col items-center gap-1 cursor-pointer p-2 border border-line rounded hover:border-forest"
                >
                  <input type="radio" name={`q${idx}`} value={String(valueIdx)} required />
                  <span className="text-xs">{label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="card">
          <label className="label">Voorbeeld of toelichting (optioneel)</label>
          <textarea
            name="comment"
            rows={4}
            placeholder="Een concrete situatie waarin je dit zag…"
            className="input"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Versturen
        </button>
      </form>
    </div>
  );
}

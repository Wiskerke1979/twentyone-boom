import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { invitePeers } from "./actions";

export default async function NewPeerRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ competence?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  // Suggest peers in same class
  const peers = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      id: { not: session.user.id },
      ...(me?.className ? { className: me.className } : {}),
    },
    take: 30,
    orderBy: { name: "asc" },
  });

  const competences = await prisma.competence.findMany({ orderBy: { orderIndex: "asc" } });

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/student/dashboard" className="text-sm text-muted hover:text-ink">← Terug</Link>
      <h1 className="text-3xl font-serif mt-4">Vraag peers om te scoren</h1>
      <p className="text-muted mt-2">
        Kies maximaal 3 groepsgenoten. Zij krijgen een korte vragenlijst over één competentie.
      </p>

      <form action={invitePeers} className="mt-8 space-y-6 card">
        <div>
          <label className="label">Welke competentie?</label>
          <select name="competenceSlug" required className="input" defaultValue={params.competence || ""}>
            <option value="" disabled>Kies een competentie</option>
            {competences.map((c) => (
              <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Wie vraag je? (max. 3)</label>
          {peers.length === 0 ? (
            <p className="text-sm text-muted">Geen groepsgenoten gevonden. Stel je klas in via instellingen.</p>
          ) : (
            <div className="space-y-1 mt-2">
              {peers.map((p) => (
                <label key={p.id} className="flex items-center gap-2 p-2 rounded hover:bg-paper">
                  <input type="checkbox" name="peerIds" value={p.id} />
                  <span className="text-sm">
                    {p.name} <span className="text-muted">· {p.className || "—"}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="label">Persoonlijk bericht (optioneel)</label>
          <textarea
            name="message"
            rows={3}
            placeholder="Hoi! Wil je me scoren op deze competentie? Bedankt!"
            className="input"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Verstuur verzoek
        </button>
      </form>
    </div>
  );
}

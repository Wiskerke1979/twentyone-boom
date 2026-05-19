import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateHelpStatus } from "./actions";

export default async function HelpDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const r = await prisma.helpRequest.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true, className: true, role: true } } },
  });
  if (!r) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/admin/help" className="text-sm text-muted hover:text-ink">← Terug</Link>
      <h1 className="text-4xl font-serif mt-4">Hulpvraag</h1>

      <div className="card mt-6">
        <div className="text-xs uppercase tracking-wider text-muted font-semibold">Van</div>
        <div className="font-medium mt-1">
          {r.fromName} <span className="text-muted">&lt;{r.fromEmail}&gt;</span>
        </div>
        {r.fromRole && <span className="pill pill-locked mt-1 text-xs">{r.fromRole.toLowerCase()}</span>}
        {r.user?.className && <span className="text-xs text-muted ml-2">{r.user.className}</span>}
        <div className="text-xs text-muted mt-2">{new Date(r.createdAt).toLocaleString("nl-NL")}</div>
      </div>

      <div className="card mt-3 bg-paper">
        <div className="text-xs uppercase tracking-wider text-muted font-semibold mb-2">Bericht</div>
        <p className="whitespace-pre-wrap">{r.message}</p>
      </div>

      <div className="card mt-3">
        <div className="text-xs uppercase tracking-wider text-muted font-semibold mb-2">Status: {r.status.toLowerCase().replace("_", " ")}</div>
        <div className="flex gap-2 flex-wrap">
          <form action={updateHelpStatus}>
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="status" value="IN_PROGRESS" />
            <button type="submit" className="btn btn-ghost text-xs" disabled={r.status === "IN_PROGRESS"}>
              📌 Markeer als bezig
            </button>
          </form>
          <form action={updateHelpStatus}>
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="status" value="RESOLVED" />
            <button type="submit" className="btn btn-primary text-xs" disabled={r.status === "RESOLVED"}>
              ✓ Markeer als opgelost
            </button>
          </form>
          <form action={updateHelpStatus}>
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="status" value="OPEN" />
            <button type="submit" className="btn btn-ghost text-xs" disabled={r.status === "OPEN"}>
              ↺ Heropen
            </button>
          </form>
        </div>
      </div>

      <a href={`mailto:${r.fromEmail}?subject=Antwoord op je hulpvraag&body=Hoi ${r.fromName.split(" ")[0]},%0A%0A`} className="btn btn-primary mt-4 inline-block">
        ✉ Antwoord per e-mail
      </a>
    </div>
  );
}

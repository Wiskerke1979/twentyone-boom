import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { submitEvidence } from "./actions";
import { EvidenceForm } from "./EvidenceForm";

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
      <h1 className="text-3xl font-serif mt-4">Bewijs indienen</h1>
      <p className="text-muted mt-2">
        Laat zien wat je hebt gedaan. Een geschreven reflectie volstaat — een foto, document, link of video maakt het sterker.
      </p>

      <EvidenceForm
        competences={competences}
        action={submitEvidence}
        focusCompetence={params.competence}
      />
    </div>
  );
}

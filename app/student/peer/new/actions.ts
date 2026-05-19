"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { sendEmail, templates } from "@/lib/email";

export async function invitePeers(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const competenceSlug = formData.get("competenceSlug") as string;
  const peerIds = formData.getAll("peerIds") as string[];
  const message = ((formData.get("message") as string) || "").trim() || null;

  if (!competenceSlug || peerIds.length === 0) {
    redirect("/student/peer/new?error=missing");
  }

  const limited = peerIds.slice(0, 3);

  const created = await prisma.$transaction(
    limited.map((peerId) =>
      prisma.peerRequest.create({
        data: {
          targetUserId: session.user.id,
          peerUserId: peerId,
          competenceSlug,
          message,
          status: "OPEN",
        },
      })
    )
  );

  // Stuur e-mails (fire-and-forget)
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const competence = await prisma.competence.findUnique({ where: { slug: competenceSlug } });
  const peers = await prisma.user.findMany({
    where: { id: { in: limited } },
    select: { id: true, name: true, email: true },
  });
  for (const req of created) {
    const peer = peers.find((p) => p.id === req.peerUserId);
    if (peer && competence) {
      const tpl = templates.peerRequest(peer.name, session.user.name, competence.name, `${baseUrl}/student/peer/inbox`);
      sendEmail({ to: peer.email, ...tpl }).catch(() => {});
    }
  }

  redirect("/student/dashboard?peer=verzonden");
}

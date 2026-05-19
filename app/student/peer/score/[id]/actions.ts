"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { awardBadges } from "@/lib/badges";

export async function submitPeerScore(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const requestId = formData.get("requestId") as string;
  const request = await prisma.peerRequest.findUnique({ where: { id: requestId } });
  if (!request || request.peerUserId !== session.user.id) {
    redirect("/student/peer/inbox");
  }

  const answers: number[] = [];
  for (let i = 0; i < 10; i++) {
    const v = formData.get(`q${i}`);
    if (v === null) break;
    answers.push(parseInt(v as string, 10));
  }
  const comment = ((formData.get("comment") as string) || "").trim() || null;

  await prisma.peerScore.create({
    data: {
      requestId,
      peerUserId: session.user.id,
      competenceSlug: request!.competenceSlug,
      answers: JSON.stringify(answers),
      comment,
    },
  });

  await prisma.peerRequest.update({
    where: { id: requestId },
    data: { status: "COMPLETED" },
  });

  // Peer-helper badge?
  await awardBadges(session.user.id);

  redirect("/student/peer/inbox?done=1");
}

"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function invitePeers(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const competenceSlug = formData.get("competenceSlug") as string;
  const peerIds = formData.getAll("peerIds") as string[];
  const message = ((formData.get("message") as string) || "").trim() || null;

  if (!competenceSlug || peerIds.length === 0) {
    redirect("/student/peer/new?error=missing");
  }

  // Max 3 peers
  const limited = peerIds.slice(0, 3);

  await prisma.$transaction(
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

  redirect("/student/dashboard?peer=verzonden");
}

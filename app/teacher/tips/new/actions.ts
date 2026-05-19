"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function createTip(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    redirect("/");
  }

  const competenceSlug = formData.get("competenceSlug") as string;
  const level = formData.get("level") as string;
  const type = formData.get("type") as string;
  const text = ((formData.get("text") as string) || "").trim();
  const suggestedEvidence = ((formData.get("suggestedEvidence") as string) || "").trim() || null;

  if (!competenceSlug || !level || !type || !text) {
    redirect("/teacher/tips/new?error=missing");
  }

  await prisma.tip.create({
    data: {
      competenceSlug,
      level,
      type,
      text,
      suggestedEvidence,
      createdById: session.user.id,
    },
  });

  redirect("/teacher/tips");
}

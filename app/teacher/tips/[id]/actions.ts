"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function updateTip(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    redirect("/");
  }

  const id = formData.get("id") as string;
  const competenceSlug = formData.get("competenceSlug") as string;
  const level = formData.get("level") as string;
  const type = formData.get("type") as string;
  const text = ((formData.get("text") as string) || "").trim();
  const suggestedEvidence = ((formData.get("suggestedEvidence") as string) || "").trim() || null;

  await prisma.tip.update({
    where: { id },
    data: { competenceSlug, level, type, text, suggestedEvidence },
  });

  redirect("/teacher/tips");
}

export async function deleteTip(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    redirect("/");
  }

  const id = formData.get("id") as string;
  await prisma.tip.delete({ where: { id } });
  redirect("/teacher/tips");
}

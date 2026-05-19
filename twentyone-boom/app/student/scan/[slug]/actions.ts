"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function saveScan(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const slug = formData.get("slug") as string;
  const answers: number[] = [];
  for (let i = 0; i < 20; i++) {
    const v = formData.get(`q${i}`);
    if (v === null) break;
    answers.push(parseInt(v as string, 10));
  }

  // Average answer determines level: 0-0.99 = nog niet (default Basis), 1-1.99 = Basis, 2-2.99 = Gevorderd, 3 = Expert
  const avg = answers.reduce((a, b) => a + b, 0) / answers.length;
  let calculatedLevel: "BASIS" | "GEVORDERD" | "EXPERT" = "BASIS";
  if (avg >= 2.5) calculatedLevel = "EXPERT";
  else if (avg >= 1.5) calculatedLevel = "GEVORDERD";

  await prisma.selfScore.create({
    data: {
      userId: session.user.id,
      competenceSlug: slug,
      answers: JSON.stringify(answers),
      calculatedLevel,
    },
  });

  redirect(`/student/competentie/${slug}?scanned=1`);
}

"use server";

import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function submitEvidence(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const fileType = formData.get("fileType") as string;
  const linkUrl = (formData.get("linkUrl") as string) || null;
  const reflection = formData.get("reflection") as string;
  const file = formData.get("file") as File | null;
  const indicatorIds = formData.getAll("indicatorIds") as string[];

  if (!reflection || reflection.length < 50) {
    redirect("/student/bewijs/new?error=reflection");
  }
  if (indicatorIds.length === 0) {
    redirect("/student/bewijs/new?error=no-indicators");
  }

  let fileUrl: string | null = null;
  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadDir, safeName);
    await writeFile(filePath, buffer);
    fileUrl = `/uploads/${safeName}`;
  }

  // Look up indicator -> competence for the link rows
  const indicators = await prisma.indicator.findMany({
    where: { id: { in: indicatorIds } },
  });

  const evidence = await prisma.evidence.create({
    data: {
      userId: session.user.id,
      fileType,
      fileUrl,
      linkUrl,
      reflection,
      status: "INGEDIEND",
      links: {
        create: indicators.map((i) => ({
          indicatorId: i.id,
          competenceSlug: i.competenceSlug,
        })),
      },
    },
    include: { links: true },
  });

  redirect(`/student/dashboard?bewijs=ingediend`);
}

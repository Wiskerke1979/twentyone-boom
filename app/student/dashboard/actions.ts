"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function dismissTip(formData: FormData) {
  const session = await auth();
  if (!session?.user) return;

  const tipId = formData.get("tipId") as string;
  if (!tipId) return;

  await prisma.dismissedTip.upsert({
    where: { userId_tipId: { userId: session.user.id, tipId } },
    create: { userId: session.user.id, tipId },
    update: {},
  });

  revalidatePath("/student/dashboard");
}

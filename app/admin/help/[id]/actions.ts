"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function updateHelpStatus(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  await prisma.helpRequest.update({
    where: { id },
    data: {
      status,
      resolvedAt: status === "RESOLVED" ? new Date() : null,
      resolvedBy: status === "RESOLVED" ? session.user.id : null,
    },
  });

  redirect(`/admin/help/${id}`);
}

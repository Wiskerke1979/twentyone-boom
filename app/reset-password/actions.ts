"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export async function setNewPassword(formData: FormData) {
  const token = (formData.get("token") as string) || "";
  const password = (formData.get("password") as string) || "";
  const password2 = (formData.get("password2") as string) || "";

  if (password.length < 6) redirect(`/reset-password?token=${token}&error=short`);
  if (password !== password2) redirect(`/reset-password?token=${token}&error=mismatch`);

  const reset = await prisma.passwordResetToken.findUnique({
    where: { token },
  });
  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    redirect(`/reset-password?token=${token}`);
  }

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: reset.userId },
    data: { passwordHash: hash },
  });
  await prisma.passwordResetToken.update({
    where: { id: reset.id },
    data: { usedAt: new Date() },
  });

  redirect("/login?reset=1");
}

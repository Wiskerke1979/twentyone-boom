"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { sendEmail, templates } from "@/lib/email";

export async function requestPasswordReset(formData: FormData) {
  const email = ((formData.get("email") as string) || "").trim().toLowerCase();
  if (!email) redirect("/forgot-password?sent=1");

  const user = await prisma.user.findUnique({ where: { email } });
  // Altijd "sent" redirecten om enumeratie te voorkomen
  if (!user) redirect("/forgot-password?sent=1");

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 uur

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  const tpl = templates.passwordReset(user.name, resetUrl);
  await sendEmail({ to: user.email, ...tpl });

  redirect("/forgot-password?sent=1");
}

"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pw = "";
  for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

export async function teacherResetPassword(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") redirect("/");
  const userId = formData.get("userId") as string;

  // Verify target is a STUDENT (docent mag geen andere docenten/admins resetten)
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target || target.role !== "STUDENT") redirect("/teacher/manage");

  const tempPw = generatePassword();
  const hash = await bcrypt.hash(tempPw, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hash },
  });

  redirect(`/teacher/manage/${userId}?tempPw=${tempPw}`);
}

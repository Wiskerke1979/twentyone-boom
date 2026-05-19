"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

function generatePassword(): string {
  // 8 chars, leesbaar (geen 0/O/1/l verwarringen)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pw = "";
  for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

export async function resetUserPassword(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");
  const userId = formData.get("userId") as string;

  const tempPw = generatePassword();
  const hash = await bcrypt.hash(tempPw, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hash },
  });

  revalidatePath(`/admin/users/${userId}`);
  redirect(`/admin/users/${userId}?msg=pw-reset&tempPw=${tempPw}`);
}

export async function changeUserRole(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;
  if (!["STUDENT", "TEACHER", "ADMIN"].includes(role)) return;

  // Als rol naar STUDENT verandert, zorg dat er een Tree bestaat
  if (role === "STUDENT") {
    await prisma.tree.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  redirect(`/admin/users/${userId}?msg=role-changed`);
}

export async function updateUserClass(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");
  const userId = formData.get("userId") as string;
  const className = ((formData.get("className") as string) || "").trim() || null;

  await prisma.user.update({
    where: { id: userId },
    data: { className },
  });

  redirect(`/admin/users/${userId}?msg=class-updated`);
}

export async function deleteUser(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");
  const userId = formData.get("userId") as string;

  // Eigen account niet per ongeluk verwijderen
  if (userId === session.user.id) {
    redirect(`/admin/users/${userId}?msg=cant-delete-self`);
  }

  await prisma.user.delete({ where: { id: userId } });
  redirect("/admin/users");
}

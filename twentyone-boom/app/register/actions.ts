"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signIn } from "@/auth";

export async function register(formData: FormData) {
  const name = (formData.get("name") as string).trim();
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const className = ((formData.get("className") as string) || "").trim() || null;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) redirect("/register?error=exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      className,
    },
  });

  if (role === "STUDENT") {
    await prisma.tree.create({ data: { userId: user.id } });
  }

  await signIn("credentials", { email, password, redirect: false });
  redirect("/");
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function createAssignment(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") redirect("/login");

  const competenceSlug = formData.get("competenceSlug") as string;
  const targetType = formData.get("targetType") as string;
  const studentId = ((formData.get("studentId") as string) || "").trim() || null;
  const className = ((formData.get("className") as string) || "").trim() || null;
  const targetLevel = ((formData.get("targetLevel") as string) || "").trim() || null;
  const dueDateRaw = ((formData.get("dueDate") as string) || "").trim();
  const message = ((formData.get("message") as string) || "").trim() || null;

  if (!competenceSlug) redirect("/teacher/assign?error=competentie");

  if (targetType === "student" && !studentId) redirect("/teacher/assign?error=leerling");
  if (targetType === "class" && !className) redirect("/teacher/assign?error=klas");

  await prisma.competenceAssignment.create({
    data: {
      competenceSlug,
      studentId: targetType === "student" ? studentId : null,
      className: targetType === "class" ? className : null,
      targetLevel,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      message,
      assignedById: session.user.id,
    },
  });

  revalidatePath("/teacher/assign");
  redirect("/teacher/assign?created=1");
}

export async function deleteAssignment(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") redirect("/login");

  const id = formData.get("id") as string;
  await prisma.competenceAssignment.delete({ where: { id } });

  revalidatePath("/teacher/assign");
  redirect("/teacher/assign");
}

// Voor gebruik vanaf het leerling-profielscherm
export async function quickAssignForStudent(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") redirect("/login");

  const competenceSlug = formData.get("competenceSlug") as string;
  const studentId = formData.get("studentId") as string;
  const targetLevel = ((formData.get("targetLevel") as string) || "").trim() || null;
  const message = ((formData.get("message") as string) || "").trim() || null;

  if (!competenceSlug || !studentId) redirect(`/teacher/student/${studentId || ""}`);

  await prisma.competenceAssignment.create({
    data: {
      competenceSlug,
      studentId,
      targetLevel,
      message,
      assignedById: session.user.id,
    },
  });

  revalidatePath(`/teacher/student/${studentId}`);
  redirect(`/teacher/student/${studentId}?assigned=1`);
}

import { prisma } from "@/lib/db";

/**
 * Geeft de actieve assignments voor een leerling terug.
 * Bevat zowel directe (studentId) als klas-brede (className) assignments.
 */
export async function getAssignmentsForStudent(userId: string) {
  const me = await prisma.user.findUnique({ where: { id: userId } });
  if (!me) return [];

  const assignments = await prisma.competenceAssignment.findMany({
    where: {
      OR: [
        { studentId: userId },
        me.className ? { className: me.className } : { className: "__never__" },
      ],
    },
    include: {
      competence: true,
      assignedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return assignments;
}

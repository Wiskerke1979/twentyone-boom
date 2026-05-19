import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { HelpButton } from "@/components/HelpButton";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin/dashboard");
  if (session.user.role !== "TEACHER") redirect("/student/dashboard");

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.user.role} userName={session.user.name} />
      <main className="flex-1 p-8 overflow-x-auto">{children}</main>
      <HelpButton userName={session.user.name} userEmail={session.user.email} userRole={session.user.role} />
    </div>
  );
}

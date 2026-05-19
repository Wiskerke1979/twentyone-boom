import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/teacher/dashboard");

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.user.role} userName={session.user.name} />
      <main className="flex-1 p-8 overflow-x-auto">{children}</main>
    </div>
  );
}

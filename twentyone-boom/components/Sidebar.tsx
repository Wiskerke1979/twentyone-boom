import Link from "next/link";
import { signOut } from "@/auth";

interface SidebarLink {
  href: string;
  label: string;
  icon: string;
}

const STUDENT_LINKS: SidebarLink[] = [
  { href: "/student/dashboard", label: "Mijn boom", icon: "🌳" },
  { href: "/student/peer/inbox", label: "Peer-verzoeken", icon: "📩" },
  { href: "/student/peer/new", label: "Vraag peer", icon: "🤝" },
  { href: "/student/bewijs/new", label: "Bewijs uploaden", icon: "📎" },
];

const TEACHER_LINKS: SidebarLink[] = [
  { href: "/teacher/dashboard", label: "Klas", icon: "🌲" },
  { href: "/teacher/inbox", label: "Bewijs-inbox", icon: "📨" },
];

export function Sidebar({ role, userName }: { role: string; userName: string }) {
  const links = role === "TEACHER" ? TEACHER_LINKS : STUDENT_LINKS;

  return (
    <aside className="w-64 shrink-0 border-r border-line bg-paper min-h-screen p-6 flex flex-col">
      <Link href="/" className="block mb-8">
        <div className="text-3xl">🌳</div>
        <div className="font-serif text-xl mt-1">De Groeiende Boom</div>
        <div className="text-xs text-muted mt-0.5">{role === "TEACHER" ? "Docent" : "Leerling"}</div>
      </Link>

      <nav className="flex-1 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block px-3 py-2 rounded-md text-sm text-ink hover:bg-line transition"
          >
            <span className="mr-2">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8 pt-4 border-t border-line">
        <div className="text-sm text-ink font-medium">{userName}</div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button type="submit" className="mt-2 text-xs text-muted hover:text-ink underline">
            Uitloggen
          </button>
        </form>
      </div>
    </aside>
  );
}

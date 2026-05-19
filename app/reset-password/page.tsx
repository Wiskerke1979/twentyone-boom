import Link from "next/link";
import { prisma } from "@/lib/db";
import { setNewPassword } from "./actions";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const token = sp.token || "";

  const reset = token
    ? await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: { select: { name: true, email: true } } },
      })
    : null;

  const valid = reset && !reset.usedAt && reset.expiresAt > new Date();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-sky to-cream">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌱</div>
          <h1 className="text-3xl font-serif">Nieuw wachtwoord</h1>
        </div>

        {!valid ? (
          <div className="card">
            <div className="p-4 bg-expert/10 border border-expert rounded-md text-sm">
              Deze link is verlopen of ongeldig.
            </div>
            <Link href="/forgot-password" className="block text-center text-sm mt-4 text-forest underline">
              Vraag een nieuwe link aan
            </Link>
          </div>
        ) : (
          <form action={setNewPassword} className="card space-y-4">
            <input type="hidden" name="token" value={token} />
            <p className="text-sm text-muted">
              Hoi {reset!.user.name.split(" ")[0]}, kies een nieuw wachtwoord.
            </p>
            {sp.error && (
              <div className="p-3 bg-expert/10 text-expert rounded-md text-sm">
                {sp.error === "mismatch" ? "Wachtwoorden komen niet overeen." : "Wachtwoord moet minimaal 6 tekens."}
              </div>
            )}
            <div>
              <label className="label">Nieuw wachtwoord</label>
              <input name="password" type="password" required minLength={6} className="input" autoFocus />
            </div>
            <div>
              <label className="label">Herhaal wachtwoord</label>
              <input name="password2" type="password" required minLength={6} className="input" />
            </div>
            <button type="submit" className="btn btn-primary w-full justify-center">
              Opslaan
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

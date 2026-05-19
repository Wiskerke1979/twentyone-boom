import Link from "next/link";
import { requestPasswordReset } from "./actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-sky to-cream">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔑</div>
          <h1 className="text-3xl font-serif">Wachtwoord vergeten?</h1>
          <p className="text-muted mt-2">Vul je e-mailadres in. We sturen een reset-link.</p>
        </div>

        {sp.sent ? (
          <div className="card">
            <div className="p-4 bg-basis/10 border border-basis rounded-md text-sm">
              ✓ Als dit e-mailadres bekend is, hebben we een reset-link gestuurd. Controleer je inbox (en spam).
            </div>
            <Link href="/login" className="block text-center text-sm mt-4 text-forest underline">
              Terug naar inloggen
            </Link>
          </div>
        ) : (
          <form action={requestPasswordReset} className="card space-y-4">
            <div>
              <label className="label">E-mail</label>
              <input name="email" type="email" required className="input" autoComplete="email" />
            </div>
            <button type="submit" className="btn btn-primary w-full justify-center">
              Stuur reset-link
            </button>
            <p className="text-center text-sm">
              <Link href="/login" className="underline text-forest">← Terug naar inloggen</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-sky to-cream">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌳</div>
          <h1 className="text-4xl font-serif">De Groeiende Boom</h1>
          <p className="text-muted mt-2">Log in om je boom te zien.</p>
        </div>

        <form action={login} className="card space-y-4">
          {params.error && (
            <div className="p-3 bg-expert/10 text-expert rounded-md text-sm">
              Inloggen mislukt. Controleer je e-mail en wachtwoord.
            </div>
          )}

          <div>
            <label className="label">E-mail</label>
            <input
              name="email"
              type="email"
              required
              defaultValue="lotte@school.nl"
              className="input"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label">Wachtwoord</label>
            <input
              name="password"
              type="password"
              required
              defaultValue="welkom123"
              className="input"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary w-full justify-center">
            Inloggen
          </button>

          <p className="text-center text-sm text-muted">
            Nog geen account? <Link href="/register" className="underline text-forest">Registreer</Link>
          </p>
        </form>

        <div className="card mt-6 text-sm text-muted">
          <strong className="text-ink block mb-2">Demo accounts (na seed):</strong>
          <ul className="space-y-1 font-mono text-xs">
            <li>lotte@school.nl · welkom123 (leerling)</li>
            <li>sem@school.nl · welkom123 (leerling)</li>
            <li>docent@school.nl · welkom123 (docent)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

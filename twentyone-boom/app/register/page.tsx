import Link from "next/link";
import { register } from "./actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-sky to-cream">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌱</div>
          <h1 className="text-3xl font-serif">Plant je boom</h1>
          <p className="text-muted mt-2">Maak een account aan.</p>
        </div>

        <form action={register} className="card space-y-4">
          {params.error && (
            <div className="p-3 bg-expert/10 text-expert rounded-md text-sm">
              {params.error === "exists" ? "Dit e-mailadres bestaat al." : "Registreren mislukt."}
            </div>
          )}

          <div>
            <label className="label">Naam</label>
            <input name="name" type="text" required className="input" />
          </div>

          <div>
            <label className="label">E-mail</label>
            <input name="email" type="email" required className="input" />
          </div>

          <div>
            <label className="label">Wachtwoord</label>
            <input name="password" type="password" required minLength={6} className="input" />
          </div>

          <div>
            <label className="label">Ik ben</label>
            <select name="role" className="input">
              <option value="STUDENT">Leerling</option>
              <option value="TEACHER">Docent</option>
            </select>
          </div>

          <div>
            <label className="label">Klas (optioneel voor leerlingen)</label>
            <input name="className" type="text" placeholder="bv. O&O 3A" className="input" />
          </div>

          <button type="submit" className="btn btn-primary w-full justify-center">
            Account aanmaken
          </button>

          <p className="text-center text-sm text-muted">
            Heb je al een account? <Link href="/login" className="underline text-forest">Inloggen</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

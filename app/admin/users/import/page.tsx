import Link from "next/link";
import { ImportFlow } from "./ImportFlow";

export default function ImportPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/admin/users" className="text-sm text-muted hover:text-ink">← Terug</Link>
      <h1 className="text-4xl font-serif mt-4">Bulk-import gebruikers</h1>
      <p className="text-muted mt-2 max-w-xl">
        Upload een CSV. Je krijgt eerst een preview met wat er zou gebeuren. Pas daarna wordt het echt opgeslagen.
      </p>

      <div className="card mt-6 bg-paper">
        <h2 className="font-serif text-lg mb-2">📋 Verwachte CSV-kolommen</h2>
        <pre className="bg-white border border-line rounded-md p-3 text-xs font-mono overflow-x-auto">
{`name,email,role,className,password
Lotte de Vries,lotte@school.nl,STUDENT,O&O 3A,
Sem Bakker,sem@school.nl,STUDENT,O&O 3A,welkom2026
Mw. de Boer,boer@school.nl,TEACHER,,`}
        </pre>
        <ul className="text-sm text-muted mt-3 space-y-1">
          <li>· <strong>name</strong> en <strong>email</strong> zijn verplicht</li>
          <li>· <strong>role</strong> is STUDENT / TEACHER / ADMIN — leeg = STUDENT</li>
          <li>· <strong>className</strong> mag leeg zijn (voor docenten/admins meestal leeg)</li>
          <li>· <strong>password</strong> leeg = automatisch genereren (8 tekens)</li>
        </ul>
      </div>

      <ImportFlow />
    </div>
  );
}

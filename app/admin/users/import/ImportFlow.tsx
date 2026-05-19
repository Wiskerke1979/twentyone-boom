"use client";

import { useState, useTransition } from "react";
import { previewImport, commitImport } from "./actions";

interface PreviewRow {
  rowNumber: number;
  name: string;
  email: string;
  role: string;
  className: string | null;
  password: string;
  status: "create" | "skip" | "error";
  reason?: string;
}

export function ImportFlow() {
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [committed, setCommitted] = useState<PreviewRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCsvText(String(reader.result));
      setPreview(null);
      setCommitted(null);
      setError(null);
    };
    reader.readAsText(file);
  }

  async function doPreview() {
    setError(null);
    startTransition(async () => {
      const res = await previewImport(csvText);
      if ("error" in res) setError(res.error);
      else setPreview(res.rows);
    });
  }

  async function doCommit() {
    if (!preview) return;
    setError(null);
    startTransition(async () => {
      const toCommit = preview.filter((r) => r.status === "create");
      const res = await commitImport(toCommit);
      if ("error" in res) setError(res.error);
      else setCommitted(res.rows);
    });
  }

  function downloadResultCSV() {
    if (!committed) return;
    const header = "name,email,role,className,password\n";
    const lines = committed
      .map((r) => [r.name, r.email, r.role, r.className || "", r.password].map(esc).join(","))
      .join("\n");
    const blob = new Blob([header + lines], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boom-credentials-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ----- VIEW: COMMITTED -----
  if (committed) {
    return (
      <div className="mt-6 space-y-4">
        <div className="card bg-basis/10 border-basis">
          <h2 className="font-serif text-xl">✓ {committed.length} gebruikers aangemaakt</h2>
          <p className="text-sm mt-2">
            Download de CSV met de inloggegevens en stuur deze door naar de docent of leerlingen.
          </p>
          <button onClick={downloadResultCSV} className="btn btn-primary mt-3">
            ⬇ Download credentials.csv
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Naam</th>
              <th>E-mail</th>
              <th>Rol</th>
              <th>Klas</th>
              <th>Wachtwoord</th>
            </tr>
          </thead>
          <tbody>
            {committed.map((r) => (
              <tr key={r.email}>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td><span className="pill pill-locked">{r.role.toLowerCase()}</span></td>
                <td>{r.className || "—"}</td>
                <td><code className="bg-paper px-1.5 py-0.5 rounded font-mono text-xs">{r.password}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ----- VIEW: PREVIEW -----
  if (preview) {
    const creates = preview.filter((r) => r.status === "create").length;
    const skips = preview.filter((r) => r.status === "skip").length;
    const errors = preview.filter((r) => r.status === "error").length;
    return (
      <div className="mt-6 space-y-4">
        <div className="card flex items-center justify-between">
          <div className="flex gap-4 text-sm">
            <span className="text-basis font-medium">✓ {creates} aanmaken</span>
            <span className="text-muted">⊘ {skips} overslaan (bestaan al)</span>
            {errors > 0 && <span className="text-expert font-medium">✗ {errors} fouten</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPreview(null)} className="btn btn-ghost text-xs">Wijzig</button>
            <button onClick={doCommit} disabled={creates === 0 || pending} className="btn btn-primary text-xs">
              {pending ? "Bezig…" : `Importeer ${creates} →`}
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Naam</th>
              <th>E-mail</th>
              <th>Rol</th>
              <th>Klas</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((r) => (
              <tr key={r.rowNumber} className={r.status === "error" ? "bg-expert/10" : r.status === "skip" ? "opacity-50" : ""}>
                <td className="text-xs text-muted">{r.rowNumber}</td>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td><span className="pill pill-locked text-xs">{r.role.toLowerCase()}</span></td>
                <td>{r.className || "—"}</td>
                <td className="text-xs">
                  {r.status === "create" && <span className="text-basis">✓ Aanmaken</span>}
                  {r.status === "skip" && <span className="text-muted">⊘ {r.reason}</span>}
                  {r.status === "error" && <span className="text-expert">✗ {r.reason}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ----- VIEW: UPLOAD -----
  return (
    <div className="card mt-6 space-y-4">
      <div>
        <label className="label">CSV-bestand</label>
        <input type="file" accept=".csv,text/csv" onChange={onFile} className="input" />
      </div>

      <div>
        <label className="label">of plak hier</label>
        <textarea
          rows={8}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder="name,email,role,className,password&#10;Lotte de Vries,lotte@school.nl,STUDENT,O&O 3A,"
          className="input font-mono text-xs"
        />
      </div>

      {error && (
        <div className="p-3 bg-expert/10 text-expert rounded-md text-sm">{error}</div>
      )}

      <button onClick={doPreview} disabled={!csvText.trim() || pending} className="btn btn-primary">
        {pending ? "Bezig…" : "Toon preview"}
      </button>
    </div>
  );
}

function esc(v: string) {
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

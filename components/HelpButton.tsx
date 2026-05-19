"use client";

import { useState, useTransition } from "react";
import { sendHelpRequest } from "@/app/api/help/actions";

export function HelpButton({ userName, userEmail, userRole }: {
  userName: string;
  userEmail: string;
  userRole: string;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await sendHelpRequest(formData);
      if (res?.error) setError(res.error);
      else setSent(true);
    });
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setSent(false); setError(null); }}
        title="Hulp nodig?"
        className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-forest text-cream shadow-lg hover:bg-leaf hover:scale-105 transition flex items-center justify-center text-2xl"
      >
        ?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/60 flex items-end md:items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-cream rounded-2xl max-w-md w-full p-6 shadow-2xl border border-line"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="font-serif text-2xl">Hulp nodig?</h2>
                <p className="text-sm text-muted">We helpen je graag.</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-ink text-xl w-8 h-8">×</button>
            </div>

            {sent ? (
              <div className="p-4 bg-basis/10 border border-basis rounded-md text-sm">
                ✓ Bedankt! Je vraag is verzonden. We nemen zo snel mogelijk contact op.
                <button onClick={() => setOpen(false)} className="block mt-3 underline text-forest text-xs">
                  Sluiten
                </button>
              </div>
            ) : (
              <form action={handleSubmit} className="space-y-3">
                <input type="hidden" name="fromName" value={userName} />
                <input type="hidden" name="fromEmail" value={userEmail} />
                <input type="hidden" name="fromRole" value={userRole} />

                {error && (
                  <div className="p-2 bg-expert/10 text-expert rounded-md text-sm">{error}</div>
                )}

                <div>
                  <label className="label">Wat is je vraag of probleem?</label>
                  <textarea
                    name="message"
                    rows={5}
                    required
                    minLength={10}
                    placeholder="Bijv. 'Mijn bewijs werd afgewezen maar ik begrijp niet waarom — kun je helpen?'"
                    className="input"
                    autoFocus
                  />
                </div>

                <div className="text-xs text-muted">
                  We sturen dit naar de schoolcoördinator. Je naam ({userName}) en e-mail ({userEmail}) gaan automatisch mee.
                </div>

                <button type="submit" disabled={pending} className="btn btn-primary w-full justify-center">
                  {pending ? "Verzenden…" : "Verstuur"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

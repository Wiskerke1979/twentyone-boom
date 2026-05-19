import Link from "next/link";
import { dismissTip } from "@/app/student/dashboard/actions";
import type { SuggestionItem } from "@/lib/suggestions";

const TYPE_META: Record<string, { icon: string; label: string; bg: string; fg: string }> = {
  TIP: { icon: "💡", label: "Tip", bg: "#FFF6E0", fg: "#A67B14" },
  OPDRACHT: { icon: "📋", label: "Opdracht", bg: "#E8F0F0", fg: "#2D5043" },
  CHALLENGE: { icon: "🎯", label: "Challenge", bg: "#F9E5E0", fg: "#C74E3A" },
};

const REASON_LABEL: Record<SuggestionItem["reason"], string> = {
  assignment: "📌 klaargezet door docent",
  "claimed-no-proof": "🟫 bewijs leveren voor je zelfscan",
  fresh: "🌱 nog niet gestart",
};

export function SuggestionCard({ s }: { s: SuggestionItem }) {
  const meta = TYPE_META[s.type] || TYPE_META.TIP;

  return (
    <div className="card flex flex-col relative">
      {/* Dismiss button */}
      <form action={dismissTip} className="absolute top-2 right-2">
        <input type="hidden" name="tipId" value={s.id} />
        <button
          type="submit"
          title="Verberg deze suggestie"
          className="text-muted hover:text-ink text-lg w-7 h-7 flex items-center justify-center rounded-full hover:bg-line transition"
        >
          ×
        </button>
      </form>

      <div className="flex items-center gap-2 mb-2">
        <span className="pill" style={{ background: meta.bg, color: meta.fg }}>
          {meta.icon} {meta.label}
        </span>
        <span className="pill" style={{ background: "#F4EFE6", color: "#8B7E6E" }}>
          {s.competence.icon} {s.competence.name}
        </span>
      </div>

      <div className="text-xs text-muted mb-2">{REASON_LABEL[s.reason]} · {s.level.toLowerCase()}</div>

      <p className="text-sm text-ink leading-relaxed mb-3 flex-1">{s.text}</p>

      {s.suggestedEvidence && (
        <div className="text-xs text-muted bg-paper rounded-md p-2 mb-3">
          <span className="font-medium text-ink">📎 Bewijs idee: </span>
          {s.suggestedEvidence}
        </div>
      )}

      <div className="flex justify-end">
        <Link
          href={`/student/bewijs/new?competence=${s.competence.slug}`}
          className="btn btn-primary text-xs"
        >
          📎 Lever bewijs in →
        </Link>
      </div>
    </div>
  );
}

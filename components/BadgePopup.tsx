"use client";

import { useEffect, useState } from "react";

interface Badge {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
}

export function BadgePopup({ badges }: { badges: Badge[] }) {
  const [shown, setShown] = useState(badges);

  useEffect(() => {
    if (badges.length === 0) return;
    setShown(badges);
    const timer = setTimeout(() => setShown([]), 8000);
    return () => clearTimeout(timer);
  }, [badges]);

  if (shown.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
      {shown.map((b, idx) => (
        <div
          key={b.id}
          className="card bg-cream shadow-2xl border-2 border-sun pointer-events-auto"
          style={{
            animation: `slide-in 0.4s ease-out backwards`,
            animationDelay: `${idx * 150}ms`,
          }}
        >
          <div className="flex items-start gap-3">
            <div className="text-4xl">{b.icon}</div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider text-sun font-bold">🏆 Nieuwe badge!</div>
              <div className="font-serif text-xl mt-0.5">{b.name}</div>
              <div className="text-sm text-muted mt-1">{b.description}</div>
            </div>
            <button
              onClick={() => setShown((s) => s.filter((x) => x.id !== b.id))}
              className="text-muted hover:text-ink text-lg w-7 h-7 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(60px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

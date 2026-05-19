"use client";

import { useEffect, useState } from "react";

interface Step {
  emoji: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    emoji: "🌳",
    title: "Welkom bij De Groeiende Boom",
    body: "Dit is jouw persoonlijke boom. Hij groeit mee met wat je leert in O&O en de competenties die je ontwikkelt.",
  },
  {
    emoji: "✍️",
    title: "Begin met een zelfscan",
    body: "Beantwoord 5 korte vragen per competentie. Je krijgt een eerste indicatie — bruine bladeren verschijnen op de boom.",
  },
  {
    emoji: "📎",
    title: "Lever bewijs in",
    body: "Laat met een tekst, foto of link zien wat je hebt gedaan. Je docent keurt het goed → je bladeren worden groen.",
  },
  {
    emoji: "🤝",
    title: "Vraag een peer",
    body: "Laat groepsgenoten je scoren op een competentie. Hun feedback verschijnt op de tak in je boom.",
  },
  {
    emoji: "💡",
    title: "Actiepunten op je dashboard",
    body: "Concrete dingen die je vandaag al kunt doen, met direct een suggestie wat voor bewijs erbij past. Niet alle 4 nuttig? Klik × — er komt een nieuwe.",
  },
];

const STORAGE_KEY = "twentyone-boom-onboarding-completed";

export function OnboardingTour({ forceShow = false }: { forceShow?: boolean }) {
  const [step, setStep] = useState(-1); // -1 = not shown

  useEffect(() => {
    if (forceShow) {
      setStep(0);
      return;
    }
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) setStep(0);
    } catch {}
  }, [forceShow]);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {}
    setStep(-1);
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else dismiss();
  }

  if (step === -1) return null;
  const current = STEPS[step];

  return (
    <div
      className="fixed inset-0 z-40 bg-ink/70 flex items-center justify-center px-4"
      style={{ animation: "fade-overlay 0.2s ease-out" }}
    >
      <div className="bg-cream rounded-2xl max-w-md w-full p-8 shadow-2xl border border-line relative">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-muted hover:text-ink text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-paper"
        >
          ×
        </button>

        <div className="text-6xl mb-4">{current.emoji}</div>
        <h2 className="font-serif text-3xl">{current.title}</h2>
        <p className="text-ink mt-3 leading-relaxed">{current.body}</p>

        <div className="flex items-center justify-between mt-8">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step ? "bg-forest w-6" : i < step ? "bg-leaf" : "bg-line"
                }`}
              />
            ))}
          </div>
          <button onClick={next} className="btn btn-primary">
            {step < STEPS.length - 1 ? "Volgende →" : "Aan de slag 🌱"}
          </button>
        </div>

        <button
          onClick={dismiss}
          className="block mx-auto mt-4 text-xs text-muted hover:text-ink underline"
        >
          Overslaan
        </button>
      </div>

      <style>{`
        @keyframes fade-overlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

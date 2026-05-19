"use client";

import { useState } from "react";

interface Indicator {
  id: string;
  competenceSlug: string;
  level: string;
  text: string;
}

interface Competence {
  slug: string;
  name: string;
  icon: string;
  indicators: Indicator[];
}

export function EvidenceForm({
  competences,
  action,
  focusCompetence,
}: {
  competences: Competence[];
  action: (formData: FormData) => Promise<void>;
  focusCompetence?: string;
}) {
  const [fileType, setFileType] = useState<string>("text");

  const showFileInput = fileType === "image" || fileType === "pdf" || fileType === "video";
  const showLinkInput = fileType === "link";

  return (
    <form action={action} className="mt-8 space-y-6 card">
      <div>
        <label className="label">Hoe lever je bewijs aan?</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
          {[
            { v: "text",  i: "✍️", l: "Alleen reflectie" },
            { v: "image", i: "📸", l: "Foto" },
            { v: "pdf",   i: "📄", l: "PDF / doc" },
            { v: "video", i: "🎥", l: "Video" },
            { v: "link",  i: "🔗", l: "Link" },
          ].map((opt) => (
            <label
              key={opt.v}
              className={`flex flex-col items-center gap-1 cursor-pointer p-3 border rounded-md transition ${
                fileType === opt.v ? "border-forest bg-paper" : "border-line hover:border-forest"
              }`}
            >
              <input
                type="radio"
                name="fileType"
                value={opt.v}
                checked={fileType === opt.v}
                onChange={(e) => setFileType(e.target.value)}
                className="sr-only"
              />
              <span className="text-2xl">{opt.i}</span>
              <span className="text-xs text-center">{opt.l}</span>
            </label>
          ))}
        </div>
      </div>

      {showFileInput && (
        <div>
          <label className="label">Bestand</label>
          <input
            type="file"
            name="file"
            accept={
              fileType === "image" ? "image/*"
              : fileType === "pdf" ? "application/pdf"
              : "video/*"
            }
            required
            className="input"
          />
        </div>
      )}

      {showLinkInput && (
        <div>
          <label className="label">Link</label>
          <input
            type="url"
            name="linkUrl"
            required
            placeholder="https://…"
            className="input"
          />
        </div>
      )}

      <div>
        <label className="label">Kies competentie en indicator(en)</label>
        <div className="space-y-3 mt-2">
          {competences.map((c) => (
            <details
              key={c.slug}
              open={focusCompetence === c.slug}
              className="border border-line rounded-md"
            >
              <summary className="cursor-pointer px-3 py-2 select-none hover:bg-paper">
                {c.icon} {c.name}
              </summary>
              <div className="px-3 py-2 space-y-1">
                {c.indicators.map((i) => (
                  <label key={i.id} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="indicatorIds"
                      value={i.id}
                      className="mt-1"
                    />
                    <span>
                      <span className={`pill pill-${i.level.toLowerCase()} mr-2`}>
                        {i.level.toLowerCase()}
                      </span>
                      {i.text}
                    </span>
                  </label>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Mijn reflectie (verplicht, minstens 50 tekens)</label>
        <textarea
          name="reflection"
          required
          minLength={50}
          rows={6}
          placeholder="Wat heb je gedaan, wat heb je geleerd, en waarom is dit bewijs voor de gekozen indicator(en)?"
          className="input"
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Indienen bij docent
      </button>
    </form>
  );
}

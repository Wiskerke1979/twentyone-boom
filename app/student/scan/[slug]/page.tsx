import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { saveScan } from "./actions";

// Lightweight question set per competence. Five answer-statements with implicit level scoring.
// Each question has 4 options scored: 0 = nog niet, 1 = Basis, 2 = Gevorderd, 3 = Expert
const QUESTIONS: Record<string, { question: string; options: string[] }[]> = {
  "samenwerken": [
    { question: "Tijdens een groepsoverleg merk je dat een teamgenoot niets durft te zeggen. Wat doe je?", options: ["Ik laat het zo.", "Ik vraag aan het einde of hij/zij iets wil zeggen.", "Ik nodig hem/haar tijdens het gesprek expliciet uit.", "Ik stel voor om iedereen een tussenmoment te geven."] },
    { question: "Hoe ga je om met een teamgenoot die zijn deel niet af heeft?", options: ["Ik klaag bij de docent.", "Ik help met afmaken zonder gedoe.", "Ik bespreek met de teamgenoot wat er speelt.", "Ik help het team om afspraken te maken die dit voorkomen."] },
    { question: "Iemand geeft jou kritische feedback. Hoe reageer je?", options: ["Ik word boos of trek me terug.", "Ik luister maar zeg er niets over.", "Ik vraag toelichting en probeer iets te doen met de feedback.", "Ik bedank en pas mijn werk actief aan."] },
    { question: "Bij rolverdeling in een nieuwe groep…", options: ["Ik wacht af welke rol ik krijg.", "Ik accepteer de rol die wordt voorgesteld.", "Ik kies bewust een rol die past bij wat ik wil leren.", "Ik stel een rolverdeling voor die het hele team versterkt."] },
    { question: "Een conflict tussen twee teamgenoten ontstaat. Wat doe je?", options: ["Niks, dat moeten zij zelf doen.", "Ik vertel het aan de docent.", "Ik praat met beide om begrip te kweken.", "Ik begeleid een gesprek tot een oplossing."] },
  ],
  "doorzetten": [
    { question: "Een opdracht is moeilijker dan verwacht. Wat doe je?", options: ["Ik geef op of doe het half.", "Ik vraag hulp en ga door.", "Ik verdeel hem in stukken en werk gestaag.", "Ik houd vast aan kwaliteit én planning."] },
    { question: "Je hebt iets fout gedaan in je prototype. Wat doe je?", options: ["Ik laat het zo.", "Ik herstel het zoals het was.", "Ik leer ervan en pas mijn aanpak aan.", "Ik schrijf reflectie en deel met team."] },
    { question: "Aan het eind van een lange dag…", options: ["Ik laat het werk liggen.", "Ik maak alleen het minimale af.", "Ik maak afgesproken taken af.", "Ik kies bewust wat nog nodig is voor het lange-termijn doel."] },
    { question: "Je projectopdracht verveelt je. Wat doe je?", options: ["Ik werk zonder energie.", "Ik werk gewoon door.", "Ik zoek een eigen invalshoek die mij motiveert.", "Ik help anderen ook gemotiveerd te blijven."] },
    { question: "Hoe lang volhardt je op één moeilijke taak?", options: ["Niet lang, ik switch snel.", "Tot het ongeveer af is.", "Tot het écht klopt.", "Tot het kwalitatief beter is dan nodig."] },
  ],
  "presenteren": [
    { question: "Hoe bereid je een presentatie voor?", options: ["Ik improviseer.", "Ik maak slides en lees ze voor.", "Ik schrijf hoofdpunten en oefen hardop.", "Ik bouw een verhaal met begin-midden-einde, oefen voor publiek."] },
    { question: "Hoe gebruik je visuele middelen?", options: ["Niet of veel tekst.", "Standaard slides met bullets.", "Slides ondersteunen mijn verhaal.", "Ik kies bewust per moment beeld, slide of fysiek voorwerp."] },
    { question: "Iemand stelt een lastige vraag.", options: ["Ik raak in paniek.", "Ik geef een kort antwoord.", "Ik beantwoord helder of zeg dat ik het uitzoek.", "Ik gebruik de vraag om mijn verhaal te verdiepen."] },
    { question: "Voor welk publiek pas je je aan?", options: ["Ik pas niet aan.", "Soms bij heel jong/oud publiek.", "Voor verschillende leeftijden bewust.", "Voor elk publiek, ook expert vs. leek."] },
    { question: "Hoe sluit je een presentatie af?", options: ["Met 'einde, vragen?'", "Met een korte samenvatting.", "Met een conclusie en oproep.", "Met een verhaal dat blijft hangen."] },
  ],
};

// Default question set for competences we haven't customized — use a generic set keyed by indicators
function getQuestions(slug: string) {
  return QUESTIONS[slug] || [
    { question: `Beheers je de basis-acties van ${slug.replace(/-/g, " ")}?`, options: ["Nee, helemaal niet.", "Soms.", "Vaak.", "Altijd."] },
    { question: `Pas je dit zelfstandig toe?`, options: ["Nee.", "Met hulp.", "Meestal zelfstandig.", "Volledig zelfstandig."] },
    { question: `Help je anderen hierbij?`, options: ["Nee.", "Soms.", "Vaak.", "Ja, ik coach anderen."] },
    { question: `Reflecteer je hierop?`, options: ["Nee.", "Achteraf.", "Tussentijds en achteraf.", "Continu, en stuur bij."] },
    { question: `Hoe vaak voeg je iets eigens toe aan deze competentie?`, options: ["Nooit.", "Zelden.", "Regelmatig.", "Altijd, ik verbeter de aanpak."] },
  ];
}

export default async function ScanPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const competence = await prisma.competence.findUnique({ where: { slug } });
  if (!competence) notFound();

  const questions = getQuestions(slug);

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/student/competentie/${slug}`} className="text-sm text-muted hover:text-ink">← Terug</Link>
      <div className="mt-4 flex items-center gap-3">
        <span className="text-4xl">{competence.icon}</span>
        <div>
          <p className="text-sm text-forest font-semibold uppercase tracking-wider">Zelfscan</p>
          <h1 className="text-3xl font-serif">{competence.name}</h1>
        </div>
      </div>

      <p className="text-muted mt-3">
        Beantwoord elke vraag eerlijk. Je krijgt aan het einde een indicatie van je niveau — geen officieel oordeel.
      </p>

      <form action={saveScan} className="mt-8 space-y-8">
        <input type="hidden" name="slug" value={slug} />
        {questions.map((q, idx) => (
          <div key={idx} className="card">
            <div className="text-xs text-muted mb-2">Vraag {idx + 1} van {questions.length}</div>
            <div className="font-medium mb-3">{q.question}</div>
            <div className="space-y-2">
              {q.options.map((opt, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-paper transition"
                >
                  <input
                    type="radio"
                    name={`q${idx}`}
                    value={String(optIdx)}
                    required
                    className="text-forest"
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <button type="submit" className="btn btn-primary">
          Bereken mijn niveau →
        </button>
      </form>
    </div>
  );
}

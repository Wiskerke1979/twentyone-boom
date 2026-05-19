// Centrale data: de 9 competenties met hun indicatoren per niveau.
// Wordt gebruikt door seed.ts en kan client-side direct geïmporteerd voor UI.

export type LevelKey = "BASIS" | "GEVORDERD" | "EXPERT";

export interface IndicatorSeed {
  level: LevelKey;
  text: string;
}

export interface CompetenceSeed {
  slug: string;
  name: string;
  icon: string;
  description: string;
  indicators: IndicatorSeed[];
}

export const LEVELS: LevelKey[] = ["BASIS", "GEVORDERD", "EXPERT"];

export const LEVEL_LABEL: Record<LevelKey, string> = {
  BASIS: "Basis",
  GEVORDERD: "Gevorderd",
  EXPERT: "Expert",
};

export const LEVEL_COLOR: Record<LevelKey, string> = {
  BASIS: "#6BA368",
  GEVORDERD: "#D89B5D",
  EXPERT: "#C74E3A",
};

export const COMPETENCES: CompetenceSeed[] = [
  {
    slug: "samenwerken",
    name: "Samenwerken",
    icon: "🐝",
    description: "Werken in een team aan een gezamenlijk doel.",
    indicators: [
      { level: "BASIS", text: "Accepteert toegewezen rol in een team" },
      { level: "BASIS", text: "Geeft een compliment of opmerking aan teamgenoten" },
      { level: "BASIS", text: "Vraagt om hulp als iets onduidelijk is" },
      { level: "GEVORDERD", text: "Bespreekt en kiest een rol bewust" },
      { level: "GEVORDERD", text: "Geeft concrete, bruikbare feedback" },
      { level: "GEVORDERD", text: "Praat over verschillen in het team" },
      { level: "EXPERT", text: "Stelt een rolverdeling voor die het team versterkt" },
      { level: "EXPERT", text: "Geeft feedback die anderen verder helpt" },
      { level: "EXPERT", text: "Bemiddelt actief tussen teamleden" },
    ],
  },
  {
    slug: "individueel-werken",
    name: "Individueel werken",
    icon: "🐿️",
    description: "Zelfstandig taken oppakken en afronden.",
    indicators: [
      { level: "BASIS", text: "Werkt zelfstandig aan korte taken" },
      { level: "BASIS", text: "Houdt focus voor minstens 20 minuten" },
      { level: "BASIS", text: "Maakt afgesproken taken op tijd af" },
      { level: "GEVORDERD", text: "Maakt eigen keuzes binnen een opdracht" },
      { level: "GEVORDERD", text: "Werkt geconcentreerd aan langere taken" },
      { level: "GEVORDERD", text: "Neemt verantwoordelijkheid voor eigen werk" },
      { level: "EXPERT", text: "Plant zelfstandig complexe trajecten" },
      { level: "EXPERT", text: "Werkt geconcentreerd onder afleiding" },
      { level: "EXPERT", text: "Stuurt eigen leerproces bij" },
    ],
  },
  {
    slug: "planmatig-werken",
    name: "Planmatig werken",
    icon: "🦫",
    description: "Een project overzichtelijk uitvoeren.",
    indicators: [
      { level: "BASIS", text: "Maakt een planning voor een korte opdracht" },
      { level: "BASIS", text: "Splitst een taak in stappen" },
      { level: "BASIS", text: "Haalt afgesproken deadlines" },
      { level: "GEVORDERD", text: "Stelt prioriteiten als tijd schaars is" },
      { level: "GEVORDERD", text: "Past planning aan op basis van voortgang" },
      { level: "GEVORDERD", text: "Houdt overzicht over een meerweeks project" },
      { level: "EXPERT", text: "Plant rekening houdend met afhankelijkheden tussen taken" },
      { level: "EXPERT", text: "Helpt team om planmatig te werken" },
      { level: "EXPERT", text: "Reflecteert op planningsproces en verbetert het" },
    ],
  },
  {
    slug: "inventiviteit",
    name: "Inventiviteit",
    icon: "🦋",
    description: "Originele oplossingen bedenken.",
    indicators: [
      { level: "BASIS", text: "Bedenkt meerdere oplossingen voor een probleem" },
      { level: "BASIS", text: "Combineert bestaande ideeën op een nieuwe manier" },
      { level: "BASIS", text: "Durft een ongebruikelijke optie te noemen" },
      { level: "GEVORDERD", text: "Onderbouwt waarom een idee origineel is" },
      { level: "GEVORDERD", text: "Werkt een eigen idee uit tot prototype" },
      { level: "GEVORDERD", text: "Vraagt feedback om idee aan te scherpen" },
      { level: "EXPERT", text: "Daagt een team uit om verder te denken dan voor de hand ligt" },
      { level: "EXPERT", text: "Past technieken voor ideeën-generatie bewust toe" },
      { level: "EXPERT", text: "Maakt een originele oplossing daadwerkelijk werkend" },
    ],
  },
  {
    slug: "productgericht-werken",
    name: "Productgericht werken",
    icon: "🕷️",
    description: "Een tastbaar eindresultaat opleveren.",
    indicators: [
      { level: "BASIS", text: "Levert een werkend eindproduct op" },
      { level: "BASIS", text: "Werkt netjes en verzorgd af" },
      { level: "BASIS", text: "Vertaalt eisen naar concrete oplossingen" },
      { level: "GEVORDERD", text: "Test het product en past het aan" },
      { level: "GEVORDERD", text: "Let op kwaliteit van details" },
      { level: "GEVORDERD", text: "Maakt het product passend voor de gebruiker" },
      { level: "EXPERT", text: "Iteratie op iteratie tot eindkwaliteit" },
      { level: "EXPERT", text: "Maakt productkeuzes expliciet en onderbouwd" },
      { level: "EXPERT", text: "Levert een product op dat externe waardering krijgt" },
    ],
  },
  {
    slug: "procesgericht-werken",
    name: "Procesgericht werken",
    icon: "🐟",
    description: "Het proces bewust sturen en bewaken.",
    indicators: [
      { level: "BASIS", text: "Werkt in logische stappen" },
      { level: "BASIS", text: "Houdt bij wat al gedaan is" },
      { level: "BASIS", text: "Reflecteert achteraf op hoe het ging" },
      { level: "GEVORDERD", text: "Reflecteert tussentijds en stuurt bij" },
      { level: "GEVORDERD", text: "Documenteert het proces voor anderen" },
      { level: "GEVORDERD", text: "Herkent waar het proces vastloopt" },
      { level: "EXPERT", text: "Ontwerpt een passend proces voor een nieuw probleem" },
      { level: "EXPERT", text: "Begeleidt het team door procesfases" },
      { level: "EXPERT", text: "Reflecteert op meta-niveau: hoe leer ik?" },
    ],
  },
  {
    slug: "kennisgericht-werken",
    name: "Kennisgericht werken",
    icon: "🦉",
    description: "Onderzoeken, leren en kennis toepassen.",
    indicators: [
      { level: "BASIS", text: "Vindt informatie over een onderwerp" },
      { level: "BASIS", text: "Vat een bron in eigen woorden samen" },
      { level: "BASIS", text: "Gebruikt kennis uit lessen in een project" },
      { level: "GEVORDERD", text: "Beoordeelt of een bron betrouwbaar is" },
      { level: "GEVORDERD", text: "Legt verbanden tussen meerdere bronnen" },
      { level: "GEVORDERD", text: "Past kennis toe in een nieuwe context" },
      { level: "EXPERT", text: "Doet eigen onderzoek met een onderzoeksvraag" },
      { level: "EXPERT", text: "Combineert kennis uit meerdere vakgebieden" },
      { level: "EXPERT", text: "Draagt kennis over aan medeleerlingen" },
    ],
  },
  {
    slug: "doorzetten",
    name: "Doorzetten",
    icon: "🐢",
    description: "Volhouden bij tegenslag.",
    indicators: [
      { level: "BASIS", text: "Gaat door na een eerste tegenslag" },
      { level: "BASIS", text: "Vraagt om hulp in plaats van op te geven" },
      { level: "BASIS", text: "Maakt een taak af die langer duurt dan verwacht" },
      { level: "GEVORDERD", text: "Verdeelt een lastige taak in haalbare stappen" },
      { level: "GEVORDERD", text: "Houdt vast aan kwaliteit ook onder tijdsdruk" },
      { level: "GEVORDERD", text: "Probeert opnieuw na een fout met aangepaste aanpak" },
      { level: "EXPERT", text: "Houdt focus op een langetermijndoel meer dan een kwartaal" },
      { level: "EXPERT", text: "Motiveert medeleerlingen om door te zetten" },
      { level: "EXPERT", text: "Erkent eigen frustratie en gaat er constructief mee om" },
    ],
  },
  {
    slug: "presenteren",
    name: "Presenteren",
    icon: "🦚",
    description: "Resultaten en ideeën helder overbrengen.",
    indicators: [
      { level: "BASIS", text: "Houdt een korte presentatie voor de klas" },
      { level: "BASIS", text: "Gebruikt eenvoudige visuele ondersteuning" },
      { level: "BASIS", text: "Houdt structuur: begin-midden-einde" },
      { level: "GEVORDERD", text: "Past taalgebruik aan op publiek" },
      { level: "GEVORDERD", text: "Maakt visuele middelen die het verhaal versterken" },
      { level: "GEVORDERD", text: "Beantwoordt vragen helder" },
      { level: "EXPERT", text: "Boeit een onbekend publiek" },
      { level: "EXPERT", text: "Werkt presentatietechnieken (timing, pauze, ritme) bewust in" },
      { level: "EXPERT", text: "Krijgt publiek mee in een verhaal of standpunt" },
    ],
  },
];

export const BADGES = [
  { slug: "eerste-blad", name: "Eerste blad", icon: "🌱", description: "Jouw eerste goedgekeurde indicator." },
  { slug: "hele-boom-basis", name: "Hele boom Basis", icon: "🌳", description: "Alle 9 competenties op Basis." },
  { slug: "hele-boom-gevorderd", name: "Hele boom Gevorderd", icon: "🌲", description: "Alle 9 competenties op Gevorderd." },
  { slug: "expert-x3", name: "Expert × 3", icon: "🏆", description: "Drie competenties op Expert." },
  { slug: "peer-helper", name: "Peer-helper", icon: "🤝", description: "5 peer-scores gegeven." },
  { slug: "streak-7", name: "Streak ×7", icon: "🔥", description: "7 dagen achter elkaar actief." },
];

export const STARTER_TIPS = [
  // SAMENWERKEN
  { competenceSlug: "samenwerken", level: "BASIS", type: "TIP", text: "Vraag morgen één teamgenoot wat hij van jouw deel vond." },
  { competenceSlug: "samenwerken", level: "BASIS", type: "OPDRACHT", text: "Schrijf in 3 zinnen op wat jouw rol in het team is." },
  { competenceSlug: "samenwerken", level: "GEVORDERD", type: "CHALLENGE", text: "Geef tijdens het volgende overleg minstens 3x feedback aan teamgenoten." },
  { competenceSlug: "samenwerken", level: "EXPERT", type: "OPDRACHT", text: "Begeleid een minder zelfverzekerde teamgenoot tijdens één projectweek." },
  // PLANMATIG
  { competenceSlug: "planmatig-werken", level: "BASIS", type: "TIP", text: "Begin elke dag met 5 minuten plannen." },
  { competenceSlug: "planmatig-werken", level: "GEVORDERD", type: "OPDRACHT", text: "Maak een Gantt-strook voor je huidige project." },
  // DOORZETTEN
  { competenceSlug: "doorzetten", level: "BASIS", type: "TIP", text: "Verdeel je opdracht in 3 kleinere stukken. Vier elk stuk." },
  { competenceSlug: "doorzetten", level: "GEVORDERD", type: "CHALLENGE", text: "Maak een taak af die je 2 weken hebt laten liggen." },
  // KENNISGERICHT
  { competenceSlug: "kennisgericht-werken", level: "BASIS", type: "TIP", text: "Schrijf 3 vragen op die je over een onderwerp wilt beantwoorden vóór je gaat zoeken." },
  { competenceSlug: "kennisgericht-werken", level: "EXPERT", type: "OPDRACHT", text: "Geef een mini-college van 5 minuten aan een groepsgenoot over je onderzoek." },
  // PRESENTEREN
  { competenceSlug: "presenteren", level: "BASIS", type: "TIP", text: "Oefen je intro 3 keer hardop voor de spiegel." },
  { competenceSlug: "presenteren", level: "GEVORDERD", type: "CHALLENGE", text: "Houd een presentatie zonder slides — alleen met whiteboard of voorwerpen." },
  // INVENTIVITEIT
  { competenceSlug: "inventiviteit", level: "BASIS", type: "OPDRACHT", text: "Bedenk 10 verschillende manieren om eieren te koken (echt 10)." },
  // PRODUCTGERICHT
  { competenceSlug: "productgericht-werken", level: "BASIS", type: "TIP", text: "Wat zou een gebruiker van je product écht nodig hebben? Vraag het iemand." },
  // PROCESGERICHT
  { competenceSlug: "procesgericht-werken", level: "BASIS", type: "OPDRACHT", text: "Houd een week lang een korte dagelijkse logboek bij over je project." },
  // INDIVIDUEEL
  { competenceSlug: "individueel-werken", level: "BASIS", type: "TIP", text: "Probeer een Pomodoro: 25 min focus, 5 min pauze." },
];

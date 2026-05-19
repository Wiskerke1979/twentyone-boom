// Centrale data: de 9 competenties met hun indicatoren per niveau.
// 8 categorieën komen uit de officiële 21next Competentiemonitor CSV (gecureerd: 3 per niveau).
// Presenteren is een placeholder die niet in de CSV stond.

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
      { level: "BASIS", text: "Je werkt samen in het team en komt de afspraken na." },
      { level: "BASIS", text: "Je staat open voor ideeën van anderen." },
      { level: "BASIS", text: "Je overlegt met je teamgenoten." },
      { level: "GEVORDERD", text: "Je werkt actief aan het optimaal laten functioneren van je team." },
      { level: "GEVORDERD", text: "Bij een conflict probeer je het zelf op te lossen." },
      { level: "GEVORDERD", text: "Je zorgt ervoor dat je teamgenoten weten wat je aan het doen bent." },
      { level: "EXPERT", text: "Je handelt altijd in het belang van het team." },
      { level: "EXPERT", text: "Bij een conflict los je het zelf op, je speelt hierbij een actieve rol." },
      { level: "EXPERT", text: "Je controleert of anderen hun afspraken na komen." },
    ],
  },
  {
    slug: "individueel",
    name: "Individueel werken",
    icon: "🐿️",
    description: "Zelfstandig taken oppakken en afronden.",
    indicators: [
      { level: "BASIS", text: "Je kunt uitleggen wat je aan het doen bent." },
      { level: "BASIS", text: "Je kunt zelf aan de slag met de vragen die gesteld worden tijdens een project." },
      { level: "BASIS", text: "Je bent kritisch op je eigen resultaten." },
      { level: "GEVORDERD", text: "Je kunt anderen uitleggen wat je gedaan hebt." },
      { level: "GEVORDERD", text: "Je kunt zelfstandig aan de slag met zelf bedachte vragen." },
      { level: "GEVORDERD", text: "Als je een opdracht hebt zorg je ervoor dat je deze zoveel mogelijk zelfstandig maakt." },
      { level: "EXPERT", text: "Je maakt een plan voordat je aan de slag gaat." },
      { level: "EXPERT", text: "Je kunt terugkijken op wat je gedaan hebt en aangeven wat je de volgende keer anders zou doen." },
      { level: "EXPERT", text: "Je bent in staat om zelf een onderzoek op te zetten aan de hand van vragen die je zelf bedenkt." },
    ],
  },
  {
    slug: "plannen",
    name: "Planmatig werken",
    icon: "🦫",
    description: "Een project overzichtelijk uitvoeren.",
    indicators: [
      { level: "BASIS", text: "Je werkt stap voor stap en verliest je niet in details." },
      { level: "BASIS", text: "Je kunt een plan van aanpak maken voor een korte periode." },
      { level: "BASIS", text: "Je houdt je aan de planning." },
      { level: "GEVORDERD", text: "Je kunt een plan van aanpak maken voor een langer project." },
      { level: "GEVORDERD", text: "Je kunt onderdelen van de opdracht in kleinere stukjes verdelen en goed inschatten hoeveel tijd ze kosten." },
      { level: "GEVORDERD", text: "Je stelt prioriteiten voor jezelf en anderen." },
      { level: "EXPERT", text: "Je kent en overziet het hele ontwerptraject en bewaakt de grote lijn." },
      { level: "EXPERT", text: "Rekening houdend met alle omstandigheden kun je snel problemen analyseren en oplossen." },
      { level: "EXPERT", text: "Je plant door efficiënt taken te verdelen tussen een groot aantal anderen." },
    ],
  },
  {
    slug: "inventiviteit",
    name: "Inventiviteit",
    icon: "🦋",
    description: "Originele oplossingen bedenken.",
    indicators: [
      { level: "BASIS", text: "Je zoekt naar verschillende oplossingen voor een probleem als dat gevraagd wordt." },
      { level: "BASIS", text: "Je durft voor jouw idee op te komen." },
      { level: "BASIS", text: "Je ontwerpt dingen die werken." },
      { level: "GEVORDERD", text: "Je zoekt uit jezelf naar verschillende oplossingen." },
      { level: "GEVORDERD", text: "Je bent niet bang iets geheel nieuws te proberen." },
      { level: "GEVORDERD", text: "Je legt verbanden tussen bestaande ideeën en gezichtspunten en vormt deze tot iets nieuws." },
      { level: "EXPERT", text: "Je zoekt altijd actief naar meerdere oplossingen, ook buiten de wereld van je project." },
      { level: "EXPERT", text: "Je ontwerpt dingen waarin vorm en functie hand in hand gaan." },
      { level: "EXPERT", text: "Je genereert nieuwe ideeën en oplossingen." },
    ],
  },
  {
    slug: "product",
    name: "Productgericht werken",
    icon: "🕷️",
    description: "Een tastbaar eindresultaat opleveren dat voldoet aan de eisen.",
    indicators: [
      { level: "BASIS", text: "Je luistert aandachtig naar de opdrachtgever." },
      { level: "BASIS", text: "Je vertrekt vanuit de eisen van de klant en niet vanuit je eigen fantasie." },
      { level: "BASIS", text: "Je kunt een ontwerp toelichten, de werking uitleggen en vragen beantwoorden." },
      { level: "GEVORDERD", text: "Tussentijds controleer je altijd of het idee voldoet aan het PVE en stel je zo nodig bij." },
      { level: "GEVORDERD", text: "Je kunt duidelijk aangeven waarom voor een ontwerp gekozen is." },
      { level: "GEVORDERD", text: "Je kunt een keuze verdedigen." },
      { level: "EXPERT", text: "Je communiceert actief, helder, stipt en open naar de opdrachtgever." },
      { level: "EXPERT", text: "Op basis van een PVE maak je een product dat geheel voldoet aan de wensen van de klant." },
      { level: "EXPERT", text: "Je herkent snel de juiste keuze, motiveert deze, en overtuigt de ander." },
    ],
  },
  {
    slug: "proces",
    name: "Procesgericht werken",
    icon: "🐟",
    description: "Het proces bewust sturen en bewaken.",
    indicators: [
      { level: "BASIS", text: "Voordat je begint verdiep je je in de opdracht." },
      { level: "BASIS", text: "Je weet waarom je keuzes maakt en probeert de gevolgen in te schatten." },
      { level: "BASIS", text: "Je houdt een logboek bij en verzamelt belangrijke documentatie in een dossiermap." },
      { level: "GEVORDERD", text: "Voordat je begint verzamel je zoveel mogelijk informatie over de opdracht." },
      { level: "GEVORDERD", text: "Je let er op dat teamgenoten de stappen doorlopen die doorlopen moeten worden." },
      { level: "GEVORDERD", text: "Tijdens je onderzoek blijf je alert op nieuwe ontwikkelingen en schat je in of die zinvol zijn." },
      { level: "EXPERT", text: "Je kunt je team duidelijk maken wanneer er niet volgens de regels gewerkt wordt." },
      { level: "EXPERT", text: "Vanuit een totaalbeeld maak je keuzes waarvan je de gevolgen goed kunt inschatten." },
      { level: "EXPERT", text: "Je weet wat documenteren is: je bezit alle relevante info en kunt die feilloos terugvinden." },
    ],
  },
  {
    slug: "kennis",
    name: "Kennisgericht werken",
    icon: "🦉",
    description: "Onderzoeken, leren en kennis toepassen.",
    indicators: [
      { level: "BASIS", text: "Je probeert een literatuuronderzoek te doen voordat je begint aan je opdracht." },
      { level: "BASIS", text: "Je bent leergierig en verzamelt graag kennis." },
      { level: "BASIS", text: "Je doet je best en gaat moeilijke informatie niet uit de weg." },
      { level: "GEVORDERD", text: "Je verdiept je in de opdracht, zoekt literatuur en kunt daar een samenvatting van schrijven." },
      { level: "GEVORDERD", text: "Je verzamelt kennis uit betrouwbare bronnen." },
      { level: "GEVORDERD", text: "Je denkt na: je probeert verbanden te leggen of patronen te ontdekken." },
      { level: "EXPERT", text: "Je verzamelt kennis uit anderstalige betrouwbare bronnen." },
      { level: "EXPERT", text: "Je verzamelt snel en kritisch de voor jou relevante en betrouwbare kennis." },
      { level: "EXPERT", text: "Je zorgt ervoor dat je kennis deelt met anderen en anderen hun kennis met jou delen." },
    ],
  },
  {
    slug: "doorzetten",
    name: "Doorzetten",
    icon: "🐢",
    description: "Volhouden bij tegenslag.",
    indicators: [
      { level: "BASIS", text: "Je probeert altijd je werk goed te doen en afspraken na te komen." },
      { level: "BASIS", text: "Als je iets niet weet ga je op zoek naar het antwoord." },
      { level: "BASIS", text: "Je vraagt alleen om hulp als je het zelf geprobeerd hebt." },
      { level: "GEVORDERD", text: "Ook als je geen zin hebt, ga je aan het werk of kom je je afspraak na." },
      { level: "GEVORDERD", text: "Je kunt goed tegen kritiek en probeert er van te leren." },
      { level: "GEVORDERD", text: "Je vraagt pas om hulp als je het zelf geprobeerd hebt en er na een redelijke tijd niet uit komt." },
      { level: "EXPERT", text: "Je bent erg gedisciplineerd: het werk gaat boven alles en afspraken zijn heilig." },
      { level: "EXPERT", text: "Je kunt zelf inschatten waar je kritiek op gaat krijgen en probeert het voor te zijn." },
      { level: "EXPERT", text: "Je kunt je kalme en bedachtzame manier van werken overbrengen op anderen in je team." },
    ],
  },
  {
    slug: "presenteren",
    name: "Presenteren",
    icon: "🦚",
    description: "Resultaten en ideeën helder overbrengen.",
    indicators: [
      { level: "BASIS", text: "Je houdt een korte presentatie met een helder begin, midden en einde." },
      { level: "BASIS", text: "Je gebruikt eenvoudige visuele ondersteuning (slides of voorwerp)." },
      { level: "BASIS", text: "Je beantwoordt vragen uit de groep helder." },
      { level: "GEVORDERD", text: "Je past taalgebruik en voorbeelden aan op je publiek." },
      { level: "GEVORDERD", text: "Je maakt visuele middelen die het verhaal versterken." },
      { level: "GEVORDERD", text: "Je kunt onverwachte vragen omzetten in meer inzicht voor het publiek." },
      { level: "EXPERT", text: "Je boeit ook een onbekend publiek en houdt aandacht vast." },
      { level: "EXPERT", text: "Je werkt presentatietechnieken (ritme, pauze, timing) bewust in." },
      { level: "EXPERT", text: "Je krijgt je publiek mee in een verhaal of standpunt." },
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

/**
 * Concrete actiepunten met bewijs-suggestie.
 * Elke tip heeft een 'suggestedEvidence' zin die zegt wat voor bewijs erbij past.
 */
export const STARTER_TIPS = [
  // ---------- SAMENWERKEN ----------
  { competenceSlug: "samenwerken", level: "BASIS", type: "TIP", text: "Vraag tijdens het volgende overleg actief wat een teamgenoot van jouw idee vindt.", suggestedEvidence: "Korte tekst over wat je vroeg, het antwoord, en hoe je het hebt verwerkt." },
  { competenceSlug: "samenwerken", level: "BASIS", type: "OPDRACHT", text: "Schrijf voor je volgende projectles 3 afspraken op die je team gaat naleven.", suggestedEvidence: "Foto van de afspraken op het bord, of een tekst met de drie afspraken." },
  { competenceSlug: "samenwerken", level: "GEVORDERD", type: "CHALLENGE", text: "Stel deze week een rolverdeling voor in je team en stuur het overleg aan.", suggestedEvidence: "Een verslag van het overleg met daarin de rolverdeling en hoe het verliep." },
  { competenceSlug: "samenwerken", level: "GEVORDERD", type: "OPDRACHT", text: "Geef tijdens een overleg expliciet feedback aan twee teamgenoten. Schrijf op wat je zei en hoe ze reageerden.", suggestedEvidence: "Reflectietekst met de feedback en de reacties." },
  { competenceSlug: "samenwerken", level: "EXPERT", type: "CHALLENGE", text: "Bemiddel deze week in een meningsverschil tussen teamgenoten zonder de docent erbij te halen.", suggestedEvidence: "Reflectietekst die beschrijft wat er speelde, hoe je bemiddelde en de uitkomst." },
  { competenceSlug: "samenwerken", level: "EXPERT", type: "OPDRACHT", text: "Controleer of de afspraken van het team daadwerkelijk worden nagekomen en geef collegiale terugkoppeling.", suggestedEvidence: "Foto van je notities of korte tekst met wie wat wel of niet nakwam." },

  // ---------- INDIVIDUEEL ----------
  { competenceSlug: "individueel", level: "BASIS", type: "TIP", text: "Probeer een Pomodoro: 25 min focus, 5 min pauze. Doe het deze week 2 keer.", suggestedEvidence: "Foto van je timer/aantekeningen of een korte tekst over wat het opleverde." },
  { competenceSlug: "individueel", level: "BASIS", type: "OPDRACHT", text: "Leg in 3 zinnen uit waar je nu mee bezig bent in je project — alsof je het aan iemand thuis vertelt.", suggestedEvidence: "De 3 zinnen direct als reflectietekst." },
  { competenceSlug: "individueel", level: "GEVORDERD", type: "CHALLENGE", text: "Bedenk deze week zelf 2 nieuwe vragen die je in je project wil beantwoorden en ga ermee aan de slag.", suggestedEvidence: "De 2 vragen + wat je hebt gevonden of geprobeerd." },
  { competenceSlug: "individueel", level: "GEVORDERD", type: "OPDRACHT", text: "Schrijf op wat je goed of fout hebt gedaan tijdens je laatste werksessie — wees specifiek.", suggestedEvidence: "Reflectietekst met concrete momenten." },
  { competenceSlug: "individueel", level: "EXPERT", type: "OPDRACHT", text: "Maak vóór de start van je volgende deelopdracht een eigen plan van aanpak.", suggestedEvidence: "Foto of PDF van je plan." },
  { competenceSlug: "individueel", level: "EXPERT", type: "CHALLENGE", text: "Zet zelf een mini-onderzoek op rond een vraag die je interesseert binnen je project.", suggestedEvidence: "Onderzoeksvraag + opzet + uitkomst als tekst of PDF." },

  // ---------- PLANNEN ----------
  { competenceSlug: "plannen", level: "BASIS", type: "TIP", text: "Maak elke ochtend deze week een lijstje van 3 dingen die af moeten.", suggestedEvidence: "Foto van een lijstje of plak een tekst van een dag in je reflectie." },
  { competenceSlug: "plannen", level: "BASIS", type: "OPDRACHT", text: "Splits je huidige project op in 5 stappen en zet ze in volgorde.", suggestedEvidence: "Foto of tekst van je stappenplan." },
  { competenceSlug: "plannen", level: "GEVORDERD", type: "OPDRACHT", text: "Maak een planning voor de komende 3 weken op je project — met deadlines per onderdeel.", suggestedEvidence: "Foto of PDF van de planning." },
  { competenceSlug: "plannen", level: "GEVORDERD", type: "TIP", text: "Reflecteer wekelijks of je nog op koers ligt. Pas de planning aan als nodig.", suggestedEvidence: "Korte tekst over wat je hebt aangepast en waarom." },
  { competenceSlug: "plannen", level: "EXPERT", type: "CHALLENGE", text: "Maak een Gantt-strook voor je hele project, inclusief afhankelijkheden tussen taken.", suggestedEvidence: "Foto of digitaal bestand van de Gantt-strook." },
  { competenceSlug: "plannen", level: "EXPERT", type: "OPDRACHT", text: "Verdeel taken efficiënt over je team voor een week. Documenteer waarom je voor deze verdeling kiest.", suggestedEvidence: "De taakverdeling + onderbouwing." },

  // ---------- INVENTIVITEIT ----------
  { competenceSlug: "inventiviteit", level: "BASIS", type: "OPDRACHT", text: "Bedenk 10 verschillende manieren om een eenvoudig probleem op te lossen (bijv. eieren koken). Schrijf ze op.", suggestedEvidence: "De lijst van 10 manieren." },
  { competenceSlug: "inventiviteit", level: "BASIS", type: "TIP", text: "Verdedig je volgende idee met minstens 2 argumenten.", suggestedEvidence: "Korte tekst met de argumenten." },
  { competenceSlug: "inventiviteit", level: "GEVORDERD", type: "CHALLENGE", text: "Combineer in je volgende projectfase 2 bestaande ideeën tot iets nieuws. Beschrijf de combinatie.", suggestedEvidence: "Beschrijving + foto van schets of model." },
  { competenceSlug: "inventiviteit", level: "GEVORDERD", type: "OPDRACHT", text: "Probeer iets nieuws dat je nog nooit eerder hebt gedaan in een project.", suggestedEvidence: "Tekst of foto van wat je probeerde en wat het opleverde." },
  { competenceSlug: "inventiviteit", level: "EXPERT", type: "CHALLENGE", text: "Ontwikkel een nieuwe methode of techniek voor je project — eentje die de jouwe is.", suggestedEvidence: "Beschrijving + bewijs (foto/video) van toepassing." },
  { competenceSlug: "inventiviteit", level: "EXPERT", type: "OPDRACHT", text: "Genereer 5 echt nieuwe ideeën voor je project en kies onderbouwd 1.", suggestedEvidence: "De 5 ideeën + onderbouwing van keuze." },

  // ---------- PRODUCT ----------
  { competenceSlug: "product", level: "BASIS", type: "OPDRACHT", text: "Lees het PVE van je opdracht en schrijf in eigen woorden op wat de kerneisen zijn.", suggestedEvidence: "Korte tekst met de eisen in jouw woorden." },
  { competenceSlug: "product", level: "BASIS", type: "TIP", text: "Vraag je opdrachtgever (of docent) of je product voldoet aan wat ze willen.", suggestedEvidence: "Tekst met de vraag en het antwoord." },
  { competenceSlug: "product", level: "GEVORDERD", type: "OPDRACHT", text: "Check halverwege je project of je product nog voldoet aan het PVE. Pas aan waar nodig.", suggestedEvidence: "Reflectietekst over wat je hebt aangepast." },
  { competenceSlug: "product", level: "GEVORDERD", type: "TIP", text: "Bereid een verdediging van je ontwerpkeuzes voor — minimaal 3 argumenten per keuze.", suggestedEvidence: "Lijst met keuzes en argumenten." },
  { competenceSlug: "product", level: "EXPERT", type: "CHALLENGE", text: "Communiceer een week lang actief met je opdrachtgever over voortgang en keuzes.", suggestedEvidence: "Mail-correspondentie of foto's van overleg." },
  { competenceSlug: "product", level: "EXPERT", type: "OPDRACHT", text: "Verdedig je eindontwerp in een gesprek met de opdrachtgever en blijf open voor kritiek.", suggestedEvidence: "Reflectietekst met de feedback en wat je ermee gaat doen." },

  // ---------- PROCES ----------
  { competenceSlug: "proces", level: "BASIS", type: "OPDRACHT", text: "Houd een logboek bij voor minstens 5 dagen tijdens je project — wat deed je, wat leerde je?", suggestedEvidence: "Foto van je logboek of de tekst direct als reflectie." },
  { competenceSlug: "proces", level: "BASIS", type: "TIP", text: "Schrijf vóór je een nieuwe stap begint op waarom je deze keuze maakt.", suggestedEvidence: "Korte tekst per keuze." },
  { competenceSlug: "proces", level: "GEVORDERD", type: "CHALLENGE", text: "Maak deze week een procesdocument waarin een ander team jouw stappen kan navolgen.", suggestedEvidence: "PDF of foto van het procesdocument." },
  { competenceSlug: "proces", level: "GEVORDERD", type: "OPDRACHT", text: "Spot een moment in je proces waar het vastliep — en schrijf op waarom.", suggestedEvidence: "Reflectietekst over het vastloop-moment." },
  { competenceSlug: "proces", level: "EXPERT", type: "OPDRACHT", text: "Documenteer alle relevante info van je project zo dat je het in 1 minuut kunt terugvinden.", suggestedEvidence: "Foto of screenshot van je dossierstructuur." },
  { competenceSlug: "proces", level: "EXPERT", type: "CHALLENGE", text: "Houd een logboek bij in 'taal van de doelgroep' — een 12-jarige moet het kunnen lezen.", suggestedEvidence: "De vereenvoudigde logboek-tekst." },

  // ---------- KENNIS ----------
  { competenceSlug: "kennis", level: "BASIS", type: "OPDRACHT", text: "Doe een korte literatuurzoektocht over je project-onderwerp — minstens 3 bronnen.", suggestedEvidence: "Lijst van de 3 bronnen + 1 zin per bron." },
  { competenceSlug: "kennis", level: "BASIS", type: "TIP", text: "Stel jezelf 3 vragen over je onderwerp vóór je gaat zoeken.", suggestedEvidence: "Lijst van de 3 vragen." },
  { competenceSlug: "kennis", level: "GEVORDERD", type: "OPDRACHT", text: "Schrijf een korte samenvatting (max. 1 pagina) van je literatuuronderzoek.", suggestedEvidence: "De samenvatting als tekst of PDF." },
  { competenceSlug: "kennis", level: "GEVORDERD", type: "TIP", text: "Beoordeel elke bron op betrouwbaarheid — markeer welke je vertrouwt en waarom.", suggestedEvidence: "Lijst van bronnen met betrouwbaarheidsscore en korte motivatie." },
  { competenceSlug: "kennis", level: "EXPERT", type: "CHALLENGE", text: "Gebruik deze maand minstens 1 anderstalige (Engels of anders) bron in je onderzoek.", suggestedEvidence: "Vermelding van de bron + Nederlandse samenvatting." },
  { competenceSlug: "kennis", level: "EXPERT", type: "OPDRACHT", text: "Houd een mini-college van 5 minuten voor een groepsgenoot over je onderzoek.", suggestedEvidence: "Video, foto of reflectietekst over hoe het ging." },

  // ---------- DOORZETTEN ----------
  { competenceSlug: "doorzetten", level: "BASIS", type: "TIP", text: "Verdeel een lastige taak deze week in 3 stappen. Vier elke stap die je afmaakt.", suggestedEvidence: "Korte tekst over de 3 stappen en hoe het ging." },
  { competenceSlug: "doorzetten", level: "BASIS", type: "OPDRACHT", text: "Schrijf op een moment waarop je deze week bijna opgaf — en wat je toen wel deed.", suggestedEvidence: "Reflectietekst over dat moment." },
  { competenceSlug: "doorzetten", level: "GEVORDERD", type: "CHALLENGE", text: "Maak een taak af die je al 2 weken hebt laten liggen. Documenteer hoe je het doorbrak.", suggestedEvidence: "Foto van het eindresultaat + reflectie." },
  { competenceSlug: "doorzetten", level: "GEVORDERD", type: "OPDRACHT", text: "Vraag deze week om feedback en gebruik die om iets aan te passen — schrijf op wat.", suggestedEvidence: "De feedback + wat je hebt aangepast." },
  { competenceSlug: "doorzetten", level: "EXPERT", type: "CHALLENGE", text: "Help deze week een groepsgenoot die het moeilijk heeft door te zetten. Hoe deed je dat?", suggestedEvidence: "Reflectietekst over de aanpak en uitkomst." },
  { competenceSlug: "doorzetten", level: "EXPERT", type: "OPDRACHT", text: "Schrijf 5 momenten op waarop jij dit jaar hebt doorgezet ondanks tegenslag.", suggestedEvidence: "De lijst met de 5 momenten + korte beschrijving." },

  // ---------- PRESENTEREN ----------
  { competenceSlug: "presenteren", level: "BASIS", type: "OPDRACHT", text: "Oefen je intro 3 keer hardop voor de spiegel of een huisgenoot. Wat veranderde er?", suggestedEvidence: "Korte reflectietekst over wat beter ging." },
  { competenceSlug: "presenteren", level: "BASIS", type: "TIP", text: "Maak een 1-pagina-overzicht van je verhaal vóór je slides bouwt.", suggestedEvidence: "Foto van het overzicht." },
  { competenceSlug: "presenteren", level: "GEVORDERD", type: "CHALLENGE", text: "Houd een presentatie zonder slides — alleen whiteboard of voorwerpen.", suggestedEvidence: "Video, foto van het bord of reflectietekst van het publiek." },
  { competenceSlug: "presenteren", level: "GEVORDERD", type: "OPDRACHT", text: "Pas je verhaal aan voor 2 verschillende publieken (bv. klasgenoten + ouders).", suggestedEvidence: "De 2 versies + reflectie over de verschillen." },
  { competenceSlug: "presenteren", level: "EXPERT", type: "CHALLENGE", text: "Geef een presentatie aan een onbekend publiek (andere klas, bezoekers) en houd hun aandacht.", suggestedEvidence: "Foto of video + reflectie over de reactie." },
  { competenceSlug: "presenteren", level: "EXPERT", type: "OPDRACHT", text: "Werk bewust met timing, pauze en ritme in je volgende presentatie. Welke technieken paste je toe?", suggestedEvidence: "Tekst met de technieken en hoe het werkte." },
];

# 🌳 De Groeiende Boom

Een werkende Next.js 15 codebase voor een competentie-app voor het Technasium, gebaseerd op het bijbehorende ontwerpdocument.

Negen competenties (Samenwerken, Individueel werken, Planmatig werken, Inventiviteit, Productgericht werken, Procesgericht werken, Kennisgericht werken, Doorzetten, Presenteren) op drie niveaus (Basis → Gevorderd → Expert). De boom-visualisatie groeit mee met goedgekeurd bewijs.

---

## 🚀 Snel aan de slag

Voorwaarden: **Node 20+** en npm.

```bash
# 1. Installeer dependencies
npm install

# 2. Kopieer env-template en vul AUTH_SECRET in
cp .env.example .env
# Genereer een secret en plak in .env:
# openssl rand -base64 32

# 3. Maak de database aan + seed met demo-data
npm run db:push
npm run db:seed

# 4. Start dev server
npm run dev
```

Open <http://localhost:3000>.

### Demo-accounts (na seed)

| Rol | E-mail | Wachtwoord |
|---|---|---|
| Leerling | `lotte@school.nl` | `welkom123` |
| Leerling | `sem@school.nl` | `welkom123` |
| Leerling | `mira@school.nl` | `welkom123` |
| Docent | `docent@school.nl` | `welkom123` |

---

## ✨ Wat werkt end-to-end

### Leerling
- Inloggen en uitloggen
- Dashboard met **live boom-visualisatie** (data-driven SVG)
- Per competentie: indicatoren bekijken, status zien (bewezen / wacht op review / open)
- Zelfscan: 5 situationele vragen → indicatie-niveau
- Bewijs uploaden (foto / pdf / video / link / alleen tekst) + koppelen aan indicatoren + verplichte reflectie
- Peer-verzoek versturen aan maximaal 3 groepsgenoten per keer
- Peer-inbox: inkomende verzoeken zien en beantwoorden

### Peer
Een peer is gewoon een ingelogde leerling die een verzoek van een klasgenoot beantwoordt via `/student/peer/inbox`.

### Docent
- Klassenoverzicht: alle leerlingen gegroepeerd per klas, per leerling status-pillen + boom-icoon
- Bewijs-inbox: alle openstaande items chronologisch
- Review-scherm: bekijken, indicatoren zien, goedkeuren of afwijzen met optionele feedback
- Leerlingprofiel: boom + tijdlijn van bewijs + zelfscan-historie
- Bij goedkeuring berekent het systeem automatisch of een niveau is behaald (alle indicatoren op dat niveau bewezen)

---

## 🏗 Architectuur

```
twentyone-boom/
├── app/                    Next.js App Router
│   ├── api/auth/[...nextauth]/   NextAuth handlers
│   ├── login/              Login pagina + server action
│   ├── register/           Registreer pagina + server action
│   ├── student/            Alle leerling-routes (layout + sub-routes)
│   │   ├── dashboard/      Hoofdpagina met boom
│   │   ├── competentie/[slug]/  Detail per competentie
│   │   ├── scan/[slug]/    Zelfscan wizard
│   │   ├── bewijs/new/     Bewijs upload formulier
│   │   └── peer/           inbox, new (verzoek), score/[id]
│   ├── teacher/            Alle docent-routes
│   │   ├── dashboard/      Klassenoverzicht
│   │   ├── inbox/          Bewijs te reviewen
│   │   ├── evidence/[id]/  Review-scherm
│   │   └── student/[id]/   Leerling-profiel
│   ├── layout.tsx          Global layout (fonts, CSS)
│   ├── page.tsx            Root redirect op basis van rol
│   └── globals.css         Tailwind + custom components
├── components/
│   ├── Tree.tsx            Data-driven SVG boom
│   └── Sidebar.tsx         Linker navigatie per rol
├── lib/
│   ├── db.ts               Prisma client singleton
│   ├── tree-data.ts        Bereken boom-status uit DB
│   ├── competence-data.ts  Seed-data (9 competenties + indicatoren + tips + badges)
│   └── types.ts            TypeScript declaraties (NextAuth augmentation)
├── prisma/
│   ├── schema.prisma       Datamodel (12 entiteiten)
│   └── seed.ts             Vult competenties, badges, tips, demo-users
├── public/uploads/         Lokale file storage (dev)
├── auth.ts                 NextAuth v5 config
├── middleware.ts           Rol-gebaseerde route protection
└── README.md
```

---

## 🗃️ Datamodel (kort)

- **User** — rol STUDENT of TEACHER, klassenaam, password hash
- **Tree** — XP, streak, één per leerling
- **Competence** — de 9 competenties (geseed)
- **Indicator** — gedrags-indicatoren per competentie per niveau (geseed)
- **SelfScore** — antwoorden op de zelfscan + berekend niveau
- **Evidence** — geüpload bestand of link + reflectie + status (CONCEPT/INGEDIEND/GOEDGEKEURD/AFGEWEZEN)
- **EvidenceLink** — koppelt bewijs aan indicator(en)
- **PeerRequest / PeerScore** — peers vragen om feedback
- **LevelAchievement** — een niveau is behaald wanneer alle indicatoren op dat niveau bewezen zijn
- **Tip** — content per competentie + niveau (TIP / OPDRACHT / CHALLENGE)
- **Badge / UserBadge** — gamification (datamodel klaar, UI nog skeletons)

Volledige schema: zie `prisma/schema.prisma`.

---

## 🔐 Auth

NextAuth v5 (Auth.js) met **Credentials** provider — e-mail + wachtwoord.
Sessies via JWT. Rol komt mee in de session (`session.user.role`).

Middleware (`middleware.ts`) zorgt voor:
- Anoniem → `/login`
- Student → kan niet bij `/teacher/*`
- Teacher → kan niet bij `/student/*`

### Latere toevoegingen (TODO)
- **SSO** via SURFconext / Microsoft / Google for Education
- **Magic-link** voor externe peers zonder account
- **Wachtwoord-reset** flow
- **MFA** voor docenten

---

## 📤 Productie-checklist

Wat moet je doen vóór deployment:

1. **Database**: schakel over naar PostgreSQL
   - `prisma/schema.prisma`: zet `provider = "postgresql"`
   - `DATABASE_URL` in `.env`: `postgresql://user:pass@host:5432/db`
   - Run `npx prisma migrate deploy`

2. **File storage**: vervang lokaal `public/uploads` door S3
   - `app/student/bewijs/new/actions.ts` past file-upload aan
   - Voorgesteld: `@aws-sdk/client-s3` met EU-bucket

3. **Auth**:
   - Genereer veilige `AUTH_SECRET` (`openssl rand -base64 32`)
   - Voeg SSO providers toe in `auth.ts`
   - Zet `AUTH_TRUST_HOST=true` als je achter een proxy zit

4. **Email**: voor peer-notificaties + bewijs-review-meldingen
   - Voorgesteld: Resend of Postmark
   - Trigger vanuit `peer/new/actions.ts` en `evidence/[id]/actions.ts`

5. **Hosting**: Vercel (EU-regio), Cloudflare Pages, of eigen Docker

6. **AVG / privacy**:
   - Verwerkersovereenkomst met de school
   - Cookie-banner als je analytics gebruikt
   - 5 jaar data-retentie + automatisch verwijderen

---

## 🚧 Wat staat nog als TODO in v1

In de code is dit allemaal voorbereid (data-model, routes, types) maar de UI is óf skeleton óf ontbreekt:

- **Gamification UI**: XP wordt al opgeteld bij goedkeuring (+25) en niveau (+100), maar er is nog geen badge-popup of streak-tracker
- **Tips & opdrachten engine**: 17 tips zijn geseed en de competentie-detailpagina toont er 3, maar het slimme selectie-algoritme uit het ontwerpdocument moet nog worden gebouwd
- **Seizoenen-thema's** voor de boom
- **Groepsboom / teamtuin**
- **Ouder/observer rol** (read-only)
- **Magic-link** voor peers zonder account
- **Email notificaties**
- **Animaties** (Framer Motion) — dep is geïnstalleerd maar nog niet gebruikt
- **Tests** (Vitest of Playwright)

---

## 🛠 Scripts

```bash
npm run dev          # Dev server op :3000
npm run build        # Productie-build
npm run start        # Start productie-build
npm run db:push      # Sync schema naar DB (dev)
npm run db:seed      # Seed competenties + demo users
npm run db:reset     # Volledige reset (let op: data weg)
npm run db:studio    # Prisma Studio (GUI voor de DB)
```

---

## 📜 Licentie

Eigendom van de bouwende school. Niet bedoeld voor publieke distributie zonder toestemming.

Concept gebaseerd op de Technasium Competentiemonitor (Stichting Technasium).

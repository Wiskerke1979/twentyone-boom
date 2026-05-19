# 🚀 Deploy guide — De Groeiende Boom live krijgen

Stappenplan om de app van localhost naar een echte URL te krijgen. Gemikt op een schoolpilot in 1 klas.

**Aanbevolen stack:**
- **Vercel** (hosting) — gratis hobby tier, EU regio
- **Neon** (Postgres database) — gratis tier met 500 MB, EU regio (Frankfurt)
- **Resend** (e-mail) — gratis 100 e-mails/dag

Geschatte tijd: 30–45 minuten als alles soepel verloopt.

---

## 0. Voorbereiding

- GitHub-account (gratis)
- Push de codebase naar een GitHub-repo. Tijdelijk privé is prima.
- Heb je nog geen Git? Installeer via [git-scm.com](https://git-scm.com).

```bash
cd twentyone-boom
git init
git add .
git commit -m "initial"
gh repo create twentyone-boom --private --source=. --push
# of via website van GitHub
```

---

## 1. Postgres-database (Neon)

1. Ga naar [neon.tech](https://neon.tech) → sign up (GitHub-login is makkelijkst)
2. Klik **Create project**:
   - Naam: `twentyone-boom`
   - Regio: **Europe (Frankfurt)**
   - Postgres versie: laatste
3. Kopieer de **Connection string** (begint met `postgresql://`). Hou 'm bij.

---

## 2. Pas Prisma schema aan voor Postgres

Open `prisma/schema.prisma`. Wijzig:

```prisma
datasource db {
  provider = "postgresql"   // was: sqlite
  url      = env("DATABASE_URL")
}
```

Test lokaal (optioneel) met de Neon-URL:

```bash
export DATABASE_URL="postgresql://..."     # Mac/Linux
set DATABASE_URL=postgresql://...          # Windows cmd

npm run db:push
npm run db:seed
```

Werkt het? Commit + push naar GitHub.

> **Tip:** als je liever blijft schakelen tussen SQLite lokaal en Postgres prod, voeg dan een `.env.local` toe met `DATABASE_URL="file:./dev.db"` — die is git-ignored.

---

## 3. Resend voor e-mail (optioneel maar aanbevolen)

1. [resend.com](https://resend.com) → sign up
2. **API Keys** → Create API Key → naam: `boom-prod`
3. Kopieer de key (begint met `re_…`)
4. **Domains** → optioneel: voeg een eigen domein toe (anders gebruik je `onboarding@resend.dev` als afzender — werkt maar oogt minder pro)

Voor pilot is `onboarding@resend.dev` prima. Stel `EMAIL_FROM` in als:
```
EMAIL_FROM="De Groeiende Boom <onboarding@resend.dev>"
```

---

## 4. Vercel-deployment

1. [vercel.com](https://vercel.com) → sign up met GitHub
2. **Add New** → **Project** → kies je `twentyone-boom` repo → Import
3. **Framework Preset**: Next.js (automatisch herkend)
4. **Environment Variables** (Settings → Environment Variables):

   | Variabele | Waarde |
   |---|---|
   | `DATABASE_URL` | Neon-URL (zie stap 1) |
   | `AUTH_SECRET` | Genereer: `openssl rand -base64 32` |
   | `AUTH_TRUST_HOST` | `true` |
   | `NEXTAUTH_URL` | bv. `https://twentyone-boom.vercel.app` (vul ná deploy aan) |
   | `RESEND_API_KEY` | Resend key (zie stap 3) — leeg laten = console log |
   | `EMAIL_FROM` | `De Groeiende Boom <onboarding@resend.dev>` |

5. Klik **Deploy**. Eerste build duurt 2–4 minuten.

6. Na deploy: kopieer de URL (`https://twentyone-boom-xyz.vercel.app`) en zet die in `NEXTAUTH_URL`. Redeploy.

---

## 5. Database initialiseren (eenmalig)

De Vercel-deploy maakt de tabellen NIET automatisch aan. Doe dit lokaal:

```bash
# Lokaal met de Neon DATABASE_URL ingesteld:
export DATABASE_URL="postgresql://..."
npx prisma db push        # tabellen aanmaken
npm run db:seed           # competenties + 4 demo-users
```

> **Alternatief:** voeg een one-time GitHub Actions job toe die `db push` runt. Of doe het met `prisma migrate dev` als je echte migrations wil voor toekomstige changes.

---

## 6. Eigen domein (optioneel)

In Vercel **Settings → Domains** → voeg `boom.jouwschool.nl` toe. Vercel toont DNS-records die je moet toevoegen bij je domain-provider. Werkt meestal binnen een uur.

Vergeet niet: update `NEXTAUTH_URL` naar het nieuwe domein.

---

## 7. School-onboarding

Je hebt nu een werkende live URL. Nu de pilot voorbereiden:

### Pre-pilot checklist (1 week ervoor)

- [ ] Admin-account ingesteld (`admin@school.nl` — wachtwoord wijzigen via `/admin/users/<id>` met reset)
- [ ] Klassenlijst voorbereiden in een Excel/Google Sheet, exporteer als CSV met kolommen: `name, email, role, className, password`
- [ ] Bulk-importeren via `/admin/users/import` — krijg de credentials.csv terug
- [ ] Verstuur welkomstmail (gebeurt automatisch als Resend is geconfigureerd) OF deel credentials handmatig
- [ ] Test met 2 echte leerling-accounts: kan ik inloggen, zelfscan doen, bewijs uploaden, peer vragen?

### Eerste dag van de pilot

- [ ] Korte uitleg in de klas (10 min): wat is de boom, hoe doe je een zelfscan, wat is bewijs leveren?
- [ ] Laat leerlingen direct inloggen met de credentials (op telefoon of laptop)
- [ ] Iedere leerling doet 1 zelfscan en levert 1 bewijs in
- [ ] Docent keurt minstens 1 bewijs goed in de les zodat ze de eerste groene bladeren zien

### Eerste week observeren

- [ ] Check `/admin/dashboard` — hoeveel leerlingen zijn ingelogd?
- [ ] Hoeveel bewijs is ingediend? Hoeveel wacht op review?
- [ ] Verzamel feedback van 3-5 leerlingen + de docent

---

## 8. Onderhoud & backups

- **Backups Neon**: gratis tier doet automatische point-in-time recovery (7 dagen). Zet eens per maand een dump apart als je voorzichtig wil zijn.
- **Logs Vercel**: zie `Deployments → ... → Logs` voor errors.
- **Resend logs**: zie of e-mails echt aankomen — bounce-rates checken.

---

## 9. Troubleshooting

**Build faalt op Vercel met Prisma-error**  
Voeg `prisma generate && next build` toe als build command (Settings → Build & Development).

**"Cannot connect to database"**  
Check dat Neon connection string `?sslmode=require` heeft.

**E-mails komen niet aan**  
Check Resend dashboard → Logs. Vaak: spam-filter of geen geverifieerd domein. Voor pilot is `onboarding@resend.dev` oké.

**Bewijs upload werkt niet op productie zonder S3**  
Vercel heeft een **read-only filesystem** — `/public/uploads` werkt niet in productie. Configureer Cloudflare R2 (zie hieronder) en upload-bestanden landen automatisch daar.

---

## 11. Cloudflare R2 voor bewijs-bestanden (productie)

R2 is S3-compatibel, EU-regio, en **gratis** voor 10 GB + geen egress-kosten.

### 11a. R2 bucket aanmaken

1. Maak een [Cloudflare-account](https://dash.cloudflare.com/sign-up)
2. **R2** in de sidebar → **Create bucket**
   - Naam: `twentyone-boom-evidence`
   - Locatie: **Europe (EEUR)**
3. Klik op de bucket → **Settings** → **Public access** → enable als je publieke URLs wil
   - Aanbevolen: alleen via aangemaakte **R2.dev subdomain** (geen eigen domein nodig) OF custom domain
   - Voor pilot: gebruik **R2.dev subdomain** — krijg URL zoals `https://pub-xxxxx.r2.dev`

### 11b. API key aanmaken

1. **R2** → **Manage R2 API Tokens** → **Create API Token**
   - Permissions: **Object Read & Write**
   - Specify bucket: jouw bucket
2. Kopieer **Access Key ID** + **Secret Access Key**
3. Noteer ook de **Endpoint URL** (zie bucket details, ziet er uit als `https://<account-id>.r2.cloudflarestorage.com`)

### 11c. Env vars in Vercel

Voeg toe (Settings → Environment Variables):

| Variabele | Voorbeeld |
|---|---|
| `S3_BUCKET` | `twentyone-boom-evidence` |
| `S3_REGION` | `auto` |
| `S3_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` |
| `S3_ACCESS_KEY_ID` | (uit stap 11b) |
| `S3_SECRET_ACCESS_KEY` | (uit stap 11b) |
| `S3_PUBLIC_URL` | `https://pub-xxxxx.r2.dev` (leeg laten = signed URLs gebruiken) |

### 11d. Test

Redeploy je Vercel-project. Log in als leerling, upload een foto-bewijs. Werkt? 

In de Cloudflare R2 dashboard zie je het bestand verschijnen onder `evidence/`. 

---

## 12. Support-e-mail

Voeg `SUPPORT_EMAIL` env var toe (bv. `coordinator@school.nl`). Vragen verstuurd via de helpknop in de app komen in een dashboard én worden ge-emaild naar dit adres (mits Resend is geconfigureerd).

---

## 10. Wat heeft de pilot opgeleverd?

Na 4-6 weken pilot heb je inzicht in:
- Gebruikspatronen (hoe vaak loggen leerlingen in, wanneer)
- Welke competenties worden het meest gebruikt
- Wat werkt wel/niet aan de UX
- Of docenten genoeg overzicht hebben

Op basis daarvan kun je beslissen: doorgaan naar volledige school-uitrol, of nog een iteratie.

Succes! 🌳

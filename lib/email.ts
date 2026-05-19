/**
 * Lichte e-mail wrapper. Gebruikt Resend als RESEND_API_KEY is gezet,
 * anders logt naar console (geweldig voor dev).
 *
 * Resend wordt dynamisch geïmporteerd — zo werkt de app ook zonder
 * dat de dependency geïnstalleerd is.
 */

const FROM = process.env.EMAIL_FROM || "De Groeiende Boom <noreply@example.com>";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("📧 [DEV — geen RESEND_API_KEY] zou e-mail sturen:");
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   ${text || html.replace(/<[^>]+>/g, "").slice(0, 200)}…`);
    return;
  }

  try {
    // Use REST API via fetch (geen dependency op resend SDK nodig)
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("📧 Resend error:", res.status, body);
    } else {
      console.log(`📧 Verzonden aan ${to}: ${subject}`);
    }
  } catch (err) {
    console.error("📧 Fout bij versturen e-mail:", err);
  }
}

// ----- Templates -----

const wrap = (title: string, body: string, ctaUrl?: string, ctaText?: string) => `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8" /></head>
<body style="background:#FAF7F2;font-family:Georgia,serif;color:#2C2418;margin:0;padding:40px 20px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:40px 32px;border:1px solid #E8E0D3;">
    <div style="font-size:42px;line-height:1;margin-bottom:8px;">🌳</div>
    <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:500;margin:0 0 24px 0;color:#2C2418;">${title}</h1>
    <div style="font-family:-apple-system,sans-serif;font-size:15px;line-height:1.6;color:#3a342a;">
      ${body}
    </div>
    ${ctaUrl
      ? `<div style="margin-top:32px;"><a href="${ctaUrl}" style="display:inline-block;background:#2D5043;color:#FAF7F2;padding:12px 24px;border-radius:6px;text-decoration:none;font-family:-apple-system,sans-serif;font-weight:600;font-size:14px;">${ctaText || "Open"}</a></div>`
      : ""}
    <p style="margin-top:40px;font-size:12px;color:#8B7E6E;font-family:-apple-system,sans-serif;">De Groeiende Boom · Technasium competentie-app</p>
  </div>
</body>
</html>`;

export const templates = {
  passwordReset: (name: string, url: string) => ({
    subject: "Stel je wachtwoord opnieuw in",
    html: wrap(
      `Hoi ${name.split(" ")[0]},`,
      `<p>Iemand (waarschijnlijk jij) heeft gevraagd om je wachtwoord opnieuw in te stellen voor De Groeiende Boom.</p>
       <p>Klik op de knop hieronder om een nieuw wachtwoord te kiezen. De link werkt 1 uur.</p>
       <p style="color:#8B7E6E;font-size:13px;">Was jij dit niet? Negeer dan deze e-mail — je wachtwoord blijft hetzelfde.</p>`,
      url,
      "Kies nieuw wachtwoord"
    ),
    text: `Hoi ${name},\n\nKlik op deze link om een nieuw wachtwoord te kiezen: ${url}\n\nDe link werkt 1 uur. Was jij dit niet? Negeer deze e-mail.`,
  }),

  newAccount: (name: string, email: string, tempPassword: string, loginUrl: string) => ({
    subject: "Welkom bij De Groeiende Boom",
    html: wrap(
      `Welkom, ${name.split(" ")[0]}!`,
      `<p>Er is een account voor je aangemaakt voor De Groeiende Boom — een app waarin je je Technasium-competenties bijhoudt en ziet groeien.</p>
       <p><strong>Je gegevens:</strong></p>
       <ul style="background:#F4EFE6;padding:14px 18px;border-radius:8px;list-style:none;">
         <li><strong>E-mail:</strong> ${email}</li>
         <li><strong>Wachtwoord:</strong> <code style="background:white;padding:2px 6px;border-radius:3px;font-family:monospace;">${tempPassword}</code></li>
       </ul>
       <p>Verander je wachtwoord meteen na de eerste login.</p>`,
      loginUrl,
      "Inloggen"
    ),
    text: `Welkom ${name}!\n\nEr is een account voor je aangemaakt.\n\nE-mail: ${email}\nWachtwoord: ${tempPassword}\n\nLogin op: ${loginUrl}\n\nVerander je wachtwoord na de eerste login.`,
  }),

  peerRequest: (peerName: string, targetName: string, competence: string, url: string) => ({
    subject: `${targetName} vraagt je om peer-feedback`,
    html: wrap(
      `Hoi ${peerName.split(" ")[0]},`,
      `<p><strong>${targetName}</strong> vraagt of je hem/haar wil scoren op de competentie <em>${competence}</em>.</p>
       <p>Het kost ongeveer 90 seconden — 5 stellingen + ruimte voor commentaar.</p>`,
      url,
      "Geef peer-feedback"
    ),
    text: `Hoi ${peerName},\n\n${targetName} vraagt of je hem of haar wil scoren op ${competence}.\n\nGa naar: ${url}`,
  }),

  evidenceApproved: (studentName: string, competence: string, indicators: string[], note: string | null, url: string) => ({
    subject: `Je bewijs voor ${competence} is goedgekeurd 🌿`,
    html: wrap(
      `Hoi ${studentName.split(" ")[0]},`,
      `<p>Je docent heeft je bewijs voor <strong>${competence}</strong> goedgekeurd!</p>
       <p>Bewezen indicatoren:</p>
       <ul>${indicators.map((i) => `<li>${i}</li>`).join("")}</ul>
       ${note ? `<p style="background:#F4EFE6;padding:12px 16px;border-radius:8px;font-style:italic;">"${note}"</p>` : ""}
       <p>Je tak in de boom is bijgewerkt — kijk er even naar! 🌳</p>`,
      url,
      "Bekijk je boom"
    ),
    text: `Hoi ${studentName},\n\nJe bewijs voor ${competence} is goedgekeurd!\n\nBekijk je boom: ${url}`,
  }),

  evidenceRejected: (studentName: string, competence: string, note: string | null, url: string) => ({
    subject: `Je bewijs voor ${competence} is niet goedgekeurd`,
    html: wrap(
      `Hoi ${studentName.split(" ")[0]},`,
      `<p>Je docent heeft je bewijs voor <strong>${competence}</strong> niet goedgekeurd. Geen zorgen — je kunt opnieuw indienen.</p>
       ${note ? `<p style="background:#FBE4E1;padding:12px 16px;border-radius:8px;font-style:italic;">"${note}"</p>` : ""}
       <p>Pak het aan en probeer het opnieuw.</p>`,
      url,
      "Bekijk feedback"
    ),
    text: `Hoi ${studentName},\n\nJe bewijs voor ${competence} is niet goedgekeurd.\n\n${note ? `Opmerking: "${note}"\n\n` : ""}Bekijk en probeer opnieuw: ${url}`,
  }),
};

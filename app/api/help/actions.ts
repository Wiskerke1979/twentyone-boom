"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export async function sendHelpRequest(formData: FormData): Promise<{ error?: string } | void> {
  const session = await auth();
  const message = ((formData.get("message") as string) || "").trim();
  if (message.length < 10) return { error: "Vraag is te kort." };

  const fromName = ((formData.get("fromName") as string) || "").trim() || "Onbekend";
  const fromEmail = ((formData.get("fromEmail") as string) || "").trim();
  const fromRole = ((formData.get("fromRole") as string) || "").trim() || null;

  try {
    await prisma.helpRequest.create({
      data: {
        userId: session?.user?.id || null,
        fromName,
        fromEmail: fromEmail || "anonymous@school.nl",
        fromRole,
        message,
      },
    });
  } catch (err) {
    console.error("HelpRequest create failed:", err);
  }

  // E-mail naar support
  const supportEmail = process.env.SUPPORT_EMAIL;
  if (supportEmail) {
    sendEmail({
      to: supportEmail,
      subject: `Hulpvraag van ${fromName} (${fromRole || "onbekend"})`,
      html: `<p><strong>Van:</strong> ${fromName} &lt;${fromEmail}&gt; (${fromRole || "?"})</p>
             <p><strong>Bericht:</strong></p>
             <pre style="white-space:pre-wrap;background:#f0f0f0;padding:10px;border-radius:6px;">${message}</pre>`,
      text: `Van: ${fromName} <${fromEmail}> (${fromRole || "?"})\n\n${message}`,
    }).catch(() => {});
  } else {
    console.log("📧 Geen SUPPORT_EMAIL ingesteld — hulpvraag genegeerd voor e-mail (wel in DB)");
  }
}

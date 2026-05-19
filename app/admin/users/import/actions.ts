"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { sendEmail, templates } from "@/lib/email";

const VALID_ROLES = new Set(["STUDENT", "TEACHER", "ADMIN"]);

interface PreviewRow {
  rowNumber: number;
  name: string;
  email: string;
  role: string;
  className: string | null;
  password: string;
  status: "create" | "skip" | "error";
  reason?: string;
}

// Minimal CSV parser — handles quoted strings, escapes "" inside quotes.
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === ",") {
        cur.push(field);
        field = "";
      } else if (ch === "\n") {
        cur.push(field);
        rows.push(cur);
        cur = [];
        field = "";
      } else if (ch === "\r") {
        // skip
      } else if (ch === '"' && field === "") {
        inQuotes = true;
      } else {
        field += ch;
      }
    }
  }
  if (field || cur.length) {
    cur.push(field);
    rows.push(cur);
  }
  return rows.filter((r) => r.some((v) => v.trim()));
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pw = "";
  for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

export async function previewImport(csvText: string): Promise<{ rows: PreviewRow[] } | { error: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Niet geautoriseerd" };

  const parsed = parseCSV(csvText.trim());
  if (parsed.length === 0) return { error: "Lege CSV." };

  // Detect header row
  const first = parsed[0].map((v) => v.trim().toLowerCase());
  const expected = ["name", "email", "role", "classname", "password"];
  const hasHeader = expected.some((c) => first.includes(c));
  const headerCols = hasHeader ? first : ["name", "email", "role", "classname", "password"];
  const dataRows = hasHeader ? parsed.slice(1) : parsed;

  const idx = {
    name: headerCols.indexOf("name"),
    email: headerCols.indexOf("email"),
    role: headerCols.indexOf("role"),
    className: headerCols.indexOf("classname"),
    password: headerCols.indexOf("password"),
  };

  if (idx.name === -1 || idx.email === -1) {
    return { error: "Verplichte kolommen 'name' en 'email' niet gevonden." };
  }

  // Verzamel alle e-mails om bestaande te checken
  const emails = dataRows.map((r) => (r[idx.email] || "").trim().toLowerCase()).filter(Boolean);
  const existing = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { email: true },
  });
  const existingSet = new Set(existing.map((u) => u.email));

  const out: PreviewRow[] = [];
  const seenInThisFile = new Set<string>();

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const name = (r[idx.name] || "").trim();
    const email = (r[idx.email] || "").trim().toLowerCase();
    let role = idx.role >= 0 ? (r[idx.role] || "").trim().toUpperCase() : "";
    const className = idx.className >= 0 ? (r[idx.className] || "").trim() : "";
    const password = idx.password >= 0 ? (r[idx.password] || "").trim() : "";

    const row: PreviewRow = {
      rowNumber: i + (hasHeader ? 2 : 1),
      name,
      email,
      role: role || "STUDENT",
      className: className || null,
      password: password || generatePassword(),
      status: "create",
    };

    if (!name) {
      row.status = "error";
      row.reason = "Naam ontbreekt";
    } else if (!email) {
      row.status = "error";
      row.reason = "E-mail ontbreekt";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      row.status = "error";
      row.reason = "Ongeldig e-mailadres";
    } else if (!VALID_ROLES.has(row.role)) {
      row.status = "error";
      row.reason = `Onbekende rol: ${row.role}`;
    } else if (password && password.length < 6) {
      row.status = "error";
      row.reason = "Wachtwoord moet minstens 6 tekens";
    } else if (existingSet.has(email)) {
      row.status = "skip";
      row.reason = "Bestaat al";
    } else if (seenInThisFile.has(email)) {
      row.status = "skip";
      row.reason = "Duplicaat in CSV";
    } else {
      seenInThisFile.add(email);
    }

    out.push(row);
  }

  return { rows: out };
}

export async function commitImport(rows: PreviewRow[]): Promise<{ rows: PreviewRow[] } | { error: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Niet geautoriseerd" };

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const created: PreviewRow[] = [];

  for (const r of rows) {
    if (r.status !== "create") continue;
    try {
      const hash = await bcrypt.hash(r.password, 10);
      const user = await prisma.user.create({
        data: {
          name: r.name,
          email: r.email,
          passwordHash: hash,
          role: r.role,
          className: r.className,
        },
      });
      if (r.role === "STUDENT") {
        await prisma.tree.create({ data: { userId: user.id } });
      }
      created.push(r);

      // Fire-and-forget e-mail (non-blocking on errors)
      const tpl = templates.newAccount(r.name, r.email, r.password, `${baseUrl}/login`);
      sendEmail({ to: r.email, ...tpl }).catch(() => {});
    } catch (err) {
      console.error("Import error:", err);
    }
  }

  return { rows: created };
}

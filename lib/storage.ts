/**
 * Storage abstractie — S3-compatibel (AWS S3 / Cloudflare R2 / MinIO) of lokale fallback.
 *
 * Productie: zet S3_BUCKET + S3_ENDPOINT + S3_ACCESS_KEY_ID + S3_SECRET_ACCESS_KEY env vars.
 * Dev (geen env): files gaan naar /public/uploads.
 */

import { randomBytes } from "crypto";
import path from "path";
import { writeFile, mkdir } from "fs/promises";

const useS3 =
  !!process.env.S3_BUCKET &&
  !!process.env.S3_ACCESS_KEY_ID &&
  !!process.env.S3_SECRET_ACCESS_KEY;

let s3Client: any = null;
async function getS3() {
  if (!useS3) return null;
  if (s3Client) return s3Client;
  const { S3Client } = await import("@aws-sdk/client-s3");
  s3Client = new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });
  return s3Client;
}

/**
 * Upload een bestand. Returns {fileUrl, key}.
 * - In S3-mode: returnt direct een gebruiksbare URL (signed of public)
 * - In local-mode: returnt /uploads/...
 */
export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  contentType: string
): Promise<{ fileUrl: string; key: string }> {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const hash = randomBytes(8).toString("hex");
  const key = `evidence/${Date.now()}-${hash}-${safeName}`;

  if (useS3) {
    const client = await getS3();
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    // Twee opties: public CDN URL of een signed-URL marker (s3://key)
    if (process.env.S3_PUBLIC_URL) {
      return {
        fileUrl: `${process.env.S3_PUBLIC_URL.replace(/\/$/, "")}/${key}`,
        key,
      };
    }
    // Geen public URL: bewaar als 's3://key' en haal signed URL on-the-fly op
    return { fileUrl: `s3://${key}`, key };
  }

  // Local fallback
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, `${Date.now()}-${hash}-${safeName}`);
  await writeFile(filePath, buffer);
  return {
    fileUrl: `/uploads/${path.basename(filePath)}`,
    key: path.basename(filePath),
  };
}

/**
 * Vertaal een opgeslagen fileUrl naar een echte URL die je in een <img>/<a> kan stoppen.
 * Voor s3:// prefixen genereert dit een 1-uur geldige signed URL.
 */
export async function resolveFileUrl(storedUrl: string): Promise<string> {
  if (!storedUrl) return storedUrl;
  if (!storedUrl.startsWith("s3://")) return storedUrl;

  const key = storedUrl.replace(/^s3:\/\//, "");
  const client = await getS3();
  if (!client) return storedUrl; // shouldn't happen but fallback
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
  return getSignedUrl(client, new GetObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
  }), { expiresIn: 3600 });
}

export function storageMode(): "s3" | "local" {
  return useS3 ? "s3" : "local";
}

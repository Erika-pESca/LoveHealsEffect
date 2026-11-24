import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, SessionPayload, verifySessionToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const MAX_DOC_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_DOC_MIME_MAP: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export function getSessionFromRequest(req: NextRequest): SessionPayload | null {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function getUploadsDir(fichaId: number | string): string {
  return path.join(process.cwd(), "uploads", "documentos", String(fichaId));
}

export function getMimeTypeFromFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_DOC_MIME_MAP[ext] || "application/octet-stream";
}

export function isAllowedDocumentFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return Boolean(ALLOWED_DOC_MIME_MAP[ext]);
}

function sanitizeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const base = path
    .basename(originalName, ext)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "documento"}${ext}`;
}

export async function resolveUserFichaId(session: SessionPayload): Promise<number | null> {
  if (session.rol === "paciente") {
    const { data } = await supabaseAdmin
      .from("ficha_paciente")
      .select("id")
      .eq("paciente_usuario_id", session.userId)
      .maybeSingle();
    return data?.id ?? null;
  }

  if (session.rol === "cuidador") {
    const { data } = await supabaseAdmin
      .from("ficha_paciente")
      .select("id")
      .eq("cuidador_usuario_id", session.userId)
      .maybeSingle();
    return data?.id ?? null;
  }

  return session.fichaPacienteId ?? null;
}

export async function canAccessFichaDocument(
  session: SessionPayload,
  fichaId: number
): Promise<boolean> {
  if (session.rol === "admin" || session.rol === "sanador") {
    return true;
  }
  const ownFichaId = await resolveUserFichaId(session);
  return ownFichaId === fichaId;
}

export async function saveLocalDocument(
  fichaId: number,
  file: File
): Promise<{
  archivoNombre: string;
  archivoStorageName: string;
  archivoRuta: string;
  mimeType: string;
  sizeBytes: number;
}> {
  if (!isAllowedDocumentFile(file.name)) {
    throw new Error(
      "Formato no permitido. Usa PDF, Word (.doc, .docx) o imagen (.jpg, .png, .webp)."
    );
  }

  if (file.size <= 0 || file.size > MAX_DOC_SIZE_BYTES) {
    throw new Error("El archivo debe pesar entre 1 byte y 10 MB.");
  }

  const safeName = sanitizeFilename(file.name);
  const uniquePrefix = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const storageName = `${uniquePrefix}-${safeName}`;

  const dir = getUploadsDir(fichaId);
  await fs.mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, storageName), buffer);

  return {
    archivoNombre: file.name,
    archivoStorageName: storageName,
    archivoRuta: `/api/documentos/${fichaId}/${encodeURIComponent(storageName)}`,
    mimeType: file.type || getMimeTypeFromFilename(file.name),
    sizeBytes: file.size,
  };
}

export async function deleteLocalDocument(
  fichaId: number,
  archivoStorageName?: string
): Promise<void> {
  if (!archivoStorageName) return;
  const safeStorageName = path.basename(archivoStorageName);
  const fullPath = path.join(getUploadsDir(fichaId), safeStorageName);
  try {
    await fs.unlink(fullPath);
  } catch (err: any) {
    if (err?.code !== "ENOENT") {
      console.error("Error deleting local document:", err);
    }
  }
}

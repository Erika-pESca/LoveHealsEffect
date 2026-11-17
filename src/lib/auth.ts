import crypto from "crypto";
import bcrypt from "bcryptjs";
import type { RolUsuario } from "@/types/database";

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  "love-heals-effect-default-secret-change-in-production-2026";

export interface SessionPayload {
  userId: number;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  fichaPacienteId?: number;
  exp: number;
}

export interface InvitationTokenPayload {
  type: "invitation";
  fichaId: number;
  targetEmail: string;
  targetRole: "paciente" | "cuidador";
  inviterName: string;
  exp: number;
}

export interface PasswordResetTokenPayload {
  type: "reset_password";
  userId: number;
  correo: string;
  exp: number;
}

export type ActionTokenPayload =
  | InvitationTokenPayload
  | PasswordResetTokenPayload;

/**
 * Genera hash seguro de contraseña usando bcryptjs.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compara contraseña ingresada con el hash almacenado.
 */
export async function comparePassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Firma digitalmente un token HMAC-SHA256 con AUTH_SECRET.
 */
function signToken(data: unknown): string {
  const json = JSON.stringify(data);
  const payloadBase64 = Buffer.from(json).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payloadBase64)
    .digest("base64url");
  return `${payloadBase64}.${signature}`;
}

/**
 * Verifica la firma y expiración de un token firmado.
 */
function verifyToken<T extends { exp: number }>(token: string): T | null {
  try {
    const [payloadBase64, signature] = token.split(".");
    if (!payloadBase64 || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(payloadBase64)
      .digest("base64url");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(payloadBase64, "base64url").toString("utf-8")
    ) as T;

    if (Date.now() > payload.exp) {
      return null; // Token expirado
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Crea una sesión de usuario válida por 7 días.
 */
export function createSessionToken(
  user: Omit<SessionPayload, "exp">
): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 días
  return signToken({ ...user, exp });
}

/**
 * Verifica y extrae la sesión desde la cookie.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  return verifyToken<SessionPayload>(token);
}

/**
 * Crea un token para invitación de Cuidador o Paciente (válido por 14 días).
 */
export function createInvitationToken(data: {
  fichaId: number;
  targetEmail: string;
  targetRole: "paciente" | "cuidador";
  inviterName: string;
}): string {
  const exp = Date.now() + 14 * 24 * 60 * 60 * 1000; // 14 días
  return signToken({
    type: "invitation",
    ...data,
    exp,
  });
}

/**
 * Verifica un token de invitación.
 */
export function verifyInvitationToken(
  token: string
): InvitationTokenPayload | null {
  const payload = verifyToken<InvitationTokenPayload>(token);
  if (payload && payload.type === "invitation") {
    return payload;
  }
  return null;
}

/**
 * Crea un token de recuperación de contraseña (válido por 1 hora).
 */
export function createPasswordResetToken(data: {
  userId: number;
  correo: string;
}): string {
  const exp = Date.now() + 60 * 60 * 1000; // 1 hora
  return signToken({
    type: "reset_password",
    ...data,
    exp,
  });
}

/**
 * Verifica un token de recuperación de contraseña.
 */
export function verifyPasswordResetToken(
  token: string
): PasswordResetTokenPayload | null {
  const payload = verifyToken<PasswordResetTokenPayload>(token);
  if (payload && payload.type === "reset_password") {
    return payload;
  }
  return null;
}

/**
 * Opciones para la cookie de sesión HTTP-Only.
 */
export const SESSION_COOKIE_NAME = "lhe_session";

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 días en segundos
  };
}

import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "lhe_session";
const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  "love-heals-effect-default-secret-change-in-production-2026";

interface EdgeSessionPayload {
  userId: number;
  nombre: string;
  correo: string;
  rol: "paciente" | "cuidador" | "sanador" | "admin";
  fichaPacienteId?: number;
  exp: number;
}

const ROLE_HOME_PATHS: Record<EdgeSessionPayload["rol"], string> = {
  paciente: "/paciente",
  cuidador: "/cuidador",
  sanador: "/sanador",
  admin: "/admin",
};

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLength);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function verifySessionTokenEdge(
  token: string
): Promise<EdgeSessionPayload | null> {
  try {
    const [payloadBase64, signature] = token.split(".");
    if (!payloadBase64 || !signature) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(AUTH_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBytes = base64UrlToUint8Array(signature);
    const dataBytes = encoder.encode(payloadBase64);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as BufferSource,
      dataBytes
    );

    if (!isValid) return null;

    const decodedJson = new TextDecoder().decode(
      base64UrlToUint8Array(payloadBase64)
    );
    const payload = JSON.parse(decodedJson) as EdgeSessionPayload;

    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  // Permitir acceso y navegación libre e inmediata a todos los paneles
  // (/paciente, /cuidador, /sanador, /admin) sin bloquear por sesión ni por rol
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/paciente/:path*",
    "/cuidador/:path*",
    "/sanador/:path*",
    "/admin/:path*",
    "/auth/login",
    "/auth/registro",
  ],
};


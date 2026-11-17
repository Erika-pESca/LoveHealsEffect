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
  const { pathname, searchParams } = req.nextUrl;

  const isPanelRoute =
    pathname.startsWith("/paciente") ||
    pathname.startsWith("/cuidador") ||
    pathname.startsWith("/sanador") ||
    pathname.startsWith("/admin");

  const isAuthRoute =
    pathname.startsWith("/auth/login") || pathname.startsWith("/auth/registro");

  if (!isPanelRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  const session = cookie?.value
    ? await verifySessionTokenEdge(cookie.value)
    : null;

  // 1. Si intenta entrar a un panel sin sesión válida ->
  // En producción redirigimos a /auth/login; en desarrollo permitimos previsualizar directamente por URL
  if (isPanelRoute && !session) {
    if (process.env.NODE_ENV === "production") {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Si tiene sesión activa e intenta entrar al panel de otro rol -> Redirigir a su propio panel
  // (El rol 'admin' puede supervisar o entrar a su propio panel /admin)
  if (isPanelRoute && session) {
    const allowedPrefix = ROLE_HOME_PATHS[session.rol] || "/paciente";
    if (session.rol !== "admin" && !pathname.startsWith(allowedPrefix)) {
      return NextResponse.redirect(new URL(allowedPrefix, req.url));
    }
  }

  // 3. Si ya inició sesión y entra a /auth/login o /auth/registro (sin token de invitación) -> Enviar a su panel
  if (isAuthRoute && session && !searchParams.get("token")) {
    const targetPanel = ROLE_HOME_PATHS[session.rol] || "/paciente";
    return NextResponse.redirect(new URL(targetPanel, req.url));
  }

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


import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createPasswordResetToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { validateEmail } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Ingresa tu correo electrónico" },
        { status: 400 }
      );
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json({ ok: false, error: emailCheck.error }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Buscar usuario
    const { data: user } = await supabaseAdmin
      .from("usuarios")
      .select("id, nombre, correo")
      .eq("correo", cleanEmail)
      .maybeSingle();

    // Por seguridad, si el correo no existe, no lo revelamos al atacante pero respondemos OK
    if (!user) {
      return NextResponse.json({
        ok: true,
        message:
          "Si el correo está registrado en la plataforma, recibirás un mensaje con las instrucciones de recuperación.",
      });
    }

    // 2. Generar token de recuperación firmado (válido por 1 hora)
    const token = createPasswordResetToken({
      userId: user.id,
      correo: user.correo,
    });

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const resetLink = `${origin}/auth/recuperar-password?token=${token}`;

    // 3. Enviar correo directo (sin Supabase)
    const result = await sendPasswordResetEmail({
      userName: user.nombre,
      userEmail: user.correo,
      resetLink,
    });

    return NextResponse.json({
      ok: true,
      message:
        "Te hemos enviado un correo electrónico con el enlace para restablecer tu contraseña.",
      previewUrl: result.previewUrl,
    });
  } catch (error) {
    console.error("Error en /api/auth/forgot-password:", error);
    return NextResponse.json(
      { ok: false, error: "Error procesando la solicitud" },
      { status: 500 }
    );
  }
}

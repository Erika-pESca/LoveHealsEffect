import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyPasswordResetToken, hashPassword } from "@/lib/auth";
import { validatePassword } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { ok: false, error: "Datos incompletos para restablecer contraseña" },
        { status: 400 }
      );
    }

    const passCheck = validatePassword(newPassword);
    if (!passCheck.valid) {
      return NextResponse.json({ ok: false, error: passCheck.error }, { status: 400 });
    }

    // 1. Verificar validez y firma del token
    const payload = verifyPasswordResetToken(token);
    if (!payload) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.",
        },
        { status: 400 }
      );
    }

    // 2. Hashear nueva contraseña
    const passwordHash = await hashPassword(newPassword);

    // 3. Actualizar en Supabase
    const { error: updateErr } = await supabaseAdmin
      .from("usuarios")
      .update({ password_hash: passwordHash })
      .eq("id", payload.userId);

    if (updateErr) {
      return NextResponse.json(
        { ok: false, error: "Error al actualizar la contraseña" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión.",
    });
  } catch (error) {
    console.error("Error en /api/auth/reset-password:", error);
    return NextResponse.json(
      { ok: false, error: "Error del servidor" },
      { status: 500 }
    );
  }
}

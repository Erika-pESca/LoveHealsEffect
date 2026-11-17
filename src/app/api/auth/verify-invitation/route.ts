import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyInvitationToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Token no proporcionado" },
        { status: 400 }
      );
    }

    const payload = verifyInvitationToken(token);
    if (!payload) {
      return NextResponse.json(
        {
          ok: false,
          error: "La invitación es inválida o ha expirado.",
        },
        { status: 400 }
      );
    }

    // Traer datos de la ficha médica asociada
    const { data: ficha } = await supabaseAdmin
      .from("ficha_paciente")
      .select("id, nombre_paciente, etapa_actual, registrado_por")
      .eq("id", payload.fichaId)
      .maybeSingle();

    return NextResponse.json({
      ok: true,
      invitation: {
        fichaId: payload.fichaId,
        targetEmail: payload.targetEmail,
        targetRole: payload.targetRole,
        inviterName: payload.inviterName,
        patientName: ficha?.nombre_paciente || payload.inviterName,
        stage: ficha?.etapa_actual || "diagnostico",
      },
    });
  } catch (error) {
    console.error("Error en /api/auth/verify-invitation:", error);
    return NextResponse.json({ ok: false, error: "Error del servidor" }, { status: 500 });
  }
}

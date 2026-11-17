import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const cookie = req.cookies.get(SESSION_COOKIE_NAME);
    if (!cookie?.value) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const session = verifySessionToken(cookie.value);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // Traer información actualizada de la base de datos
    const { data: user } = await supabaseAdmin
      .from("usuarios")
      .select("id, nombre, correo, telefono, rol, nivel_suscripcion, idioma_preferido, estado")
      .eq("id", session.userId)
      .maybeSingle();

    if (!user || user.estado !== "activo") {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // Buscar información de la relación / ficha médica
    let relationInfo: {
      hasPartner: boolean;
      partnerName: string | null;
      partnerEmail: string | null;
      relationship: string | null;
      stage: string | null;
      status: string;
      fichaId: number | null;
    } = {
      hasPartner: false,
      partnerName: null,
      partnerEmail: null,
      relationship: null,
      stage: null,
      status: "sin_vincular",
      fichaId: null,
    };

    if (user.rol === "paciente") {
      const { data: ficha } = await supabaseAdmin
        .from("ficha_paciente")
        .select("id, cuidador_usuario_id, correo_invitacion_cuidador, etapa_actual")
        .eq("paciente_usuario_id", user.id)
        .maybeSingle();

      if (ficha) {
        relationInfo.fichaId = ficha.id;
        relationInfo.stage = ficha.etapa_actual;
        if (ficha.cuidador_usuario_id) {
          const { data: cuidador } = await supabaseAdmin
            .from("usuarios")
            .select("nombre, correo")
            .eq("id", ficha.cuidador_usuario_id)
            .maybeSingle();
          if (cuidador) {
            relationInfo.hasPartner = true;
            relationInfo.partnerName = cuidador.nombre;
            relationInfo.partnerEmail = cuidador.correo;
            relationInfo.status = "vinculado";
          }
        } else if (ficha.correo_invitacion_cuidador) {
          relationInfo.partnerEmail = ficha.correo_invitacion_cuidador;
          relationInfo.status = "invitacion_pendiente";
        }
      }
    } else if (user.rol === "cuidador") {
      const { data: ficha } = await supabaseAdmin
        .from("ficha_paciente")
        .select("id, paciente_usuario_id, nombre_paciente, correo_invitacion_paciente, etapa_actual")
        .eq("cuidador_usuario_id", user.id)
        .maybeSingle();

      if (ficha) {
        relationInfo.fichaId = ficha.id;
        relationInfo.stage = ficha.etapa_actual;
        relationInfo.partnerName = ficha.nombre_paciente;

        if (ficha.paciente_usuario_id) {
          relationInfo.hasPartner = true;
          relationInfo.status = "vinculado";
          const { data: pac } = await supabaseAdmin
            .from("usuarios")
            .select("correo")
            .eq("id", ficha.paciente_usuario_id)
            .maybeSingle();
          if (pac) relationInfo.partnerEmail = pac.correo;
        } else {
          relationInfo.partnerEmail = ficha.correo_invitacion_paciente || null;
          relationInfo.status = "invitacion_pendiente";
        }

        const { data: fc } = await supabaseAdmin
          .from("ficha_cuidador")
          .select("relacion_familiar")
          .eq("ficha_paciente_id", ficha.id)
          .maybeSingle();
        if (fc) relationInfo.relationship = fc.relacion_familiar;
      }
    }

    return NextResponse.json({
      authenticated: true,
      user,
      relation: relationInfo,
    });
  } catch (error) {
    console.error("Error en /api/auth/session:", error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { generatePonoExecutiveSummary } from "@/lib/gemini";

async function resolveHealerUser(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  const session = cookie?.value ? verifySessionToken(cookie.value) : null;

  let user: any = null;
  if (session?.userId) {
    const { data } = await supabaseAdmin
      .from("usuarios")
      .select(
        "id, nombre, correo, telefono, rol, nivel_suscripcion, idioma_preferido, estado"
      )
      .eq("id", session.userId)
      .maybeSingle();
    if (data && (data.rol === "sanador" || data.rol === "admin")) {
      user = data;
    }
  }

  if (!user) {
    const { data: firstHealer } = await supabaseAdmin
      .from("usuarios")
      .select(
        "id, nombre, correo, telefono, rol, nivel_suscripcion, idioma_preferido, estado"
      )
      .eq("rol", "sanador")
      .maybeSingle();

    user = firstHealer || {
      id: 3,
      nombre: "Omar Melero & Kelsie Reynolds",
      correo: "sanador@loveheals.com",
      telefono: "8085550103",
      rol: "sanador",
      nivel_suscripcion: "pagada",
      idioma_preferido: "es",
      estado: "activo",
    };
  }

  return user;
}

export async function GET(req: NextRequest) {
  try {
    const user = await resolveHealerUser(req);

    const { data: allUsersData } = await supabaseAdmin
      .from("usuarios")
      .select("id, nombre, correo, rol");
    const allUsers = Array.isArray(allUsersData) ? allUsersData : [];

    const { data: fichasData } = await supabaseAdmin
      .from("ficha_paciente")
      .select("*");
    const fichasRaw = Array.isArray(fichasData) ? fichasData : [];

    const { data: sessionsData } = await supabaseAdmin
      .from("citas_y_bitacora_sanador")
      .select("*");
    const allSessions = Array.isArray(sessionsData) ? sessionsData : [];

    const { data: contentsData } = await supabaseAdmin
      .from("sanadores_y_contenidos")
      .select("*");
    const allContents = Array.isArray(contentsData) ? contentsData : [];

    const { data: ticketsData } = await supabaseAdmin
      .from("tickets_feedback")
      .select("*")
      .eq("usuario_id", user.id);
    const tickets = Array.isArray(ticketsData) ? ticketsData : [];

    // Enriquecer cada ficha_paciente con el nombre de su cuidador y su historial de sesiones
    const fichas = await Promise.all(
      fichasRaw.map(async (f) => {
        const caregiverUser = f.cuidador_usuario_id
          ? allUsers.find((u) => u.id === f.cuidador_usuario_id)
          : null;
        const patientSessions = allSessions.filter(
          (s) => s.ficha_paciente_id === f.id
        );

        let resumenIa = f.resumen_ia_pono || "";
        if (!resumenIa) {
          const generated = await generatePonoExecutiveSummary({
            ficha: f,
            bitacoras: patientSessions,
            caregiverName: caregiverUser?.nombre || null,
          });
          resumenIa = generated.summary;
        }

        return {
          ...f,
          caregiverName: caregiverUser?.nombre || null,
          caregiverEmail:
            caregiverUser?.correo || f.correo_invitacion_cuidador || null,
          resumen_ia_pono: resumenIa,
          suplementos: Array.isArray(f.suplementos) ? f.suplementos : [],
          medicamentos_y_horarios: Array.isArray(f.medicamentos_y_horarios)
            ? f.medicamentos_y_horarios
            : [],
          citas_medicas: Array.isArray(f.citas_medicas) ? f.citas_medicas : [],
          documentos_oncologo: Array.isArray(f.documentos_oncologo)
            ? f.documentos_oncologo
            : [],
          sessions: patientSessions,
        };
      })
    );

    const healerProfiles = allContents.filter(
      (c) => c.tipo_registro === "perfil_sanador"
    );
    const publishedItems = allContents.filter(
      (c) => c.tipo_registro === "contenido" || c.tipo_registro === "workshop"
    );

    return NextResponse.json({
      ok: true,
      user,
      fichas,
      sessions: allSessions,
      healerProfiles,
      publishedItems,
      tickets,
    });
  } catch (error) {
    console.error("Error en GET /api/sanador/dashboard:", error);
    return NextResponse.json(
      { ok: false, error: "Error cargando el portal del sanador" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;
    const user = await resolveHealerUser(req);

    // 1. Guardar Bitácora Post-Sesión + Transcripción y actualizar PONO IA
    if (action === "save_post_session_log") {
      const fichaId = Number(payload.ficha_paciente_id || 1);
      const sessionId = payload.session_id ? Number(payload.session_id) : null;

      if (sessionId) {
        await supabaseAdmin
          .from("citas_y_bitacora_sanador")
          .update({
            estado_cita: "completada",
            estado_observado_paciente: payload.estado_observado_paciente || "",
            patrones_detectados: payload.patrones_detectados || "",
            recomendaciones_dadas: payload.recomendaciones_dadas || "",
            archivo_adjunto_url: payload.archivo_adjunto_url || "",
            transcripcion_o_notas: payload.transcripcion_o_notas || "",
          })
          .eq("id", sessionId);
      } else {
        await supabaseAdmin.from("citas_y_bitacora_sanador").insert({
          ficha_paciente_id: fichaId,
          sanador_usuario_id: user.id,
          reservado_por_usuario_id: user.id,
          asistente_rol: payload.asistente_rol || "paciente",
          modalidad: payload.modalidad || "online",
          fecha_sesion: new Date().toISOString(),
          es_sesion_gratuita_mensual: false,
          enlace_o_lugar:
            payload.enlace_o_lugar ||
            "Bitácora de Sesión · Omar & Kelsie",
          estado_cita: "completada",
          estado_observado_paciente: payload.estado_observado_paciente || "",
          patrones_detectados: payload.patrones_detectados || "",
          recomendaciones_dadas: payload.recomendaciones_dadas || "",
          archivo_adjunto_url: payload.archivo_adjunto_url || "",
          transcripcion_o_notas: payload.transcripcion_o_notas || "",
        });
      }

      // Regenerar inmediatamente el Resumen Ejecutivo PONO IA con la nueva bitácora
      const { data: ficha } = await supabaseAdmin
        .from("ficha_paciente")
        .select("*")
        .eq("id", fichaId)
        .maybeSingle();

      const { data: logs } = await supabaseAdmin
        .from("citas_y_bitacora_sanador")
        .select("*")
        .eq("ficha_paciente_id", fichaId);

      if (ficha) {
        const generated = await generatePonoExecutiveSummary({
          ficha,
          bitacoras: Array.isArray(logs) ? logs : [],
        });

        await supabaseAdmin
          .from("ficha_paciente")
          .update({
            resumen_ia_pono: generated.summary,
            resumen_ia_actualizado_en: new Date().toISOString(),
          })
          .eq("id", fichaId);
      }

      return NextResponse.json({ ok: true });
    }

    // 2. Regenerar Resumen Ejecutivo de PONO IA bajo demanda
    if (action === "regenerate_pono_summary") {
      const fichaId = Number(payload.ficha_paciente_id || 1);
      const { data: ficha } = await supabaseAdmin
        .from("ficha_paciente")
        .select("*")
        .eq("id", fichaId)
        .maybeSingle();

      const { data: logs } = await supabaseAdmin
        .from("citas_y_bitacora_sanador")
        .select("*")
        .eq("ficha_paciente_id", fichaId);

      if (!ficha) {
        return NextResponse.json(
          { ok: false, error: "Ficha no encontrada" },
          { status: 404 }
        );
      }

      const generated = await generatePonoExecutiveSummary({
        ficha,
        bitacoras: Array.isArray(logs) ? logs : [],
      });

      await supabaseAdmin
        .from("ficha_paciente")
        .update({
          resumen_ia_pono: generated.summary,
          resumen_ia_actualizado_en: new Date().toISOString(),
        })
        .eq("id", fichaId);

      return NextResponse.json({
        ok: true,
        summary: generated.summary,
        source: generated.source,
      });
    }

    // 3. Publicar nuevo contenido gratuito o Workshop (con validación anti-cruce de horario)
    if (action === "create_content") {
      const isWorkshop =
        payload.tipo_contenido === "workshop" ||
        payload.tipo_contenido === "love_circle";

      if (isWorkshop && payload.fecha_evento) {
        const { data: existingContents } = await supabaseAdmin
          .from("sanadores_y_contenidos")
          .select("*");

        const rows = Array.isArray(existingContents) ? existingContents : [];
        const targetDateHour = String(payload.fecha_evento).slice(0, 13);

        const conflict = rows.find(
          (r) =>
            r.fecha_evento &&
            String(r.fecha_evento).slice(0, 13) === targetDateHour
        );

        if (conflict) {
          return NextResponse.json(
            {
              ok: false,
              error: `Conflicto de horario: Ya existe el evento "${conflict.titulo_es}" programado en esa misma fecha y hora.`,
            },
            { status: 409 }
          );
        }
      }

      await supabaseAdmin.from("sanadores_y_contenidos").insert({
        sanador_usuario_id: user.id,
        tipo_registro: isWorkshop ? "workshop" : "contenido",
        tipo_contenido: payload.tipo_contenido || "video_bam",
        titulo_es: payload.titulo_es,
        titulo_en: payload.titulo_en || payload.titulo_es,
        descripcion_es: payload.descripcion_es || "",
        descripcion_en: payload.descripcion_en || payload.descripcion_es || "",
        media_url: payload.media_url || "",
        fecha_evento: payload.fecha_evento || null,
        publico_objetivo: payload.publico_objetivo || "ambos",
        es_gratuito: payload.es_gratuito !== false,
        estado: "activo",
      });

      return NextResponse.json({ ok: true });
    }

    if (action === "delete_content") {
      await supabaseAdmin
        .from("sanadores_y_contenidos")
        .delete()
        .eq("id", Number(payload.id));

      return NextResponse.json({ ok: true });
    }

    // 4. Cambiar estado de una reserva
    if (action === "update_session_status") {
      await supabaseAdmin
        .from("citas_y_bitacora_sanador")
        .update({ estado_cita: payload.estado_cita })
        .eq("id", Number(payload.session_id));

      return NextResponse.json({ ok: true });
    }

    // 5. Actualizar Ficha Profesional del Sanador (Short Bio, Tarifa, Modalidades)
    if (action === "update_healer_profile") {
      const profileId = Number(payload.id || 1);
      await supabaseAdmin
        .from("sanadores_y_contenidos")
        .update({
          especialidad: payload.especialidad,
          short_bio_es: payload.short_bio_es,
          short_bio_en: payload.short_bio_en,
          tarifa_hora_usd: Number(payload.tarifa_hora_usd || 85),
          modalidades: payload.modalidades || "ambas",
          disponibilidad_horaria: payload.disponibilidad_horaria || {
            dias: "Lunes a Viernes",
            horas: "9:00 AM - 5:00 PM HST",
          },
        })
        .eq("id", profileId);

      return NextResponse.json({ ok: true });
    }

    if (action === "create_ticket") {
      await supabaseAdmin.from("tickets_feedback").insert({
        usuario_id: user.id,
        rol_usuario: "sanador",
        tipo: payload.tipo || "feedback",
        asunto: payload.asunto,
        descripcion: payload.descripcion,
        estado: "abierto",
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { ok: false, error: "Acción no reconocida" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error en PATCH /api/sanador/dashboard:", error);
    return NextResponse.json(
      { ok: false, error: "Error guardando cambios del sanador" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  hashPassword,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth";
import { generatePonoExecutiveSummary } from "@/lib/gemini";

async function resolveAdminUser(req: NextRequest) {
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
    if (data) user = data;
  }

  if (!user) {
    const { data: adminRow } = await supabaseAdmin
      .from("usuarios")
      .select(
        "id, nombre, correo, telefono, rol, nivel_suscripcion, idioma_preferido, estado"
      )
      .eq("rol", "admin")
      .maybeSingle();

    user = adminRow || {
      id: 4,
      nombre: "Omar, Kelsie & Erika (Admin)",
      correo: "admin@loveheals.com",
      telefono: "8085550104",
      rol: "admin",
      nivel_suscripcion: "pagada",
      idioma_preferido: "es",
      estado: "activo",
    };
  }

  return user;
}

export async function GET(req: NextRequest) {
  try {
    const adminUser = await resolveAdminUser(req);

    const { data: usersData } = await supabaseAdmin
      .from("usuarios")
      .select(
        "id, nombre, correo, telefono, rol, nivel_suscripcion, idioma_preferido, estado, creado_en"
      );
    const users = Array.isArray(usersData) ? usersData : [];

    const { data: fichasData } = await supabaseAdmin
      .from("ficha_paciente")
      .select("*");
    const fichasRaw = Array.isArray(fichasData) ? fichasData : [];

    const { data: cuidadoresData } = await supabaseAdmin
      .from("ficha_cuidador")
      .select("*");
    const fichasCuidador = Array.isArray(cuidadoresData) ? cuidadoresData : [];

    const { data: contentsData } = await supabaseAdmin
      .from("sanadores_y_contenidos")
      .select("*");
    const contents = Array.isArray(contentsData) ? contentsData : [];

    const { data: sessionsData } = await supabaseAdmin
      .from("citas_y_bitacora_sanador")
      .select("*");
    const sessions = Array.isArray(sessionsData) ? sessionsData : [];

    const { data: paymentsData } = await supabaseAdmin
      .from("pagos_y_suscripciones")
      .select("*");
    const payments = Array.isArray(paymentsData) ? paymentsData : [];

    const { data: ticketsData } = await supabaseAdmin
      .from("tickets_feedback")
      .select("*");
    const tickets = Array.isArray(ticketsData) ? ticketsData : [];

    const familyCells = fichasRaw.map((f) => {
      const patientUser = f.paciente_usuario_id
        ? users.find((u) => u.id === f.paciente_usuario_id)
        : null;
      const caregiverUser = f.cuidador_usuario_id
        ? users.find((u) => u.id === f.cuidador_usuario_id)
        : null;
      const fc = fichasCuidador.find((c) => c.ficha_paciente_id === f.id);
      const patientSessions = sessions.filter(
        (s) => s.ficha_paciente_id === f.id
      );

      return {
        ...f,
        patientUser,
        caregiverUser,
        relacion_familiar: fc?.relacion_familiar || "Pendiente",
        estado_vinculo:
          f.paciente_usuario_id && f.cuidador_usuario_id
            ? "vinculado"
            : "pendiente",
        sessionsCount: patientSessions.length,
      };
    });

    const metrics = {
      totalUsers: users.length,
      totalPatients: users.filter((u) => u.rol === "paciente").length,
      totalCaregivers: users.filter((u) => u.rol === "cuidador").length,
      totalHealers: users.filter((u) => u.rol === "sanador").length,
      totalFamilies: familyCells.length,
      linkedFamilies: familyCells.filter((f) => f.estado_vinculo === "vinculado")
        .length,
      paidUsers: users.filter((u) => u.nivel_suscripcion === "pagada").length,
      totalSessions: sessions.length,
      openTickets: tickets.filter((t) => t.estado !== "resuelto").length,
    };

    return NextResponse.json({
      ok: true,
      adminUser,
      metrics,
      users,
      familyCells,
      contents,
      sessions,
      payments,
      tickets,
    });
  } catch (error) {
    console.error("Error en GET /api/admin/dashboard:", error);
    return NextResponse.json(
      { ok: false, error: "Error cargando el panel de administración" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;
    const adminUser = await resolveAdminUser(req);

    // 1. Cambiar nivel de suscripción ('gratuita' | 'pagada'), rol o estado de un usuario
    if (action === "update_user_access") {
      const updates: Record<string, any> = {};
      if (payload.nivel_suscripcion)
        updates.nivel_suscripcion = payload.nivel_suscripcion;
      if (payload.rol) updates.rol = payload.rol;
      if (payload.estado) updates.estado = payload.estado;

      await supabaseAdmin
        .from("usuarios")
        .update(updates)
        .eq("id", Number(payload.userId));

      // Si se activa suscripción pagada ($10 USD/mes), registrar en pagos_y_suscripciones
      if (payload.nivel_suscripcion === "pagada") {
        await supabaseAdmin.from("pagos_y_suscripciones").insert({
          usuario_id: Number(payload.userId),
          tipo_pago: "suscripcion_familiar",
          monto_usd: 10.0,
          fee_plataforma_usd: 0.0,
          referencia_pasarela: `ADMIN-ACT-${Date.now()}`,
          estado_pago: "completado",
          periodo_fin: new Date(Date.now() + 30 * 86400000).toISOString(),
        });
      }

      return NextResponse.json({ ok: true });
    }

    // 2. Crear nuevo usuario (y ficha si es paciente) desde Admin para el Piloto V1
    if (action === "create_pilot_user") {
      const cleanEmail = (payload.correo || "").toLowerCase().trim();
      const passwordHash = await hashPassword(payload.password || "Love2026");

      const { data: newUser, error } = await supabaseAdmin
        .from("usuarios")
        .insert({
          nombre: payload.nombre.trim(),
          correo: cleanEmail,
          password_hash: passwordHash,
          telefono: payload.telefono || "",
          rol: payload.rol || "paciente",
          nivel_suscripcion: payload.nivel_suscripcion || "gratuita",
          idioma_preferido: payload.idioma_preferido || "es",
          estado: "activo",
        })
        .select("*")
        .single();

      if (error || !newUser) {
        return NextResponse.json(
          { ok: false, error: error?.message || "No se pudo crear el usuario" },
          { status: 400 }
        );
      }

      if (newUser.rol === "paciente") {
        await supabaseAdmin.from("ficha_paciente").insert({
          nombre_familia:
            payload.nombre_familia || `Familia ${newUser.nombre.split(" ")[0]}`,
          paciente_usuario_id: newUser.id,
          nombre_paciente: newUser.nombre,
          correo_invitacion_paciente: newUser.correo,
          etapa_actual: payload.etapa_actual || "diagnostico",
          registrado_por: "paciente",
        });
      }

      return NextResponse.json({ ok: true, user: newUser });
    }

    // 3. Entrenamiento y ajuste manual o regeneración del resumen PONO IA
    if (action === "save_pono_summary") {
      await supabaseAdmin
        .from("ficha_paciente")
        .update({
          resumen_ia_pono: payload.resumen_ia_pono,
          resumen_ia_actualizado_en: new Date().toISOString(),
        })
        .eq("id", Number(payload.fichaId));

      return NextResponse.json({ ok: true });
    }

    if (action === "regenerate_pono_summary") {
      const fichaId = Number(payload.fichaId);
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

        return NextResponse.json({ ok: true, summary: generated.summary });
      }
      return NextResponse.json(
        { ok: false, error: "Ficha no encontrada" },
        { status: 404 }
      );
    }

    // 4. Responder y cambiar estado de un Ticket de soporte/feedback
    if (action === "update_ticket") {
      await supabaseAdmin
        .from("tickets_feedback")
        .update({
          estado: payload.estado,
          respuesta_admin: payload.respuesta_admin ?? "",
        })
        .eq("id", Number(payload.ticketId));

      return NextResponse.json({ ok: true });
    }

    // 5. Publicar o editar contenido / anuncio bilingüe EN / ES desde Admin CMS
    if (action === "create_cms_content") {
      await supabaseAdmin.from("sanadores_y_contenidos").insert({
        sanador_usuario_id: adminUser.id,
        tipo_registro:
          payload.tipo_contenido === "workshop" ||
          payload.tipo_contenido === "love_circle"
            ? "workshop"
            : "contenido",
        tipo_contenido: payload.tipo_contenido || "guia_autocuidado",
        titulo_es: payload.titulo_es,
        titulo_en: payload.titulo_en || payload.titulo_es,
        descripcion_es: payload.descripcion_es || "",
        descripcion_en: payload.descripcion_en || payload.descripcion_es || "",
        media_url: payload.media_url || "",
        publico_objetivo: payload.publico_objetivo || "ambos",
        es_gratuito: payload.es_gratuito !== false,
        estado: "activo",
      });

      return NextResponse.json({ ok: true });
    }

    if (action === "delete_cms_content") {
      await supabaseAdmin
        .from("sanadores_y_contenidos")
        .delete()
        .eq("id", Number(payload.id));

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { ok: false, error: "Acción no reconocida" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error en PATCH /api/admin/dashboard:", error);
    return NextResponse.json(
      { ok: false, error: "Error ejecutando acción de administrador" },
      { status: 500 }
    );
  }
}


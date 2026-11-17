import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  comparePassword,
  createInvitationToken,
  hashPassword,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth";
import { sendPatientInvitationEmail } from "@/lib/email";
import { validatePassword } from "@/lib/validation";
import {
  aiBriefing,
  aiConsultSummary,
  aiRecommend,
  aiStructureEntry,
} from "@/lib/pono-ai";

const DEFAULT_CAREGIVER_RESOURCES = [
  {
    id: 301,
    tipo_registro: "workshop",
    tipo_contenido: "love_circle",
    titulo_es: "Love Circle for Caregivers · Grupo de Soporte con Omar Melero",
    titulo_en: "Love Circle for Caregivers · Support Group with Omar Melero",
    descripcion_es:
      "Espacio semanal gratuito para familiares y cuidadores: desahogo seguro, herramientas prácticas y fortaleza compartida (Zoom y Honolulu).",
    descripcion_en:
      "Free weekly space for family members and caregivers: safe sharing, practical tools, and shared strength (Zoom & Honolulu).",
    media_url: "https://zoom.us",
    fecha_evento: "2026-11-23T19:00:00Z",
    publico_objetivo: "cuidador",
    es_gratuito: true,
    costo_usd: 0,
  },
  {
    id: 302,
    tipo_registro: "contenido",
    tipo_contenido: "guia_autocuidado",
    titulo_es: "Guía de Cocina y Alimentación Suave para Días de Quimioterapia",
    titulo_en: "Gentle Cooking & Nutrition Guide for Chemotherapy Days",
    descripcion_es:
      "Recetas fáciles de preparar en casa: caldos minerales, batidos alcalinos y comidas que calman las náuseas sin olores fuertes.",
    descripcion_en:
      "Easy home recipes: mineral broths, alkaline smoothies, and meals that soothe nausea without strong odors.",
    media_url: "#guia-cocina-cuidador",
    publico_objetivo: "cuidador",
    es_gratuito: true,
    costo_usd: 0,
  },
  {
    id: 303,
    tipo_registro: "contenido",
    tipo_contenido: "meditacion_audio",
    titulo_es: "Autorregulación en 8 Minutos: Soltar el Agotamiento del Cuidador",
    titulo_en: "8-Minute Self-Regulation: Releasing Caregiver Burnout",
    descripcion_es:
      "Meditación guiada por Omar para recuperar tu centro emocional, bajar el cortisol y descansar mejor por la noche.",
    descripcion_en:
      "Guided meditation by Omar to regain your emotional center, lower cortisol, and sleep better at night.",
    media_url: "https://open.spotify.com",
    publico_objetivo: "cuidador",
    es_gratuito: true,
    costo_usd: 0,
  },
  {
    id: 304,
    tipo_registro: "contenido",
    tipo_contenido: "guia_autocuidado",
    titulo_es: "Gestión Preventiva y Síntomas Nocturnos en Cáncer de Mama",
    titulo_en: "Preventive Care & Nighttime Symptom Guide in Breast Cancer",
    descripcion_es:
      "Qué tener listo en la mesa de noche, cuándo llamar al oncólogo y cómo acompañar el dolor o el insomnio sin angustiarte.",
    descripcion_en:
      "What to keep by the bedside, when to call the oncologist, and how to support pain or insomnia calmly.",
    media_url: "#guia-preventiva",
    publico_objetivo: "cuidador",
    es_gratuito: true,
    costo_usd: 0,
  },
  {
    id: 305,
    tipo_registro: "workshop",
    tipo_contenido: "workshop",
    titulo_es: "Workshop Online Gratuito: Comunicación Afectiva en la Familia",
    titulo_en: "Free Online Workshop: Compassionate Family Communication",
    descripcion_es:
      "Aprende a organizar turnos de ayuda familiar y pedir apoyo sin sentir culpa.",
    descripcion_en:
      "Learn how to organize family support shifts and ask for help without guilt.",
    media_url: "https://zoom.us",
    fecha_evento: "2026-11-26T18:30:00Z",
    publico_objetivo: "cuidador",
    es_gratuito: true,
    costo_usd: 0,
  },
  {
    id: 306,
    tipo_registro: "workshop",
    tipo_contenido: "workshop",
    titulo_es: "Workshop Presencial en Honolulu: Retiro de Resiliencia y Cuencos",
    titulo_en: "In-Person Honolulu Workshop: Resilience & Sound Bowls Retreat",
    descripcion_es:
      "Encuentro presencial de medio día en O'ahu con Omar y Kelsie para cuidadores y parejas.",
    descripcion_en:
      "Half-day in-person gathering in O'ahu with Omar and Kelsie for caregivers and partners.",
    media_url: "#workshop-presencial",
    fecha_evento: "2026-11-29T10:00:00Z",
    publico_objetivo: "cuidador",
    es_gratuito: false,
    costo_usd: 45,
  },
];

const DEFAULT_HEALERS = [
  {
    id: 102,
    sanador_usuario_id: 3,
    tipo_registro: "perfil_sanador",
    especialidad: "Omar Melero · Integrative Coach & Caregiver Circle Lead",
    short_bio_es:
      "Cofundador de Love Heals Effect. Especialista en acompañamiento a cuidadores, resiliencia familiar, regulación del sistema nervioso y meditación.",
    short_bio_en:
      "Co-founder of Love Heals Effect. Specialist in caregiver support, family resilience, nervous system regulation, and meditation.",
    tarifa_hora_usd: 85,
    modalidades: "ambas",
  },
  {
    id: 101,
    sanador_usuario_id: 3,
    tipo_registro: "perfil_sanador",
    especialidad: "Kelsie Reynolds · Holistic Breast Cancer Coach & BAM",
    short_bio_es:
      "Cofundadora de Love Heals Effect en Honolulu. Especialista en acompañamiento emocional para pacientes, Body Awareness Movement (BAM) y sesiones conjuntas.",
    short_bio_en:
      "Co-founder of Love Heals Effect in Honolulu. Specialist in emotional accompaniment for patients, BAM, and joint family sessions.",
    tarifa_hora_usd: 85,
    modalidades: "ambas",
  },
];

async function resolveCaregiverAndFichas(req: NextRequest) {
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
    if (data && data.rol === "cuidador") {
      user = data;
    }
  }

  // Fallback para modo desarrollo directo al entrar a http://localhost:3000/cuidador
  if (!user) {
    const { data: firstCaregiver } = await supabaseAdmin
      .from("usuarios")
      .select(
        "id, nombre, correo, telefono, rol, nivel_suscripcion, idioma_preferido, estado"
      )
      .eq("rol", "cuidador")
      .maybeSingle();

    user = firstCaregiver || {
      id: 2,
      nombre: "Mateo Kalani (Cuidador Demo)",
      correo: "cuidador@loveheals.com",
      telefono: "8085550102",
      rol: "cuidador",
      nivel_suscripcion: "pagada",
      idioma_preferido: "es",
      estado: "activo",
    };
  }

  // 1. Buscar la ficha_paciente vinculada a este cuidador (o la primera ficha disponible en modo demo)
  let { data: fichaPaciente } = await supabaseAdmin
    .from("ficha_paciente")
    .select("*")
    .eq("cuidador_usuario_id", user.id)
    .maybeSingle();

  if (!fichaPaciente) {
    const { data: firstFicha } = await supabaseAdmin
      .from("ficha_paciente")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (firstFicha) {
      fichaPaciente = firstFicha;
    } else {
      const { data: createdFicha } = await supabaseAdmin
        .from("ficha_paciente")
        .insert({
          nombre_familia: "Familia Kalani",
          cuidador_usuario_id: user.id,
          nombre_paciente: "Elena Kalani",
          correo_invitacion_paciente: "paciente@loveheals.com",
          etapa_actual: "tratamiento_activo",
          registrado_por: "cuidador",
        })
        .select("*")
        .single();
      fichaPaciente = createdFicha;
    }
  }

  // 2. Buscar o crear la ficha propia del cuidador (ficha_cuidador)
  let { data: fichaCuidador } = await supabaseAdmin
    .from("ficha_cuidador")
    .select("*")
    .eq("cuidador_usuario_id", user.id)
    .maybeSingle();

  if (!fichaCuidador && fichaPaciente) {
    const { data: createdFc } = await supabaseAdmin
      .from("ficha_cuidador")
      .insert({
        cuidador_usuario_id: user.id,
        ficha_paciente_id: fichaPaciente.id,
        relacion_familiar: "Esposo / Acompañante Principal",
        nivel_experiencia: "Intermedio",
        habitos_autocuidado:
          "Caminata matutina de 20 min, hidratación y respiración consciente.",
        horarios_disponibles: "Mañanas (7:00 AM - 12:00 PM) y Tardes",
        areas_de_interes:
          "Cocina antiinflamatoria, manejo del sueño y grupos con Omar",
        estado_vinculo: fichaPaciente.paciente_usuario_id
          ? "vinculado"
          : "pendiente",
      })
      .select("*")
      .single();

    fichaCuidador = createdFc || {
      id: 1,
      cuidador_usuario_id: user.id,
      ficha_paciente_id: fichaPaciente.id,
      relacion_familiar: "Esposo / Acompañante Principal",
      nivel_experiencia: "Intermedio",
      habitos_autocuidado: "Caminata matutina de 20 min y respiración guiada",
      horarios_disponibles: "Mañanas y tardes",
      areas_de_interes: "Nutrición, manejo del sueño y grupos con Omar",
      estado_vinculo: "vinculado",
    };
  }

  return { user, fichaPaciente, fichaCuidador };
}

export async function GET(req: NextRequest) {
  try {
    const { user, fichaPaciente, fichaCuidador } =
      await resolveCaregiverAndFichas(req);

    // Información de la paciente vinculada
    let patientInfo = {
      linked: Boolean(fichaPaciente?.paciente_usuario_id),
      nombre: fichaPaciente?.nombre_paciente || "Paciente",
      correo: fichaPaciente?.correo_invitacion_paciente || "",
      telefono: "",
    };

    if (fichaPaciente?.paciente_usuario_id) {
      const { data: pUser } = await supabaseAdmin
        .from("usuarios")
        .select("nombre, correo, telefono")
        .eq("id", fichaPaciente.paciente_usuario_id)
        .maybeSingle();

      if (pUser) {
        patientInfo = {
          linked: true,
          nombre: pUser.nombre,
          correo: pUser.correo,
          telefono: pUser.telefono || "",
        };
      }
    }

    // Sesiones con sanadores de la célula familiar
    const { data: sessionsData } = await supabaseAdmin
      .from("citas_y_bitacora_sanador")
      .select("*")
      .eq("ficha_paciente_id", fichaPaciente.id);

    const healerSessions = Array.isArray(sessionsData) ? sessionsData : [];

    // Tickets del cuidador
    const { data: ticketsData } = await supabaseAdmin
      .from("tickets_feedback")
      .select("*")
      .eq("usuario_id", user.id);

    const tickets = Array.isArray(ticketsData) ? ticketsData : [];

    return NextResponse.json({
      ok: true,
      user,
      patientInfo,
      fichaCuidador: {
        ...fichaCuidador,
        bienestar_diario:
          fichaCuidador?.bienestar_diario &&
          typeof fichaCuidador.bienestar_diario === "object"
            ? fichaCuidador.bienestar_diario
            : {},
      },
      fichaPaciente: {
        ...fichaPaciente,
        bitacora_clinica: Array.isArray(fichaPaciente.bitacora_clinica)
          ? fichaPaciente.bitacora_clinica
          : [],
        suplementos: Array.isArray(fichaPaciente.suplementos)
          ? fichaPaciente.suplementos
          : [],
        medicamentos_y_horarios: Array.isArray(
          fichaPaciente.medicamentos_y_horarios
        )
          ? fichaPaciente.medicamentos_y_horarios
          : [],
        citas_medicas: Array.isArray(fichaPaciente.citas_medicas)
          ? fichaPaciente.citas_medicas
          : [],
        documentos_oncologo: Array.isArray(fichaPaciente.documentos_oncologo)
          ? fichaPaciente.documentos_oncologo
          : [],
        contactos_personales: Array.isArray(fichaPaciente.contactos_personales)
          ? fichaPaciente.contactos_personales
          : [],
      },
      healers: DEFAULT_HEALERS,
      resources: DEFAULT_CAREGIVER_RESOURCES,
      healerSessions,
      tickets,
    });
  } catch (error) {
    console.error("Error en GET /api/cuidador/dashboard:", error);
    return NextResponse.json(
      { ok: false, error: "Error cargando el panel del cuidador" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;
    const { user, fichaPaciente, fichaCuidador } =
      await resolveCaregiverAndFichas(req);

    // Check-in diario del cuidador: ánimo y hábitos de autocuidado (clave = fecha)
    if (action === "update_daily") {
      const date = String(
        payload.date || new Date().toISOString().slice(0, 10)
      );
      const diary: Record<string, any> =
        fichaCuidador?.bienestar_diario &&
        typeof fichaCuidador.bienestar_diario === "object"
          ? { ...fichaCuidador.bienestar_diario }
          : {};
      const prev = diary[date] || {};
      const next: Record<string, any> = { ...prev };
      if (payload.mood !== undefined) next.mood = payload.mood;
      if (payload.habits) {
        next.habits = { ...(prev.habits || {}), ...payload.habits };
      }
      diary[date] = next;

      const keys = Object.keys(diary).sort();
      if (keys.length > 120) {
        keys.slice(0, keys.length - 120).forEach((k) => delete diary[k]);
      }

      const { error } = await supabaseAdmin
        .from("ficha_cuidador")
        .update({ bienestar_diario: diary })
        .eq("id", fichaCuidador.id);

      if (error) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "No se pudo guardar. Ejecuta el ALTER TABLE de ficha_cuidador en database/schema.sql",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Agregar o eliminar entradas en la bitácora clínica compartida de la paciente
    if (action === "add_bitacora") {
      const today = new Date().toLocaleDateString("en-CA");
      const current = Array.isArray(fichaPaciente.bitacora_clinica)
        ? [...fichaPaciente.bitacora_clinica]
        : [];
      current.unshift({
        id: Date.now() + Math.floor(Math.random() * 1000),
        fecha: String(payload.fecha || today).slice(0, 10),
        tipo: payload.tipo || "nota",
        titulo: String(payload.titulo || "Nota del cuidador").slice(0, 120),
        detalle: payload.detalle || "",
        medico: payload.medico || "",
        lugar: payload.lugar || "",
        etiquetas: Array.isArray(payload.etiquetas) ? payload.etiquetas : [],
        origen: payload.origen === "ia" ? "ia" : "cuidador",
        creado_en: new Date().toISOString(),
      });
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ bitacora_clinica: current.slice(0, 500) })
        .eq("id", fichaPaciente.id);
      return NextResponse.json({ ok: true });
    }

    if (action === "delete_bitacora") {
      const current = Array.isArray(fichaPaciente.bitacora_clinica)
        ? fichaPaciente.bitacora_clinica
        : [];
      const kept = current.filter((e: any) => e.id !== payload.id);
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ bitacora_clinica: kept })
        .eq("id", fichaPaciente.id);
      return NextResponse.json({ ok: true });
    }

    if (action === "update_profile") {
      const nombre = String(payload.nombre || "").trim();
      if (!nombre) {
        return NextResponse.json(
          { ok: false, error: "El nombre no puede estar vacío" },
          { status: 400 }
        );
      }
      const updates: Record<string, any> = { nombre };
      if (payload.telefono !== undefined)
        updates.telefono = String(payload.telefono);
      if (payload.idioma === "es" || payload.idioma === "en") {
        updates.idioma_preferido = payload.idioma;
      }
      await supabaseAdmin.from("usuarios").update(updates).eq("id", user.id);
      return NextResponse.json({ ok: true });
    }

    if (action === "change_password") {
      const { data: row } = await supabaseAdmin
        .from("usuarios")
        .select("id, password_hash")
        .eq("id", user.id)
        .maybeSingle();
      const okCurrent =
        row &&
        (await comparePassword(String(payload.actual || ""), row.password_hash));
      if (!okCurrent) {
        return NextResponse.json(
          { ok: false, error: "La contraseña actual no es correcta" },
          { status: 400 }
        );
      }
      const check = validatePassword(String(payload.nueva || ""));
      if (!check.valid) {
        return NextResponse.json(
          { ok: false, error: check.error || "Contraseña no válida" },
          { status: 400 }
        );
      }
      await supabaseAdmin
        .from("usuarios")
        .update({ password_hash: await hashPassword(String(payload.nueva)) })
        .eq("id", user.id);
      return NextResponse.json({ ok: true });
    }

    // 1. Actualizar perfil propio del cuidador (ficha_cuidador)
    if (action === "update_caregiver_profile") {
      await supabaseAdmin
        .from("ficha_cuidador")
        .update({
          relacion_familiar:
            payload.relacion_familiar ?? fichaCuidador.relacion_familiar,
          nivel_experiencia:
            payload.nivel_experiencia ?? fichaCuidador.nivel_experiencia,
          habitos_autocuidado:
            payload.habitos_autocuidado ?? fichaCuidador.habitos_autocuidado,
          horarios_disponibles:
            payload.horarios_disponibles ?? fichaCuidador.horarios_disponibles,
          areas_de_interes:
            payload.areas_de_interes ?? fichaCuidador.areas_de_interes,
        })
        .eq("id", fichaCuidador.id);

      return NextResponse.json({ ok: true });
    }

    // 2. Actualizar etapa o ficha clínica de la paciente (sincronizada 1 a 1)
    if (action === "update_patient_stage") {
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ etapa_actual: payload.etapa_actual })
        .eq("id", fichaPaciente.id);
      return NextResponse.json({ ok: true });
    }

    if (action === "update_patient_medical_info") {
      await supabaseAdmin
        .from("ficha_paciente")
        .update({
          historia_medica:
            payload.historia_medica ?? fichaPaciente.historia_medica,
          alergias: payload.alergias ?? fichaPaciente.alergias,
          datos_nutricionales:
            payload.datos_nutricionales ?? fichaPaciente.datos_nutricionales,
        })
        .eq("id", fichaPaciente.id);
      return NextResponse.json({ ok: true });
    }

    if (action === "add_medication") {
      const current = Array.isArray(fichaPaciente.medicamentos_y_horarios)
        ? fichaPaciente.medicamentos_y_horarios
        : [];
      const updated = [
        ...current,
        {
          id: Date.now(),
          nombre: payload.nombre,
          dosis: payload.dosis,
          horario: payload.horario,
          indicaciones: payload.indicaciones || "",
        },
      ];
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ medicamentos_y_horarios: updated })
        .eq("id", fichaPaciente.id);
      return NextResponse.json({ ok: true, items: updated });
    }

    if (action === "delete_medication") {
      const current = Array.isArray(fichaPaciente.medicamentos_y_horarios)
        ? fichaPaciente.medicamentos_y_horarios
        : [];
      const updated = current.filter(
        (_: any, idx: number) => idx !== payload.index
      );
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ medicamentos_y_horarios: updated })
        .eq("id", fichaPaciente.id);
      return NextResponse.json({ ok: true, items: updated });
    }

    if (action === "add_supplement") {
      const current = Array.isArray(fichaPaciente.suplementos)
        ? fichaPaciente.suplementos
        : [];
      const updated = [
        ...current,
        {
          id: Date.now(),
          nombre: payload.nombre,
          dosis: payload.dosis,
          horario: payload.horario,
        },
      ];
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ suplementos: updated })
        .eq("id", fichaPaciente.id);
      return NextResponse.json({ ok: true, items: updated });
    }

    if (action === "delete_supplement") {
      const current = Array.isArray(fichaPaciente.suplementos)
        ? fichaPaciente.suplementos
        : [];
      const updated = current.filter(
        (_: any, idx: number) => idx !== payload.index
      );
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ suplementos: updated })
        .eq("id", fichaPaciente.id);
      return NextResponse.json({ ok: true, items: updated });
    }

    if (action === "add_document") {
      const current = Array.isArray(fichaPaciente.documentos_oncologo)
        ? fichaPaciente.documentos_oncologo
        : [];
      const updated = [
        {
          id: Date.now(),
          titulo: payload.titulo,
          tipo: payload.tipo || "Receta / Nota Oncológica (Subido por Cuidador)",
          fecha: new Date().toISOString().slice(0, 10),
          notas: payload.notas || "",
          archivoNombre: payload.archivoNombre || "documento-paciente.pdf",
        },
        ...current,
      ];
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ documentos_oncologo: updated })
        .eq("id", fichaPaciente.id);
      return NextResponse.json({ ok: true, items: updated });
    }

    if (action === "delete_document") {
      const current = Array.isArray(fichaPaciente.documentos_oncologo)
        ? fichaPaciente.documentos_oncologo
        : [];
      const updated = current.filter(
        (_: any, idx: number) => idx !== payload.index
      );
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ documentos_oncologo: updated })
        .eq("id", fichaPaciente.id);
      return NextResponse.json({ ok: true, items: updated });
    }

    if (action === "add_medical_appointment") {
      const current = Array.isArray(fichaPaciente.citas_medicas)
        ? fichaPaciente.citas_medicas
        : [];
      const updated = [
        ...current,
        {
          id: Date.now(),
          titulo: payload.titulo,
          fecha: payload.fecha,
          hora: payload.hora || "09:30 AM",
          lugar: payload.lugar || "Clínica / Hospital",
        },
      ];
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ citas_medicas: updated })
        .eq("id", fichaPaciente.id);
      return NextResponse.json({ ok: true, items: updated });
    }

    if (action === "delete_medical_appointment") {
      const current = Array.isArray(fichaPaciente.citas_medicas)
        ? fichaPaciente.citas_medicas
        : [];
      const updated = current.filter(
        (_: any, idx: number) => idx !== payload.index
      );
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ citas_medicas: updated })
        .eq("id", fichaPaciente.id);
      return NextResponse.json({ ok: true, items: updated });
    }

    if (action === "book_healer_session") {
      const { data: inserted } = await supabaseAdmin
        .from("citas_y_bitacora_sanador")
        .insert({
          ficha_paciente_id: fichaPaciente.id,
          sanador_usuario_id: 3,
          reservado_por_usuario_id: user.id,
          asistente_rol: payload.asistente_rol || "cuidador",
          modalidad: payload.modalidad || "online",
          fecha_sesion: payload.fecha_sesion,
          es_sesion_gratuita_mensual: Boolean(
            payload.es_sesion_gratuita_mensual
          ),
          enlace_o_lugar:
            payload.enlace_o_lugar ||
            "Sesión con Omar Melero · Love Heals Effect",
          estado_cita: "programada",
        })
        .select("*")
        .single();

      return NextResponse.json({ ok: true, session: inserted });
    }

    if (action === "invite_patient") {
      const patientEmail = (payload.correo || "").toLowerCase().trim();
      const patientName = (payload.nombre || "Mi Paciente").trim();
      const patientStage = payload.etapa_actual || fichaPaciente.etapa_actual;

      await supabaseAdmin
        .from("ficha_paciente")
        .update({
          nombre_paciente: patientName,
          correo_invitacion_paciente: patientEmail,
          etapa_actual: patientStage,
        })
        .eq("id", fichaPaciente.id);

      const origin =
        req.headers.get("origin") ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";

      const token = createInvitationToken({
        fichaId: fichaPaciente.id,
        targetEmail: patientEmail,
        targetRole: "paciente",
        inviterName: user.nombre,
      });

      const inviteLink = `${origin}/auth/registro?token=${token}&rol=paciente`;
      await sendPatientInvitationEmail({
        caregiverName: user.nombre,
        patientEmail,
        patientName,
        inviteLink,
      });

      return NextResponse.json({ ok: true, inviteLink });
    }

    if (action === "add_contact") {
      const current = Array.isArray(fichaPaciente.contactos_personales)
        ? fichaPaciente.contactos_personales
        : [];
      const updated = [
        ...current,
        {
          id: Date.now(),
          nombre: payload.nombre,
          rol: payload.rol || "Oncólogo / Emergencia",
          telefono: payload.telefono || "",
        },
      ];
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ contactos_personales: updated })
        .eq("id", fichaPaciente.id);
      return NextResponse.json({ ok: true, items: updated });
    }

    if (action === "delete_contact") {
      const current = Array.isArray(fichaPaciente.contactos_personales)
        ? fichaPaciente.contactos_personales
        : [];
      const updated = current.filter(
        (_: any, idx: number) => idx !== payload.index
      );
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ contactos_personales: updated })
        .eq("id", fichaPaciente.id);
      return NextResponse.json({ ok: true, items: updated });
    }

    if (action === "create_ticket") {
      const { data: ticket } = await supabaseAdmin
        .from("tickets_feedback")
        .insert({
          usuario_id: user.id,
          rol_usuario: "cuidador",
          tipo: payload.tipo || "feedback",
          asunto: payload.asunto,
          descripcion: payload.descripcion,
          estado: "abierto",
        })
        .select("*")
        .single();

      return NextResponse.json({ ok: true, ticket });
    }

    return NextResponse.json(
      { ok: false, error: "Acción no reconocida" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error en PATCH /api/cuidador/dashboard:", error);
    return NextResponse.json(
      { ok: false, error: "Error guardando los cambios del cuidador" },
      { status: 500 }
    );
  }
}



/**
 * POST = funciones de PONO IA compartidas con el Cuidador:
 * ai_recommend · ai_structure · ai_consult_summary
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;
    const payload = body.payload || {};
    const lang: "es" | "en" = payload.locale === "en" ? "en" : "es";
    const today = /^\d{4}-\d{2}-\d{2}$/.test(String(payload.today))
      ? String(payload.today)
      : new Date().toLocaleDateString("en-CA");

    const { user, fichaPaciente } = await resolveCaregiverAndFichas(req);

    if (action === "ai_recommend") {
      const result = await aiRecommend({
        mood: String(payload.mood || "tranquila"),
        note: String(payload.note || ""),
        resources: DEFAULT_CAREGIVER_RESOURCES,
        lang,
      });
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "ai_structure") {
      const text = String(payload.text || "").trim();
      if (text.length < 3) {
        return NextResponse.json(
          { ok: false, error: "Cuéntame un poco más para poder organizarlo" },
          { status: 400 }
        );
      }
      const entry = await aiStructureEntry({ text, lang, today });
      return NextResponse.json({ ok: true, entry });
    }

    if (action === "ai_consult_summary") {
      const { data: sessionsData } = await supabaseAdmin
        .from("citas_y_bitacora_sanador")
        .select("*")
        .eq("ficha_paciente_id", fichaPaciente.id);
      const sessions = Array.isArray(sessionsData) ? sessionsData : [];
      const manual = Array.isArray(fichaPaciente.bitacora_clinica)
        ? fichaPaciente.bitacora_clinica
        : [];
      const fromSessions = sessions
        .filter(
          (s) =>
            s.estado_cita === "completada" &&
            (s.estado_observado_paciente || s.recomendaciones_dadas)
        )
        .map((s) => ({
          id: `ses-${s.id}`,
          fecha: String(s.fecha_sesion).slice(0, 10),
          tipo: "sanador",
          titulo: s.enlace_o_lugar,
          detalle: [s.estado_observado_paciente, s.recomendaciones_dadas]
            .filter(Boolean)
            .join(" · "),
          medico: "",
          etiquetas: [],
          origen: "auto",
        }));

      const result = await aiConsultSummary({
        audience: payload.audience === "sanador" ? "sanador" : "medico",
        ficha: fichaPaciente,
        timeline: [...manual, ...fromSessions],
        caregiverName: user.nombre,
        lang,
        today,
      });
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "ai_briefing") {
      const { data: sessionsData } = await supabaseAdmin
        .from("citas_y_bitacora_sanador")
        .select("*")
        .eq("ficha_paciente_id", fichaPaciente.id);
      const sessions = Array.isArray(sessionsData) ? sessionsData : [];
      const result = await aiBriefing({
        name: String(user.nombre || "").split(" ")[0],
        ficha: fichaPaciente,
        sessions,
        timeline: Array.isArray(fichaPaciente.bitacora_clinica)
          ? fichaPaciente.bitacora_clinica
          : [],
        resources: DEFAULT_CAREGIVER_RESOURCES,
        lastMood: payload.lastMood || null,
        lang,
        today,
      });
      return NextResponse.json({ ok: true, ...result });
    }

    return NextResponse.json(
      { ok: false, error: "Acción de IA no reconocida" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error en POST /api/cuidador/dashboard (IA):", error);
    return NextResponse.json(
      { ok: false, error: "PONO IA no pudo responder" },
      { status: 500 }
    );
  }
}

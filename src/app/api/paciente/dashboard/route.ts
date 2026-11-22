import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  createInvitationToken,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth";
import { sendCaregiverInvitationEmail } from "@/lib/email";
import { comparePassword, hashPassword } from "@/lib/auth";
import { validatePassword } from "@/lib/validation";
import {
  aiBriefing,
  aiConsultSummary,
  aiRecommend,
  aiStructureEntry,
} from "@/lib/pono-ai";

/** Recursos premium de muestra (se usan solo mientras Omar y Kelsie no publiquen los reales). */
const PAID_RESOURCES = [
  {
    id: 401,
    tipo_registro: "contenido",
    tipo_contenido: "meditacion_audio",
    titulo_es: "Visualización avanzada de sanación (Premium)",
    titulo_en: "Advanced Healing Visualization (Premium)",
    descripcion_es:
      "Meditación guiada profunda de 25 minutos para acompañar tus etapas de tratamiento.",
    descripcion_en:
      "Deep 25-minute guided meditation to accompany your treatment stages.",
    media_url: "https://open.spotify.com",
    publico_objetivo: "paciente",
    es_gratuito: false,
    costo_usd: 10,
  },
  {
    id: 402,
    tipo_registro: "contenido",
    tipo_contenido: "video_bam",
    titulo_es: "Serie BAM avanzada: 4 semanas de movimiento consciente (Premium)",
    titulo_en: "Advanced BAM Series: 4 Weeks of Mindful Movement (Premium)",
    descripcion_es:
      "Programa semanal con Kelsie para recuperar movilidad y vitalidad con suavidad.",
    descripcion_en:
      "Weekly program with Kelsie to regain mobility and vitality gently.",
    media_url: "https://www.youtube.com",
    publico_objetivo: "paciente",
    es_gratuito: false,
    costo_usd: 10,
  },
  {
    id: 403,
    tipo_registro: "workshop",
    tipo_contenido: "workshop",
    titulo_es: "Seminario con profesionales invitados (Premium)",
    titulo_en: "Seminar with Invited Professionals (Premium)",
    descripcion_es:
      "Encuentro en vivo con especialistas en medicina integrativa y oncología.",
    descripcion_en:
      "Live gathering with integrative medicine and oncology specialists.",
    media_url: "https://zoom.us",
    fecha_evento: "2026-12-05T18:00:00Z",
    publico_objetivo: "paciente",
    es_gratuito: false,
    costo_usd: 25,
  },
];

/* ------------------------------------------------------------------ */
/*  Datos clínicos y holísticos de ejemplo (Mi Camino / tab=salud)     */
/* ------------------------------------------------------------------ */

const SAMPLE_HISTORIA =
  "Diagnosticada en septiembre de 2026 con Carcinoma Ductal Infiltrante (CDI) en mama izquierda, Estadio IIA (ER+, PR+, HER2-). Actualmente en ciclo de tratamiento integrativo combinando quimioterapia adyuvante con prácticas de movimiento suave BAM, meditación diaria y coaching holístico en Love Heals Effect junto a mi familia.";

const SAMPLE_ALERGIAS =
  "Alergia confirmada a Penicilina (urticaria y dificultad respiratoria leve). Sensibilidad leve al contraste yodado en tomografías. Sin alergias alimentarias conocidas.";

const SAMPLE_NUTRICION =
  "Protocolo antiinflamatorio rico en vegetales crucíferos, cúrcuma, caldos nutritivos y té de jengibre para evitar náuseas. Meta diaria de hidratación: 2.5 litros de agua estructurada. Sin ultraprocesados ni azúcares refinados.";

const SAMPLE_MEDICAMENTOS = [
  {
    id: 1,
    nombre: "Tamoxifeno",
    dosis: "20 mg",
    horario: "1 tableta cada mañana con el desayuno",
    indicaciones: "Terapia hormonal, tomar con abundante agua",
  },
  {
    id: 2,
    nombre: "Ondansetrón",
    dosis: "8 mg",
    horario: "Cada 12 horas (según pauta médica)",
    indicaciones: "Prevención de náuseas post-quimioterapia",
  },
  {
    id: 3,
    nombre: "Dexametasona",
    dosis: "4 mg",
    horario: "Mañanas días 1 a 3 del ciclo",
    indicaciones: "Antiinflamatorio y soporte médico",
  },
];

const SAMPLE_SUPLEMENTOS = [
  {
    nombre: "Vitamina D3 + K2",
    dosis: "5000 UI",
    horario: "Al mediodía con almuerzo graso saludable",
  },
  {
    nombre: "Omega 3 EPA/DHA de alta pureza",
    dosis: "2000 mg",
    horario: "Noches con la cena",
  },
  {
    nombre: "Magnesio Glicinato",
    dosis: "400 mg",
    horario: "30 minutos antes de dormir para descanso profundo",
  },
  {
    nombre: "Melatonina Liposomal",
    dosis: "5 mg",
    horario: "Noches, soporte celular y sueño reparador",
  },
];

const SAMPLE_CONTACTOS = [
  {
    nombre: "Dra. Sarah Jenkins",
    rol: "Oncóloga Médica",
    telefono: "(808) 691-1000",
    email: "sjenkins@queensmedical.org",
  },
  {
    nombre: "Dr. Michael Chen",
    rol: "Cirujano Oncológico",
    telefono: "(808) 983-6000",
    email: "mchen@kapiolani.org",
  },
  {
    nombre: "Dra. Maya Lin",
    rol: "Medicina Integrativa y Acupuntura",
    telefono: "(808) 523-8888",
    email: "mlin@honoluluholistic.org",
  },
  {
    nombre: "Kelsie Reynolds",
    rol: "Holistic Breast Cancer Coach & BAM",
    telefono: "(808) 728-1920",
    email: "kelsie@lovehealscoaching.com",
  },
];

const SAMPLE_DOCUMENTOS = [
  {
    titulo: "Informe de Patología e Inmunohistoquímica",
    tipo: "Biopsia / Patología",
    fecha: "2026-09-18",
    notas:
      "Receptores de estrógeno 95%, progesterona 80%, Ki-67 15%. Estadio IIA.",
    archivo_url: "#",
  },
  {
    titulo: "Analítica de Sangre Completa y Perfil Hepático",
    tipo: "Laboratorio Clínico",
    fecha: "2026-11-12",
    notas:
      "Hemograma dentro de parámetros normales pre-infusión. Neutrófilos estables.",
    archivo_url: "#",
  },
  {
    titulo: "Receta Médica y Pauta de Soporte Quimioterápico",
    tipo: "Receta Médica",
    fecha: "2026-11-15",
    notas: "Firmada por Dra. Sarah Jenkins (Oncología Queen's Honolulu)",
    archivo_url: "#",
  },
  {
    titulo: "Plan de Cuidados Holísticos y Guía Nutricional LHE",
    tipo: "Guía Integrativa",
    fecha: "2026-11-01",
    notas: "Plan personalizado coordinado con Kelsie Reynolds y Omar",
    archivo_url: "#",
  },
];

const SAMPLE_BITACORA = [
  {
    id: 1,
    fecha: "2026-11-20",
    tipo: "cita",
    titulo: "Consulta de seguimiento con Oncología Médica",
    detalle:
      "Revisión de analítica sanguínea. Neutrófilos y plaquetas en niveles estables para continuar ciclo. Tolerancia al tratamiento favorable. Se autorizan caminatas suaves y sesiones BAM.",
    medico: "Dra. Sarah Jenkins",
    lugar: "Queen's Medical Center, Honolulu",
    etiquetas: ["oncología", "laboratorio", "seguimiento"],
    origen: "ia",
    creado_en: "2026-11-20T10:30:00Z",
  },
  {
    id: 2,
    fecha: "2026-11-19",
    tipo: "sintoma",
    titulo: "Cansancio leve por la tarde y ligera náusea matutina",
    detalle:
      "Disminuyó tras infusión tibia de jengibre y descanso con respiración 4-7-8 recomendada por PONO. Buen apetito al mediodía y buen ánimo.",
    medico: "",
    lugar: "Casa",
    etiquetas: ["síntomas", "náuseas", "autocuidado"],
    origen: "escrito",
    creado_en: "2026-11-19T14:15:00Z",
  },
  {
    id: 3,
    fecha: "2026-11-16",
    tipo: "procedimiento",
    titulo: "Ecografía mamaria de control post-ciclo 2",
    detalle:
      "Respuesta tumoral favorable con reducción milimétrica observada en mama izquierda. Ganglios axilares sin variaciones adversas.",
    medico: "Dr. Michael Chen",
    lugar: "Kapi'olani Medical Center",
    etiquetas: ["ecografía", "control", "imágenes"],
    origen: "auto",
    creado_en: "2026-11-16T11:00:00Z",
  },
  {
    id: 4,
    fecha: "2026-11-14",
    tipo: "sanador",
    titulo: "Sesión holística 1 a 1 de movimiento BAM con Kelsie",
    detalle:
      "Liberación miofascial suave de hombro y plexo solar, drenaje linfático asistido y visualización celular de amor propio. Sensación de alivio y ligereza.",
    medico: "Kelsie Reynolds",
    lugar: "Love Heals Zoom (Honolulu)",
    etiquetas: ["BAM", "sanación", "movimiento"],
    origen: "ia",
    creado_en: "2026-11-14T17:00:00Z",
  },
  {
    id: 5,
    fecha: "2026-11-10",
    tipo: "medicamento",
    titulo: "Ajuste de suplementación con Dra. Maya Lin",
    detalle:
      "Incorporación de té verde matcha orgánico y magnesio glicinato nocturno para potenciar reparación celular y sueño reparador.",
    medico: "Dra. Maya Lin",
    lugar: "Honolulu Holistic Center",
    etiquetas: ["nutrición", "suplementos"],
    origen: "escrito",
    creado_en: "2026-11-10T16:00:00Z",
  },
];

const SAMPLE_CITAS = [
  {
    id: 101,
    titulo: "Consulta mensual con Dra. Jenkins (Oncología)",
    fecha: "2026-12-04",
    hora: "10:00 AM",
    lugar: "Queen's Medical Center - Consultorio 402",
    notas: "Llevar analítica reciente y preguntas preparadas con PONO IA",
  },
  {
    id: 102,
    titulo: "Sesión de Acupuntura y Regulación Nerviosa",
    fecha: "2026-12-08",
    hora: "03:30 PM",
    lugar: "Honolulu Holistic Center con Dra. Maya Lin",
    notas: "Ropa cómoda de algodón",
  },
  {
    id: 103,
    titulo: "Love Circle Mensual de Sanación con Kelsie y Omar",
    fecha: "2026-12-15",
    hora: "06:00 PM",
    lugar: "Love Heals Live Stream Honolulu",
    notas: "Encuentro con la comunidad de pacientes",
  },
];

function mergeResources(dbResources: any[]) {
  const base = dbResources.length > 0 ? dbResources : DEFAULT_RESOURCES;
  const hasPaid = base.some((r: any) => r.es_gratuito === false);
  return hasPaid ? base : [...base, ...PAID_RESOURCES];
}

const DEFAULT_HEALERS = [
  {
    id: 101,
    sanador_usuario_id: 3,
    tipo_registro: "perfil_sanador",
    especialidad: "Kelsie Reynolds · Holistic Breast Cancer Coach & BAM",
    short_bio_es:
      "Cofundadora de Love Heals Effect en Honolulu. Especialista en acompañamiento emocional para pacientes, Body Awareness Movement (BAM) y círculos de sanación.",
    short_bio_en:
      "Co-founder of Love Heals Effect in Honolulu. Specialist in emotional accompaniment for patients, Body Awareness Movement (BAM), and healing circles.",
    tarifa_hora_usd: 85,
    modalidades: "ambas",
    disponibilidad_horaria: {
      dias: "Lunes a Viernes",
      horas: "9:00 AM - 4:00 PM HST",
    },
    es_sanador_interno: true,
  },
  {
    id: 102,
    sanador_usuario_id: 3,
    tipo_registro: "perfil_sanador",
    especialidad: "Omar Melero · Integrative Coach & Caregiver Circle Lead",
    short_bio_es:
      "Cofundador de Love Heals Effect. Facilitador de resiliencia familiar, regulación del sistema nervioso, meditación guiada y grupos de soporte en Hawái.",
    short_bio_en:
      "Co-founder of Love Heals Effect. Family resilience facilitator, nervous system regulation, guided meditation, and support groups in Hawaii.",
    tarifa_hora_usd: 85,
    modalidades: "ambas",
    disponibilidad_horaria: {
      dias: "Martes a Sábado",
      horas: "10:00 AM - 5:00 PM HST",
    },
    es_sanador_interno: true,
  },
];

const DEFAULT_RESOURCES = [
  {
    id: 201,
    tipo_registro: "contenido",
    tipo_contenido: "video_bam",
    titulo_es: "Suavizando el Cuerpo tras Quimioterapia (BAM · 15 min)",
    titulo_en: "Softening the Body Post-Chemo (15-min BAM)",
    descripcion_es:
      "Movimiento consciente suave guiado por Kelsie para liberar tensión linfática y reconectar con tu respiración sin esfuerzo.",
    descripcion_en:
      "Gentle conscious movement guided by Kelsie to release lymphatic tension and reconnect with your breath effortlessly.",
    media_url: "https://www.youtube.com/watch?v=inpok4MKVLM",
    publico_objetivo: "paciente",
    es_gratuito: true,
  },
  {
    id: 202,
    tipo_registro: "contenido",
    tipo_contenido: "meditacion_audio",
    titulo_es: "Meditación Aloha: Calma antes de tu Cita Oncológica",
    titulo_en: "Aloha Meditation: Calm Before Your Oncology Visit",
    descripcion_es:
      "Audio guiado de 10 minutos para regular la ansiedad antes de exámenes de laboratorio o consultas médicas.",
    descripcion_en:
      "10-minute guided audio to regulate anxiety before lab tests or medical appointments.",
    media_url: "https://open.spotify.com",
    publico_objetivo: "ambos",
    es_gratuito: true,
  },
  {
    id: 203,
    tipo_registro: "contenido",
    tipo_contenido: "musicoterapia",
    titulo_es: "Cuencos Sonoros y Brisa de O'ahu (432 Hz)",
    titulo_en: "Sound Bowls & O'ahu Ocean Breeze (432 Hz)",
    descripcion_es:
      "Sesión de musicoterapia restaurativa ideal para descansar durante la tarde o conciliar el sueño profundo.",
    descripcion_en:
      "Restorative music therapy session ideal for afternoon rest or deep sleep.",
    media_url: "https://open.spotify.com",
    publico_objetivo: "ambos",
    es_gratuito: true,
  },
  {
    id: 204,
    tipo_registro: "contenido",
    tipo_contenido: "guia_autocuidado",
    titulo_es: "Guía de Nutrición Antiinflamatoria e Hidratación en Tratamiento",
    titulo_en: "Anti-inflammatory Nutrition & Hydration Guide During Treatment",
    descripcion_es:
      "Recetas sencillas, infusiones para aliviar náuseas y alimentos alcalinos recomendados para tu semana.",
    descripcion_en:
      "Simple recipes, nausea-soothing infusions, and alkaline foods recommended for your week.",
    media_url: "#guia-nutricion",
    publico_objetivo: "ambos",
    es_gratuito: true,
  },
  {
    id: 205,
    tipo_registro: "workshop",
    tipo_contenido: "love_circle",
    titulo_es: "Love Circle for Patients · Círculo Semanal con Kelsie",
    titulo_en: "Love Circle for Patients · Weekly Circle with Kelsie",
    descripcion_es:
      "Espacio íntimo y gratuito de contención emocional entre mujeres atravesando el proceso de cáncer de mama (Zoom y Honolulu).",
    descripcion_en:
      "Free intimate emotional support space for women navigating breast cancer (Zoom & Honolulu).",
    media_url: "https://zoom.us",
    fecha_evento: "2026-11-21T18:00:00Z",
    publico_objetivo: "paciente",
    es_gratuito: true,
  },
];

async function resolvePatientAndFicha(req: NextRequest) {
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

  // Fallback para modo desarrollo directo sin cookie o si entra como admin a previsualizar
  if (!user || user.rol !== "paciente") {
    const { data: firstPatient } = await supabaseAdmin
      .from("usuarios")
      .select(
        "id, nombre, correo, telefono, rol, nivel_suscripcion, idioma_preferido, estado"
      )
      .eq("rol", "paciente")
      .maybeSingle();

    user = firstPatient || {
      id: 1,
      nombre: "Elena Kalani",
      correo: "paciente@loveheals.com",
      telefono: "8085550101",
      rol: "paciente",
      nivel_suscripcion: "gratuita",
      idioma_preferido: "es",
      estado: "activo",
    };
  }

  let { data: ficha } = await supabaseAdmin
    .from("ficha_paciente")
    .select("*")
    .eq("paciente_usuario_id", user.id)
    .maybeSingle();

  if (!ficha) {
    const { data: createdFicha } = await supabaseAdmin
      .from("ficha_paciente")
      .insert({
        nombre_familia: `Familia de ${user.nombre.split(" ")[0]}`,
        paciente_usuario_id: user.id,
        nombre_paciente: user.nombre,
        correo_invitacion_paciente: user.correo,
        etapa_actual: "tratamiento_activo",
        historia_medica: SAMPLE_HISTORIA,
        alergias: SAMPLE_ALERGIAS,
        datos_nutricionales: SAMPLE_NUTRICION,
        suplementos: SAMPLE_SUPLEMENTOS,
        resultados_laboratorio: SAMPLE_BITACORA,
        medicamentos_y_horarios: SAMPLE_MEDICAMENTOS,
        citas_medicas: SAMPLE_CITAS,
        documentos_oncologo: SAMPLE_DOCUMENTOS,
        contactos_personales: SAMPLE_CONTACTOS,
        registrado_por: "paciente",
      })
      .select("*")
      .single();

    ficha = createdFicha || {
      id: 1,
      nombre_familia: `Familia de ${user.nombre.split(" ")[0]}`,
      paciente_usuario_id: user.id,
      cuidador_usuario_id: null,
      nombre_paciente: user.nombre,
      correo_invitacion_paciente: user.correo,
      correo_invitacion_cuidador: "",
      etapa_actual: "tratamiento_activo",
      historia_medica: SAMPLE_HISTORIA,
      alergias: SAMPLE_ALERGIAS,
      datos_nutricionales: SAMPLE_NUTRICION,
      suplementos: SAMPLE_SUPLEMENTOS,
      resultados_laboratorio: SAMPLE_BITACORA,
      medicamentos_y_horarios: SAMPLE_MEDICAMENTOS,
      citas_medicas: SAMPLE_CITAS,
      documentos_oncologo: SAMPLE_DOCUMENTOS,
      contactos_personales: SAMPLE_CONTACTOS,
    };
  }

  return { user, ficha };
}

export async function GET(req: NextRequest) {
  try {
    const { user, ficha } = await resolvePatientAndFicha(req);

    // Consultas secundarias en paralelo para máxima velocidad de respuesta
    const [
      cuidadorUserRes,
      fichaCuidadorRes,
      allHealerRowsRes,
      sessionsDataRes,
      ticketsDataRes,
    ] = await Promise.all([
      ficha.cuidador_usuario_id
        ? supabaseAdmin
            .from("usuarios")
            .select("id, nombre, correo, telefono")
            .eq("id", ficha.cuidador_usuario_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      ficha.cuidador_usuario_id
        ? supabaseAdmin
            .from("ficha_cuidador")
            .select("relacion_familiar, horarios_disponibles, estado_vinculo")
            .eq("ficha_paciente_id", ficha.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabaseAdmin.from("sanadores_y_contenidos").select("*"),
      supabaseAdmin
        .from("citas_y_bitacora_sanador")
        .select("*")
        .eq("ficha_paciente_id", ficha.id),
      supabaseAdmin
        .from("tickets_feedback")
        .select("*")
        .eq("usuario_id", user.id),
    ]);

    let caregiver = {
      linked: false,
      nombre: null as string | null,
      correo: ficha.correo_invitacion_cuidador || null,
      relacion: null as string | null,
      horarios: null as string | null,
      estado_vinculo: ficha.correo_invitacion_cuidador
        ? "invitacion_pendiente"
        : "sin_vincular",
    };

    const cuidadorUser = cuidadorUserRes?.data;
    const fichaCuidador = fichaCuidadorRes?.data;

    if (cuidadorUser) {
      caregiver = {
        linked: true,
        nombre: cuidadorUser.nombre,
        correo: cuidadorUser.correo,
        relacion: fichaCuidador?.relacion_familiar || "Familiar / Acompañante",
        horarios: fichaCuidador?.horarios_disponibles || "",
        estado_vinculo: "vinculado",
      };
    }

    // Sanadores y contenidos gratuitos
    const rows = Array.isArray(allHealerRowsRes?.data) ? allHealerRowsRes.data : [];
    const dbHealers = rows.filter((r) => r.tipo_registro === "perfil_sanador");
    const dbResources = rows.filter(
      (r) =>
        (r.tipo_registro === "contenido" || r.tipo_registro === "workshop") &&
        (r.publico_objetivo === "paciente" || r.publico_objetivo === "ambos")
    );

    const healers = dbHealers.length > 0 ? dbHealers : DEFAULT_HEALERS;
    const resources = mergeResources(dbResources);

    // Citas con sanadores (citas_y_bitacora_sanador)
    const sessionsData = sessionsDataRes?.data;
    const healerSessions = Array.isArray(sessionsData) ? sessionsData : [];

    // Tickets de soporte / feedback enviados por la paciente
    const ticketsData = ticketsDataRes?.data;
    const tickets = Array.isArray(ticketsData) ? ticketsData : [];

    const rawBitacora =
      Array.isArray(ficha.bitacora_clinica) && ficha.bitacora_clinica.length > 0
        ? ficha.bitacora_clinica
        : Array.isArray(ficha.resultados_laboratorio) &&
          ficha.resultados_laboratorio.length > 0
        ? ficha.resultados_laboratorio
        : SAMPLE_BITACORA;

    return NextResponse.json({
      ok: true,
      user,
      ficha: {
        ...ficha,
        etapa_actual: ficha.etapa_actual || "tratamiento_activo",
        historia_medica: ficha.historia_medica || SAMPLE_HISTORIA,
        alergias: ficha.alergias || SAMPLE_ALERGIAS,
        datos_nutricionales: ficha.datos_nutricionales || SAMPLE_NUTRICION,
        bienestar_diario:
          ficha.bienestar_diario && typeof ficha.bienestar_diario === "object"
            ? ficha.bienestar_diario
            : {},
        bitacora_clinica: rawBitacora,
        suplementos:
          Array.isArray(ficha.suplementos) && ficha.suplementos.length > 0
            ? ficha.suplementos
            : SAMPLE_SUPLEMENTOS,
        resultados_laboratorio: rawBitacora,
        medicamentos_y_horarios:
          Array.isArray(ficha.medicamentos_y_horarios) &&
          ficha.medicamentos_y_horarios.length > 0
            ? ficha.medicamentos_y_horarios
            : SAMPLE_MEDICAMENTOS,
        citas_medicas:
          Array.isArray(ficha.citas_medicas) && ficha.citas_medicas.length > 0
            ? ficha.citas_medicas
            : SAMPLE_CITAS,
        documentos_oncologo:
          Array.isArray(ficha.documentos_oncologo) &&
          ficha.documentos_oncologo.length > 0
            ? ficha.documentos_oncologo
            : SAMPLE_DOCUMENTOS,
        contactos_personales:
          Array.isArray(ficha.contactos_personales) &&
          ficha.contactos_personales.length > 0
            ? ficha.contactos_personales
            : SAMPLE_CONTACTOS,
      },
      caregiver,
      healers,
      resources,
      healerSessions,
      tickets,
    });
  } catch (error) {
    console.error("Error en GET /api/paciente/dashboard:", error);
    return NextResponse.json(
      { ok: false, error: "Error cargando el panel de la paciente" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;
    const { user, ficha } = await resolvePatientAndFicha(req);

    // ---- Línea de tiempo clínica (bitácora): eventos automáticos ----
    const today = new Date().toLocaleDateString("en-CA");
    const timeline: any[] =
      Array.isArray(ficha.bitacora_clinica) && ficha.bitacora_clinica.length > 0
        ? [...ficha.bitacora_clinica]
        : Array.isArray(ficha.resultados_laboratorio) &&
          ficha.resultados_laboratorio.length > 0
        ? [...ficha.resultados_laboratorio]
        : [...SAMPLE_BITACORA];

    const pushTimeline = async (entry: Record<string, any>) => {
      timeline.unshift({
        id: Date.now() + Math.floor(Math.random() * 1000),
        fecha: today,
        medico: "",
        lugar: "",
        detalle: "",
        etiquetas: [],
        origen: "auto",
        creado_en: new Date().toISOString(),
        ...entry,
      });
      const { error: err } = await supabaseAdmin
        .from("ficha_paciente")
        .update({ bitacora_clinica: timeline.slice(0, 500) })
        .eq("id", ficha.id);
      if (err) {
        await supabaseAdmin
          .from("ficha_paciente")
          .update({ resultados_laboratorio: timeline.slice(0, 500) })
          .eq("id", ficha.id);
      }
    };
    const STAGE_LABEL: Record<string, string> = {
      diagnostico: "Diagnóstico",
      tratamiento_activo: "Tratamiento activo",
      cirugia_recuperacion: "Cirugía y recuperación",
      post_tratamiento: "Post-tratamiento",
    };

    if (action === "update_stage" && payload.etapa_actual !== ficha.etapa_actual) {
      await pushTimeline({
        tipo: "etapa",
        titulo: `Etapa: ${STAGE_LABEL[payload.etapa_actual] || payload.etapa_actual}`,
        detalle: `Pasó de ${STAGE_LABEL[ficha.etapa_actual] || ficha.etapa_actual} a ${
          STAGE_LABEL[payload.etapa_actual] || payload.etapa_actual
        }`,
      });
    }
    if (action === "add_medication") {
      await pushTimeline({
        tipo: "medicamento",
        titulo: `Inicia ${payload.nombre}`,
        detalle: [payload.dosis, payload.horario, payload.indicaciones]
          .filter(Boolean)
          .join(" · "),
        etiquetas: [String(payload.nombre || "").toLowerCase()],
      });
    }
    if (action === "delete_medication") {
      const m = (ficha.medicamentos_y_horarios || [])[payload.index];
      if (m) {
        await pushTimeline({
          tipo: "medicamento",
          titulo: `Suspende ${m.nombre}`,
          detalle: `${m.dosis || ""} ${m.horario ? `· ${m.horario}` : ""}`.trim(),
          etiquetas: [String(m.nombre || "").toLowerCase()],
        });
      }
    }
    if (action === "add_supplement") {
      await pushTimeline({
        tipo: "medicamento",
        titulo: `Inicia suplemento ${payload.nombre}`,
        detalle: [payload.dosis, payload.horario].filter(Boolean).join(" · "),
      });
    }
    if (action === "add_document") {
      await pushTimeline({
        tipo: "documento",
        titulo: payload.titulo,
        detalle: payload.notas || payload.tipo || "",
      });
    }
    if (action === "add_medical_appointment") {
      await pushTimeline({
        tipo: "cita",
        fecha: String(payload.fecha || today).slice(0, 10),
        titulo: payload.titulo,
        lugar: payload.lugar || "",
        detalle: `Programada${payload.hora ? ` · ${payload.hora}` : ""}`,
      });
    }
    if (action === "book_healer_session") {
      await pushTimeline({
        tipo: "sanador",
        fecha: String(payload.fecha_sesion || today).slice(0, 10),
        titulo: "Sesión con sanador reservada",
        detalle: payload.enlace_o_lugar || "",
      });
    }

    // ---- Bitácora manual / asistida por IA ----
    if (action === "add_bitacora") {
      await pushTimeline({
        fecha: String(payload.fecha || today).slice(0, 10),
        tipo: payload.tipo || "nota",
        titulo: String(payload.titulo || "Nota").slice(0, 120),
        detalle: payload.detalle || "",
        medico: payload.medico || "",
        lugar: payload.lugar || "",
        etiquetas: Array.isArray(payload.etiquetas) ? payload.etiquetas : [],
        origen: payload.origen === "ia" ? "ia" : "manual",
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "delete_bitacora") {
      const kept = timeline.filter((e) => e.id !== payload.id);
      const { error: err } = await supabaseAdmin
        .from("ficha_paciente")
        .update({ bitacora_clinica: kept })
        .eq("id", ficha.id);
      if (err) {
        await supabaseAdmin
          .from("ficha_paciente")
          .update({ resultados_laboratorio: kept })
          .eq("id", ficha.id);
      }
      return NextResponse.json({ ok: true });
    }

    // ---- Perfil: datos, contraseña y cambio de cuidador ----
    if (action === "update_profile") {
      const nombre = String(payload.nombre || "").trim();
      if (!nombre) {
        return NextResponse.json(
          { ok: false, error: "El nombre no puede estar vacío" },
          { status: 400 }
        );
      }
      const updates: Record<string, any> = { nombre };
      if (payload.telefono !== undefined) updates.telefono = String(payload.telefono);
      if (payload.idioma === "es" || payload.idioma === "en") {
        updates.idioma_preferido = payload.idioma;
      }
      await supabaseAdmin.from("usuarios").update(updates).eq("id", user.id);
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ nombre_paciente: nombre })
        .eq("id", ficha.id);
      return NextResponse.json({ ok: true });
    }

    if (action === "change_password") {
      const { data: row } = await supabaseAdmin
        .from("usuarios")
        .select("id, password_hash")
        .eq("id", user.id)
        .maybeSingle();
      const okCurrent =
        row && (await comparePassword(String(payload.actual || ""), row.password_hash));
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

    if (action === "unlink_caregiver") {
      await supabaseAdmin
        .from("ficha_cuidador")
        .delete()
        .eq("ficha_paciente_id", ficha.id);
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ cuidador_usuario_id: null, correo_invitacion_cuidador: "" })
        .eq("id", ficha.id);
      await pushTimeline({
        tipo: "nota",
        titulo: "Cambio de cuidador",
        detalle: "Se desvinculó al cuidador anterior",
      });
      return NextResponse.json({ ok: true });
    }

    // Check-in diario: ánimo, hábitos cumplidos y vasos de agua (clave = fecha YYYY-MM-DD)
    if (action === "update_daily") {
      const date = String(
        payload.date || new Date().toISOString().slice(0, 10)
      );
      const diary: Record<string, any> =
        ficha.bienestar_diario && typeof ficha.bienestar_diario === "object"
          ? { ...ficha.bienestar_diario }
          : {};
      const prev = diary[date] || {};
      const next: Record<string, any> = { ...prev };
      if (payload.mood !== undefined) next.mood = payload.mood;
      if (payload.water !== undefined) next.water = Number(payload.water);
      if (payload.habits) {
        next.habits = { ...(prev.habits || {}), ...payload.habits };
      }
      diary[date] = next;

      // Conservar solo los últimos 120 días
      const keys = Object.keys(diary).sort();
      if (keys.length > 120) {
        keys.slice(0, keys.length - 120).forEach((k) => delete diary[k]);
      }

      const { error } = await supabaseAdmin
        .from("ficha_paciente")
        .update({ bienestar_diario: diary })
        .eq("id", ficha.id);

      if (error) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "No se pudo guardar. Ejecuta el ALTER TABLE de bienestar_diario en database/schema.sql",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "update_stage") {
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ etapa_actual: payload.etapa_actual })
        .eq("id", ficha.id);

      return NextResponse.json({ ok: true });
    }

    if (action === "update_medical_info") {
      await supabaseAdmin
        .from("ficha_paciente")
        .update({
          nombre_familia: payload.nombre_familia ?? ficha.nombre_familia,
          historia_medica: payload.historia_medica ?? ficha.historia_medica,
          alergias: payload.alergias ?? ficha.alergias,
          datos_nutricionales:
            payload.datos_nutricionales ?? ficha.datos_nutricionales,
        })
        .eq("id", ficha.id);

      return NextResponse.json({ ok: true });
    }

    if (action === "add_medication") {
      const current = Array.isArray(ficha.medicamentos_y_horarios)
        ? ficha.medicamentos_y_horarios
        : [];
      const updated = [
        ...current,
        {
          id: Date.now(),
          nombre: payload.nombre,
          dosis: payload.dosis,
          horario: payload.horario,
          indicaciones: payload.indicaciones || "",
          contraindicaciones: payload.contraindicaciones || "",
        },
      ];
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ medicamentos_y_horarios: updated })
        .eq("id", ficha.id);
      return NextResponse.json({ ok: true, items: updated });
    }

    if (action === "delete_medication") {
      const current = Array.isArray(ficha.medicamentos_y_horarios)
        ? ficha.medicamentos_y_horarios
        : [];
      const updated = current.filter(
        (_: any, idx: number) => idx !== payload.index
      );
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ medicamentos_y_horarios: updated })
        .eq("id", ficha.id);
      return NextResponse.json({ ok: true, items: updated });
    }

    if (action === "add_supplement") {
      const current = Array.isArray(ficha.suplementos) ? ficha.suplementos : [];
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
        .eq("id", ficha.id);
      return NextResponse.json({ ok: true, items: updated });
    }

    if (action === "delete_supplement") {
      const current = Array.isArray(ficha.suplementos) ? ficha.suplementos : [];
      const updated = current.filter(
        (_: any, idx: number) => idx !== payload.index
      );
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ suplementos: updated })
        .eq("id", ficha.id);
      return NextResponse.json({ ok: true, items: updated });
    }

    if (action === "add_document") {
      const current = Array.isArray(ficha.documentos_oncologo)
        ? ficha.documentos_oncologo
        : [];
      const updated = [
        {
          id: Date.now(),
          titulo: payload.titulo,
          tipo: payload.tipo || "Receta / Nota Oncológica",
          fecha: payload.fecha || new Date().toISOString().slice(0, 10),
          notas: payload.notas || "",
          archivoNombre: payload.archivoNombre || "documento-clinico.pdf",
        },
        ...current,
      ];
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ documentos_oncologo: updated })
        .eq("id", ficha.id);
      return NextResponse.json({ ok: true, items: updated });
    }

    if (action === "delete_document") {
      const current = Array.isArray(ficha.documentos_oncologo)
        ? ficha.documentos_oncologo
        : [];
      const updated = current.filter(
        (_: any, idx: number) => idx !== payload.index
      );
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ documentos_oncologo: updated })
        .eq("id", ficha.id);
      return NextResponse.json({ ok: true, items: updated });
    }

    if (action === "add_medical_appointment") {
      const current = Array.isArray(ficha.citas_medicas)
        ? ficha.citas_medicas
        : [];
      const updated = [
        ...current,
        {
          id: Date.now(),
          titulo: payload.titulo,
          fecha: payload.fecha,
          hora: payload.hora || "09:00 AM",
          lugar: payload.lugar || "Clínica / Hospital",
          notas: payload.notas || "",
        },
      ];
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ citas_medicas: updated })
        .eq("id", ficha.id);
      return NextResponse.json({ ok: true, items: updated });
    }

    if (action === "delete_medical_appointment") {
      const current = Array.isArray(ficha.citas_medicas)
        ? ficha.citas_medicas
        : [];
      const updated = current.filter(
        (_: any, idx: number) => idx !== payload.index
      );
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ citas_medicas: updated })
        .eq("id", ficha.id);
      return NextResponse.json({ ok: true, items: updated });
    }

    if (action === "book_healer_session") {
      const { data: inserted } = await supabaseAdmin
        .from("citas_y_bitacora_sanador")
        .insert({
          ficha_paciente_id: ficha.id,
          sanador_usuario_id: payload.sanador_usuario_id || 3,
          reservado_por_usuario_id: user.id,
          asistente_rol: "paciente",
          modalidad: payload.modalidad || "online",
          fecha_sesion: payload.fecha_sesion,
          es_sesion_gratuita_mensual: Boolean(
            payload.es_sesion_gratuita_mensual
          ),
          enlace_o_lugar:
            payload.enlace_o_lugar ||
            "Sesión con Kelsie & Omar · Love Heals Effect",
          estado_cita: "programada",
        })
        .select("*")
        .single();

      return NextResponse.json({ ok: true, session: inserted });
    }

    if (action === "add_contact") {
      const current = Array.isArray(ficha.contactos_personales)
        ? ficha.contactos_personales
        : [];
      const updated = [
        ...current,
        {
          id: Date.now(),
          nombre: payload.nombre,
          rol: payload.rol || "Oncólogo / Médico",
          telefono: payload.telefono || "",
          correo: payload.correo || "",
        },
      ];
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ contactos_personales: updated })
        .eq("id", ficha.id);
      return NextResponse.json({ ok: true, items: updated });
    }

    if (action === "delete_contact") {
      const current = Array.isArray(ficha.contactos_personales)
        ? ficha.contactos_personales
        : [];
      const updated = current.filter(
        (_: any, idx: number) => idx !== payload.index
      );
      await supabaseAdmin
        .from("ficha_paciente")
        .update({ contactos_personales: updated })
        .eq("id", ficha.id);
      return NextResponse.json({ ok: true, items: updated });
    }

    if (action === "invite_caregiver") {
      const caregiverEmail = (payload.correo || "").toLowerCase().trim();
      const caregiverName = (payload.nombre || "Familiar").trim();
      if (!caregiverEmail) {
        return NextResponse.json(
          { ok: false, error: "Ingresa el correo de tu cuidador" },
          { status: 400 }
        );
      }

      await supabaseAdmin
        .from("ficha_paciente")
        .update({ correo_invitacion_cuidador: caregiverEmail })
        .eq("id", ficha.id);

      const origin =
        req.headers.get("origin") ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";

      const token = createInvitationToken({
        fichaId: ficha.id,
        targetEmail: caregiverEmail,
        targetRole: "cuidador",
        inviterName: user.nombre,
      });

      const inviteLink = `${origin}/auth/registro?token=${token}&rol=cuidador`;
      await sendCaregiverInvitationEmail({
        patientName: user.nombre,
        caregiverEmail,
        caregiverName,
        inviteLink,
      });

      return NextResponse.json({ ok: true, inviteLink });
    }

    if (action === "create_ticket") {
      const { data: ticket } = await supabaseAdmin
        .from("tickets_feedback")
        .insert({
          usuario_id: user.id,
          rol_usuario: "paciente",
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
    console.error("Error en PATCH /api/paciente/dashboard:", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo guardar el cambio" },
      { status: 500 }
    );
  }
}



/**
 * POST = funciones de PONO IA para la paciente:
 * ai_briefing · ai_recommend · ai_structure · ai_consult_summary
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

    const { user, ficha } = await resolvePatientAndFicha(req);

    const loadResources = async () => {
      const { data } = await supabaseAdmin
        .from("sanadores_y_contenidos")
        .select("*");
      const rows = Array.isArray(data) ? data : [];
      const db = rows.filter(
        (r) =>
          (r.tipo_registro === "contenido" || r.tipo_registro === "workshop") &&
          (r.publico_objetivo === "paciente" || r.publico_objetivo === "ambos")
      );
      return mergeResources(db);
    };

    const loadSessions = async () => {
      const { data } = await supabaseAdmin
        .from("citas_y_bitacora_sanador")
        .select("*")
        .eq("ficha_paciente_id", ficha.id);
      return Array.isArray(data) ? data : [];
    };

    // La línea de tiempo incluye las sesiones completadas con sanadores
    const buildTimeline = (sessions: any[]) => {
      const manual = Array.isArray(ficha.bitacora_clinica)
        ? ficha.bitacora_clinica
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
      return [...manual, ...fromSessions];
    };

    if (action === "ai_recommend") {
      const resources = await loadResources();
      const result = await aiRecommend({
        mood: String(payload.mood || "tranquila"),
        note: String(payload.note || ""),
        resources,
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
      const sessions = await loadSessions();
      let caregiverName: string | null = null;
      if (ficha.cuidador_usuario_id) {
        const { data: c } = await supabaseAdmin
          .from("usuarios")
          .select("nombre")
          .eq("id", ficha.cuidador_usuario_id)
          .maybeSingle();
        caregiverName = c?.nombre || null;
      }
      const result = await aiConsultSummary({
        audience: payload.audience === "sanador" ? "sanador" : "medico",
        ficha,
        timeline: buildTimeline(sessions),
        caregiverName,
        lang,
        today,
      });
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "ai_briefing") {
      const [resources, sessions] = await Promise.all([
        loadResources(),
        loadSessions(),
      ]);
      const result = await aiBriefing({
        name: String(user.nombre || "").split(" ")[0],
        ficha,
        sessions,
        timeline: buildTimeline(sessions),
        resources,
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
    console.error("Error en POST /api/paciente/dashboard (IA):", error);
    return NextResponse.json(
      { ok: false, error: "PONO IA no pudo responder en este momento" },
      { status: 500 }
    );
  }
}

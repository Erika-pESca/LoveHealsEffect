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
import { deleteLocalDocument } from "@/lib/local-documents";
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
    tipo_contenido: "academia_lhe",
    titulo_es: "Academia LHE · Lección 1: Reconectando con la Sabiduría de tu Cuerpo",
    titulo_en: "LHE Academy · Lesson 1: Reconnecting with Your Body's Wisdom",
    descripcion_es:
      "Primera lección del curso anual Love Heals Effect. Práctica semanal paso a paso de sanación individual (Individual Healing).",
    descripcion_en:
      "First lesson of the Love Heals Effect annual course. Step-by-step weekly individual healing practice.",
    media_url: "https://open.spotify.com",
    imagen_url: "/img/academy-lesson.jpg",
    duracion: "20 min",
    instructor: "Kelsie Reynolds",
    nivel: "Sanación Individual",
    categoria_doc: "academy_paid",
    publico_objetivo: "paciente",
    es_gratuito: false,
    costo_usd: 10,
  },
  {
    id: 402,
    tipo_registro: "contenido",
    tipo_contenido: "meditacion_audio",
    titulo_es: "Visualización Cuántica de Regeneración y Células Madre",
    titulo_en: "Quantum Stem Cell & Cellular Regeneration Visualization",
    descripcion_es:
      "Meditación guiada profunda de 25 minutos con frecuencias binaurales 528 Hz para apoyar tu sistema inmune durante el tratamiento activo.",
    descripcion_en:
      "Deep 25-minute guided meditation with 528 Hz binaural frequencies to support your immune system during active treatment.",
    media_url: "https://open.spotify.com",
    imagen_url: "/img/meditation-calm.jpg",
    duracion: "25 min",
    instructor: "Omar Melero",
    nivel: "Sanación Profunda",
    categoria_doc: "academy_paid",
    publico_objetivo: "paciente",
    es_gratuito: false,
    costo_usd: 10,
  },
  {
    id: 403,
    tipo_registro: "contenido",
    tipo_contenido: "video_bam",
    titulo_es: "Serie BAM Avanzada: 4 Semanas de Movimiento Consciente",
    titulo_en: "Advanced BAM Series: 4 Weeks of Mindful Movement",
    descripcion_es:
      "Secuencias progresivas diseñadas por Kelsie para recuperar rango articular, drenaje linfático y flexibilidad con amor y respeto a tus tiempos.",
    descripcion_en:
      "Progressive mindful movement sequences to regain range of motion, lymphatic flow, and flexibility.",
    media_url: "https://www.youtube.com",
    imagen_url: "/img/bam-movement.jpg",
    duracion: "30 min",
    instructor: "Kelsie Reynolds",
    nivel: "Restaurativo Pro",
    categoria_doc: "academy_paid",
    publico_objetivo: "paciente",
    es_gratuito: false,
    costo_usd: 10,
  },
  {
    id: 404,
    tipo_registro: "workshop",
    tipo_contenido: "workshop",
    titulo_es: "Peers Healing Live Webinar · Práctica entre Pares",
    titulo_en: "Peers Healing Live Webinar · Peer Practice",
    descripcion_es:
      "Encuentro mensual en vivo para pacientes de la membresía: práctica compartida de respiración, coaching grupal y preguntas con Omar y Kelsie.",
    descripcion_en:
      "Monthly live gathering for members: shared breathwork, peer coaching, and Q&A with Omar and Kelsie.",
    media_url: "https://zoom.us",
    imagen_url: "/img/love-circle.jpg",
    duracion: "45 min",
    instructor: "Omar Melero & Kelsie Reynolds",
    nivel: "Práctica en Pares",
    categoria_doc: "academy_paid",
    fecha_evento: "2026-12-05T18:00:00Z",
    publico_objetivo: "paciente",
    es_gratuito: false,
    costo_usd: 10,
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
    fecha: "2026-11-22",
    tipo: "cita",
    titulo: "Consulta de seguimiento con Oncología Médica",
    detalle:
      "Revisión de analítica sanguínea previa al ciclo. Neutrófilos y plaquetas en niveles estables para continuar tratamiento. Tolerancia favorable; se autorizan caminatas suaves y movimiento BAM.",
    medico: "Dra. Sarah Jenkins",
    lugar: "Queen's Medical Center, Honolulu",
    etiquetas: ["oncología", "laboratorio", "seguimiento"],
    origen: "manual",
    creado_en: "2026-11-22T10:30:00Z",
  },
  {
    id: 2,
    fecha: "2026-11-21",
    tipo: "sintoma",
    titulo: "Cansancio leve por la tarde y náusea matutina suave",
    detalle:
      "Disminuyó tras infusión tibia de jengibre, hidratación con electrolitos y 10 minutos de respiración 4-7-8. Buen apetito al mediodía y descanso reparador por la noche.",
    medico: "",
    lugar: "Casa",
    etiquetas: ["fatiga", "náuseas", "autocuidado"],
    origen: "manual",
    creado_en: "2026-11-21T14:15:00Z",
  },
  {
    id: 3,
    fecha: "2026-11-19",
    tipo: "procedimiento",
    titulo: "Ecografía mamaria de control y hemograma completo",
    detalle:
      "Respuesta tumoral favorable con reducción milimétrica observada en mama izquierda. Ganglios axilares sin variaciones adversas y valores hepáticos dentro de rango normal.",
    medico: "Dr. Michael Chen",
    lugar: "Kapi'olani Medical Center",
    etiquetas: ["ecografía", "hemograma", "control"],
    origen: "manual",
    creado_en: "2026-11-19T11:00:00Z",
  },
  {
    id: 4,
    fecha: "2026-11-17",
    tipo: "sanador",
    titulo: "Sesión 1 a 1 de movimiento BAM y cuencos con Kelsie",
    detalle:
      "Liberación miofascial suave de hombro y plexo solar, respiración consciente y baño de sonido con cuencos tibetanos. Sensación de calma profunda y mejor movilidad del brazo.",
    medico: "Kelsie Reynolds",
    lugar: "Love Heals Zoom (Honolulu)",
    etiquetas: ["BAM", "sonoterapia", "sanación"],
    origen: "manual",
    creado_en: "2026-11-17T17:00:00Z",
  },
  {
    id: 5,
    fecha: "2026-11-15",
    tipo: "medicamento",
    titulo: "Inicio de Tamoxifeno 20 mg y ajuste de Magnesio nocturno",
    detalle:
      "Toma de Tamoxifeno cada mañana con el desayuno y Magnesio Glicinato 400 mg antes de dormir para mejorar la calidad del sueño. Sin efectos adversos relevantes en los primeros días.",
    medico: "Dra. Sarah Jenkins",
    lugar: "Queen's Medical Center, Honolulu",
    etiquetas: ["tamoxifeno", "magnesio", "dosis"],
    origen: "manual",
    creado_en: "2026-11-15T09:00:00Z",
  },
  {
    id: 6,
    fecha: "2026-11-13",
    tipo: "nota",
    titulo: "Reflexión semanal y organización con mi cuidador",
    detalle:
      "Coordinamos los horarios de comidas antiinflamatorias y las dos citas de la próxima semana. Me sentí muy acompañada en el Love Circle del jueves; quiero repetir la meditación de gratitud.",
    medico: "",
    lugar: "Casa",
    etiquetas: ["gratitud", "familia", "love-circle"],
    origen: "manual",
    creado_en: "2026-11-13T19:20:00Z",
  },
  {
    id: 7,
    fecha: "2026-11-10",
    tipo: "sanador",
    titulo: "Acompañamiento emocional familiar con Omar",
    detalle:
      "Conversación abierta sobre cómo distribuir tareas en casa durante los días de mayor fatiga y herramientas prácticas de autorregulación para evitar sobrecarga.",
    medico: "Omar Melero",
    lugar: "Love Heals Zoom (Honolulu)",
    etiquetas: ["coaching", "célula-familiar", "apoyo"],
    origen: "manual",
    creado_en: "2026-11-10T16:00:00Z",
  },
  {
    id: 8,
    fecha: "2026-11-08",
    tipo: "sintoma",
    titulo: "Ligera rigidez en hombro izquierdo al despertar",
    detalle:
      "Cedió tras estiramientos suaves de 5 minutos y compresa tibia. Anotar para comentarlo en la próxima sesión de fisioterapia y BAM.",
    medico: "Dra. Maya Lin",
    lugar: "Casa",
    etiquetas: ["movilidad", "estiramientos"],
    origen: "manual",
    creado_en: "2026-11-08T08:45:00Z",
  },
];

const SAMPLE_CITAS = [
  {
    id: 100,
    titulo: "Control de laboratorio pre-ciclo",
    fecha: "2026-11-26",
    hora: "08:30 AM",
    lugar: "Queen's Medical Center · Laboratorio Central",
    medico: "Dra. Sarah Jenkins",
    notas: "Asistir en ayuno ligero con hidratación; resultados compartidos con tu oncóloga.",
  },
  {
    id: 101,
    titulo: "Consulta mensual con Dra. Jenkins (Oncología)",
    fecha: "2026-12-04",
    hora: "10:00 AM",
    lugar: "Queen's Medical Center - Consultorio 402",
    medico: "Dra. Sarah Jenkins",
    notas: "Llevar analítica reciente y tus preguntas anotadas para la consulta.",
  },
  {
    id: 102,
    titulo: "Sesión de Acupuntura y Regulación Nerviosa",
    fecha: "2026-12-08",
    hora: "03:30 PM",
    lugar: "Honolulu Holistic Center con Dra. Maya Lin",
    medico: "Dra. Maya Lin",
    notas: "Ropa cómoda de algodón e hidratación tibia después de la sesión.",
  },
];

const SAMPLE_HEALER_SESSIONS = [
  {
    id: 9001,
    sanador_usuario_id: 3,
    asistente_rol: "paciente",
    modalidad: "online",
    fecha_sesion: "2026-11-29T18:00:00-10:00",
    es_sesion_gratuita_mensual: true,
    enlace_o_lugar: "Love Circle for Patients · Respirar en paz y soltar tensión (Kelsie & Omar)",
    zoom_url: "https://zoom.us/j/lovehealseffect-circle",
    estado_cita: "confirmada",
    sample: true,
  },
  {
    id: 9002,
    sanador_usuario_id: 3,
    asistente_rol: "paciente",
    modalidad: "online",
    fecha_sesion: "2026-12-02T11:00:00-10:00",
    es_sesion_gratuita_mensual: true,
    enlace_o_lugar: "Sesión mensual gratuita 1 a 1 de Coaching y BAM con Kelsie Reynolds",
    zoom_url: "https://zoom.us/j/lovehealseffect-coaching",
    estado_cita: "programada",
    sample: true,
  },
];

/**
 * Biblioteca semilla por colección (Spotify, podcast, libros, guías...).
 * Según el ANEXO: "El sanador publica contenido gratuito (música, podcast, libros y guías)"
 * y "Perfil gratuito de Spotify de Love Heals". Se usa solo para los tipos que aún no
 * existan en la base de datos, así la galería nunca queda vacía en el piloto.
 */
const LIBRARY_SEED = [
  // ---------- Spotify ----------
  { id: 501, tipo_contenido: "spotify", titulo_es: "Calma para tus días de quimio", titulo_en: "Calm for your chemo days", descripcion_es: "Playlist suave para acompañarte durante la infusión y el descanso posterior.", descripcion_en: "Gentle playlist for infusion time and the rest afterwards.", media_url: "https://open.spotify.com/search/healing%20calm%20piano", imagen_url: "/img/meditation-calm.jpg", duracion: "1 h 12 min", instructor: "Kelsie Reynolds", nivel: "24 canciones" },
  { id: 502, tipo_contenido: "spotify", titulo_es: "Aloha Sleep · Océano de O'ahu", titulo_en: "Aloha Sleep · O'ahu Ocean", descripcion_es: "Sonidos del mar de Hawái y música ambiental para dormir profundo.", descripcion_en: "Hawaiian ocean sounds and ambient music for deep sleep.", media_url: "https://open.spotify.com/search/ocean%20sleep%20hawaii", imagen_url: "/img/sound-healing.jpg", duracion: "58 min", instructor: "Omar Melero", nivel: "18 canciones" },
  { id: 503, tipo_contenido: "spotify", titulo_es: "Frecuencias 432 Hz para descansar", titulo_en: "432 Hz frequencies to rest", descripcion_es: "Cuencos y tonos sostenidos para bajar el ritmo del sistema nervioso.", descripcion_en: "Bowls and sustained tones to slow the nervous system.", media_url: "https://open.spotify.com/search/432%20hz%20healing", imagen_url: "/img/sound-healing.jpg", duracion: "45 min", instructor: "Omar Melero", nivel: "12 canciones" },
  { id: 504, tipo_contenido: "spotify", titulo_es: "Mañanas suaves · Música para tu BAM", titulo_en: "Soft mornings · Music for your BAM", descripcion_es: "Ritmos lentos para acompañar tu movimiento consciente diario.", descripcion_en: "Slow rhythms for your daily mindful movement.", media_url: "https://open.spotify.com/search/gentle%20morning%20yoga", imagen_url: "/img/bam-movement.jpg", duracion: "35 min", instructor: "Kelsie Reynolds", nivel: "10 canciones" },
  // ---------- Podcast ----------
  { id: 511, tipo_contenido: "podcast", titulo_es: "Ep. 1 · Lo que nadie te dice del diagnóstico", titulo_en: "Ep. 1 · What no one tells you about diagnosis", descripcion_es: "Kelsie comparte su historia como sobreviviente y cómo nació Love Heals Effect.", descripcion_en: "Kelsie shares her survivor story and how Love Heals Effect was born.", media_url: "https://open.spotify.com/search/breast%20cancer%20podcast", imagen_url: "/img/love-circle.jpg", duracion: "32 min", instructor: "Kelsie Reynolds & Omar Melero", nivel: "Episodio 1" },
  { id: 512, tipo_contenido: "podcast", titulo_es: "Ep. 2 · Cuidar sin agotarse", titulo_en: "Ep. 2 · Caring without burning out", descripcion_es: "Omar habla con cuidadores sobre límites, descanso y pedir ayuda.", descripcion_en: "Omar talks with caregivers about limits, rest and asking for help.", media_url: "https://open.spotify.com/search/caregiver%20podcast", imagen_url: "/img/love-circle.jpg", duracion: "28 min", instructor: "Omar Melero", nivel: "Episodio 2" },
  { id: 513, tipo_contenido: "podcast", titulo_es: "Ep. 3 · Comer con amor durante el tratamiento", titulo_en: "Ep. 3 · Eating with love during treatment", descripcion_es: "Ideas sencillas para cuando no hay apetito o hay náuseas.", descripcion_en: "Simple ideas for when appetite is low or nausea shows up.", media_url: "https://open.spotify.com/search/nutrition%20cancer%20podcast", imagen_url: "/img/healthy-cooking.jpg", duracion: "25 min", instructor: "Kelsie Reynolds", nivel: "Episodio 3" },
  // ---------- Libros ----------
  { id: 521, tipo_contenido: "libro", titulo_es: "Radical Remission", titulo_en: "Radical Remission", autor: "Kelly A. Turner", color: "#DC5678", descripcion_es: "Los 9 factores comunes en personas que superaron el cáncer contra todo pronóstico.", descripcion_en: "The 9 common factors among people who beat the odds.", media_url: "https://www.amazon.com/s?k=Radical+Remission+Kelly+Turner", duracion: "336 págs", instructor: "Kelsie Reynolds", nivel: "Recomendado" },
  { id: 522, tipo_contenido: "libro", titulo_es: "Anticáncer", titulo_en: "Anticancer: A New Way of Life", autor: "David Servan-Schreiber", color: "#239BA2", descripcion_es: "Hábitos de alimentación, movimiento y emoción que apoyan al cuerpo.", descripcion_en: "Food, movement and emotional habits that support the body.", media_url: "https://www.amazon.com/s?k=Anticancer+Servan-Schreiber", duracion: "400 págs", instructor: "Omar Melero", nivel: "Recomendado" },
  { id: 523, tipo_contenido: "libro", titulo_es: "The Cancer Journals", titulo_en: "The Cancer Journals", autor: "Audre Lorde", color: "#7A4FD1", descripcion_es: "Un diario honesto y poderoso sobre vivir el cáncer de mama.", descripcion_en: "An honest, powerful journal about living with breast cancer.", media_url: "https://www.amazon.com/s?k=The+Cancer+Journals+Audre+Lorde", duracion: "96 págs", instructor: "Kelsie Reynolds", nivel: "Recomendado" },
  { id: 524, tipo_contenido: "libro", titulo_es: "Crazy Sexy Cancer Tips", titulo_en: "Crazy Sexy Cancer Tips", autor: "Kris Carr", color: "#E8A23A", descripcion_es: "Consejos prácticos y con humor para atravesar el tratamiento.", descripcion_en: "Practical, funny tips for getting through treatment.", media_url: "https://www.amazon.com/s?k=Crazy+Sexy+Cancer+Tips", duracion: "208 págs", instructor: "Kelsie Reynolds", nivel: "Recomendado" },
  // ---------- Guías descargables ----------
  { id: 531, tipo_contenido: "guia_pdf", titulo_es: "Guía para tu primera quimioterapia", titulo_en: "Guide for your first chemo", descripcion_es: "Qué llevar, qué preguntar y cómo cuidarte los días siguientes.", descripcion_en: "What to bring, what to ask and how to care for yourself after.", media_url: "#guia-quimio", imagen_url: "/img/academy-lesson.jpg", duracion: "8 págs", instructor: "Kelsie Reynolds", nivel: "PDF" },
  { id: 532, tipo_contenido: "guia_pdf", titulo_es: "Guía del cuidador: primeras 4 semanas", titulo_en: "Caregiver guide: first 4 weeks", descripcion_es: "Organización, señales de alerta y autocuidado para quien acompaña.", descripcion_en: "Organization, warning signs and self-care for companions.", media_url: "#guia-cuidador", imagen_url: "/img/love-circle.jpg", duracion: "12 págs", instructor: "Omar Melero", nivel: "PDF" },
  { id: 533, tipo_contenido: "guia_pdf", titulo_es: "Recetario alcalino Love Heals", titulo_en: "Love Heals alkaline recipe book", descripcion_es: "Caldos, batidos e infusiones fáciles para días de poco apetito.", descripcion_en: "Easy broths, smoothies and teas for low-appetite days.", media_url: "#recetario", imagen_url: "/img/healthy-cooking.jpg", duracion: "10 págs", instructor: "Kelsie Reynolds", nivel: "PDF" },
  // ---------- Extras para colecciones existentes ----------
  { id: 541, tipo_contenido: "meditacion_audio", titulo_es: "Respiración 4-7-8 para dormir", titulo_en: "4-7-8 breathing for sleep", descripcion_es: "Audio corto para soltar el día y conciliar el sueño.", descripcion_en: "Short audio to let go of the day and fall asleep.", media_url: "https://open.spotify.com/search/478%20breathing", imagen_url: "/img/meditation-calm.jpg", duracion: "8 min", instructor: "Omar Melero", nivel: "Para dormir" },
  { id: 542, tipo_contenido: "video_bam", titulo_es: "BAM de hombros y brazos tras cirugía", titulo_en: "BAM for shoulders & arms after surgery", descripcion_es: "Movimientos muy suaves para recuperar rango sin dolor.", descripcion_en: "Very gentle moves to regain range without pain.", media_url: "https://www.youtube.com/results?search_query=gentle+arm+exercises+after+mastectomy", imagen_url: "/img/bam-movement.jpg", duracion: "12 min", instructor: "Kelsie Reynolds", nivel: "Post-cirugía" },
].map((r) => ({
  ...r,
  tipo_registro: "contenido",
  categoria_doc: "support_free",
  publico_objetivo: "ambos",
  es_gratuito: true,
}));

function mergeResources(dbResources: any[]) {
  let base: any[];
  if (dbResources.length > 0) {
    const ids = new Set(dbResources.map((r: any) => r.id));
    const types = new Set(dbResources.map((r: any) => r.tipo_contenido));
    base = [
      ...dbResources,
      ...LIBRARY_SEED.filter((r) => !types.has(r.tipo_contenido) && !ids.has(r.id)),
    ];
  } else {
    base = [...DEFAULT_RESOURCES, ...LIBRARY_SEED];
  }
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
    imagen_url: "/img/bam-movement.jpg",
    duracion: "15 min",
    instructor: "Kelsie Reynolds",
    nivel: "Nivel Suave",
    categoria_doc: "support_free",
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
      "Audio guiado de 10 minutos para regular la ansiedad, calmar palpitaciones y centrarte antes de exámenes o consultas médicas.",
    descripcion_en:
      "10-minute guided audio to regulate anxiety and feel grounded before medical consultations.",
    media_url: "https://open.spotify.com",
    imagen_url: "/img/meditation-calm.jpg",
    duracion: "10 min",
    instructor: "Kelsie Reynolds",
    nivel: "Calma Rápida",
    categoria_doc: "support_free",
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
      "Sesión de musicoterapia restaurativa grabada en la costa de Oahu. Ideal para relajación vespertina o conciliar el sueño profundo.",
    descripcion_en:
      "Restorative sound therapy recorded on the Oahu coast. Ideal for deep sleep and cellular ease.",
    media_url: "https://open.spotify.com",
    imagen_url: "/img/sound-healing.jpg",
    duracion: "20 min",
    instructor: "Omar Melero",
    nivel: "Relajación Total",
    categoria_doc: "support_free",
    publico_objetivo: "ambos",
    es_gratuito: true,
  },
  {
    id: 204,
    tipo_registro: "contenido",
    tipo_contenido: "guia_autocuidado",
    titulo_es: "Cocina Saludable: Caldos Antiinflamatorios e Infusiones",
    titulo_en: "Healthy Cooking: Anti-inflammatory Broths & Teas",
    descripcion_es:
      "Guía y video práctico con recetas de caldos de cúrcuma y jengibre, alimentos alcalinos y batidos para aliviar náuseas.",
    descripcion_en:
      "Simple culinary video and recipes of turmeric-ginger broths and alkalizing smoothies to ease nausea.",
    media_url: "#guia-nutricion",
    imagen_url: "/img/healthy-cooking.jpg",
    duracion: "12 min",
    instructor: "Dra. Maya Lin & Kelsie",
    nivel: "Nutrición Fácil",
    categoria_doc: "support_free",
    publico_objetivo: "ambos",
    es_gratuito: true,
  },
  {
    id: 205,
    tipo_registro: "contenido",
    tipo_contenido: "tapping_eft",
    titulo_es: "Tapping EFT para Calmar el Miedo y la Incertidumbre",
    titulo_en: "EFT Tapping to Calm Fear & Uncertainty",
    descripcion_es:
      "Técnica de Liberación Emocional guiada para reducir la carga de estrés y reprogramar el sistema nervioso en momentos difíciles.",
    descripcion_en:
      "Guided Emotional Freedom Technique to release emotional stress and ground yourself in moments of uncertainty.",
    media_url: "https://www.youtube.com",
    imagen_url: "/img/tapping-eft.jpg",
    duracion: "14 min",
    instructor: "Omar Melero",
    nivel: "Regulación Emocional",
    categoria_doc: "support_free",
    publico_objetivo: "ambos",
    es_gratuito: true,
  },
  {
    id: 206,
    tipo_registro: "workshop",
    tipo_contenido: "love_circle",
    titulo_es: "Love Circle for Patients · Círculo Semanal con Kelsie y Omar",
    titulo_en: "Love Circle for Patients · Weekly Circle with Kelsie & Omar",
    descripcion_es:
      "Espacio íntimo y 100% gratuito de contención entre mujeres en tratamiento y sobrevivientes (Zoom en vivo desde Honolulu).",
    descripcion_en:
      "Free intimate support circle for breast cancer patients and survivors (Live Zoom from Honolulu).",
    media_url: "https://zoom.us",
    imagen_url: "/img/love-circle.jpg",
    duracion: "60 min",
    instructor: "Kelsie Reynolds & Omar Melero",
    nivel: "Comunidad en Vivo",
    categoria_doc: "support_free",
    fecha_evento: "2026-11-28T18:00:00Z",
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
      healerUsersRes,
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
        .from("usuarios")
        .select("id, nombre")
        .in("rol", ["sanador", "admin"]),
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
    const healerUsers = Array.isArray(healerUsersRes?.data) ? healerUsersRes.data : [];
    const healerNameById = new Map<number, string>();
    healerUsers.forEach((u: any) => {
      if (u?.id && u?.nombre) healerNameById.set(Number(u.id), String(u.nombre));
    });
    const dbHealers = rows.filter((r) => r.tipo_registro === "perfil_sanador");
    dbHealers.forEach((h: any) => {
      if (h?.sanador_usuario_id && !healerNameById.has(Number(h.sanador_usuario_id)) && h?.especialidad) {
        healerNameById.set(Number(h.sanador_usuario_id), String(h.especialidad).split("·")[0].trim());
      }
    });
    const dbResources = rows
      .filter(
        (r) =>
          (r.tipo_registro === "contenido" || r.tipo_registro === "workshop") &&
          (r.publico_objetivo === "paciente" || r.publico_objetivo === "ambos")
      )
      .map((r) => ({
        ...r,
        instructor:
          r.instructor ||
          healerNameById.get(Number(r.sanador_usuario_id)) ||
          "Love Heals Effect",
      }));

    const healers = dbHealers.length > 0 ? dbHealers : DEFAULT_HEALERS;
    const resources = mergeResources(dbResources);

    // Citas con sanadores (citas_y_bitacora_sanador)
    const sessionsData = sessionsDataRes?.data;
    const healerSessions =
      Array.isArray(sessionsData) && sessionsData.length > 0
        ? sessionsData
        : SAMPLE_HEALER_SESSIONS;

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

    // ---- Bitácora manual ----
    if (action === "add_bitacora") {
      await pushTimeline({
        fecha: String(payload.fecha || today).slice(0, 10),
        tipo: payload.tipo || "nota",
        titulo: String(payload.titulo || "Nota").slice(0, 120),
        detalle: payload.detalle || "",
        medico: payload.medico || "",
        lugar: payload.lugar || "",
        etiquetas: Array.isArray(payload.etiquetas) ? payload.etiquetas : [],
        origen: "manual",
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "update_bitacora") {
      const updated = timeline.map((e) =>
        e.id === payload.id
          ? {
              ...e,
              fecha: String(payload.fecha || e.fecha || today).slice(0, 10),
              tipo: payload.tipo || e.tipo || "nota",
              titulo: String(payload.titulo || e.titulo || "Nota").slice(0, 120),
              detalle: payload.detalle ?? e.detalle ?? "",
              medico: payload.medico ?? e.medico ?? "",
              lugar: payload.lugar ?? e.lugar ?? "",
              etiquetas: Array.isArray(payload.etiquetas)
                ? payload.etiquetas
                : e.etiquetas || [],
            }
          : e
      );
      const { error: err } = await supabaseAdmin
        .from("ficha_paciente")
        .update({ bitacora_clinica: updated })
        .eq("id", ficha.id);
      if (err) {
        await supabaseAdmin
          .from("ficha_paciente")
          .update({ resultados_laboratorio: updated })
          .eq("id", ficha.id);
      }
      return NextResponse.json({ ok: true, timeline: updated });
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
      return NextResponse.json({ ok: true, timeline: kept });
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
          archivoStorageName: payload.archivoStorageName || "",
          archivoRuta: payload.archivoRuta || "",
          mimeType: payload.mimeType || "",
          sizeBytes: payload.sizeBytes || 0,
          subidoPor: "paciente",
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
      const targetDoc = current[payload.index];
      if (targetDoc?.archivoStorageName) {
        await deleteLocalDocument(ficha.id, targetDoc.archivoStorageName);
      }
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

    if (action === "reschedule_healer_session") {
      if (payload.id && Number(payload.id) < 9000) {
        await supabaseAdmin
          .from("citas_y_bitacora_sanador")
          .update({
            fecha_sesion: payload.fecha_sesion,
            estado_cita: "reprogramada",
          })
          .eq("id", Number(payload.id));
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "cancel_healer_session") {
      if (payload.id && Number(payload.id) < 9000) {
        await supabaseAdmin
          .from("citas_y_bitacora_sanador")
          .update({ estado_cita: "cancelada" })
          .eq("id", Number(payload.id));
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "update_medical_appointment") {
      const base =
        Array.isArray(ficha.citas_medicas) && ficha.citas_medicas.length > 0
          ? [...ficha.citas_medicas]
          : [...SAMPLE_CITAS];
      const idx = Number(payload.index);
      if (base[idx]) {
        base[idx] = {
          ...base[idx],
          fecha: payload.fecha || base[idx].fecha,
          hora: payload.hora ?? base[idx].hora,
          notas: payload.notas ?? base[idx].notas,
        };
        await supabaseAdmin
          .from("ficha_paciente")
          .update({ citas_medicas: base })
          .eq("id", ficha.id);
      }
      return NextResponse.json({ ok: true, items: base });
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

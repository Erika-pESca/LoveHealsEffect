"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Crown,
  FileText,
  Headphones,
  HeartHandshake,
  Image as ImageIcon,
  Lock,
  MapPin,
  Mic,
  Music,
  Play,
  Search,
  Sparkles,
  Users,
  Utensils,
  Video,
  Wind,
  X,
} from "lucide-react";

export interface RecursosSectionProps {
  resources: any[];
  healers?: any[];
  /** Guarda la vista actual: "todos" (inicio), "col:<id>|<sanador>" o "healer:<nombre>" */
  resourceFilter: string;
  setResourceFilter: (filter: string) => void;
  isPremium: boolean;
  openSheet: (name: string, initial?: Record<string, string>) => void;
  canOpenItem: (item: any) => boolean;
  openResource: (item: any, can: boolean) => void;
  runAction: (action: string, payload?: any, successToast?: string, options?: any) => Promise<any>;
  fmtDate: (d: string) => string;
  t: (es: string, en: string) => string;
  isEs: boolean;
}

/* ------------------------------------------------------------------ */
/*  Configuración de colecciones (cada una = una "puerta" con su foto) */
/* ------------------------------------------------------------------ */

type Layout = "tracks" | "videos" | "books" | "docs";

interface Collection {
  id: string;
  types: string[];
  es: string;
  en: string;
  descEs: string;
  descEn: string;
  helpsEs: string;
  helpsEn: string;
  tagsEs: string[];
  tagsEn: string[];
  img: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  layout: Layout;
}

const COLLECTIONS: Collection[] = [
  {
    id: "spotify",
    types: ["spotify"],
    es: "Música en Spotify",
    en: "Music on Spotify",
    descEs: "Playlists curadas por nuestros sanadores",
    descEn: "Playlists curated by our healers",
    helpsEs:
      "Acompañarte durante tus sesiones de quimioterapia o salas de espera, bajar la ansiedad del cuerpo y ayudarte a conciliar un sueño profundo en casa.",
    helpsEn:
      "Support you during chemotherapy or waiting rooms, calm body anxiety, and help you fall into deep, restorative sleep at home.",
    tagsEs: ["Calma en quimio", "Bajar ansiedad", "Dormir mejor", "Ánimo suave"],
    tagsEn: ["Chemo calm", "Lower anxiety", "Better sleep", "Gentle mood"],
    img: "/img/meditation-calm.jpg",
    icon: Headphones,
    accent: "#1DB954",
    layout: "tracks",
  },
  {
    id: "meditaciones",
    types: ["meditacion_audio"],
    es: "Meditaciones",
    en: "Meditations",
    descEs: "Audios guiados de autosanación",
    descEn: "Guided self-healing audios",
    helpsEs:
      "Regular las palpitaciones y el miedo antes de exámenes o consultas médicas, reconectar con tu respiración y cultivar calma mental.",
    helpsEn:
      "Regulate racing thoughts and fear before scans or medical visits, reconnect with your breath, and cultivate inner calm.",
    tagsEs: ["Antes de citas médicas", "Calmar el miedo", "Respiración guiada"],
    tagsEn: ["Before appointments", "Calm fear", "Guided breath"],
    img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    icon: Wind,
    accent: "#7A4FD1",
    layout: "tracks",
  },
  {
    id: "videos",
    types: ["video_bam"],
    es: "Movimiento BAM",
    en: "BAM Movement",
    descEs: "Videos de movimiento consciente",
    descEn: "Mindful movement videos",
    helpsEs:
      "Recuperar movilidad suave en brazos, pecho y hombros tras cirugía o quimio, apoyar el drenaje linfático y soltar la rigidez sin dolor.",
    helpsEn:
      "Gently restore mobility in arms, chest, and shoulders post-surgery or chemo, support lymphatic flow, and release stiffness safely.",
    tagsEs: ["Drenaje linfático", "Movilidad post-cirugía", "Cero impacto"],
    tagsEn: ["Lymphatic flow", "Post-surgery mobility", "Zero impact"],
    img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    icon: Video,
    accent: "#DC5678",
    layout: "videos",
  },
  {
    id: "libros",
    types: ["libro"],
    es: "Libros",
    en: "Books",
    descEs: "Lecturas que recomiendan nuestros sanadores",
    descEn: "Reads our healers recommend",
    helpsEs:
      "Comprender tu proceso con esperanza, aprender hábitos integrativos respaldados por sobrevivientes y sentirte acompañada en cada etapa.",
    helpsEn:
      "Understand your journey with hope, learn integrative habits backed by survivors, and feel accompanied at every stage.",
    tagsEs: ["Esperanza realista", "Hábitos anticáncer", "Historias reales"],
    tagsEn: ["Grounded hope", "Anticancer habits", "Real stories"],
    img: "/img/academy-lesson.jpg",
    icon: BookOpen,
    accent: "#B98A00",
    layout: "books",
  },
  {
    id: "podcast",
    types: ["podcast"],
    es: "Podcast",
    en: "Podcast",
    descEs: "Conversaciones Love Heals",
    descEn: "Love Heals conversations",
    helpsEs:
      "Escuchar conversaciones honestas sobre el diagnóstico, el descanso familiar, los límites sanos y cómo cuidar sin agotarse.",
    helpsEn:
      "Listen to honest conversations about diagnosis, family rest, healthy boundaries, and how to care without burning out.",
    tagsEs: ["Acompañamiento emocional", "Familia y cuidador", "Testimonios"],
    tagsEn: ["Emotional support", "Family & caregiver", "Stories"],
    img: "/img/love-circle.jpg",
    icon: Mic,
    accent: "#C94A6A",
    layout: "tracks",
  },
  {
    id: "musicoterapia",
    types: ["musicoterapia"],
    es: "Musicoterapia",
    en: "Music therapy",
    descEs: "Cuencos y sonidos que relajan",
    descEn: "Bowls and relaxing sounds",
    helpsEs:
      "Descansar el sistema nervioso mediante cuencos de cuarzo, frecuencias armónicas y paisajes sonoros de Hawái cuando no tienes energía para hablar.",
    helpsEn:
      "Rest your nervous system through quartz bowls, harmonic frequencies, and Hawaiian soundscapes when you just need quiet rest.",
    tagsEs: ["Cuencos 432 Hz", "Descanso nervioso", "Relajación profunda"],
    tagsEn: ["432 Hz bowls", "Nervous system rest", "Deep relaxation"],
    img: "/img/sound-healing.jpg",
    icon: Music,
    accent: "#239BA2",
    layout: "tracks",
  },
  {
    id: "tapping",
    types: ["tapping_eft"],
    es: "Tapping y respiración",
    en: "Tapping & breathwork",
    descEs: "Técnicas para calmar las emociones",
    descEn: "Techniques to calm emotions",
    helpsEs:
      "Liberar picos de angustia, incertidumbre o insomnio en pocos minutos estimulando puntos suaves de acupresión con tu propia mano.",
    helpsEn:
      "Release spikes of distress, uncertainty, or insomnia in minutes by gently tapping calming acupressure points.",
    tagsEs: ["Alivio en 10 min", "Manejo del miedo", "Regulación emocional"],
    tagsEn: ["10-min relief", "Fear management", "Emotional regulation"],
    img: "/img/tapping-eft.jpg",
    icon: Sparkles,
    accent: "#7A4FD1",
    layout: "videos",
  },
  {
    id: "cocina",
    types: ["guia_autocuidado"],
    es: "Cocina saludable",
    en: "Healthy cooking",
    descEs: "Recetas y alimentación con amor",
    descEn: "Recipes and loving nutrition",
    helpsEs:
      "Aliviar náuseas y falta de apetito con caldos antiinflamatorios, infusiones digestivas y preparaciones sencillas para ti y tu cuidador.",
    helpsEn:
      "Ease nausea and low appetite with anti-inflammatory broths, digestive teas, and simple recipes for you and your caregiver.",
    tagsEs: ["Aliviar náuseas", "Caldos e infusiones", "Fácil para el cuidador"],
    tagsEn: ["Ease nausea", "Broths & teas", "Easy for caregivers"],
    img: "/img/healthy-cooking.jpg",
    icon: Utensils,
    accent: "#5C8D67",
    layout: "videos",
  },
  {
    id: "guias",
    types: ["guia_pdf"],
    es: "Guías descargables",
    en: "Downloadable guides",
    descEs: "PDFs prácticos para tu proceso",
    descEn: "Practical PDFs for your journey",
    helpsEs:
      "Tener a la mano listas prácticas para tu primera quimio, preguntas para el oncólogo y pasos claros para las primeras semanas en casa.",
    helpsEn:
      "Keep handy checklists for your first chemo, questions for your oncologist, and clear steps for your first weeks at home.",
    tagsEs: ["Listas paso a paso", "Para imprimir o guardar", "Paciente y cuidador"],
    tagsEn: ["Step-by-step lists", "Print or save", "Patient & caregiver"],
    img: "/img/academy-lesson.jpg",
    icon: FileText,
    accent: "#262322",
    layout: "docs",
  },
];

const ACADEMY: Collection = {
  id: "academia",
  types: [],
  es: "The Love Heals Effect Academy",
  en: "The Love Heals Effect Academy",
  descEs: "Lecciones semanales, meditaciones avanzadas y webinars en vivo",
  descEn: "Weekly lessons, advanced meditations and live webinars",
  helpsEs:
    "Profundizar semana a semana en los 3 pilares del curso Love Heals Effect: sanación individual, práctica en vivo entre pares y grupos avanzados.",
  helpsEn:
    "Go deeper week by week across the 3 pillars of The Love Heals Effect course: individual healing, live peer practice, and advanced circles.",
  tagsEs: ["Individual Healing", "Peers Healing", "Collective Healing"],
  tagsEn: ["Individual Healing", "Peers Healing", "Collective Healing"],
  img: "/img/academy-lesson.jpg",
  icon: Crown,
  accent: "#B98A00",
  layout: "videos",
};

export interface HealerSummary {
  id?: number;
  name: string;
  specialtyEs: string;
  specialtyEn: string;
  bioEs: string;
  bioEn: string;
  grad: string;
  avatarUrl?: string;
}

/** Respaldo base cuando aún no hay ficha en BD para un sanador. */
const FALLBACK_HEALERS: Record<string, HealerSummary> = {
  "Kelsie Reynolds": {
    id: 101,
    name: "Kelsie Reynolds",
    specialtyEs: "Sobreviviente · Coach holística de cáncer de mama y Movimiento BAM",
    specialtyEn: "Survivor · Holistic Breast Cancer Coach & BAM Movement",
    bioEs:
      "Cofundadora de Love Heals Effect en Honolulu. Acompaña a mujeres en tratamiento y recuperación a liberar tensión linfática, habitar su cuerpo con calma y sostener la esperanza.",
    bioEn:
      "Co-founder of Love Heals Effect in Honolulu. Helps women in treatment and recovery release lymphatic tension, inhabit their body gently, and hold grounded hope.",
    grad: "from-[#E8809A] to-[#C94A6A]",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  },
  "Omar Melero": {
    id: 102,
    name: "Omar Melero",
    specialtyEs: "Coach integrativo · Regulación del sistema nervioso y apoyo a cuidadores",
    specialtyEn: "Integrative Coach · Nervous System Regulation & Caregiver Support",
    bioEs:
      "Cofundador de Love Heals Effect. Especialista en respiración consciente, descanso profundo, Tapping EFT y resiliencia emocional para pacientes y quienes cuidan en casa.",
    bioEn:
      "Co-founder of Love Heals Effect. Specialist in conscious breathwork, deep rest, EFT Tapping, and emotional resilience for patients and family caregivers.",
    grad: "from-[#239BA2] to-[#166064]",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  "Dra. Maya Lin": {
    name: "Dra. Maya Lin",
    specialtyEs: "Medicina integrativa · Acupuntura oncológica y nutrición antiinflamatoria",
    specialtyEn: "Integrative Medicine · Oncology Acupuncture & Anti-inflammatory Nutrition",
    bioEs:
      "Especialista invitada en Honolulu en alimentación alcalina, alivio natural de náuseas post-quimioterapia y equilibrio digestivo.",
    bioEn:
      "Guest specialist in Honolulu focused on alkaline nutrition, natural post-chemo nausea relief, and digestive balance.",
    grad: "from-[#5C8D67] to-[#239BA2]",
    avatarUrl:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
  },
};

export interface CircleEventInfo {
  iso: string;
  es: string;
  en: string;
  fullDateEs: string;
  fullDateEn: string;
  time: string;
  badgeEs: string;
  badgeEn: string;
  topicEs: string;
  topicEn: string;
  host: string;
  img: string;
  videoUrl: string;
  summaryEs: string;
  summaryEn: string;
  whereEs: string;
  whereEn: string;
  whoEs: string;
  whoEn: string;
  stepsEs: { time: string; title: string; detail: string }[];
  stepsEn: { time: string; title: string; detail: string }[];
  bringEs: string[];
  bringEn: string[];
  spots: number;
}

/** Próximas fechas de Healing & Love Circles con resumen, imagen, video y dinámica interactiva. */
const UPCOMING_CIRCLES: CircleEventInfo[] = [
  {
    iso: "2026-11-29T18:00:00-10:00",
    es: "Sáb 29 Nov",
    en: "Sat Nov 29",
    fullDateEs: "Sábado 29 de Noviembre · 6:00 PM HST",
    fullDateEn: "Saturday, November 29 · 6:00 PM HST",
    time: "6:00 PM HST · 60 min",
    badgeEs: "Love Circle · Pacientes",
    badgeEn: "Love Circle · Patients",
    topicEs: "Respirar en paz y soltar tensión",
    topicEn: "Breathe in peace, release tension",
    host: "Kelsie Reynolds & Omar Melero",
    img: "/img/love-circle.jpg",
    videoUrl: "https://www.youtube.com/embed/inpok4MKVLM?rel=0",
    summaryEs:
      "Un encuentro cálido y guiado para bajar la ansiedad acumulada de la semana, suavizar el cuerpo después de tratamientos o consultas médicas y descansar acompañada por mujeres que comprenden lo que vives.",
    summaryEn:
      "A warm guided gathering to release weekly anxiety, soften your body after medical visits or treatments, and rest alongside women who truly understand your journey.",
    whereEs:
      "En línea en vivo por Zoom (recibes tu enlace privado al correo apenas te inscribes) o presencial en nuestro espacio de Honolulu, O'ahu.",
    whereEn:
      "Live online via Zoom (your private link is sent to your email upon signup) or in person at our Honolulu, O'ahu space.",
    whoEs: "Pacientes y sobrevivientes · Cámara opcional (puedes hablar o solo escuchar en calma).",
    whoEn: "Patients & survivors · Camera optional (share openly or simply listen in peace).",
    stepsEs: [
      { time: "10 min", title: "Bienvenida Aloha sin presiones", detail: "Llegamos con calma, nos saludamos y preparamos un espacio seguro." },
      { time: "25 min", title: "Respiración 4-7-8 y alivio de hombros", detail: "Práctica suave guiada en vivo por Kelsie para relajar pecho, cuello y sistema linfático." },
      { time: "25 min", title: "Círculo de compañía y escucha", detail: "Quien lo desee comparte cómo va su semana y cerramos con una intención de paz." },
    ],
    stepsEn: [
      { time: "10 min", title: "Pressure-free Aloha welcome", detail: "Arrive gently, settle in, and open a safe space together." },
      { time: "25 min", title: "4-7-8 breathwork & shoulder release", detail: "Gentle live practice with Kelsie to relax chest, neck, and lymphatic tension." },
      { time: "25 min", title: "Companionship & listening circle", detail: "Optional sharing and a peaceful closing intention together." },
    ],
    bringEs: ["Ropa cómoda", "Agua o infusión tibia", "Manta o cojín suave"],
    bringEn: ["Comfortable clothes", "Water or warm tea", "Soft blanket or pillow"],
    spots: 8,
  },
  {
    iso: "2026-12-06T18:00:00-10:00",
    es: "Sáb 6 Dic",
    en: "Sat Dec 6",
    fullDateEs: "Sábado 6 de Diciembre · 6:00 PM HST",
    fullDateEn: "Saturday, December 6 · 6:00 PM HST",
    time: "6:00 PM HST · 60 min",
    badgeEs: "Círculo Familiar 1 a 1",
    badgeEn: "1-on-1 Family Circle",
    topicEs: "Pacientes y cuidadores juntos",
    topicEn: "Patients and caregivers together",
    host: "Omar Melero & Kelsie Reynolds",
    img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/embed/aEqlQvczMJQ?rel=0",
    summaryEs:
      "Espacio pensado para asistir sola o acompañada de tu cuidador/familiar. Aprenderán ejercicios simples para bajar el agotamiento en casa, pedir apoyo sin culpa y cuidarse mutuamente.",
    summaryEn:
      "Designed to attend solo or with your caregiver/family member. Learn simple practices to ease household burnout, ask for help without guilt, and care for each other.",
    whereEs:
      "En vivo por Zoom (pueden conectarse juntos desde casa o desde ciudades distintas) y cupos presenciales en Honolulu.",
    whereEn:
      "Live on Zoom (join together from home or from different locations) plus in-person spots in Honolulu.",
    whoEs: "Pacientes, cuidadores y familiares cercanos.",
    whoEn: "Patients, caregivers, and close family members.",
    stepsEs: [
      { time: "10 min", title: "Encuentro de familias Love Heals", detail: "Reconocemos tanto el proceso de la paciente como el corazón de quien cuida." },
      { time: "25 min", title: "Dinámica de regulación del sistema nervioso", detail: "Omar guía ejercicios prácticos de respiración compartida y manejo del estrés." },
      { time: "25 min", title: "Herramientas para la semana en casa", detail: "Preguntas abiertas a Omar y Kelsie y acuerdos sencillos de descanso familiar." },
    ],
    stepsEn: [
      { time: "10 min", title: "Love Heals family welcome", detail: "Honoring both the patient's journey and the caregiver's heart." },
      { time: "25 min", title: "Co-regulating the nervous system", detail: "Omar guides practical shared breathing and stress-relief tools." },
      { time: "25 min", title: "Take-home weekly tools & Q&A", detail: "Open questions with Omar & Kelsie and simple family rest agreements." },
    ],
    bringEs: ["Asistir sola o en pareja familiar", "Libreta opcional", "Té o agua"],
    bringEn: ["Attend solo or with your caregiver", "Optional notebook", "Tea or water"],
    spots: 6,
  },
  {
    iso: "2026-12-13T18:00:00-10:00",
    es: "Sáb 13 Dic",
    en: "Sat Dec 13",
    fullDateEs: "Sábado 13 de Diciembre · 6:00 PM HST",
    fullDateEn: "Saturday, December 13 · 6:00 PM HST",
    time: "6:00 PM HST · 60 min",
    badgeEs: "Taller Sonoro + EFT",
    badgeEn: "Sound & EFT Workshop",
    topicEs: "Tapping y cuencos de cuarzo",
    topicEn: "Tapping and quartz bowls",
    host: "Omar Melero & Kelsie Reynolds",
    img: "/img/sound-healing.jpg",
    videoUrl: "https://www.youtube.com/embed/1ZYbU82GVz4?rel=0",
    summaryEs:
      "Sesión vivencial que une Tapping EFT (acupresión emocional con tus manos) para soltar miedo o insomnio, seguida de un baño sonoro en vivo con cuencos de cuarzo a 432 Hz para un descanso profundo.",
    summaryEn:
      "Experiential session pairing gentle EFT Tapping to release fear or insomnia with a live 432 Hz quartz sound bath for deep cellular rest.",
    whereEs:
      "En vivo por Zoom con audio de alta fidelidad para que puedas recostarte directamente en tu cama o sofá.",
    whereEn:
      "Live on Zoom with high-fidelity audio so you can lie back comfortably on your bed or sofa.",
    whoEs: "Ideal si sientes insomnio, nervios antes de estudios o cansancio físico.",
    whoEn: "Ideal if you're experiencing insomnia, scan anxiety, or physical fatigue.",
    stepsEs: [
      { time: "10 min", title: "Mapa fácil de puntos de Tapping", detail: "Aprendes dónde tocar suavemente para calmar picos de ansiedad en cualquier momento." },
      { time: "20 min", title: "Ronda guiada de liberación emocional", detail: "Soltamos tensión, miedo a los controles y pensamientos repetitivos." },
      { time: "30 min", title: "Concierto meditativo de cuencos 432 Hz", detail: "Solo cierras los ojos y recibes las frecuencias restaurativas desde O'ahu." },
    ],
    stepsEn: [
      { time: "10 min", title: "Simple EFT tapping point map", detail: "Learn gentle points you can use anytime anxiety spikes." },
      { time: "20 min", title: "Guided emotional release round", detail: "Letting go of tension, scan fear, and racing thoughts." },
      { time: "30 min", title: "Live 432 Hz quartz bowl sound bath", detail: "Simply close your eyes and receive restorative sound from O'ahu." },
    ],
    bringEs: ["Audífonos recomendados", "Almohada y manta", "Luz suave"],
    bringEn: ["Headphones recommended", "Pillow & blanket", "Dim lighting"],
    spots: 11,
  },
  {
    iso: "2026-12-20T18:00:00-10:00",
    es: "Sáb 20 Dic",
    en: "Sat Dec 20",
    fullDateEs: "Sábado 20 de Diciembre · 6:00 PM HST",
    fullDateEn: "Saturday, December 20 · 6:00 PM HST",
    time: "6:00 PM HST · 60 min",
    badgeEs: "Open Workshop Gratuito",
    badgeEn: "Free Open Workshop",
    topicEs: "Cocina alcalina y cierre en gratitud",
    topicEn: "Alkaline kitchen & gratitude circle",
    host: "Kelsie Reynolds & Dra. Maya Lin",
    img: "/img/healthy-cooking.jpg",
    videoUrl: "https://www.youtube.com/embed/inpok4MKVLM?rel=0",
    summaryEs:
      "Taller abierto donde prepararemos caldos antiinflamatorios e infusiones suaves para días de náusea o poco apetito, cerrando con un círculo amoroso de gratitud y esperanza.",
    summaryEn:
      "Open workshop preparing soothing anti-inflammatory broths and teas for low-appetite or nausea days, closing with a warm gratitude circle.",
    whereEs:
      "En vivo por Zoom interactivo con espacio de preguntas en directo + recetario descargable incluido.",
    whereEn:
      "Interactive live Zoom with live Q&A + downloadable recipe guide included.",
    whoEs: "Abierto a pacientes, cuidadores y toda la comunidad.",
    whoEn: "Open to patients, caregivers, and the whole community.",
    stepsEs: [
      { time: "25 min", title: "Preparación en vivo de caldos e infusiones", detail: "Ingredientes sencillos con cúrcuma, jengibre y vegetales suaves para el estómago." },
      { time: "15 min", title: "Consejos prácticos para el cuidador", detail: "Cómo adaptar porciones, aromas y texturas durante el tratamiento." },
      { time: "20 min", title: "Brindis con infusión y círculo de gratitud", detail: "Despedimos el mes conectadas en calma y compañía." },
    ],
    stepsEn: [
      { time: "25 min", title: "Live broth & digestive tea prep", detail: "Simple turmeric, ginger, and gentle plant ingredients." },
      { time: "15 min", title: "Practical kitchen tips for caregivers", detail: "Adapting portions, aromas, and textures during treatment." },
      { time: "20 min", title: "Warm tea toast & gratitude circle", detail: "Closing the month connected in calm and companionship." },
    ],
    bringEs: ["Tu taza favorita de té", "Invita a tu cuidador/a", "Recetario incluido"],
    bringEn: ["Your favorite cup of tea", "Invite your caregiver", "Recipe PDF included"],
    spots: 14,
  },
];

const PAGE_SIZE = 8;

/** Normaliza "Kelsie & Omar" → ["Kelsie Reynolds", "Omar Melero"]. */
function healersOf(item: any): string[] {
  const raw = String(item.instructor || "Love Heals Effect");
  return raw
    .split(/&|,| y | and /i)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (/kelsie/i.test(s) ? "Kelsie Reynolds" : /omar/i.test(s) ? "Omar Melero" : s));
}

function resolveItemPhoto(item: any): string {
  if (item.imagen_url) return item.imagen_url;
  const col = COLLECTIONS.find((c) => c.types.includes(item.tipo_contenido));
  return col?.img || "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80";
}

function HealerAvatar({
  healer,
  sizeClass = "h-10 w-10",
  textClass = "text-xs",
}: {
  healer: HealerSummary;
  sizeClass?: string;
  textClass?: string;
}) {
  if (healer.avatarUrl) {
    return (
      <img
        src={healer.avatarUrl}
        alt={healer.name}
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-2 ring-[#FCECEE]`}
      />
    );
  }
  return (
    <span
      className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${healer.grad} ${textClass} font-bold text-white`}
    >
      {healer.name.charAt(0)}
    </span>
  );
}

export function RecursosSection({
  resources,
  healers: healerRows = [],
  resourceFilter,
  setResourceFilter,
  isPremium,
  openSheet,
  canOpenItem,
  openResource,
  t,
  isEs,
}: RecursosSectionProps) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selectedCircleIdx, setSelectedCircleIdx] = useState(0);
  const [previewCircleIdx, setPreviewCircleIdx] = useState<number | null>(null);
  const activeCircle = UPCOMING_CIRCLES[selectedCircleIdx] || UPCOMING_CIRCLES[0];

  /* ---------------- Mapa vivo de fichas de sanadores (desde lo que rellena cada sanador en BD) ---------------- */
  const healerDirectory = useMemo(() => {
    const map = new Map<string, HealerSummary>();
    Object.entries(FALLBACK_HEALERS).forEach(([k, v]) => map.set(k, v));

    healerRows.forEach((h: any) => {
      const raw = String(h.especialidad || "").trim();
      if (!raw) return;
      const parts = raw.split("·").map((s) => s.trim());
      const rawName = parts[0] || raw;
      const canonicalName = /kelsie/i.test(rawName)
        ? "Kelsie Reynolds"
        : /omar/i.test(rawName)
          ? "Omar Melero"
          : rawName;
      const specFromRow = parts.slice(1).join(" · ").trim();
      const existing = map.get(canonicalName);

      map.set(canonicalName, {
        id: h.id ?? existing?.id,
        name: canonicalName,
        specialtyEs: specFromRow || existing?.specialtyEs || "Sanador integrativo · Love Heals Effect",
        specialtyEn: specFromRow || existing?.specialtyEn || "Integrative Healer · Love Heals Effect",
        bioEs: h.short_bio_es || existing?.bioEs || "",
        bioEn: h.short_bio_en || h.short_bio_es || existing?.bioEn || "",
        grad: existing?.grad || "from-[#F49678] to-[#D85678]",
        avatarUrl: h.imagen_url || existing?.avatarUrl,
      });
    });

    return map;
  }, [healerRows]);

  const getHealerInfo = (name: string): HealerSummary =>
    healerDirectory.get(name) || {
      name,
      specialtyEs: "Especialista en salud holística e integrativa",
      specialtyEn: "Holistic & integrative health specialist",
      bioEs: "Comparte recursos gratuitos en la comunidad Love Heals Effect para acompañar tu bienestar.",
      bioEn: "Shares free resources in the Love Heals Effect community to support your well-being.",
      grad: "from-[#F49678] to-[#D85678]",
    };

  /* ---------------- Vista actual (persistida en el padre) ---------------- */
  const view = useMemo(() => {
    if (resourceFilter.startsWith("col:")) {
      const [id, healer] = resourceFilter.slice(4).split("|");
      return { kind: "collection" as const, id, healer: healer || "" };
    }
    if (resourceFilter.startsWith("healer:")) {
      return { kind: "healer" as const, name: resourceFilter.slice(7) };
    }
    return { kind: "hub" as const };
  }, [resourceFilter]);

  const go = (next: string) => {
    setResourceFilter(next);
    setQuery("");
    setVisible(PAGE_SIZE);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------------- Datos derivados ---------------- */
  const freeLibrary = useMemo(
    () =>
      resources.filter(
        (r) =>
          r.es_gratuito !== false &&
          !["love_circle", "workshop", "academia_lhe"].includes(r.tipo_contenido)
      ),
    [resources]
  );
  const paidItems = useMemo(() => resources.filter((r) => r.es_gratuito === false), [resources]);
  const nextCircle = useMemo(() => resources.find((r) => r.tipo_contenido === "love_circle"), [resources]);

  const itemsOf = (col: Collection) =>
    col.id === "academia" ? paidItems : freeLibrary.filter((r) => col.types.includes(r.tipo_contenido));

  const collectionsWithItems = COLLECTIONS.map((c) => ({ col: c, items: itemsOf(c) })).filter(
    (c) => c.items.length > 0
  );

  const healers = useMemo(() => {
    const map = new Map<string, number>();
    freeLibrary.forEach((r) => healersOf(r).forEach((h) => map.set(h, (map.get(h) || 0) + 1)));
    return Array.from(map.entries())
      .filter(([name]) => name !== "Love Heals Effect")
      .sort((a, b) => b[1] - a[1]);
  }, [freeLibrary]);

  /* ---------------- Abrir un recurso (abre ficha/reproductor con contexto del sanador) ---------------- */
  const open = (item: any) => {
    openResource(item, canOpenItem(item));
  };

  /* ================================================================== */
  /*  VISTA: COLECCIÓN (ej. todo Spotify, todos los libros)              */
  /* ================================================================== */
  if (view.kind === "collection") {
    const col = view.id === "academia" ? ACADEMY : COLLECTIONS.find((c) => c.id === view.id);
    if (!col) {
      go("todos");
      return null;
    }
    const all = itemsOf(col);
    const colHealers = Array.from(new Set(all.flatMap(healersOf))).filter((n) => n !== "Love Heals Effect");
    const q = query.trim().toLowerCase();
    const filtered = all.filter((r) => {
      if (view.healer && !healersOf(r).includes(view.healer)) return false;
      if (!q) return true;
      return `${r.titulo_es} ${r.titulo_en} ${r.descripcion_es || ""} ${r.descripcion_en || ""} ${r.autor || ""} ${r.instructor || ""}`
        .toLowerCase()
        .includes(q);
    });
    const shown = filtered.slice(0, visible);
    const Icon = col.icon;
    const selectedHealerInfo = view.healer ? getHealerInfo(view.healer) : null;

    return (
      <main className="mt-6 space-y-5 pb-10 animate-fade-in">
        <button
          type="button"
          onClick={() => go("todos")}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-espresso/70 shadow-sm transition hover:bg-espresso/5 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("Volver a Recursos", "Back to Resources")}
        </button>

        {/* Portada de la colección */}
        <section className="relative overflow-hidden rounded-[30px] shadow-[0_14px_34px_rgba(38,35,34,0.18)]">
          <img src={col.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/15" />
          <div className="relative flex min-h-[210px] flex-col justify-end p-6 md:min-h-[250px] md:p-8">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-md"
              style={{ backgroundColor: col.accent }}
            >
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white md:text-4xl">{isEs ? col.es : col.en}</h2>
            <p className="mt-1 text-sm text-white/85">
              {isEs ? col.descEs : col.descEn} · {all.length} {t("recursos", "resources")}
            </p>
          </div>
        </section>

        {/* Explicación clara para la paciente: ¿Qué vas a poder manejar / en qué te ayuda? */}
        <section className="rounded-[26px] border border-espresso/5 bg-white/95 p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#C94A6A]">
                <HeartHandshake className="h-3.5 w-3.5" />
                {t("¿En qué te ayuda este espacio?", "How does this space help you?")}
              </span>
              <p className="mt-1 text-sm leading-relaxed text-espresso/80">
                {isEs ? col.helpsEs : col.helpsEn}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(isEs ? col.tagsEs : col.tagsEn).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#FAF7F2] px-3 py-1 text-[11px] font-bold text-espresso/70"
                >
                  ✨ {tag}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-3 border-t border-espresso/5 pt-2.5 text-xs text-espresso/55">
            {t(
              "Cada recurso es subido directamente por nuestros sanadores, quienes te explican qué podrás trabajar con él y desde qué especialidad te acompañan.",
              "Each resource is uploaded directly by our healers, explaining what it helps you manage and the specialty they bring to your care."
            )}
          </p>
        </section>

        {/* Filtros por sanador + búsqueda */}
        {(colHealers.length > 0 || all.length > 6) && (
          <section className="space-y-3">
            {all.length > 6 && (
              <label className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
                <Search className="h-4 w-4 text-espresso/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("Buscar por síntoma, tema o sanador…", "Search by symptom, topic or healer…")}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-espresso/40"
                />
              </label>
            )}
            {colHealers.length > 0 && (
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
                <button
                  type="button"
                  onClick={() => go(`col:${col.id}`)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition active:scale-95 ${!view.healer ? "bg-espresso text-white shadow" : "bg-white text-espresso/65 shadow-sm hover:bg-espresso/5"
                    }`}
                >
                  {t("Todos los sanadores", "All healers")}
                </button>
                {colHealers.map((h) => {
                  const active = view.healer === h;
                  const info = getHealerInfo(h);
                  const shortSpec = (isEs ? info.specialtyEs : info.specialtyEn).split("·").pop()?.trim();
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => go(`col:${col.id}|${h}`)}
                      className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-left text-xs transition active:scale-95 ${active ? "bg-espresso text-white shadow" : "bg-white text-espresso/75 shadow-sm hover:bg-espresso/5"
                        }`}
                    >
                      <HealerAvatar healer={info} sizeClass="h-6 w-6" textClass="text-[11px]" />
                      <span>
                        <strong className="font-bold">{h}</strong>
                        {shortSpec && (
                          <span className={`hidden sm:inline ${active ? "text-white/75" : "text-espresso/50"}`}>
                            {" "}
                            · {shortSpec}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Ficha viva del sanador cuando la usuaria filtra por él/ella */}
            {selectedHealerInfo && (
              <div className="flex flex-col justify-between gap-4 rounded-[26px] bg-gradient-to-r from-[#FFF8F4] via-white to-[#F2FAF9] p-4 shadow-sm border border-espresso/5 sm:flex-row sm:items-center animate-fade-in">
                <div className="flex items-start gap-3.5">
                  <HealerAvatar healer={selectedHealerInfo} sizeClass="h-12 w-12" textClass="text-lg" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold tracking-[-0.015em] text-espresso">{selectedHealerInfo.name}</h3>
                      <span className="rounded-full bg-[#E8809A]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#C94A6A]">
                        {isEs ? selectedHealerInfo.specialtyEs : selectedHealerInfo.specialtyEn}
                      </span>
                    </div>
                    {(isEs ? selectedHealerInfo.bioEs : selectedHealerInfo.bioEn) && (
                      <p className="mt-1 text-xs leading-relaxed text-espresso/70">
                        {isEs ? selectedHealerInfo.bioEs : selectedHealerInfo.bioEn}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => go(`healer:${selectedHealerInfo.name}`)}
                    className="rounded-full bg-[#FAF7F2] px-3.5 py-2 text-xs font-bold text-espresso transition hover:bg-espresso/10"
                  >
                    {t("Ver todos sus recursos", "See all their resources")}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openSheet("book", selectedHealerInfo.id ? { healer: String(selectedHealerInfo.id) } : {})
                    }
                    className="rounded-full bg-espresso px-4 py-2 text-xs font-bold text-white transition hover:brightness-110"
                  >
                    {t("Reservar sesión", "Book session")}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Contenido según el tipo de colección */}
        {shown.length === 0 ? (
          <p className="rounded-3xl bg-white p-8 text-center text-sm text-espresso/60 shadow-sm">
            {t("No encontramos recursos con ese filtro. 🌿", "No resources match that filter. 🌿")}
          </p>
        ) : col.layout === "books" ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((b) => {
              const primaryHealer = healersOf(b)[0] || "Kelsie Reynolds";
              return (
                <BookCover
                  key={b.id}
                  item={b}
                  healer={getHealerInfo(primaryHealer)}
                  onOpen={() => open(b)}
                  onSelectHealer={() => go(`healer:${primaryHealer}`)}
                  isEs={isEs}
                  t={t}
                />
              );
            })}
          </section>
        ) : col.layout === "tracks" ? (
          <section className="space-y-3">
            {shown.map((r, i) => {
              const primaryHealer = healersOf(r)[0] || "Love Heals Effect";
              return (
                <TrackRow
                  key={r.id}
                  item={r}
                  index={i + 1}
                  accent={col.accent}
                  locked={!canOpenItem(r)}
                  healer={getHealerInfo(primaryHealer)}
                  onOpen={() => open(r)}
                  onSelectHealer={() => go(`healer:${primaryHealer}`)}
                  isEs={isEs}
                  t={t}
                />
              );
            })}
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((r) => {
              const primaryHealer = healersOf(r)[0] || "Love Heals Effect";
              return (
                <MediaCard
                  key={r.id}
                  item={r}
                  locked={!canOpenItem(r)}
                  healer={getHealerInfo(primaryHealer)}
                  onOpen={() => open(r)}
                  onSelectHealer={() => go(`healer:${primaryHealer}`)}
                  isEs={isEs}
                  t={t}
                  doc={col.layout === "docs"}
                />
              );
            })}
          </section>
        )}

        {filtered.length > visible && (
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="mx-auto block rounded-full bg-white px-6 py-2.5 text-xs font-bold text-espresso shadow-sm transition hover:bg-espresso/5"
          >
            {t("Ver más", "Show more")} ({filtered.length - visible})
          </button>
        )}

        {col.id === "academia" && !isPremium && (
          <button
            type="button"
            onClick={() => openSheet("membership")}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E8B93A] to-[#B98A00] py-3 text-sm font-bold text-white shadow-md"
          >
            <Crown className="h-4 w-4" />
            {t("Desbloquear la Academia · $10 USD/mes", "Unlock the Academy · $10 USD/mo")}
          </button>
        )}
      </main>
    );
  }

  /* ================================================================== */
  /*  VISTA: SANADOR (todo lo que publica un sanador + su especialidad)  */
  /* ================================================================== */
  if (view.kind === "healer") {
    const info = getHealerInfo(view.name);
    const mine = freeLibrary.filter((r) => healersOf(r).includes(view.name));
    const groups = COLLECTIONS.map((c) => ({ col: c, items: mine.filter((r) => c.types.includes(r.tipo_contenido)) })).filter(
      (g) => g.items.length > 0
    );

    return (
      <main className="mt-6 space-y-6 pb-10 animate-fade-in">
        <button
          type="button"
          onClick={() => go("todos")}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-espresso/70 shadow-sm transition hover:bg-espresso/5 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("Volver a Recursos", "Back to Resources")}
        </button>

        <section className="rounded-[30px] bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <HealerAvatar healer={info} sizeClass="h-16 w-16" textClass="text-2xl" />
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#239BA2]">
                  {t("Especialidad del sanador", "Healer's specialty")}
                </span>
                <h2 className="text-2xl font-semibold tracking-[-0.025em] text-espresso">{view.name}</h2>
                <p className="text-xs font-semibold text-[#C94A6A]">
                  {isEs ? info.specialtyEs : info.specialtyEn}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openSheet("book", info.id ? { healer: String(info.id) } : {})}
              className="rounded-full bg-espresso px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110"
            >
              {t("Reservar sesión con ", "Book a session with ")}
              {view.name.split(" ")[0]}
            </button>
          </div>

          {(isEs ? info.bioEs : info.bioEn) && (
            <div className="rounded-2xl bg-[#FAF7F2] p-4">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-espresso/50">
                {t("¿Cómo te puede ayudar en tu proceso?", "How can they support your journey?")}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-espresso/80">
                {isEs ? info.bioEs : info.bioEn}
              </p>
            </div>
          )}
        </section>

        {groups.map(({ col, items }) => (
          <section key={col.id} className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-espresso">{isEs ? col.es : col.en}</h3>
                <p className="text-xs text-espresso/55">{isEs ? col.helpsEs : col.helpsEn}</p>
              </div>
              <button
                type="button"
                onClick={() => go(`col:${col.id}|${view.name}`)}
                className="flex shrink-0 items-center gap-0.5 text-xs font-bold text-[#C94A6A]"
              >
                {t("Ver todo", "See all")} ({items.length})
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:px-0">
              {items.slice(0, 6).map((r) => (
                <MiniTile key={r.id} item={r} img={resolveItemPhoto(r)} onOpen={() => open(r)} isEs={isEs} />
              ))}
            </div>
          </section>
        ))}
      </main>
    );
  }

  /* ================================================================== */
  /*  VISTA PRINCIPAL (HUB)                                              */
  /* ================================================================== */
  return (
    <main className="mt-6 space-y-9 pb-10">
      {/* ---------- 1. HEALING & LOVE CIRCLES (compañía + eventos gratuitos) ---------- */}
      <section className="animate-fade-in space-y-3">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#CFEDE8]/70 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#1E747A]">
            <Users className="h-3.5 w-3.5" />
            {t("Healing Circles · Compañía y Eventos Gratuitos", "Healing Circles · Companionship & Free Events")}
          </span>
          <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#2D2B2A] sm:text-4xl">
            {isEs ? "Healing Circles: Un espacio " : "Healing Circles: A space "}
            <span className="font-light italic text-[#E8809A]">
              {isEs ? "donde siempre tendrás compañía." : "where you are never alone."}
            </span>
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-espresso/65">
            {t(
              "Disfruta de nuestros encuentros en vivo, talleres abiertos y eventos 100% gratuitos creados para acompañarte, escucharte y sanar en comunidad junto a Kelsie y Omar.",
              "Enjoy our live gatherings, open workshops, and 100% free community events created to accompany you, listen to you, and heal together with Kelsie and Omar."
            )}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          {/* Tarjeta principal sincronizada con la fecha seleccionada */}
          <div className="group relative overflow-hidden rounded-[30px] shadow-[0_18px_40px_rgba(28,46,43,0.28)] lg:col-span-3">
            <img
              key={activeCircle.img}
              src={activeCircle.img}
              alt={isEs ? activeCircle.topicEs : activeCircle.topicEn}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 animate-fade-in"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#172725] via-[#172725]/75 to-[#172725]/15" />

            {/* Botón flotante superior para abrir video / vista previa interactiva */}
            <button
              type="button"
              onClick={() => setPreviewCircleIdx(selectedCircleIdx)}
              className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-black/45 py-2 pl-3 pr-4 text-xs font-bold text-white backdrop-blur-md transition hover:bg-black/65 active:scale-95"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8809A] text-white">
                <Play className="ml-0.5 h-3 w-3 fill-white" />
              </span>
              {t("Ver video y de qué trata", "Watch video & details")}
            </button>

            <div className="relative flex min-h-[340px] flex-col justify-end p-6 md:p-8">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#239BA2] px-3 py-1 text-[11px] font-bold text-white">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  {isEs ? activeCircle.badgeEs : activeCircle.badgeEn}
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                  📅 {isEs ? activeCircle.es : activeCircle.en} · 6:00 PM HST
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                  ✓ {t("100% gratis", "100% free")}
                </span>
              </div>
              <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.025em] text-white md:text-3xl">
                {isEs ? activeCircle.topicEs : activeCircle.topicEn}
              </h3>
              <p className="mt-1.5 max-w-xl line-clamp-2 text-sm leading-relaxed text-white/85">
                {isEs ? activeCircle.summaryEs : activeCircle.summaryEn}
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[#CFEDE8]">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {t("Zoom en vivo o presencial en Honolulu · Con ", "Live Zoom or in-person Honolulu · With ")}
                  <strong className="text-white">{activeCircle.host}</strong>
                </span>
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setPreviewCircleIdx(selectedCircleIdx)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-[#172725] shadow-lg transition hover:brightness-95 active:scale-95"
                >
                  <Play className="h-3.5 w-3.5 fill-[#172725]" />
                  {t("Ver resumen, video y dinámica", "See summary, video & agenda")}
                </button>
                <button
                  type="button"
                  onClick={() => openSheet("circle_rsvp", { fecha_circle: activeCircle.iso })}
                  className="inline-flex items-center gap-2 rounded-full bg-[#E8809A] px-5 py-2.5 text-xs font-bold text-white shadow-lg transition hover:brightness-105 active:scale-95"
                >
                  <Calendar className="h-4 w-4" />
                  {t("Inscribirme gratis", "Sign up for free")}
                </button>
                <button
                  type="button"
                  onClick={() => openSheet("meet_founders")}
                  className="rounded-full bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95"
                >
                  {t("Conocer a Kelsie y Omar", "Meet Kelsie & Omar")}
                </button>
              </div>
            </div>
          </div>

          {/* Próximas fechas interactivas + sesión gratuita */}
          <div className="flex flex-col gap-3 lg:col-span-2">
            <div className="rounded-[26px] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-espresso/50">
                  {t("Próximas fechas", "Upcoming dates")}
                </p>
                <span className="text-[11px] font-semibold text-[#239BA2]">
                  {t("Toca una fecha para explorar", "Tap a date to explore")}
                </span>
              </div>
              <div className="mt-2.5 space-y-1.5">
                {UPCOMING_CIRCLES.map((c, idx) => {
                  const isSelected = idx === selectedCircleIdx;
                  const parts = (isEs ? c.es : c.en).split(" ");
                  return (
                    <button
                      key={c.iso}
                      type="button"
                      onMouseEnter={() => setSelectedCircleIdx(idx)}
                      onClick={() => {
                        setSelectedCircleIdx(idx);
                        setPreviewCircleIdx(idx);
                      }}
                      className={`group flex w-full items-center gap-3 rounded-2xl p-2 text-left transition active:scale-[0.99] ${
                        isSelected
                          ? "bg-[#EAF6F4] ring-1 ring-[#239BA2]/35"
                          : "hover:bg-[#FAF7F2]"
                      }`}
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl transition ${
                          isSelected ? "bg-[#239BA2] text-white shadow-sm" : "bg-[#CFEDE8] text-[#1E747A]"
                        }`}
                      >
                        <span className="text-[9px] font-bold uppercase leading-none">{parts[0]}</span>
                        <span className="text-sm font-extrabold leading-tight">{parts[1]}</span>
                      </span>
                      <span className="relative hidden h-11 w-11 shrink-0 overflow-hidden rounded-xl sm:block">
                        <img src={c.img} alt="" className="h-full w-full object-cover" />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="h-3 w-3 fill-white text-white" />
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-espresso">
                          {isEs ? c.topicEs : c.topicEn}
                        </span>
                        <span className="block truncate text-[11px] text-espresso/55">
                          6:00 PM HST · {isEs ? c.badgeEs : c.badgeEn}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition ${
                          isSelected
                            ? "bg-[#239BA2] text-white"
                            : "bg-[#239BA2]/10 text-[#239BA2] group-hover:bg-[#239BA2] group-hover:text-white"
                        }`}
                      >
                        {t("Ver detalles", "Details")}
                      </span>
                    </button>
                  );
                })}
              </div>
              {nextCircle?.fecha_evento && (
                <p className="mt-2 text-[11px] text-espresso/45">
                  {t(
                    "Explora de qué trata cada fecha, mira el video de muestra e inscríbete gratis.",
                    "Explore what each date is about, watch the preview video, and sign up free."
                  )}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => openSheet("book", { gratis: "1", modalidad: "online" })}
              className="flex items-center gap-3 rounded-[26px] bg-gradient-to-r from-[#FFF5DA] to-[#FDE3E8] p-4 text-left shadow-sm transition hover:shadow-md active:scale-[0.98]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#C94A6A] shadow-sm">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-espresso">
                  {t("Tu sesión de coaching gratis del mes", "Your free coaching session this month")}
                </span>
                <span className="block text-xs text-espresso/60">{t("1 a 1 con Kelsie u Omar", "1-on-1 with Kelsie or Omar")}</span>
              </span>
              <ChevronRight className="h-5 w-5 text-espresso/40" />
            </button>
          </div>
        </div>

        {/* Modal interactivo al tocar cualquier fecha: Imagen + Video + Resumen + En qué y dónde participar */}
        {previewCircleIdx !== null && (
          <CircleEventPreviewModal
            circles={UPCOMING_CIRCLES}
            activeIndex={previewCircleIdx}
            onSelectIndex={(idx) => {
              setPreviewCircleIdx(idx);
              setSelectedCircleIdx(idx);
            }}
            onClose={() => setPreviewCircleIdx(null)}
            onRsvp={(iso) => {
              setPreviewCircleIdx(null);
              openSheet("circle_rsvp", { fecha_circle: iso });
            }}
            onMeetFounders={() => {
              setPreviewCircleIdx(null);
              openSheet("meet_founders");
            }}
            isEs={isEs}
            t={t}
          />
        )}
      </section>

      {/* ---------- 2. RECURSOS INSPIRADORES POR COLECCIÓN ---------- */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8809A]/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#C94A6A]">
              <Sparkles className="h-3.5 w-3.5" />
              {t("Support · Recursos de Sanación y Bienestar", "Support · Healing & Wellness Resources")}
            </span>
            <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#2D2B2A] sm:text-3xl">
              {isEs ? "Recursos que abrazan " : "Resources that embrace "}
              <span className="font-light italic text-[#E8809A]">
                {isEs ? "tu sanación cada día." : "your healing every day."}
              </span>
            </h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-espresso/65 sm:text-sm">
              {t(
                "Música, movimiento suave, meditaciones, lecturas y guías preparadas con amor por nuestros sanadores. Elige el espacio que tu cuerpo y tu corazón necesiten hoy.",
                "Music, gentle movement, meditations, reads, and guides lovingly prepared by our healers. Choose the space your body and heart need today."
              )}
            </p>
          </div>
          <span className="hidden shrink-0 text-xs font-semibold text-espresso/45 sm:block">
            {freeLibrary.length} {t("recursos", "resources")}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {collectionsWithItems.map(({ col, items }) => {
            const Icon = col.icon;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => go(`col:${col.id}`)}
                className="group relative aspect-[4/5] overflow-hidden rounded-[26px] text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(38,35,34,0.2)] active:scale-[0.98] sm:aspect-[4/3]"
              >
                <img src={col.img} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <span
                  className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md"
                  style={{ backgroundColor: col.accent }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-extrabold text-espresso">
                  {items.length}
                </span>
                <span className="absolute inset-x-3 bottom-3">
                  <span className="block text-base font-semibold leading-tight tracking-[-0.02em] text-white sm:text-lg">{isEs ? col.es : col.en}</span>
                  <span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-white/80">
                    {isEs ? col.helpsEs : col.helpsEn}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---------- 3. EXPLORAR POR SANADOR ---------- */}
      {healers.length > 0 && (
        <section className="space-y-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#239BA2]">
              {t("Nuestros sanadores", "Our healers")}
            </span>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#2D2B2A] sm:text-3xl">
              {isEs ? "Recursos según " : "Resources by "}
              <span className="font-light italic text-[#239BA2]">
                {isEs ? "cada especialista." : "each specialist."}
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-espresso/60">
              {t(
                "Conoce en qué se especializa cada sanador y explora lo que ha compartido para acompañarte.",
                "See what each healer specializes in and explore what they've shared to support you."
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {healers.map(([name, count]) => {
              const info = getHealerInfo(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => go(`healer:${name}`)}
                  className="flex flex-col justify-between rounded-[26px] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <HealerAvatar healer={info} sizeClass="h-12 w-12" textClass="text-lg" />
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-espresso">{name}</span>
                        <span className="line-clamp-2 block text-[11px] font-semibold text-[#C94A6A]">
                          {isEs ? info.specialtyEs : info.specialtyEn}
                        </span>
                      </div>
                    </div>
                    {(isEs ? info.bioEs : info.bioEn) && (
                      <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-espresso/65">
                        {isEs ? info.bioEs : info.bioEn}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-espresso/5 pt-2.5 text-xs">
                    <span className="font-bold text-[#239BA2]">
                      {count} {t("recursos publicados", "published resources")}
                    </span>
                    <span className="flex items-center gap-0.5 font-bold text-espresso/70">
                      {t("Explorar", "Explore")}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------- 4. ACADEMIA (membresía) ---------- */}
      {paidItems.length > 0 && (
        <section>
          <button
            type="button"
            onClick={() => go("col:academia")}
            className="group relative w-full overflow-hidden rounded-[30px] text-left shadow-sm transition hover:shadow-md"
          >
            <img src={ACADEMY.img} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#3A2A10]/90 via-[#3A2A10]/60 to-transparent" />
            <div className="relative flex min-h-[170px] flex-col justify-center p-6">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#E8B93A] px-3 py-1 text-[11px] font-extrabold text-[#3A2A10]">
                <Crown className="h-3.5 w-3.5" />
                {isPremium ? t("Incluida en tu membresía", "Included in your membership") : t("Membresía $10 USD/mes", "Membership $10 USD/mo")}
              </span>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">
                The Love Heals Effect <span className="font-light italic text-[#FFE7A8]">Academy</span>
              </h3>
              <p className="mt-1 max-w-md text-xs text-white/80">
                {t(
                  "Sanación individual, entre pares y colectiva: lecciones semanales, meditaciones avanzadas y webinars en vivo.",
                  "Individual, peer and collective healing: weekly lessons, advanced meditations and live webinars."
                )}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#FFE7A8]">
                {t("Ver la Academia", "View the Academy")} ({paidItems.length})
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </button>
        </section>
      )}
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Piezas visuales enriquecidas con "Para qué ayuda" + Especialidad   */
/* ------------------------------------------------------------------ */

function TrackRow({
  item,
  index,
  accent,
  locked,
  healer,
  onOpen,
  onSelectHealer,
  isEs,
  t,
}: {
  item: any;
  index: number;
  accent: string;
  locked: boolean;
  healer: HealerSummary;
  onOpen: () => void;
  onSelectHealer: () => void;
  isEs: boolean;
  t: (es: string, en: string) => string;
}) {
  const desc = isEs ? item.descripcion_es : item.descripcion_en || item.descripcion_es;
  const spec = isEs ? healer.specialtyEs : healer.specialtyEn;

  return (
    <div className="group rounded-[24px] bg-white p-4 shadow-sm transition duration-200 hover:shadow-md">
      <div className="flex items-start gap-3.5">
        <span className="mt-3 hidden w-5 text-center text-xs font-bold text-espresso/35 sm:block">{index}</span>

        {/* Portada */}
        <button
          type="button"
          onClick={onOpen}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-espresso/5 shadow-sm sm:h-20 sm:w-20"
          aria-label={isEs ? item.titulo_es : item.titulo_en || item.titulo_es}
        >
          <img src={resolveItemPhoto(item)} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition group-hover:opacity-100">
            <Play className="h-5 w-5 fill-white text-white" />
          </span>
        </button>

        {/* Título + Para qué te ayuda (rellenado por el sanador) + Especialidad */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpen}
              className="text-left text-base font-semibold leading-snug tracking-[-0.015em] text-espresso transition hover:text-[#C94A6A] sm:text-lg"
            >
              {isEs ? item.titulo_es : item.titulo_en || item.titulo_es}
            </button>
            {item.nivel && (
              <span className="rounded-full bg-[#FAF7F2] px-2.5 py-0.5 text-[10px] font-bold text-espresso/60">
                {item.nivel}
              </span>
            )}
          </div>

          {desc && (
            <p className="mt-1 text-xs leading-relaxed text-espresso/75 sm:text-[13px]">
              <strong className="font-bold text-[#239BA2]">
                ✨ {t("Te ayuda a:", "Helps you:")}{" "}
              </strong>
              {desc}
            </p>
          )}

          {/* Sanador y en qué se especializa */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSelectHealer}
              className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#FAF7F2] py-1 pl-1.5 pr-3 text-left text-[11px] transition hover:bg-espresso/10"
            >
              <HealerAvatar healer={healer} sizeClass="h-5 w-5" textClass="text-[10px]" />
              <span className="truncate">
                <strong className="font-bold text-espresso">{healer.name}</strong>
                {spec && <span className="text-espresso/60"> · {spec}</span>}
              </span>
            </button>
          </div>
        </div>

        {/* Duración + Botón Reproducir */}
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={onOpen}
            className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md transition hover:scale-105 active:scale-95"
            style={{ backgroundColor: locked ? "#262322" : accent }}
            aria-label={t("Abrir recurso", "Open resource")}
          >
            {locked ? <Lock className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4 fill-white" />}
          </button>
          <span className="text-[11px] font-semibold text-espresso/45">{item.duracion}</span>
        </div>
      </div>
    </div>
  );
}

function MediaCard({
  item,
  locked,
  healer,
  onOpen,
  onSelectHealer,
  isEs,
  t,
  doc,
}: {
  item: any;
  locked: boolean;
  healer: HealerSummary;
  onOpen: () => void;
  onSelectHealer: () => void;
  isEs: boolean;
  t: (es: string, en: string) => string;
  doc?: boolean;
}) {
  const desc = isEs ? item.descripcion_es : item.descripcion_en || item.descripcion_es;
  const spec = isEs ? healer.specialtyEs : healer.specialtyEn;

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-[24px] bg-white text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(38,35,34,0.12)]">
      <div>
        <button type="button" onClick={onOpen} className="relative block aspect-video w-full overflow-hidden bg-espresso/5">
          <img src={resolveItemPhoto(item)} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
          <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">
            {item.duracion}
          </span>
          {item.nivel && (
            <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-espresso">
              {item.nivel}
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition group-hover:scale-110 ${locked ? "bg-espresso/80" : "bg-[#E8809A]"}`}>
              {locked ? <Lock className="h-5 w-5" /> : doc ? <FileText className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5 fill-white" />}
            </span>
          </span>
        </button>

        <div className="p-4 pb-2">
          <button
            type="button"
            onClick={onOpen}
            className="line-clamp-2 text-left text-base font-semibold leading-snug tracking-[-0.015em] text-espresso transition hover:text-[#C94A6A]"
          >
            {isEs ? item.titulo_es : item.titulo_en || item.titulo_es}
          </button>
          {desc && (
            <p className="mt-1.5 text-xs leading-relaxed text-espresso/75">
              <strong className="font-bold text-[#239BA2]">✨ {t("Te ayuda a:", "Helps you:")} </strong>
              {desc}
            </p>
          )}
        </div>
      </div>

      {/* Pie con sanador y su especialidad */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center justify-between gap-2 border-t border-espresso/5 pt-3">
          <button
            type="button"
            onClick={onSelectHealer}
            className="flex min-w-0 items-center gap-2 text-left transition hover:opacity-80"
          >
            <HealerAvatar healer={healer} sizeClass="h-7 w-7" textClass="text-xs" />
            <span className="min-w-0">
              <span className="block truncate text-xs font-bold text-espresso">{healer.name}</span>
              <span className="block truncate text-[10px] text-espresso/55">{spec}</span>
            </span>
          </button>
          <button type="button" onClick={onOpen} className="shrink-0 text-xs font-bold text-[#C94A6A] hover:underline">
            {locked ? t("Desbloquear", "Unlock") : doc ? t("Abrir guía", "Open guide") : t("Iniciar", "Start")} →
          </button>
        </div>
      </div>
    </div>
  );
}

function BookCover({
  item,
  healer,
  onOpen,
  onSelectHealer,
  isEs,
  t,
}: {
  item: any;
  healer: HealerSummary;
  onOpen: () => void;
  onSelectHealer: () => void;
  isEs: boolean;
  t: (es: string, en: string) => string;
}) {
  const color = item.color || "#DC5678";
  const desc = isEs ? item.descripcion_es : item.descripcion_en || item.descripcion_es;
  const spec = isEs ? healer.specialtyEs : healer.specialtyEn;

  return (
    <div className="group flex gap-4 rounded-[26px] bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      {/* Portada tipo libro 3D */}
      <button type="button" onClick={onOpen} className="w-24 shrink-0 text-left sm:w-28">
        <span
          className="relative flex aspect-[2/3] w-full flex-col justify-between overflow-hidden rounded-r-xl rounded-l-sm p-2.5 shadow-[5px_7px_16px_rgba(38,35,34,0.22)] transition duration-300 group-hover:rotate-[-1deg]"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}CC 60%, #262322)` }}
        >
          <span className="absolute inset-y-0 left-0 w-1.5 bg-black/20" />
          <span className="pl-1 text-[8px] font-bold uppercase tracking-widest text-white/70">Love Heals</span>
          <span className="pl-1">
            <span className="line-clamp-3 block font-serif text-xs font-bold leading-tight text-white">
              {isEs ? item.titulo_es : item.titulo_en}
            </span>
            <span className="mt-1 block truncate text-[9px] text-white/80">{item.autor}</span>
          </span>
        </span>
      </button>

      {/* Qué aporta el libro + qué sanador lo recomienda */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <button
            type="button"
            onClick={onOpen}
            className="text-left text-base font-semibold leading-snug tracking-[-0.015em] text-espresso transition hover:text-[#C94A6A]"
          >
            {isEs ? item.titulo_es : item.titulo_en}
          </button>
          {item.autor && <p className="text-xs font-semibold text-espresso/55">{item.autor}</p>}
          {desc && (
            <p className="mt-1.5 text-xs leading-relaxed text-espresso/75">
              <strong className="font-bold text-[#239BA2]">✨ {t("Te ayuda a:", "Helps you:")} </strong>
              {desc}
            </p>
          )}
        </div>

        <div className="mt-3 border-t border-espresso/5 pt-2.5">
          <button
            type="button"
            onClick={onSelectHealer}
            className="flex w-full items-center gap-2 text-left transition hover:opacity-80"
          >
            <HealerAvatar healer={healer} sizeClass="h-6 w-6" textClass="text-[10px]" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-bold text-espresso">
                {t("Recomendado por", "Recommended by")} {healer.name}
              </span>
              <span className="block truncate text-[10px] text-espresso/55">{spec}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniTile({ item, img, onOpen, isEs }: { item: any; img: string; onOpen: () => void; isEs: boolean }) {
  const desc = isEs ? item.descripcion_es : item.descripcion_en || item.descripcion_es;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative h-44 w-52 shrink-0 overflow-hidden rounded-[22px] text-left shadow-sm"
    >
      <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
      <span className="absolute inset-x-3 bottom-3">
        <span className="line-clamp-2 block text-sm font-bold leading-tight text-white">{isEs ? item.titulo_es : item.titulo_en || item.titulo_es}</span>
        {desc && <span className="mt-1 line-clamp-2 block text-[11px] leading-snug text-white/80">{desc}</span>}
        <span className="mt-1 block text-[10px] font-bold text-[#CFEDE8]">{item.duracion}</span>
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Modal interactivo de fecha: Imagen + Video + Resumen + Dinámica   */
/* ------------------------------------------------------------------ */

function CircleEventPreviewModal({
  circles,
  activeIndex,
  onSelectIndex,
  onClose,
  onRsvp,
  onMeetFounders,
  isEs,
  t,
}: {
  circles: CircleEventInfo[];
  activeIndex: number;
  onSelectIndex: (idx: number) => void;
  onClose: () => void;
  onRsvp: (iso: string) => void;
  onMeetFounders: () => void;
  isEs: boolean;
  t: (es: string, en: string) => string;
}) {
  const [mediaMode, setMediaMode] = useState<"image" | "video">("image");
  const [tab, setTab] = useState<"resumen" | "participar" | "donde">("resumen");

  const event = circles[activeIndex] || circles[0];
  const steps = isEs ? event.stepsEs : event.stepsEn;
  const bring = isEs ? event.bringEs : event.bringEn;

  const switchDate = (idx: number) => {
    onSelectIndex(idx);
    setMediaMode("image");
  };

  return (
    <div className="fixed inset-0 z-[65] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label={t("Cerrar", "Close")}
        onClick={onClose}
        className="absolute inset-0 bg-espresso/55 backdrop-blur-sm"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[32px] bg-white shadow-2xl animate-sheet-up sm:rounded-[32px]">
        {/* Selector interactivo superior de fechas */}
        <div className="flex items-center justify-between gap-2 border-b border-espresso/10 bg-[#FAF7F2] px-4 py-3 sm:px-6">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {circles.map((c, idx) => {
              const active = idx === activeIndex;
              return (
                <button
                  key={c.iso}
                  type="button"
                  onClick={() => switchDate(idx)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    active
                      ? "bg-[#239BA2] text-white shadow-sm"
                      : "bg-white text-espresso/65 hover:bg-espresso/5"
                  }`}
                >
                  {isEs ? c.es : c.en}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("Cerrar", "Close")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-espresso/70 shadow-sm transition hover:bg-[#FCECEE] hover:text-[#C94A6A]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Cuerpo desplazable */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Visor interactivo: Imagen ↔ Video */}
          <div className="relative overflow-hidden rounded-[26px] bg-[#172725] shadow-md">
            {mediaMode === "video" ? (
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={`${event.videoUrl}&autoplay=1`}
                  title={isEs ? event.topicEs : event.topicEn}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              </div>
            ) : (
              <div className="relative aspect-video w-full overflow-hidden">
                <img
                  src={event.img}
                  alt={isEs ? event.topicEs : event.topicEn}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                {/* Botón Play central para ver video */}
                <button
                  type="button"
                  onClick={() => setMediaMode("video")}
                  className="group absolute inset-0 flex flex-col items-center justify-center gap-2"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-[#172725] shadow-xl transition duration-300 group-hover:scale-110">
                    <Play className="ml-1 h-7 w-7 fill-[#172725]" />
                  </span>
                  <span className="rounded-full bg-black/55 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md">
                    {t("Ver video de muestra del encuentro", "Watch session preview video")}
                  </span>
                </button>

                {/* Badges inferiores */}
                <div className="pointer-events-none absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-[#239BA2] px-3 py-1 text-[11px] font-bold text-white">
                    {isEs ? event.badgeEs : event.badgeEn}
                  </span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                    ✨ {event.spots} {t("cupos libres · 100% gratis", "free spots · 100% free")}
                  </span>
                </div>
              </div>
            )}

            {/* Conmutador Imagen / Video arriba a la derecha */}
            <div className="absolute right-3 top-3 flex gap-1 rounded-full bg-black/55 p-1 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setMediaMode("image")}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold transition ${
                  mediaMode === "image" ? "bg-white text-espresso" : "text-white/80 hover:text-white"
                }`}
              >
                <ImageIcon className="h-3 w-3" />
                {t("Imagen", "Image")}
              </button>
              <button
                type="button"
                onClick={() => setMediaMode("video")}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold transition ${
                  mediaMode === "video" ? "bg-[#E8809A] text-white" : "text-white/80 hover:text-white"
                }`}
              >
                <Video className="h-3 w-3" />
                {t("Video", "Video")}
              </button>
            </div>
          </div>

          {/* Encabezado de la fecha */}
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#239BA2]">
              <Calendar className="h-3.5 w-3.5" />
              <span>{isEs ? event.fullDateEs : event.fullDateEn}</span>
              <span className="text-espresso/30">·</span>
              <Clock className="h-3.5 w-3.5 text-[#E8809A]" />
              <span className="text-espresso/65">60 min</span>
            </div>
            <h3 className="mt-1 text-2xl font-semibold leading-tight tracking-[-0.025em] text-espresso">
              {isEs ? event.topicEs : event.topicEn}
            </h3>
            <p className="mt-1 text-xs font-semibold text-espresso/60">
              {t("Facilitado por", "Facilitated by")}{" "}
              <strong className="text-espresso">{event.host}</strong>
            </p>
          </div>

          {/* Pestañas interactivas de información */}
          <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-[#FAF7F2] p-1.5">
            {(
              [
                ["resumen", t("✨ De qué trata", "✨ About")],
                ["participar", t("🤍 En qué participas", "🤍 What we'll do")],
                ["donde", t("📍 Dónde unirte", "📍 Where & how")],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-xl py-2.5 text-xs font-bold transition ${
                  tab === id
                    ? "bg-white text-espresso shadow-sm"
                    : "text-espresso/60 hover:text-espresso"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Contenido según pestaña elegida */}
          {tab === "resumen" && (
            <div className="space-y-3 animate-fade-in">
              <div className="rounded-2xl bg-[#FAF7F2] p-4">
                <p className="text-sm leading-relaxed text-espresso/85">
                  {isEs ? event.summaryEs : event.summaryEn}
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-[#239BA2]/20 bg-[#EAF6F4]/70 p-3.5">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-[#239BA2]" />
                <div className="text-xs leading-relaxed text-espresso/80">
                  <strong className="block font-bold text-espresso">
                    {t("¿Para quién es este encuentro?", "Who is this gathering for?")}
                  </strong>
                  {isEs ? event.whoEs : event.whoEn}
                </div>
              </div>
            </div>
          )}

          {tab === "participar" && (
            <div className="space-y-2.5 animate-fade-in">
              <p className="text-xs font-semibold text-espresso/60">
                {t(
                  "Así viviremos los 60 minutos paso a paso (sin presiones, a tu propio ritmo):",
                  "Here is how our 60 minutes flow step by step (pressure-free, at your own pace):"
                )}
              </p>
              {steps.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-2xl bg-[#FAF7F2] p-3.5"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#239BA2] text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-espresso">{s.title}</span>
                      <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-[#C94A6A]">
                        {s.time}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-espresso/70">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "donde" && (
            <div className="space-y-3 animate-fade-in">
              <div className="rounded-2xl bg-[#FAF7F2] p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#239BA2]">
                  <MapPin className="h-4 w-4" />
                  {t("Dónde y cómo te conectas", "Where & how you join")}
                </div>
                <p className="text-sm leading-relaxed text-espresso/80">
                  {isEs ? event.whereEs : event.whereEn}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-espresso/50">
                  {t("Qué tener a la mano para disfrutarlo", "What to keep nearby")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {bring.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#FCECEE] px-3 py-1.5 text-xs font-semibold text-[#C94A6A]"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Barra inferior fija de acción */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-espresso/10 bg-white px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onMeetFounders}
            className="text-xs font-bold text-espresso/65 underline-offset-4 hover:text-espresso hover:underline"
          >
            {t("Conocer a Kelsie y Omar", "Meet Kelsie & Omar")}
          </button>
          <button
            type="button"
            onClick={() => onRsvp(event.iso)}
            className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#239BA2] to-[#1D8389] px-6 py-3 text-xs font-bold text-white shadow-md transition hover:brightness-105 active:scale-95"
          >
            <Calendar className="h-4 w-4" />
            {t("Quiero participar · Inscribirme gratis", "I want to join · Sign up free")} (
            {isEs ? event.es : event.en})
          </button>
        </div>
      </div>
    </div>
  );
}

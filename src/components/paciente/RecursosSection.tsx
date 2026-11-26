"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Crown,
  FileText,
  Gift,
  Headphones,
  Heart,
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
/*  Configuración de colecciones con estética pastel luminosa Hawái    */
/* ------------------------------------------------------------------ */

type Layout = "tracks" | "videos" | "books" | "docs";

interface Collection {
  id: string;
  types: string[];
  es: string;
  en: string;
  shortEs: string;
  shortEn: string;
  descEs: string;
  descEn: string;
  helpsEs: string;
  helpsEn: string;
  tagsEs: string[];
  tagsEn: string[];
  img: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  pastelBg: string;
  layout: Layout;
}

const COLLECTIONS: Collection[] = [
  {
    id: "meditaciones",
    types: ["meditacion_audio"],
    es: "Meditaciones",
    en: "Meditations",
    shortEs: "Meditación",
    shortEn: "Meditation",
    descEs: "Audios guiados de autosanación",
    descEn: "Guided self-healing audios",
    helpsEs:
      "Regular las palpitaciones y el miedo antes de exámenes o consultas médicas, reconectar con tu respiración y cultivar calma mental.",
    helpsEn:
      "Regulate racing thoughts and fear before scans or medical visits, reconnect with your breath, and cultivate inner calm.",
    tagsEs: ["Calmar el miedo", "Respiración guiada", "Antes de citas"],
    tagsEn: ["Calm fear", "Guided breath", "Before visits"],
    img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    icon: Wind,
    accent: "#E6748E",
    pastelBg: "#FCECEE",
    layout: "tracks",
  },
  {
    id: "videos",
    types: ["video_bam"],
    es: "Movimiento BAM",
    en: "BAM Movement",
    shortEs: "BAM Suave",
    shortEn: "BAM Flow",
    descEs: "Videos de movimiento consciente",
    descEn: "Mindful movement videos",
    helpsEs:
      "Recuperar movilidad suave en brazos, pecho y hombros tras cirugía o quimio, apoyar el drenaje linfático y soltar la rigidez sin dolor.",
    helpsEn:
      "Gently restore mobility in arms, chest, and shoulders post-surgery or chemo, support lymphatic flow, and release stiffness safely.",
    tagsEs: ["Drenaje linfático", "Movilidad suave", "Cero impacto"],
    tagsEn: ["Lymphatic flow", "Gentle mobility", "Zero impact"],
    img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    icon: Video,
    accent: "#239BA2",
    pastelBg: "#E5F2F1",
    layout: "videos",
  },
  {
    id: "musicoterapia",
    types: ["musicoterapia"],
    es: "Musicoterapia",
    en: "Music therapy",
    shortEs: "Sonido",
    shortEn: "Sound",
    descEs: "Cuencos y sonidos que relajan",
    descEn: "Bowls and relaxing sounds",
    helpsEs:
      "Descansar el sistema nervioso mediante cuencos de cuarzo, frecuencias armónicas y paisajes sonoros de Hawái cuando necesitas quietud.",
    helpsEn:
      "Rest your nervous system through quartz bowls, harmonic frequencies, and Hawaiian soundscapes when you need quiet rest.",
    tagsEs: ["Cuencos 432 Hz", "Descanso nervioso", " Sueño profundo"],
    tagsEn: ["432 Hz bowls", "Nervous rest", "Deep sleep"],
    img: "/img/sound-healing.jpg",
    icon: Music,
    accent: "#C98A2C",
    pastelBg: "#FFF4E2",
    layout: "tracks",
  },
  {
    id: "tapping",
    types: ["tapping_eft"],
    es: "Tapping y respiración",
    en: "Tapping & breathwork",
    shortEs: "Respiración",
    shortEn: "Breathing",
    descEs: "Técnicas para calmar las emociones",
    descEn: "Techniques to calm emotions",
    helpsEs:
      "Liberar picos de angustia, incertidumbre o insomnio en pocos minutos estimulando puntos suaves de acupresión con tu propia mano.",
    helpsEn:
      "Release spikes of distress, uncertainty, or insomnia in minutes by gently tapping calming acupressure points.",
    tagsEs: ["Alivio en 10 min", "Soltar angustia", "Calma emocional"],
    tagsEn: ["10-min relief", "Ease distress", "Emotional calm"],
    img: "/img/tapping-eft.jpg",
    icon: Sparkles,
    accent: "#C9526D",
    pastelBg: "#FDF3EF",
    layout: "videos",
  },
  {
    id: "cocina",
    types: ["guia_autocuidado"],
    es: "Cocina saludable",
    en: "Healthy cooking",
    shortEs: "Nutrición",
    shortEn: "Nutrition",
    descEs: "Recetas y alimentación con amor",
    descEn: "Recipes and loving nutrition",
    helpsEs:
      "Aliviar náuseas y falta de apetito con caldos antiinflamatorios, infusiones digestivas y preparaciones sencillas para ti y tu cuidador.",
    helpsEn:
      "Ease nausea and low appetite with anti-inflammatory broths, digestive teas, and simple recipes for you and your caregiver.",
    tagsEs: ["Aliviar náuseas", "Caldos suaves", "Antiinflamatorio"],
    tagsEn: ["Ease nausea", "Gentle broths", "Anti-inflammatory"],
    img: "/img/healthy-cooking.jpg",
    icon: Utensils,
    accent: "#5C8D67",
    pastelBg: "#EAF4EC",
    layout: "videos",
  },
  {
    id: "spotify",
    types: ["spotify"],
    es: "Música en Spotify",
    en: "Music on Spotify",
    shortEs: "Playlists",
    shortEn: "Playlists",
    descEs: "Playlists curadas por nuestros sanadores",
    descEn: "Playlists curated by our healers",
    helpsEs:
      "Acompañarte durante tus sesiones de quimioterapia o salas de espera, bajar la ansiedad del cuerpo y ayudarte a descansar en casa.",
    helpsEn:
      "Support you during chemotherapy or waiting rooms, calm body anxiety, and help you rest gently at home.",
    tagsEs: ["Calma en quimio", "Bajar ansiedad", "Ánimo suave"],
    tagsEn: ["Chemo calm", "Lower anxiety", "Gentle mood"],
    img: "/img/meditation-calm.jpg",
    icon: Headphones,
    accent: "#239BA2",
    pastelBg: "#E5F2F1",
    layout: "tracks",
  },
  {
    id: "podcast",
    types: ["podcast"],
    es: "Podcast",
    en: "Podcast",
    shortEs: "Podcast",
    shortEn: "Podcast",
    descEs: "Conversaciones Love Heals",
    descEn: "Love Heals conversations",
    helpsEs:
      "Escuchar conversaciones honestas sobre el diagnóstico, el descanso familiar, los límites sanos y cómo cuidar sin agotarse.",
    helpsEn:
      "Listen to honest conversations about diagnosis, family rest, healthy boundaries, and how to care without burning out.",
    tagsEs: ["Acompañamiento", "Célula familiar", "Historias reales"],
    tagsEn: ["Companionship", "Family cell", "Real stories"],
    img: "/img/love-circle.jpg",
    icon: Mic,
    accent: "#E6748E",
    pastelBg: "#FCECEE",
    layout: "tracks",
  },
  {
    id: "libros",
    types: ["libro"],
    es: "Libros",
    en: "Books",
    shortEs: "Lecturas",
    shortEn: "Books",
    descEs: "Lecturas que recomiendan nuestros sanadores",
    descEn: "Reads our healers recommend",
    helpsEs:
      "Comprender tu proceso con esperanza, aprender hábitos integrativos respaldados por sobrevivientes y sentirte acompañada en cada etapa.",
    helpsEn:
      "Understand your journey with hope, learn integrative habits backed by survivors, and feel accompanied at every stage.",
    tagsEs: ["Esperanza realista", "Hábitos sanos", "Sobrevivientes"],
    tagsEn: ["Grounded hope", "Healthy habits", "Survivors"],
    img: "/img/academy-lesson.jpg",
    icon: BookOpen,
    accent: "#B8862D",
    pastelBg: "#FFF4E2",
    layout: "books",
  },
  {
    id: "guias",
    types: ["guia_pdf"],
    es: "Guías descargables",
    en: "Downloadable guides",
    shortEs: "Guías PDF",
    shortEn: "PDF Guides",
    descEs: "PDFs prácticos para tu proceso",
    descEn: "Practical PDFs for your journey",
    helpsEs:
      "Tener a la mano listas prácticas para tu primera quimio, preguntas para el oncólogo y pasos claros para las primeras semanas en casa.",
    helpsEn:
      "Keep handy checklists for your first chemo, questions for your oncologist, and clear steps for your first weeks at home.",
    tagsEs: ["Paso a paso", "Para imprimir", "Paciente y cuidador"],
    tagsEn: ["Step by step", "Print or save", "Patient & caregiver"],
    img: "/img/academy-lesson.jpg",
    icon: FileText,
    accent: "#239BA2",
    pastelBg: "#F4F2E6",
    layout: "docs",
  },
];

const ACADEMY: Collection = {
  id: "academia",
  types: [],
  es: "The Love Heals Effect Academy",
  en: "The Love Heals Effect Academy",
  shortEs: "Academia",
  shortEn: "Academy",
  descEs: "Lecciones semanales, meditaciones avanzadas y webinars en vivo",
  descEn: "Weekly lessons, advanced meditations and live webinars",
  helpsEs:
    "Profundizar semana a semana en los 3 pilares del curso Love Heals Effect: sanación individual, práctica en vivo entre pares y grupos avanzados.",
  helpsEn:
    "Go deeper week by week across the 3 pillars of The Love Heals Effect course: individual healing, live peer practice, and advanced circles.",
  tagsEs: ["Sanación Individual", "Práctica en Pares", "Círculos Avanzados"],
  tagsEn: ["Individual Healing", "Peers Healing", "Collective Healing"],
  img: "/img/academy-lesson.jpg",
  icon: Crown,
  accent: "#C98A2C",
  pastelBg: "#FFF4E2",
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

/** Retratos fotográficos reales para nuestros sanadores. */
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

const UPCOMING_CIRCLES: CircleEventInfo[] = [
  {
    iso: "2026-11-29T18:00:00-10:00",
    es: "Sáb 29 Nov",
    en: "Sat Nov 29",
    fullDateEs: "Sábado 29 de Noviembre · 6:00 PM HST",
    fullDateEn: "Saturday, November 29 · 6:00 PM HST",
    time: "60 min · Principiante",
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
    time: "60 min · En familia",
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
    time: "60 min · Relajación",
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
    time: "60 min · Abierto",
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
  const [hubCategory, setHubCategory] = useState("todos");
  const [hubQuery, setHubQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selectedCircleIdx, setSelectedCircleIdx] = useState(0);
  const [previewCircleIdx, setPreviewCircleIdx] = useState<number | null>(null);
  const activeCircle = UPCOMING_CIRCLES[selectedCircleIdx] || UPCOMING_CIRCLES[0];

  /* ---------------- Directorio vivo de sanadores con foto real ---------------- */
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

  /* ---------------- Vista actual ---------------- */
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

  const itemsOf = (col: Collection) =>
    col.id === "academia" ? paidItems : freeLibrary.filter((r) => col.types.includes(r.tipo_contenido));

  const collectionsWithItems = COLLECTIONS.map((c) => ({ col: c, items: itemsOf(c) })).filter(
    (c) => c.items.length > 0
  );

  const hubFilteredResources = useMemo(() => {
    const activeCol =
      hubCategory === "todos"
        ? null
        : COLLECTIONS.find((c) => c.id === hubCategory) || null;
    const base = activeCol
      ? freeLibrary.filter((r) => activeCol.types.includes(r.tipo_contenido))
      : freeLibrary;
    const q = hubQuery.trim().toLowerCase();
    if (!q) return base;
    return base.filter((r) =>
      `${r.titulo_es || ""} ${r.titulo_en || ""} ${r.descripcion_es || ""} ${r.descripcion_en || ""} ${r.instructor || ""} ${r.autor || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [freeLibrary, hubCategory, hubQuery]);

  const healers = useMemo(() => {
    const map = new Map<string, number>();
    freeLibrary.forEach((r) => healersOf(r).forEach((h) => map.set(h, (map.get(h) || 0) + 1)));
    return Array.from(map.entries())
      .filter(([name]) => name !== "Love Heals Effect")
      .sort((a, b) => b[1] - a[1]);
  }, [freeLibrary]);

  const open = (item: any) => {
    openResource(item, canOpenItem(item));
  };

  /* ================================================================== */
  /*  VISTA DETALLE DE COLECCIÓN (inspirada en "Class Details" luminoso) */
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
    const tags = isEs ? col.tagsEs : col.tagsEn;

    return (
      <main className="mt-5 space-y-6 pb-10 animate-fade-in">
        {/* Barra superior estilo App limpia */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => go("todos")}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-espresso/80 shadow-sm transition hover:bg-[#FAF7F2] active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("Volver a Prácticas", "Back to Practices")}
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[#E6748E] shadow-sm">
            <Heart className="h-3.5 w-3.5 fill-[#E6748E]" />
            {all.length} {t("prácticas", "practices")}
          </span>
        </div>

        {/* Portada luminosa estilo "Class Details" con fotografía real y 3 tarjetas de beneficios */}
        <section className="overflow-hidden rounded-[32px] border border-white bg-white p-5 shadow-[0_14px_38px_rgba(232,128,154,0.1)] sm:p-7">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
            <div className="order-2 space-y-4 lg:order-1 lg:col-span-7">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-bold"
                style={{ backgroundColor: col.pastelBg, color: col.accent }}
              >
                <Icon className="h-3.5 w-3.5" />
                {isEs ? col.descEs : col.descEn}
              </span>

              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.03em] text-espresso sm:text-4xl">
                {isEs ? col.es : col.en}
              </h2>

              <p className="text-sm leading-relaxed text-espresso/70">
                {isEs ? col.helpsEs : col.helpsEn}
              </p>

              {/* 3 bloques pastel de Beneficios (como "Benefits" en Class Details) */}
              <div>
                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-espresso/50">
                  {t("Beneficios en tu proceso", "Benefits for your journey")}
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {tags.slice(0, 3).map((tag, idx) => {
                    const boxStyles = [
                      { bg: "bg-[#FCECEE]/75", iconBg: "bg-white text-[#E6748E]" },
                      { bg: "bg-[#E5F2F1]/80", iconBg: "bg-white text-[#239BA2]" },
                      { bg: "bg-[#FFF4E2]/85", iconBg: "bg-white text-[#C98A2C]" },
                    ][idx % 3];
                    return (
                      <div
                        key={tag}
                        className={`flex flex-col items-center rounded-2xl ${boxStyles.bg} p-3 text-center`}
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full shadow-sm ${boxStyles.iconBg}`}
                        >
                          <Sparkles className="h-4 w-4" />
                        </span>
                        <span className="mt-2 text-[11px] font-bold leading-snug text-espresso">
                          {tag}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Fotografía real luminosa a la derecha / arriba */}
            <div className="order-1 lg:order-2 lg:col-span-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[26px] bg-[#FAF7F2] shadow-sm">
                <img
                  src={col.img}
                  alt={isEs ? col.es : col.en}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/25 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-espresso shadow-sm">
                  {all.length} {t("sesiones disponibles", "available sessions")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Búsqueda + filtros por sanador con retrato real */}
        {(colHealers.length > 0 || all.length > 4) && (
          <section className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {colHealers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => go(`col:${col.id}`)}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition active:scale-95 ${
                      !view.healer
                        ? "bg-[#E8809A] text-white shadow-sm"
                        : "bg-white text-espresso/70 shadow-sm hover:bg-[#FAF7F2]"
                    }`}
                  >
                    {t("Todos", "All")}
                  </button>
                  {colHealers.map((h) => {
                    const active = view.healer === h;
                    const info = getHealerInfo(h);
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => go(`col:${col.id}|${h}`)}
                        className={`flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-xs font-bold transition active:scale-95 ${
                          active
                            ? "bg-[#239BA2] text-white shadow-sm"
                            : "bg-white text-espresso/75 shadow-sm hover:bg-[#FAF7F2]"
                        }`}
                      >
                        <HealerAvatar healer={info} sizeClass="h-6 w-6" textClass="text-[10px]" />
                        <span>{h}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <label className="flex items-center gap-2 rounded-full border border-espresso/10 bg-white px-4 py-2 shadow-sm sm:w-64">
                <Search className="h-4 w-4 text-espresso/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("Buscar práctica…", "Search practice…")}
                  className="w-full bg-transparent text-xs outline-none placeholder:text-espresso/45"
                />
              </label>
            </div>

            {selectedHealerInfo && (
              <div className="flex flex-col justify-between gap-4 rounded-[26px] border border-white bg-gradient-to-r from-[#FDF3EF] via-white to-[#E5F2F1]/70 p-4 shadow-sm sm:flex-row sm:items-center animate-fade-in">
                <div className="flex items-center gap-3.5">
                  <HealerAvatar healer={selectedHealerInfo} sizeClass="h-14 w-14" textClass="text-lg" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-espresso">{selectedHealerInfo.name}</h3>
                      <span className="rounded-full bg-[#FCECEE] px-2.5 py-0.5 text-[10px] font-bold text-[#C94A6A]">
                        {isEs ? selectedHealerInfo.specialtyEs : selectedHealerInfo.specialtyEn}
                      </span>
                    </div>
                    {(isEs ? selectedHealerInfo.bioEs : selectedHealerInfo.bioEn) && (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-espresso/70">
                        {isEs ? selectedHealerInfo.bioEs : selectedHealerInfo.bioEn}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => go(`healer:${selectedHealerInfo.name}`)}
                    className="rounded-full bg-white px-3.5 py-2 text-xs font-bold text-espresso shadow-sm transition hover:bg-[#FAF7F2]"
                  >
                    {t("Ver perfil", "View profile")}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openSheet("book", selectedHealerInfo.id ? { healer: String(selectedHealerInfo.id) } : {})
                    }
                    className="rounded-full bg-[#E8809A] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#d86c88]"
                  >
                    {t("Reservar sesión", "Book session")}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Listado limpio de prácticas */}
        {shown.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#6BB1AD]/35 bg-white/80 p-8 text-center text-sm text-espresso/60">
            {t("No encontramos prácticas con ese filtro.", "No practices match that filter.")}
          </div>
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
          <section className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            {shown.map((r) => {
              const primaryHealer = healersOf(r)[0] || "Love Heals Effect";
              return (
                <ClassListCard
                  key={r.id}
                  item={r}
                  pastelBg={col.pastelBg}
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
            className="mx-auto block rounded-full bg-white px-6 py-2.5 text-xs font-bold text-espresso shadow-sm transition hover:bg-[#FAF7F2]"
          >
            {t("Ver más", "Show more")} ({filtered.length - visible})
          </button>
        )}

        {col.id === "academia" && !isPremium && (
          <button
            type="button"
            onClick={() => openSheet("membership")}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F48EA6] via-[#E6748E] to-[#C9526D] py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(230,116,142,0.3)]"
          >
            <Crown className="h-4 w-4" />
            {t("Desbloquear la Academia · $10 USD/mes", "Unlock the Academy · $10 USD/mo")}
          </button>
        )}
      </main>
    );
  }

  /* ================================================================== */
  /*  VISTA PERFIL DE SANADOR (inspirada en pantalla "Profile" limpia)   */
  /* ================================================================== */
  if (view.kind === "healer") {
    const info = getHealerInfo(view.name);
    const mine = freeLibrary.filter((r) => healersOf(r).includes(view.name));
    const groups = COLLECTIONS.map((c) => ({
      col: c,
      items: mine.filter((r) => c.types.includes(r.tipo_contenido)),
    })).filter((g) => g.items.length > 0);

    return (
      <main className="mt-5 space-y-6 pb-10 animate-fade-in">
        <button
          type="button"
          onClick={() => go("todos")}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-espresso/80 shadow-sm transition hover:bg-[#FAF7F2] active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("Volver a Prácticas", "Back to Practices")}
        </button>

        {/* Tarjeta limpia estilo Profile con foto real y 3 contadores */}
        <section className="rounded-[32px] border border-white bg-white p-6 shadow-[0_12px_34px_rgba(232,128,154,0.1)]">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <HealerAvatar healer={info} sizeClass="h-20 w-20" textClass="text-2xl" />
              <div>
                <span className="inline-block rounded-full bg-[#FCECEE] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C94A6A]">
                  {t("Sanador verificado", "Verified healer")}
                </span>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-espresso">
                  {view.name}
                </h2>
                <p className="text-xs font-semibold text-[#239BA2]">
                  {isEs ? info.specialtyEs : info.specialtyEn}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openSheet("book", info.id ? { healer: String(info.id) } : {})}
              className="inline-flex items-center gap-2 rounded-full bg-[#E8809A] px-5 py-2.5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(232,128,154,0.3)] transition hover:bg-[#d86c88] active:scale-95"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {t("Reservar con ", "Book with ")}
                {view.name.split(" ")[0]}
              </span>
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 border-y border-espresso/5 py-4 text-center">
            <div>
              <p className="text-xl font-bold text-espresso">{mine.length}</p>
              <p className="text-[11px] font-semibold text-espresso/55">
                {t("Prácticas", "Practices")}
              </p>
            </div>
            <div>
              <p className="text-xl font-bold text-espresso">{groups.length}</p>
              <p className="text-[11px] font-semibold text-espresso/55">
                {t("Categorías", "Categories")}
              </p>
            </div>
            <div>
              <p className="text-xl font-bold text-[#239BA2]">1:1</p>
              <p className="text-[11px] font-semibold text-espresso/55">
                {t("Online y Honolulu", "Online & Honolulu")}
              </p>
            </div>
          </div>

          {(isEs ? info.bioEs : info.bioEn) && (
            <p className="mt-4 text-sm leading-relaxed text-espresso/75">
              {isEs ? info.bioEs : info.bioEn}
            </p>
          )}
        </section>

        {groups.map(({ col, items }) => (
          <section key={col.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-espresso">
                {isEs ? col.es : col.en}
              </h3>
              <button
                type="button"
                onClick={() => go(`col:${col.id}|${view.name}`)}
                className="inline-flex items-center gap-0.5 text-xs font-bold text-[#C94A6A] hover:underline"
              >
                {t("Ver todo", "See all")} ({items.length})
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              {items.slice(0, 4).map((r) => (
                <ClassListCard
                  key={r.id}
                  item={r}
                  pastelBg={col.pastelBg}
                  accent={col.accent}
                  locked={!canOpenItem(r)}
                  healer={info}
                  onOpen={() => open(r)}
                  onSelectHealer={() => {}}
                  isEs={isEs}
                  t={t}
                />
              ))}
            </div>
          </section>
        ))}
      </main>
    );
  }

  /* ================================================================== */
  /*  VISTA PRINCIPAL (HUB ESTILO AIRY WELLNESS CON FOTOS REALES)        */
  /* ================================================================== */
  return (
    <main className="mt-5 space-y-8 pb-10">
      {/* ---------- 1. ZONA DESTACADA: BENEFICIOS Y ESPACIOS 100% GRATUITOS ---------- */}
      <section className="animate-fade-in relative overflow-hidden rounded-[36px] border border-[#E8809A]/20 bg-gradient-to-b from-[#FFF5F7] via-[#FFFDFB] to-white p-5 sm:p-6 lg:p-7 shadow-[0_16px_40px_rgba(232,128,154,0.09)]">
        {/* Cabecera / Banner Superior con identidad clara de beneficios gratuitos */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-espresso/10 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E8809A]/10 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#C94A6A]">
              <Gift className="h-3.5 w-3.5 text-[#E8809A]" />
              <span>{t("Beneficios 100% Gratuitos", "100% Free Benefits")}</span>
              <span className="h-1 w-1 rounded-full bg-[#E8809A]" />
              <span className="text-[#239BA2]">{t("Comunidad Love Heals", "Love Heals Community")}</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-espresso sm:text-2xl">
              {t("Círculos en vivo, talleres y tu sesión de regalo", "Live circles, workshops & your gift session")}
            </h2>
            <p className="text-xs text-espresso/65 max-w-2xl">
              {t(
                "Espacios guiados de acompañamiento, meditación y movimiento suave. Abiertos sin costo para ti y tu familia.",
                "Guided live spaces for companion, meditation, and gentle movement. Free for you and your family."
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-espresso/75">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm border border-white">
              <Sparkles className="h-3 w-3 text-[#E8809A]" />
              {t("Círculos en vivo gratis", "Free live circles")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm border border-white">
              <HeartHandshake className="h-3 w-3 text-[#239BA2]" />
              {t("1 Sesión 1-a-1 al mes", "1 Free 1-on-1/mo")}
            </span>
          </div>
        </div>

        {/* Grid de las dos tarjetas principales */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Tarjeta izquierda: Círculo / Taller destacado de la semana */}
          <div className="relative overflow-hidden rounded-[30px] border border-white bg-gradient-to-br from-[#FFF8F6] via-[#FAF7F2] to-[#E8F3F2] p-5 sm:p-7 shadow-[0_12px_32px_rgba(232,128,154,0.12)] lg:col-span-7 flex flex-col justify-between">
            <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/60 blur-2xl" />

            <div className="relative grid grid-cols-1 items-center gap-5 sm:grid-cols-12">
              <div className="space-y-3 sm:col-span-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E8809A] to-[#D85C7D] px-3 py-1 text-[11px] font-extrabold text-white shadow-sm">
                    <Gift className="h-3 w-3 text-white" />
                    {t("100% Gratis", "100% Free")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#C94A6A] shadow-sm">
                    <Sparkles className="h-3 w-3" />
                    {isEs ? activeCircle.badgeEs : activeCircle.badgeEn}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E5F2F1] px-2.5 py-1 text-[10px] font-bold text-[#239BA2]">
                    <Check className="h-3 w-3 text-[#239BA2]" />
                    {t("Cupos abiertos", "Spots open")}
                  </span>
                </div>

                <h3 className="text-2xl font-bold leading-[1.12] tracking-tight text-espresso sm:text-[28px]">
                  {isEs ? activeCircle.topicEs : activeCircle.topicEn}
                </h3>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-espresso/70">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-[#E8809A]" />
                    {isEs ? activeCircle.es : activeCircle.en}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-espresso/50" />
                    {activeCircle.time}
                  </span>
                  <span>·</span>
                  <span className="text-[#239BA2] font-bold">
                    {activeCircle.host.split("&")[0].trim()}
                  </span>
                </div>

                <p className="line-clamp-2 text-xs leading-relaxed text-espresso/75">
                  {isEs ? activeCircle.summaryEs : activeCircle.summaryEn}
                </p>

                {/* Micro-beneficios incluidos */}
                <div className="flex flex-wrap gap-2 pt-0.5 text-[11px] font-medium text-espresso/65">
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/70 px-2 py-0.5">
                    <Check className="h-3 w-3 text-[#239BA2]" />
                    {t("Vía Zoom en vivo", "Live via Zoom")}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/70 px-2 py-0.5">
                    <Check className="h-3 w-3 text-[#239BA2]" />
                    {t("Grabación incluida", "Recording included")}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
                  <button
                    type="button"
                    onClick={() => openSheet("circle_rsvp", { fecha_circle: activeCircle.iso })}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E8809A] to-[#D85C7D] px-5 py-2.5 text-xs font-bold text-white shadow-[0_10px_22px_rgba(232,128,154,0.35)] transition hover:brightness-105 active:scale-95"
                  >
                    <span>{t("Inscribirme gratis", "Join free")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewCircleIdx(selectedCircleIdx)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-espresso shadow-sm transition hover:bg-[#FAF7F2] active:scale-95"
                  >
                    <Play className="h-3.5 w-3.5 fill-[#E8809A] text-[#E8809A]" />
                    <span>{t("Ver video", "Preview")}</span>
                  </button>
                </div>
              </div>

              {/* Fotografía real luminosa con badge de en vivo */}
              <div className="sm:col-span-5">
                <button
                  type="button"
                  onClick={() => setPreviewCircleIdx(selectedCircleIdx)}
                  className="group relative block aspect-[4/4] w-full overflow-hidden rounded-[26px] bg-white p-1.5 shadow-[0_12px_28px_rgba(38,35,34,0.1)]"
                >
                  <div className="relative h-full w-full overflow-hidden rounded-[20px]">
                    <img
                      src={activeCircle.img}
                      alt={isEs ? activeCircle.topicEs : activeCircle.topicEn}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-2.5 left-2.5 rounded-full bg-black/45 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-white">
                      {t("En vivo", "Live")}
                    </span>
                    <span className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#E8809A] shadow-md transition group-hover:scale-110">
                      <Play className="ml-0.5 h-4 w-4 fill-[#E8809A]" />
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Columna derecha: Próximas fechas gratuitas + TARJETA DESTACADA de Coaching Gratis */}
          <div className="flex flex-col justify-between gap-3.5 rounded-[30px] border border-white bg-white p-5 shadow-[0_10px_30px_rgba(38,35,34,0.05)] lg:col-span-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight text-espresso">
                  {t("Próximos Encuentros Gratuitos", "Upcoming Free Circles")}
                </h3>
                <span className="rounded-full bg-[#E5F2F1] px-2 py-0.5 text-[10px] font-bold text-[#239BA2]">
                  {UPCOMING_CIRCLES.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => openSheet("meet_founders")}
                className="text-[11px] font-bold text-[#239BA2] hover:underline"
              >
                {t("Conocer equipo", "Meet team")}
              </button>
            </div>

            <div className="space-y-2">
              {UPCOMING_CIRCLES.slice(0, 3).map((c, idx) => {
                const isSelected = idx === selectedCircleIdx;
                return (
                  <button
                    key={c.iso}
                    type="button"
                    onMouseEnter={() => setSelectedCircleIdx(idx)}
                    onClick={() => {
                      setSelectedCircleIdx(idx);
                      setPreviewCircleIdx(idx);
                    }}
                    className={`group flex w-full items-center gap-3 rounded-2xl p-2 text-left transition ${
                      isSelected
                        ? "bg-[#FFF5F7] ring-1 ring-[#E8809A]/40 shadow-sm"
                        : "bg-[#FAF7F2]/75 hover:bg-[#FFF5F7]/60"
                    }`}
                  >
                    <img
                      src={c.img}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-espresso">
                        {isEs ? c.topicEs : c.topicEn}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-espresso/55">
                        <span className="font-semibold text-espresso/70">{isEs ? c.es : c.en}</span>
                        <span>·</span>
                        <span>60 min</span>
                        <span>·</span>
                        <span className="font-bold text-[#239BA2]">{t("100% Gratis", "Free")}</span>
                      </div>
                    </div>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
                        isSelected
                          ? "bg-[#E8809A] text-white shadow-sm"
                          : "bg-white text-espresso/60 shadow-sm group-hover:text-[#E8809A]"
                      }`}
                    >
                      <Play className="ml-0.5 h-3 w-3 fill-current" />
                    </span>
                  </button>
                );
              })}
            </div>

            {/* TARJETA DESTACADA: 1 Sesión 1-a-1 de Coaching Gratis al Mes */}
            <div className="relative overflow-hidden rounded-[24px] border border-[#239BA2]/30 bg-gradient-to-br from-[#E6F4F2] via-[#F3FAF9] to-[#FFF5F7] p-4 shadow-[0_8px_24px_rgba(35,155,162,0.12)]">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#239BA2] shadow-sm">
                  <Gift className="h-3 w-3 text-[#239BA2]" />
                  <span>{t("Regalo mensual para ti", "Your monthly gift")}</span>
                </div>
                <span className="rounded-full bg-[#239BA2]/15 px-2 py-0.5 text-[10px] font-bold text-[#239BA2]">
                  {t("1 gratis al mes", "1 free/month")}
                </span>
              </div>

              <div className="mt-2 space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-espresso">
                  {t("1 Sesión 1-a-1 de Coaching o Sanación", "1 Free 1-on-1 Coaching Session")}
                </h4>
                <p className="text-[11px] text-espresso/70 leading-relaxed">
                  {t(
                    "Acompañamiento individual con nuestros terapeutas para dudas de tratamiento, nutrición o calma.",
                    "Personalized 1-on-1 guidance with our healers for questions, nutrition, or calm."
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => openSheet("book", { gratis: "1", modalidad: "online" })}
                className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full bg-[#239BA2] py-2 text-xs font-bold text-white shadow-[0_6px_16px_rgba(35,155,162,0.25)] transition hover:bg-[#1f878d] active:scale-95"
              >
                <HeartHandshake className="h-3.5 w-3.5" />
                <span>{t("Agendar mi sesión gratis", "Book my free session")}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

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

      {/* ---------- 2. QUICK ACCESS (Círculos pastel como en el diseño de referencia) ---------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold tracking-tight text-espresso">
            {t("Acceso rápido", "Quick access")}
          </h3>
          <span className="text-xs font-semibold text-espresso/50">
            {collectionsWithItems.length} {t("espacios", "spaces")}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-9">
          {collectionsWithItems.map(({ col, items }) => {
            const Icon = col.icon;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => go(`col:${col.id}`)}
                className="group flex shrink-0 flex-col items-center gap-2 rounded-3xl border border-white bg-white p-3 text-center shadow-[0_6px_20px_rgba(38,35,34,0.04)] transition hover:-translate-y-0.5 hover:shadow-md active:scale-95"
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full transition group-hover:scale-105"
                  style={{ backgroundColor: col.pastelBg, color: col.accent }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <span className="block text-xs font-bold leading-tight text-espresso">
                    {isEs ? col.shortEs : col.shortEn}
                  </span>
                  <span className="text-[10px] font-medium text-espresso/45">
                    {items.length}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---------- 3. CLASES Y PRÁCTICAS (Cápsulas + Tarjetas horizontales con foto real) ---------- */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#239BA2]">
              {t("Tu biblioteca de bienestar", "Your wellness library")}
            </span>
            <h2 className="mt-0.5 text-2xl font-semibold tracking-[-0.025em] text-espresso">
              {t("Prácticas y ", "Practices & ")}
              <span className="font-light italic text-[#E8809A]">
                {t("clases guiadas", "guided classes")}
              </span>
            </h2>
          </div>

          <label className="flex items-center gap-2 rounded-full border border-espresso/10 bg-white px-4 py-2 shadow-sm sm:w-64">
            <Search className="h-3.5 w-3.5 text-espresso/40" />
            <input
              type="text"
              value={hubQuery}
              onChange={(e) => setHubQuery(e.target.value)}
              placeholder={t("Buscar práctica o sanador…", "Search practice or healer…")}
              className="w-full bg-transparent text-xs text-espresso outline-none placeholder:text-espresso/45"
            />
            {hubQuery && (
              <button
                type="button"
                onClick={() => setHubQuery("")}
                className="text-espresso/40 hover:text-espresso"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
        </div>

        {/* Cápsulas de filtro estilo pantalla "Classes" sin scroll horizontal */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setHubCategory("todos")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
              hubCategory === "todos"
                ? "bg-[#E8809A] text-white shadow-[0_6px_16px_rgba(232,128,154,0.3)]"
                : "bg-white text-espresso/70 shadow-sm hover:bg-[#FAF7F2]"
            }`}
          >
            {t("Todas", "All")} ({freeLibrary.length})
          </button>
          {collectionsWithItems.map(({ col, items }) => {
            const active = hubCategory === col.id;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setHubCategory(col.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  active
                    ? "bg-[#E8809A] text-white shadow-[0_6px_16px_rgba(232,128,154,0.3)]"
                    : "bg-white text-espresso/70 shadow-sm hover:bg-[#FAF7F2]"
                }`}
              >
                {isEs ? col.shortEs : col.shortEn} ({items.length})
              </button>
            );
          })}
        </div>

        {hubCategory !== "todos" && (
          <div className="flex items-center justify-between rounded-2xl bg-[#FDF3EF] px-4 py-2.5 text-xs">
            <span className="font-medium text-espresso/75">
              {isEs
                ? COLLECTIONS.find((c) => c.id === hubCategory)?.helpsEs
                : COLLECTIONS.find((c) => c.id === hubCategory)?.helpsEn}
            </span>
            <button
              type="button"
              onClick={() => go(`col:${hubCategory}`)}
              className="ml-3 shrink-0 font-bold text-[#C94A6A] hover:underline"
            >
              {t("Ver colección →", "Open collection →")}
            </button>
          </div>
        )}

        {/* Lista horizontal en 2 columnas estilo "Morning Stretch / Deep Relaxation" */}
        {hubFilteredResources.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#6BB1AD]/35 bg-white/80 p-8 text-center text-sm text-espresso/60">
            {t("No encontramos prácticas con esa búsqueda.", "No practices match your search.")}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            {hubFilteredResources.slice(0, visible).map((item) => {
              const col =
                COLLECTIONS.find((c) => c.types.includes(item.tipo_contenido)) ||
                COLLECTIONS[0];
              const primaryHealer = healersOf(item)[0] || "Love Heals Effect";
              return (
                <ClassListCard
                  key={item.id}
                  item={item}
                  pastelBg={col.pastelBg}
                  accent={col.accent}
                  locked={!canOpenItem(item)}
                  healer={getHealerInfo(primaryHealer)}
                  onOpen={() => open(item)}
                  onSelectHealer={() => go(`healer:${primaryHealer}`)}
                  isEs={isEs}
                  t={t}
                />
              );
            })}
          </div>
        )}

        {hubFilteredResources.length > visible && (
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="mx-auto block rounded-full bg-white px-6 py-2.5 text-xs font-bold text-espresso shadow-sm transition hover:bg-[#FAF7F2]"
          >
            {t("Ver más prácticas", "Load more practices")} ({hubFilteredResources.length - visible})
          </button>
        )}
      </section>

      {/* ---------- 4. NUESTROS SANADORES (Con retratos de personas reales) ---------- */}
      {healers.length > 0 && (
        <section className="space-y-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#239BA2]">
              {t("Acompañamiento humano", "Human guidance")}
            </span>
            <h2 className="mt-0.5 text-2xl font-semibold tracking-[-0.025em] text-espresso">
              {isEs ? "Nuestros " : "Our "}
              <span className="font-light italic text-[#E8809A]">
                {isEs ? "sanadores especialistas" : "specialist healers"}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {healers.map(([name, count]) => {
              const info = getHealerInfo(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => go(`healer:${name}`)}
                  className="group flex flex-col justify-between rounded-[28px] border border-white bg-white p-4 text-left shadow-[0_8px_26px_rgba(38,35,34,0.05)] transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
                >
                  <div>
                    <div className="flex items-center gap-3.5">
                      <HealerAvatar healer={info} sizeClass="h-14 w-14" textClass="text-lg" />
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-espresso">
                          {name}
                        </span>
                        <span className="line-clamp-2 block text-[11px] font-semibold text-[#C94A6A]">
                          {isEs ? info.specialtyEs : info.specialtyEn}
                        </span>
                      </div>
                    </div>
                    {(isEs ? info.bioEs : info.bioEn) && (
                      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-espresso/65">
                        {isEs ? info.bioEs : info.bioEn}
                      </p>
                    )}
                  </div>

                  <div className="mt-3.5 flex items-center justify-between border-t border-espresso/5 pt-3 text-xs">
                    <span className="rounded-full bg-[#E5F2F1] px-2.5 py-0.5 text-[11px] font-bold text-[#239BA2]">
                      {count} {t("prácticas", "practices")}
                    </span>
                    <span className="inline-flex items-center gap-0.5 font-bold text-espresso/75 group-hover:text-[#E8809A]">
                      {t("Ver perfil", "View profile")}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------- 5. ACADEMIA LOVE HEALS (Banner pastel luminoso con foto real) ---------- */}
      {paidItems.length > 0 && (
        <section>
          <div className="overflow-hidden rounded-[32px] border border-white bg-gradient-to-r from-[#FDF3EF] via-white to-[#E5F2F1] p-6 shadow-[0_12px_34px_rgba(232,128,154,0.12)] sm:p-7">
            <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-12">
              <div className="space-y-2.5 md:col-span-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF4E2] px-3 py-1 text-[11px] font-bold text-[#B8862D]">
                  <Crown className="h-3.5 w-3.5" />
                  {isPremium
                    ? t("Incluida en tu membresía", "Included in your membership")
                    : t("Membresía Familiar · $10 USD/mes", "Family Membership · $10 USD/mo")}
                </span>
                <h3 className="text-2xl font-semibold tracking-[-0.025em] text-espresso sm:text-3xl">
                  The Love Heals Effect{" "}
                  <span className="font-light italic text-[#E8809A]">Academy</span>
                </h3>
                <p className="max-w-xl text-xs leading-relaxed text-espresso/70 sm:text-sm">
                  {t(
                    "Paso a paso cada semana: lecciones guiadas, meditaciones avanzadas y encuentros grupales profundos junto a Kelsie y Omar.",
                    "Step by step every week: guided lessons, advanced meditations, and deeper group circles with Kelsie and Omar."
                  )}
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => go("col:academia")}
                    className="inline-flex items-center gap-2 rounded-full bg-[#E8809A] px-5 py-2.5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(232,128,154,0.3)] transition hover:bg-[#d86c88] active:scale-95"
                  >
                    <span>
                      {t("Explorar la Academia", "Explore the Academy")} ({paidItems.length})
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="md:col-span-4">
                <img
                  src={ACADEMY.img}
                  alt="Love Heals Effect Academy"
                  className="aspect-[16/10] w-full rounded-[22px] object-cover shadow-sm"
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Tarjetas luminosas estilo "Classes" con fotografías reales         */
/* ------------------------------------------------------------------ */

function ClassListCard({
  item,
  pastelBg,
  accent,
  locked,
  healer,
  onOpen,
  onSelectHealer,
  isEs,
  t,
}: {
  item: any;
  pastelBg: string;
  accent: string;
  locked: boolean;
  healer: HealerSummary;
  onOpen: () => void;
  onSelectHealer: () => void;
  isEs: boolean;
  t: (es: string, en: string) => string;
}) {
  const title = isEs ? item.titulo_es : item.titulo_en || item.titulo_es;
  const desc = isEs ? item.descripcion_es : item.descripcion_en || item.descripcion_es;
  const photo = resolveItemPhoto(item);

  return (
    <div className="group flex items-center gap-3.5 rounded-[26px] border border-white bg-white p-3.5 shadow-[0_8px_24px_rgba(38,35,34,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(232,128,154,0.14)]">
      {/* Miniatura fotográfica real */}
      <button
        type="button"
        onClick={onOpen}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#FAF7F2] sm:h-24 sm:w-24"
        aria-label={title}
      >
        <img
          src={photo}
          alt={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </button>

      {/* Información central limpia */}
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={onOpen}
          className="line-clamp-1 text-left text-sm font-bold leading-snug text-espresso transition group-hover:text-[#C94A6A] sm:text-base"
        >
          {title}
        </button>

        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-espresso/55">
          {item.duracion && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-[#E8809A]" />
              {item.duracion}
            </span>
          )}
          {item.nivel && (
            <>
              <span>·</span>
              <span>{item.nivel}</span>
            </>
          )}
        </div>

        {desc && (
          <p className="mt-1 line-clamp-1 text-xs text-espresso/65">{desc}</p>
        )}

        <button
          type="button"
          onClick={onSelectHealer}
          className="mt-2 inline-flex max-w-full items-center gap-1.5 text-left text-[11px] font-semibold text-[#239BA2] hover:underline"
        >
          <HealerAvatar healer={healer} sizeClass="h-4 w-4" textClass="text-[8px]" />
          <span className="truncate">{healer.name}</span>
        </button>
      </div>

      {/* Botón circular Play pastel a la derecha */}
      <button
        type="button"
        onClick={onOpen}
        style={{ backgroundColor: locked ? "#FAF7F2" : pastelBg, color: locked ? "#262322" : accent }}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm transition group-hover:scale-105 active:scale-95"
        aria-label={t("Iniciar práctica", "Start practice")}
      >
        {locked ? (
          <Lock className="h-4 w-4" />
        ) : (
          <Play className="ml-0.5 h-4 w-4 fill-current" />
        )}
      </button>
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
  const photo = resolveItemPhoto(item);

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-[26px] border border-white bg-white p-3 text-left shadow-[0_8px_24px_rgba(38,35,34,0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(232,128,154,0.14)]">
      <div>
        <button
          type="button"
          onClick={onOpen}
          className="relative block aspect-video w-full overflow-hidden rounded-[20px] bg-[#FAF7F2]"
        >
          <img
            src={photo}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          {item.duracion && (
            <span className="absolute bottom-2.5 left-2.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-espresso shadow-sm">
              {item.duracion}
            </span>
          )}
          {item.nivel && (
            <span className="absolute right-2.5 top-2.5 rounded-full bg-[#FCECEE]/95 px-2.5 py-0.5 text-[10px] font-bold text-[#C94A6A]">
              {item.nivel}
            </span>
          )}
          <span className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#E8809A] shadow-md transition group-hover:scale-110">
            {locked ? (
              <Lock className="h-4 w-4 text-espresso" />
            ) : doc ? (
              <FileText className="h-4 w-4 text-[#239BA2]" />
            ) : (
              <Play className="ml-0.5 h-4 w-4 fill-[#E8809A]" />
            )}
          </span>
        </button>

        <div className="px-1.5 pt-3">
          <button
            type="button"
            onClick={onOpen}
            className="line-clamp-2 text-left text-base font-semibold leading-snug tracking-[-0.015em] text-espresso transition hover:text-[#C94A6A]"
          >
            {isEs ? item.titulo_es : item.titulo_en || item.titulo_es}
          </button>
          {desc && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-espresso/70">
              {desc}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-espresso/5 px-1.5 pt-3">
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
        <button
          type="button"
          onClick={onOpen}
          className="shrink-0 rounded-full bg-[#FDF3EF] px-3 py-1 text-[11px] font-bold text-[#C94A6A] transition hover:bg-[#E8809A] hover:text-white"
        >
          {locked ? t("Desbloquear", "Unlock") : doc ? t("Abrir", "Open") : t("Iniciar", "Start")}
        </button>
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
  const color = item.color || "#E6748E";
  const desc = isEs ? item.descripcion_es : item.descripcion_en || item.descripcion_es;

  return (
    <div className="group flex gap-4 rounded-[26px] border border-white bg-white p-4 shadow-[0_8px_24px_rgba(38,35,34,0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <button type="button" onClick={onOpen} className="w-24 shrink-0 text-left sm:w-28">
        <span
          className="relative flex aspect-[2/3] w-full flex-col justify-between overflow-hidden rounded-r-xl rounded-l-sm p-2.5 shadow-[4px_6px_14px_rgba(38,35,34,0.16)] transition duration-300 group-hover:rotate-[-1deg]"
          style={{ background: `linear-gradient(145deg, ${color}, #C9526D)` }}
        >
          <span className="absolute inset-y-0 left-0 w-1.5 bg-white/25" />
          <span className="pl-1 text-[8px] font-bold uppercase tracking-widest text-white/85">
            Love Heals
          </span>
          <span className="pl-1">
            <span className="line-clamp-3 block font-serif text-xs font-bold leading-tight text-white">
              {isEs ? item.titulo_es : item.titulo_en}
            </span>
            <span className="mt-1 block truncate text-[9px] text-white/85">{item.autor}</span>
          </span>
        </span>
      </button>

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
            <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-espresso/70">{desc}</p>
          )}
        </div>

        <div className="mt-3 border-t border-espresso/5 pt-2.5">
          <button
            type="button"
            onClick={onSelectHealer}
            className="flex w-full items-center gap-2 text-left transition hover:opacity-80"
          >
            <HealerAvatar healer={healer} sizeClass="h-6 w-6" textClass="text-[10px]" />
            <span className="truncate text-[11px] font-bold text-[#239BA2]">
              {t("Recomendado por", "By")} {healer.name}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Modal interactivo de Healing Circle (luminoso + video)             */
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
        className="absolute inset-0 bg-espresso/45 backdrop-blur-sm"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[32px] bg-white shadow-2xl animate-sheet-up sm:rounded-[32px]">
        <div className="flex items-center justify-between gap-2 border-b border-espresso/10 bg-[#FAF7F2] px-4 py-3 sm:px-6">
          <div className="flex flex-wrap gap-1.5">
            {circles.map((c, idx) => {
              const active = idx === activeIndex;
              return (
                <button
                  key={c.iso}
                  type="button"
                  onClick={() => switchDate(idx)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    active
                      ? "bg-[#E8809A] text-white shadow-sm"
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

        <div className="grid grid-cols-1 gap-5 overflow-y-auto p-5 sm:p-6 lg:grid-cols-12 lg:items-start lg:overflow-visible">
          {/* Columna izquierda: Imagen / Video */}
          <div className="space-y-3 lg:col-span-6">
            <div className="relative overflow-hidden rounded-[24px] bg-[#FAF7F2] shadow-sm">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/50 via-transparent to-transparent" />

                  <button
                    type="button"
                    onClick={() => setMediaMode("video")}
                    className="group absolute inset-0 flex flex-col items-center justify-center gap-2"
                  >
                    <span className="flex items-center justify-center rounded-full bg-white/95 p-3.5 text-[#E8809A] shadow-xl transition duration-300 group-hover:scale-110">
                      <Play className="ml-0.5 h-6 w-6 fill-[#E8809A]" />
                    </span>
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-espresso shadow-sm">
                      {t("Ver video de muestra", "Watch preview video")}
                    </span>
                  </button>

                  <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#239BA2]">
                      {isEs ? event.badgeEs : event.badgeEn}
                    </span>
                    <span className="rounded-full bg-[#FCECEE]/95 px-2.5 py-1 text-[10px] font-bold text-[#C94A6A]">
                      {event.spots} {t("cupos · Gratis", "spots · Free")}
                    </span>
                  </div>
                </div>
              )}

              <div className="absolute right-3 top-3 flex gap-1 rounded-full bg-white/90 p-1 shadow-sm backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setMediaMode("image")}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold transition ${
                    mediaMode === "image" ? "bg-[#E8809A] text-white" : "text-espresso/70 hover:text-espresso"
                  }`}
                >
                  <ImageIcon className="h-3 w-3" />
                  {t("Foto", "Photo")}
                </button>
                <button
                  type="button"
                  onClick={() => setMediaMode("video")}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold transition ${
                    mediaMode === "video" ? "bg-[#E8809A] text-white" : "text-espresso/70 hover:text-espresso"
                  }`}
                >
                  <Video className="h-3 w-3" />
                  {t("Video", "Video")}
                </button>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#239BA2]">
                <Calendar className="h-3.5 w-3.5" />
                <span>{isEs ? event.fullDateEs : event.fullDateEn}</span>
                <span className="text-espresso/30">·</span>
                <Clock className="h-3.5 w-3.5 text-[#E8809A]" />
                <span className="text-espresso/65">60 min</span>
              </div>
              <h3 className="mt-1 text-xl font-semibold leading-tight tracking-[-0.025em] text-espresso sm:text-2xl">
                {isEs ? event.topicEs : event.topicEn}
              </h3>
              <p className="mt-0.5 text-xs font-semibold text-espresso/60">
                {t("Facilitado por", "Facilitated by")}{" "}
                <strong className="text-espresso">{event.host}</strong>
              </p>
            </div>
          </div>

          {/* Columna derecha: Pestañas + Detalle + Acción */}
          <div className="flex flex-col justify-between gap-3.5 lg:col-span-6">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-1.5 rounded-full bg-[#FAF7F2] p-1">
                {(
                  [
                    ["resumen", t("De qué trata", "About")],
                    ["participar", t("Dinámica", "Flow")],
                    ["donde", t("Dónde unirte", "Where")],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`rounded-full py-1.5 text-xs font-bold transition ${
                      tab === id
                        ? "bg-[#E8809A] text-white shadow-sm"
                        : "text-espresso/65 hover:text-espresso"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === "resumen" && (
                <div className="space-y-2.5 animate-fade-in">
                  <div className="rounded-2xl bg-[#FAF7F2] p-3.5">
                    <p className="text-xs leading-relaxed text-espresso/85 sm:text-sm">
                      {isEs ? event.summaryEs : event.summaryEn}
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-2xl bg-[#E5F2F1]/70 p-3">
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
                <div className="space-y-2 animate-fade-in">
                  {steps.map((s, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 rounded-2xl bg-[#FAF7F2] p-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FCECEE] text-[11px] font-bold text-[#C94A6A]">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-espresso">{s.title}</span>
                          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#239BA2]">
                            {s.time}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] leading-snug text-espresso/70">{s.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "donde" && (
                <div className="space-y-2.5 animate-fade-in">
                  <div className="space-y-1.5 rounded-2xl bg-[#FAF7F2] p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#239BA2]">
                      <MapPin className="h-3.5 w-3.5" />
                      {t("Dónde y cómo te conectas", "Where & how you join")}
                    </div>
                    <p className="text-xs leading-relaxed text-espresso/80">
                      {isEs ? event.whereEs : event.whereEn}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {bring.map((b) => (
                      <span
                        key={b}
                        className="inline-flex items-center gap-1 rounded-full bg-[#FCECEE] px-2.5 py-1 text-[11px] font-semibold text-[#C94A6A]"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-espresso/10 pt-3">
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
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#E8809A] px-5 py-2.5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(232,128,154,0.3)] transition hover:bg-[#d86c88] active:scale-95 sm:flex-initial"
              >
                <Calendar className="h-3.5 w-3.5" />
                {t("Inscribirme gratis", "Sign up free")} ({isEs ? event.es : event.en})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

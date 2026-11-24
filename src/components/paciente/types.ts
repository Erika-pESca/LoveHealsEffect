import React from "react";
import {
  BookOpen,
  CalendarHeart,
  GraduationCap,
  Music,
  Sparkles,
  Users,
  Video,
  Wind,
} from "lucide-react";

export type EtapaKey =
  | "diagnostico"
  | "tratamiento_activo"
  | "cirugia_recuperacion"
  | "post_tratamiento";

export const STAGES: Array<{
  id: EtapaKey;
  es: string;
  en: string;
  emoji: string;
}> = [
  { id: "diagnostico", es: "Diagnóstico", en: "Diagnosis", emoji: "🌱" },
  { id: "tratamiento_activo", es: "Tratamiento", en: "Treatment", emoji: "💪" },
  { id: "cirugia_recuperacion", es: "Recuperación", en: "Recovery", emoji: "🌿" },
  { id: "post_tratamiento", es: "Post-tratamiento", en: "Post-treatment", emoji: "🌺" },
];

export const MOODS = [
  {
    id: "radiante",
    emoji: "😄",
    es: "Radiante",
    en: "Radiant",
    bg: "bg-[#FFF1B8]",
    msgEs: "¡Qué hermoso verte así!",
    msgEn: "How lovely to see you like this!",
  },
  {
    id: "tranquila",
    emoji: "😌",
    es: "Tranquila",
    en: "Calm",
    bg: "bg-[#D7F3EA]",
    msgEs: "Qué bien que estés en calma.",
    msgEn: "Great that you feel calm.",
  },
  {
    id: "cansada",
    emoji: "😴",
    es: "Cansada",
    en: "Tired",
    bg: "bg-[#E4E0FA]",
    msgEs: "Descansar también es sanar.",
    msgEn: "Resting is healing too.",
  },
  {
    id: "ansiosa",
    emoji: "😟",
    es: "Ansiosa",
    en: "Anxious",
    bg: "bg-[#FFE0D2]",
    msgEs: "Respira conmigo.",
    msgEn: "Breathe with me.",
  },
  {
    id: "triste",
    emoji: "😢",
    es: "Triste",
    en: "Sad",
    bg: "bg-[#D9E8FB]",
    msgEs: "Está bien sentirlo. No estás sola.",
    msgEn: "It's okay to feel it. You're not alone.",
  },
  {
    id: "dolor",
    emoji: "🤕",
    es: "Con molestias",
    en: "In discomfort",
    bg: "bg-[#FAD4DC]",
    msgEs: "Gracias por contarlo.",
    msgEn: "Thanks for sharing.",
  },
];

export const TYPE_META: Record<
  string,
  {
    es: string;
    en: string;
    icon: React.ComponentType<{ className?: string }>;
    grad: string;
  }
> = {
  video_bam: {
    es: "Movimiento BAM",
    en: "BAM Movement",
    icon: Video,
    grad: "from-[#FCD5DE] to-[#FBE9D6]",
  },
  meditacion_audio: {
    es: "Meditación",
    en: "Meditation",
    icon: Wind,
    grad: "from-[#D7F3EA] to-[#E4E0FA]",
  },
  musicoterapia: {
    es: "Musicoterapia",
    en: "Music therapy",
    icon: Music,
    grad: "from-[#E4E0FA] to-[#D9E8FB]",
  },
  guia_autocuidado: {
    es: "Guía",
    en: "Guide",
    icon: BookOpen,
    grad: "from-[#FFF1B8] to-[#FDE3E8]",
  },
  love_circle: {
    es: "Love Circle",
    en: "Love Circle",
    icon: Users,
    grad: "from-[#FDE3E8] to-[#F6E6FA]",
  },
  workshop: {
    es: "Workshop",
    en: "Workshop",
    icon: CalendarHeart,
    grad: "from-[#D9E8FB] to-[#D7F3EA]",
  },
  tapping_eft: {
    es: "Tapping EFT",
    en: "EFT Tapping",
    icon: Sparkles,
    grad: "from-[#FCD5DE] to-[#E4E0FA]",
  },
  academia_lhe: {
    es: "Academia LHE",
    en: "LHE Academy",
    icon: GraduationCap,
    grad: "from-[#FFF1B8] to-[#FAD4DC]",
  },
};

export const HABIT_COLORS = [
  "bg-[#D7F3EA]",
  "bg-[#FAD4DC]",
  "bg-[#FFF1B8]",
  "bg-[#D9E8FB]",
  "bg-[#E4E0FA]",
];

export const TIMELINE_META: Record<
  string,
  { es: string; en: string; emoji: string; bg: string }
> = {
  etapa: { es: "Etapa", en: "Stage", emoji: "🌱", bg: "bg-[#D7F3EA]" },
  medicamento: { es: "Medicina", en: "Medication", emoji: "💊", bg: "bg-[#FAD4DC]" },
  cita: { es: "Cita", en: "Visit", emoji: "🩺", bg: "bg-[#D9E8FB]" },
  procedimiento: { es: "Procedimiento", en: "Procedure", emoji: "🏥", bg: "bg-[#E4E0FA]" },
  sintoma: { es: "Síntoma", en: "Symptom", emoji: "🌡️", bg: "bg-[#FFE0D2]" },
  diagnostico: { es: "Diagnóstico", en: "Diagnosis", emoji: "📋", bg: "bg-[#FFF1B8]" },
  documento: { es: "Documento", en: "Document", emoji: "📄", bg: "bg-[#EFEAE2]" },
  sanador: { es: "Sanador", en: "Healer", emoji: "✨", bg: "bg-[#FFE7D6]" },
  nota: { es: "Nota", en: "Note", emoji: "📝", bg: "bg-[#F1ECF5]" },
};

export const todayKey = () => new Date().toLocaleDateString("en-CA");

export const dayKeyOffset = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("en-CA");
};

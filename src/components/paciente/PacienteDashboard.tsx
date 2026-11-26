"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  Bell,
  BookOpen,
  CalendarHeart,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Copy,
  Crown,
  Droplets,
  ExternalLink,
  FileText,
  Flame,
  Globe,
  Heart,
  HelpCircle,
  KeyRound,
  Lock,
  LogOut,
  Mic,
  MicOff,
  Moon,
  Music,
  Pause,
  Phone,
  Pill,
  Play,
  Plus,
  ScanSearch,
  Send,
  Share2,
  Sparkles,
  Stethoscope,
  Syringe,
  Trash2,
  Upload,
  UserCog,
  Users,
  Video,
  Wind,
  X,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Card,
  Field,
  inputCls,
  PrimaryButton,
  SectionTitle,
  Sheet,
  Toast,
} from "@/components/panel/ui";
import { InicioSection } from "./InicioSection";
import { RecursosSection } from "./RecursosSection";
import { MiCaminoSection } from "./MiCaminoSection";
import { ConsultSummarySheet } from "@/components/panel/ConsultSummarySheet";
import { RecordatoriosSection } from "./RecordatoriosSection";
import { PerfilSection } from "./PerfilSection";

/* ------------------------------------------------------------------ */
/*  Datos de apoyo (etapas, ánimos, tipos de práctica, bitácora)       */
/* ------------------------------------------------------------------ */

type EtapaKey =
  | "diagnostico"
  | "tratamiento_activo"
  | "cirugia_recuperacion"
  | "post_tratamiento";

export const STAGES: Array<{ id: EtapaKey; es: string; en: string; emoji: string }> = [
  { id: "diagnostico", es: "Diagnóstico", en: "Diagnosis", emoji: "🌱" },
  { id: "tratamiento_activo", es: "Tratamiento", en: "Treatment", emoji: "💪" },
  { id: "cirugia_recuperacion", es: "Recuperación", en: "Recovery", emoji: "🌿" },
  { id: "post_tratamiento", es: "Post-tratamiento", en: "Post-treatment", emoji: "🌺" },
];

const MOODS = [
  { id: "radiante", emoji: "😄", es: "Radiante", en: "Radiant", bg: "bg-[#FFF1B8]", msgEs: "¡Qué hermoso verte así!", msgEn: "How lovely to see you like this!" },
  { id: "tranquila", emoji: "😌", es: "Tranquila", en: "Calm", bg: "bg-[#D7F3EA]", msgEs: "Qué bien que estés en calma.", msgEn: "Great that you feel calm." },
  { id: "cansada", emoji: "😴", es: "Cansada", en: "Tired", bg: "bg-[#E4E0FA]", msgEs: "Descansar también es sanar.", msgEn: "Resting is healing too." },
  { id: "ansiosa", emoji: "😟", es: "Ansiosa", en: "Anxious", bg: "bg-[#FFE0D2]", msgEs: "Respira conmigo.", msgEn: "Breathe with me." },
  { id: "triste", emoji: "😢", es: "Triste", en: "Sad", bg: "bg-[#D9E8FB]", msgEs: "Está bien sentirlo. No estás sola.", msgEn: "It's okay to feel it. You're not alone." },
  { id: "dolor", emoji: "🤕", es: "Con molestias", en: "In discomfort", bg: "bg-[#FAD4DC]", msgEs: "Gracias por contarlo.", msgEn: "Thanks for sharing." },
];

export const TYPE_META: Record<
  string,
  { es: string; en: string; icon: React.ComponentType<{ className?: string }>; grad: string }
> = {
  video_bam: { es: "Movimiento BAM", en: "BAM Movement", icon: Video, grad: "from-[#FCD5DE] to-[#FBE9D6]" },
  meditacion_audio: { es: "Meditación", en: "Meditation", icon: Wind, grad: "from-[#D7F3EA] to-[#E4E0FA]" },
  musicoterapia: { es: "Musicoterapia", en: "Music therapy", icon: Music, grad: "from-[#E4E0FA] to-[#D9E8FB]" },
  guia_autocuidado: { es: "Guía", en: "Guide", icon: BookOpen, grad: "from-[#FFF1B8] to-[#FDE3E8]" },
  love_circle: { es: "Love Circle", en: "Love Circle", icon: Users, grad: "from-[#FDE3E8] to-[#F6E6FA]" },
  workshop: { es: "Workshop", en: "Workshop", icon: CalendarHeart, grad: "from-[#D9E8FB] to-[#D7F3EA]" },
  tapping_eft: { es: "Tapping EFT", en: "EFT Tapping", icon: Sparkles, grad: "from-[#FCD5DE] to-[#E4E0FA]" },
  spotify: { es: "Spotify", en: "Spotify", icon: Music, grad: "from-[#D7F3EA] to-[#CFEDE8]" },
  podcast: { es: "Podcast", en: "Podcast", icon: Mic, grad: "from-[#FDE3E8] to-[#E4E0FA]" },
  libro: { es: "Libro", en: "Book", icon: BookOpen, grad: "from-[#FFF5DA] to-[#FAD4DC]" },
  guia_pdf: { es: "Guía PDF", en: "PDF Guide", icon: FileText, grad: "from-[#EFEAE2] to-[#D9E8FB]" },
};

export const HABIT_COLORS = [
  "bg-[#D7F3EA]",
  "bg-[#FAD4DC]",
  "bg-[#FFF1B8]",
  "bg-[#D9E8FB]",
  "bg-[#E4E0FA]",
];

const BITACORA_TYPE_OPTIONS: Array<{
  id: string;
  es: string;
  en: string;
  descEs: string;
  descEn: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  pastelBg: string;
}> = [
  {
    id: "sintoma",
    es: "Síntoma",
    en: "Symptom",
    descEs: "Cómo se siente tu cuerpo",
    descEn: "How your body feels",
    icon: Activity,
    accent: "#C9526D",
    pastelBg: "#FFF0EC",
  },
  {
    id: "cita",
    es: "Cita médica",
    en: "Medical visit",
    descEs: "Consulta con especialista",
    descEn: "Specialist appointment",
    icon: Stethoscope,
    accent: "#239BA2",
    pastelBg: "#E5F2F1",
  },
  {
    id: "procedimiento",
    es: "Procedimiento",
    en: "Procedure",
    descEs: "Quimio, radio o examen",
    descEn: "Chemo, radiation or exam",
    icon: Syringe,
    accent: "#239BA2",
    pastelBg: "#E6F4F2",
  },
  {
    id: "medicamento",
    es: "Medicina",
    en: "Medication",
    descEs: "Dosis, toma o ajuste",
    descEn: "Dose or adjustment",
    icon: Pill,
    accent: "#C94A6A",
    pastelBg: "#FCECEE",
  },
  {
    id: "diagnostico",
    es: "Diagnóstico",
    en: "Diagnosis",
    descEs: "Resultado o estudio",
    descEn: "Result or study",
    icon: ScanSearch,
    accent: "#B8862D",
    pastelBg: "#FFF4E2",
  },
  {
    id: "documento",
    es: "Documento",
    en: "Document",
    descEs: "Receta o informe médico",
    descEn: "Prescription or report",
    icon: FileText,
    accent: "#B8862D",
    pastelBg: "#F4F2E6",
  },
  {
    id: "sanador",
    es: "Sanador",
    en: "Healer",
    descEs: "Terapia o bienestar",
    descEn: "Therapy or wellness",
    icon: Sparkles,
    accent: "#C94A6A",
    pastelBg: "#FFF5F7",
  },
  {
    id: "nota",
    es: "Nota personal",
    en: "Personal note",
    descEs: "Dudas o reflexiones",
    descEn: "Questions or thoughts",
    icon: ClipboardList,
    accent: "#5C8D67",
    pastelBg: "#EAF4EC",
  },
];

function BitacoraTypeDropdown({
  value,
  onChange,
  isEs,
}: {
  value: string;
  onChange: (val: string) => void;
  isEs: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const normalized = value === "consulta" ? "cita" : value === "quimio" ? "procedimiento" : value;
  const activeOpt =
    BITACORA_TYPE_OPTIONS.find((o) => o.id === normalized) || BITACORA_TYPE_OPTIONS[7];
  const ActiveIcon = activeOpt.icon;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-2.5 rounded-2xl border bg-[#FAF7F2] px-3.5 py-2.5 text-left transition ${
          open
            ? "border-[#E8809A] bg-white ring-2 ring-[#E8809A]/25"
            : "border-espresso/10 hover:border-[#E8809A]/45 hover:bg-white"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm"
            style={{ backgroundColor: activeOpt.pastelBg, color: activeOpt.accent }}
          >
            <ActiveIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-extrabold text-espresso">
              {isEs ? activeOpt.es : activeOpt.en}
            </p>
            <p className="truncate text-[10px] font-medium text-espresso/55">
              {isEs ? activeOpt.descEs : activeOpt.descEn}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-espresso/45 transition-transform duration-200 ${
            open ? "rotate-180 text-[#E8809A]" : ""
          }`}
        />
      </button>

      {open && (
        <div className="animate-fade-in absolute left-0 right-0 top-[calc(100%+6px)] z-50 grid grid-cols-1 gap-1 rounded-2xl border border-[#E8809A]/25 bg-white p-2 shadow-[0_18px_40px_rgba(38,35,34,0.16)] sm:grid-cols-2 sm:w-[380px]">
          {BITACORA_TYPE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = opt.id === activeOpt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={`group flex items-center gap-2.5 rounded-xl p-2 text-left transition ${
                  isSelected
                    ? "bg-[#FFF5F7] ring-1 ring-[#E8809A]/45"
                    : "hover:bg-[#FAF7F2]"
                }`}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition group-hover:scale-105"
                  style={{ backgroundColor: opt.pastelBg, color: opt.accent }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-espresso">
                    {isEs ? opt.es : opt.en}
                  </p>
                  <p className="truncate text-[10px] text-espresso/55">
                    {isEs ? opt.descEs : opt.descEn}
                  </p>
                </div>
                {isSelected && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8809A] text-white">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const TIMELINE_META: Record<string, { es: string; en: string; emoji: string; bg: string }> = {
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

/* ------------------------------------------------------------------ */
/*  Reproductor de práctica guiada (respiración + onda)                */
/* ------------------------------------------------------------------ */

export function PracticePlayer({
  item,
  isEs,
  healers = [],
  onViewHealer,
  onBookHealer,
}: {
  item: any;
  isEs: boolean;
  healers?: any[];
  onViewHealer?: (name: string) => void;
  onBookHealer?: (healerId?: number) => void;
}) {
  const [playing, setPlaying] = useState(true);
  const [secs, setSecs] = useState(0);

  // Parse total duration from item.duracion (e.g. "15 min" -> 900)
  const totalSecs = useMemo(() => {
    const raw = String(item.duracion || "15 min");
    const m = parseInt(raw.match(/\d+/)?.[0] || "15", 10);
    return m * 60;
  }, [item.duracion]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setSecs((s) => (s >= totalSecs ? totalSecs : s + 1));
    }, 1000);
    return () => clearInterval(t);
  }, [playing, totalSecs]);

  const progressPct = Math.min(100, Math.round((secs / totalSecs) * 100));

  const formatTime = (total: number) => {
    const mm = String(Math.floor(total / 60)).padStart(2, "0");
    const ss = String(total % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const inhale = Math.floor(secs / 4) % 2 === 0;
  const meta = TYPE_META[item.tipo_contenido] || TYPE_META.meditacion_audio;
  const title = isEs ? item.titulo_es : item.titulo_en || item.titulo_es;
  const desc = isEs ? item.descripcion_es : item.descripcion_en || item.descripcion_es;
  const hasLink = typeof item.media_url === "string" && item.media_url.startsWith("http");

  const photoUrl =
    item.imagen_url ||
    (item.tipo_contenido === "video_bam"
      ? "/img/bam-movement.jpg"
      : item.tipo_contenido === "tapping_eft"
        ? "/img/tapping-eft.jpg"
        : item.tipo_contenido === "guia_autocuidado"
          ? "/img/healthy-cooking.jpg"
          : item.tipo_contenido === "musicoterapia"
            ? "/img/sound-healing.jpg"
            : item.tipo_contenido === "academia_lhe"
              ? "/img/academy-lesson.jpg"
              : item.tipo_contenido === "love_circle"
                ? "/img/love-circle.jpg"
                : "/img/meditation-calm.jpg");

  const skip = (delta: number) => {
    setSecs((s) => Math.max(0, Math.min(totalSecs, s + delta)));
  };

  const isReading = item.tipo_contenido === "libro" || item.tipo_contenido === "guia_pdf";
  const rawInstructor = String(item.instructor || "Love Heals Effect");
  const primaryHealerName = /kelsie/i.test(rawInstructor)
    ? "Kelsie Reynolds"
    : /omar/i.test(rawInstructor)
      ? "Omar Melero"
      : rawInstructor.split(/&|,/)[0].trim();

  const matchedHealer = healers.find((h: any) =>
    String(h.especialidad || "").toLowerCase().includes(primaryHealerName.split(" ")[0].toLowerCase())
  );
  const healerSpecialty = matchedHealer
    ? String(matchedHealer.especialidad || "").split("·").slice(1).join(" · ").trim() || matchedHealer.especialidad
    : /kelsie/i.test(primaryHealerName)
      ? isEs
        ? "Sobreviviente · Coach holística y Movimiento BAM"
        : "Survivor · Holistic Coach & BAM Movement"
      : /omar/i.test(primaryHealerName)
        ? isEs
          ? "Coach integrativo · Sistema nervioso y cuidadores"
          : "Integrative Coach · Nervous System & Caregivers"
        : isEs
          ? "Especialista en salud holística"
          : "Holistic health specialist";
  const healerBio = matchedHealer
    ? isEs
      ? matchedHealer.short_bio_es
      : matchedHealer.short_bio_en || matchedHealer.short_bio_es
    : "";

  const healerPortrait = /kelsie/i.test(primaryHealerName)
    ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
    : /omar/i.test(primaryHealerName)
      ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
      : /maya/i.test(primaryHealerName)
        ? "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80"
        : "";

  return (
    <div className="-mt-2 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-center">
      {/* Columna izquierda: Portada fotográfica real + reproductor compacto */}
      <div className="space-y-3.5 lg:col-span-6">
        <div className="relative overflow-hidden rounded-[26px] bg-[#FAF7F2] shadow-sm">
          <div className="relative h-48 w-full sm:h-52">
            <img src={photoUrl} alt={title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso/65 via-espresso/15 to-transparent" />

            <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
              <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-espresso shadow-sm">
                {isEs ? meta.es : meta.en}
              </span>
              <span className="rounded-full bg-[#E8809A] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                {item.duracion || "15 min"}
              </span>
            </div>

            <div className="absolute bottom-3 left-4 right-4">
              <h4 className="line-clamp-2 text-lg font-bold leading-snug text-white drop-shadow-sm sm:text-xl">
                {title}
              </h4>
              <p className="mt-0.5 truncate text-xs font-medium text-white/85">
                {item.autor
                  ? `${item.autor} · ${isEs ? "Recomendado por" : "Recommended by"} ${primaryHealerName}`
                  : item.instructor
                    ? `${isEs ? "Compartido por" : "Shared by"} ${item.instructor}`
                    : "Love Heals Effect"}
              </p>
            </div>
          </div>
        </div>

        {/* Controles interactivos de audio/video */}
        {!isReading && (
          <div className="rounded-[24px] bg-[#FAF7F2] p-4 text-center">
            <div className="space-y-1">
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newPct = Math.max(0, Math.min(1, clickX / rect.width));
                  setSecs(Math.round(newPct * totalSecs));
                }}
                className="group relative h-2 w-full cursor-pointer overflow-hidden rounded-full bg-espresso/10 transition hover:h-2.5"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#F48EA6] to-[#DC5678] transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-espresso/60">
                <span>{formatTime(secs)}</span>
                <span className="font-semibold text-espresso/45">
                  {playing ? (inhale ? (isEs ? "Inhala…" : "Inhale…") : isEs ? "Exhala…" : "Exhale…") : isEs ? "En pausa" : "Paused"}
                </span>
                <span>{formatTime(totalSecs)}</span>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-3">
              <div className="hidden h-5 flex-1 items-center justify-center gap-1 sm:flex">
                {Array.from({ length: 14 }).map((_, i) => (
                  <span
                    key={i}
                    className="h-full w-1 origin-center animate-wave rounded-full bg-[#E8809A]/55"
                    style={{
                      animationDelay: `${(i % 7) * 0.11}s`,
                      animationPlayState: playing ? "running" : "paused",
                    }}
                  />
                ))}
              </div>

              <div className="mx-auto flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => skip(-15)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-espresso/70 shadow-sm transition active:scale-90"
                  aria-label="-15 segundos"
                >
                  <span className="text-[11px] font-bold">-15s</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#E8809A] to-[#DC5678] text-white shadow-md transition duration-200 hover:scale-105 active:scale-95"
                  aria-label={playing ? "Pausar" : "Reproducir"}
                >
                  {playing ? <Pause className="h-5 w-5 fill-white" /> : <Play className="ml-0.5 h-5 w-5 fill-white" />}
                </button>

                <button
                  type="button"
                  onClick={() => skip(15)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-espresso/70 shadow-sm transition active:scale-90"
                  aria-label="+15 segundos"
                >
                  <span className="text-[11px] font-bold">+15s</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Columna derecha: Beneficio + Sanador con retrato real + Enlace externo */}
      <div className="flex flex-col justify-between gap-3.5 lg:col-span-6">
        <div className="rounded-2xl bg-[#FAF7F2] p-4">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#239BA2]">
            {isEs ? "¿Qué vas a manejar / en qué te ayuda?" : "What does this help you manage?"}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-espresso/80 sm:text-sm">{desc}</p>
        </div>

        {primaryHealerName && primaryHealerName !== "Love Heals Effect" && (
          <div className="rounded-2xl border border-espresso/10 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              {healerPortrait ? (
                <img
                  src={healerPortrait}
                  alt={primaryHealerName}
                  className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-[#FCECEE]"
                />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#E8809A] to-[#C94A6A] text-base font-bold text-white">
                  {primaryHealerName.charAt(0)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#239BA2]">
                  {isEs ? "Sanador especialista" : "Specialist healer"}
                </p>
                <p className="truncate text-sm font-bold text-espresso">{primaryHealerName}</p>
                <p className="line-clamp-1 text-[11px] font-semibold text-[#C94A6A]">{healerSpecialty}</p>
              </div>
            </div>
            {healerBio && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-espresso/70">{healerBio}</p>}
            {(onViewHealer || onBookHealer) && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-espresso/5 pt-2.5">
                {onViewHealer && (
                  <button
                    type="button"
                    onClick={() => onViewHealer(primaryHealerName)}
                    className="rounded-full bg-[#FAF7F2] px-3.5 py-1.5 text-xs font-bold text-espresso transition hover:bg-espresso/10"
                  >
                    {isEs ? "Ver perfil y recursos" : "Profile & resources"}
                  </button>
                )}
                {onBookHealer && (
                  <button
                    type="button"
                    onClick={() => onBookHealer(matchedHealer?.id)}
                    className="rounded-full bg-[#E8809A] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#d86c88]"
                  >
                    {isEs ? "Reservar sesión" : "Book session"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {hasLink && (
          <a
            href={item.media_url}
            target="_blank"
            rel="noreferrer"
            className={`flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition ${
              item.tipo_contenido === "spotify"
                ? "bg-[#239BA2] text-white shadow-sm hover:brightness-105"
                : "border border-[#E8809A]/35 bg-[#FDF3EF] text-[#C94A6A] hover:bg-[#E8809A] hover:text-white"
            }`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {item.tipo_contenido === "spotify"
              ? isEs
                ? "Escuchar playlist en Spotify"
                : "Listen to playlist on Spotify"
              : item.tipo_contenido === "libro"
                ? isEs
                  ? "Ver libro completo"
                  : "View full book"
                : isEs
                  ? "Abrir práctica en pantalla completa"
                  : "Open full practice"}
          </a>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mini calendario                                                    */
/* ------------------------------------------------------------------ */

export function MiniCalendar({
  marks,
  selected,
  onSelect,
  isEs,
}: {
  marks: Record<string, { med: number; ses: number }>;
  selected: string;
  onSelect: (k: string) => void;
  isEs: boolean;
}) {
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const first = new Date(cursor.y, cursor.m, 1);
  const lead = (first.getDay() + 6) % 7; // lunes primero
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = first.toLocaleDateString(isEs ? "es-ES" : "en-US", {
    month: "long",
    year: "numeric",
  });
  const weekdays = isEs
    ? ["L", "M", "X", "J", "V", "S", "D"]
    : ["M", "T", "W", "T", "F", "S", "S"];

  const shift = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF7F2] text-espresso/70"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-base font-bold capitalize text-espresso">
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={() => shift(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF7F2] text-espresso/70"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {weekdays.map((w, i) => (
          <span key={i} className="pb-1 text-[11px] font-bold text-espresso/45">
            {w}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={i} />;
          const key = `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const mark = marks[key];
          const isSel = key === selected;
          const isToday = key === todayKey();
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(key)}
              className={`mx-auto flex h-10 w-10 flex-col items-center justify-center rounded-full text-sm font-semibold transition ${isSel
                ? "bg-[#D85678] text-white shadow-md"
                : isToday
                  ? "bg-[#FCECEE] text-[#C94A6A]"
                  : "text-espresso hover:bg-[#FAF7F2]"
                }`}
            >
              <span className="leading-none">{day}</span>
              <span className="mt-0.5 flex h-1.5 gap-0.5">
                {mark?.med ? (
                  <span className={`h-1.5 w-1.5 rounded-full ${isSel ? "bg-white" : "bg-[#239BA2]"}`} />
                ) : null}
                {mark?.ses ? (
                  <span className={`h-1.5 w-1.5 rounded-full ${isSel ? "bg-white/80" : "bg-[#F49678]"}`} />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-4 text-[11px] font-semibold text-espresso/60">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#239BA2]" />
          {isEs ? "Cita médica" : "Medical visit"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#F49678]" />
          {isEs ? "Sesión con sanador" : "Healer session"}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel principal                                                    */
/* ------------------------------------------------------------------ */

const REFRESH_BRIEFING_ON = new Set([
  "add_medication",
  "delete_medication",
  "add_medical_appointment",
  "delete_medical_appointment",
  "book_healer_session",
  "add_bitacora",
]);

function PacienteDashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, setLocale } = useLanguage();
  const isEs = locale === "es";
  const t = (es: string, en: string) => (isEs ? es : en);

  const rawTab = searchParams.get("tab") || "inicio";
  const activeTab = rawTab === "practicas" ? "recursos" : rawTab;

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [diary, setDiary] = useState<Record<string, any>>({});

  const [sheet, setSheet] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docUploading, setDocUploading] = useState(false);
  const [docError, setDocError] = useState("");
  const [playerItem, setPlayerItem] = useState<any>(null);
  const [lockedItem, setLockedItem] = useState<any>(null);

  const [resourceFilter, setResourceFilter] = useState("todos");
  const [saludView, setSaludView] = useState<"linea" | "medicinas" | "medicos" | "ficha" | "documentos">("linea");
  const [timelineFilter, setTimelineFilter] = useState("todo");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [selectedDay, setSelectedDay] = useState(todayKey());

  // IA
  const [briefing, setBriefing] = useState<any>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [reco, setReco] = useState<any>(null);
  const [consult, setConsult] = useState<any>(null);
  const [organizing, setOrganizing] = useState(false);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageSeqRef = useRef(0);

  const fv = (k: string, d = "") => form[k] ?? d;
  const fs =
    (k: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((p) => ({ ...p, [k]: e.target.value }));
  const openSheet = (name: string, initial: Record<string, string> = {}) => {
    setForm(initial);
    setDocFile(null);
    setDocError("");
    setSheet(name);
  };

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), 2600);
  };

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/paciente/dashboard");
      const json = await res.json();
      if (json.ok) {
        setData(json);
        setDiary(json.ficha.bienestar_diario || {});
      }
    } catch (err) {
      console.error("Error cargando panel de la paciente:", err);
    } finally {
      setLoading(false);
    }
  };

  /** Llamada a PONO IA (POST). */
  const callAI = async (action: string, payload: Record<string, any> = {}) => {
    try {
      const res = await fetch("/api/paciente/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          payload: { locale, today: todayKey(), ...payload },
        }),
      });
      const json = await res.json();
      if (json.ok) return json;
      showToast(json.error || t("PONO IA no pudo responder", "PONO AI could not respond"));
    } catch (err) {
      console.error("Error PONO IA:", err);
    }
    return null;
  };

  const fetchBriefing = async (lastMood?: string | null) => {
    setBriefingLoading(true);
    const log = diary[todayKey()] || {};
    const res = await callAI("ai_briefing", { lastMood: lastMood ?? log.mood ?? null });
    if (res) setBriefing(res);
    setBriefingLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!loading && data) fetchBriefing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, locale]);

  const runAction = async (
    action: string,
    payload: Record<string, any> = {}, message: string = "",
    options: { refetch?: boolean } = { refetch: true }
  ) => {
    const isStageUpdate = action === "update_stage" && Boolean(payload.etapa_actual);
    const prevStage = data?.ficha?.etapa_actual;
    const stageSeq = isStageUpdate ? ++stageSeqRef.current : 0;

    if (isStageUpdate) {
      setData((prev: any) =>
        prev
          ? { ...prev, ficha: { ...prev.ficha, etapa_actual: payload.etapa_actual } }
          : prev
      );
      if (message) showToast(message);
    }

    try {
      const res = await fetch("/api/paciente/dashboard", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      const json = await res.json();
      if (json.ok) {
        if (!isStageUpdate && message) showToast(message);
        if (isStageUpdate) {
          // No hacemos fetchDashboard() aquí para evitar que una respuesta anterior devuelva la etapa visualmente
        } else if (
          (action === "add_document" || action === "delete_document") &&
          Array.isArray(json.items)
        ) {
          setData((prev: any) =>
            prev
              ? { ...prev, ficha: { ...prev.ficha, documentos_oncologo: json.items } }
              : prev
          );
        } else if (options.refetch !== false) {
          await fetchDashboard();
        }
        if (REFRESH_BRIEFING_ON.has(action) && (!isStageUpdate || stageSeq === stageSeqRef.current)) {
          void fetchBriefing();
        }
        return true;
      }
      if (isStageUpdate && prevStage && stageSeq === stageSeqRef.current) {
        setData((prev: any) =>
          prev ? { ...prev, ficha: { ...prev.ficha, etapa_actual: prevStage } } : prev
        );
      }
      showToast(json.error || t("No se pudo guardar", "Could not save"));
    } catch (err) {
      if (isStageUpdate && prevStage && stageSeq === stageSeqRef.current) {
        setData((prev: any) =>
          prev ? { ...prev, ficha: { ...prev.ficha, etapa_actual: prevStage } } : prev
        );
      }
      console.error("Error ejecutando acción:", err);
    }
    return false;
  };

  /** Actualiza el check-in del día de forma instantánea (optimista). */
  const updateDaily = (patch: { mood?: string; water?: number; habits?: Record<string, boolean> }) => {
    const key = todayKey();
    setDiary((prev) => {
      const cur = prev[key] || {};
      return {
        ...prev,
        [key]: {
          ...cur,
          ...(patch.mood !== undefined ? { mood: patch.mood } : {}),
          ...(patch.water !== undefined ? { water: patch.water } : {}),
          ...(patch.habits ? { habits: { ...(cur.habits || {}), ...patch.habits } } : {}),
        },
      };
    });
    runAction("update_daily", { date: key, ...patch }, "", { refetch: false });
  };

  /** Elige un ánimo y pide a PONO IA recursos acordes. */
  const chooseMood = async (moodId: string, note = "") => {
    if (!note) updateDaily({ mood: moodId });
    setReco({ mood: moodId, loading: true, message: "", picks: [] });
    const res = await callAI("ai_recommend", { mood: moodId, note });
    setReco(res ? { mood: moodId, loading: false, message: res.message, picks: res.picks } : { mood: moodId, loading: false, message: "", picks: [] });
  };

  const openConsult = (audience: "medico" | "sanador") => {
    setConsult({ audience });
    setSheet("consult");
  };

  const organizeWithAI = async () => {
    const text = fv("relato").trim();
    if (text.length < 3) {
      showToast(t("Cuéntame primero qué pasó", "Tell me first what happened"));
      return;
    }
    setOrganizing(true);
    const res = await callAI("ai_structure", { text });
    if (res?.entry) {
      const e = res.entry;
      setForm((p) => ({
        ...p,
        tipo: e.tipo,
        titulo: e.titulo,
        fecha: e.fecha,
        medico: e.medico || "",
        lugar: e.lugar || "",
        detalle: e.detalle,
        etiquetas: (e.etiquetas || []).join(", "),
        origen: "ia",
      }));
      showToast(t("PONO IA organizó tu bitácora ✨", "PONO AI organized your journal ✨"));
    }
    setOrganizing(false);
  };

  const toggleVoice = () => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      showToast(t("Tu navegador no permite dictado; escribe tu relato.", "Your browser doesn't support dictation; type your story."));
      return;
    }
    const rec = new SR();
    rec.lang = isEs ? "es-ES" : "en-US";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onstart = () => setRecording(true);
    rec.onresult = (ev: any) => {
      let txt = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        if (ev.results[i].isFinal) txt += `${ev.results[i][0].transcript} `;
      }
      if (txt.trim()) setForm((p) => ({ ...p, detalle: p.detalle ? `${p.detalle} ${txt.trim()}` : txt.trim() }));
    };
    rec.onerror = () => setRecording(false);
    rec.onend = () => setRecording(false);
    recognitionRef.current = rec;
    rec.start();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/auth/login");
      router.refresh();
    }
  };

  const goToTab = (tabId: string) => {
    router.push(tabId === "inicio" ? "/paciente" : `/paciente?tab=${tabId}`, { scroll: false });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openResource = (item: any, canOpen: boolean) => {
    if (!canOpen) {
      setLockedItem(item);
      setSheet("premium");
      return;
    }
    setPlayerItem(item);
    setSheet("player");
  };

  /* ----------------------- Derivados ----------------------- */

  const ficha = data?.ficha;
  const user = data?.user;
  const caregiver = data?.caregiver;
  const isPremium = user?.nivel_suscripcion === "pagada";

  const todayLog = diary[todayKey()] || {};
  const todayHabits: Record<string, boolean> = todayLog.habits || {};
  const water: number = todayLog.water || 0;
  const currentMood = MOODS.find((m) => m.id === todayLog.mood) || null;

  const medReminders = useMemo(() => {
    if (!ficha) return [];
    return (ficha.medicamentos_y_horarios || []).map((m: any, i: number) => ({
      key: `med-${m.id ?? i}`,
      label: m.nombre,
      sub: `${m.dosis || ""}${m.horario ? ` · ${m.horario}` : ""}`,
    }));
  }, [ficha]);

  const medsDone = medReminders.filter((m: any) => todayHabits[m.key]).length;
  const medsPct = medReminders.length ? Math.round((medsDone / medReminders.length) * 100) : 0;

  const dayHasActivity = (key: string) => {
    const l = diary[key];
    if (!l) return false;
    return Boolean(l.mood) || (l.water || 0) > 0 || Object.values(l.habits || {}).some(Boolean);
  };

  const streak = useMemo(() => {
    let n = 0;
    let offset = dayHasActivity(dayKeyOffset(0)) ? 0 : -1;
    while (dayHasActivity(dayKeyOffset(offset)) && n < 365) {
      n++;
      offset--;
    }
    return n;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diary]);

  const resources: any[] = data?.resources || [];
  const canOpenItem = (r: any) => r.es_gratuito !== false || isPremium;

  /** Línea de tiempo = bitácora guardada + sesiones completadas con sanadores. */
  const timeline = useMemo(() => {
    if (!ficha || !data) return [];
    const fromSessions = (data.healerSessions || [])
      .filter((s: any) => s.estado_cita === "completada" && (s.estado_observado_paciente || s.recomendaciones_dadas))
      .map((s: any) => ({
        id: `ses-${s.id}`,
        fecha: String(s.fecha_sesion).slice(0, 10),
        tipo: "sanador",
        titulo: s.enlace_o_lugar,
        detalle: [s.estado_observado_paciente, s.recomendaciones_dadas].filter(Boolean).join(" · "),
        medico: "",
        lugar: "",
        etiquetas: [],
        origen: "auto",
        readonly: true,
        creado_en: String(s.fecha_sesion),
      }));
    return [...(ficha.bitacora_clinica || []), ...fromSessions].sort(
      (a: any, b: any) =>
        String(b.fecha).localeCompare(String(a.fecha)) ||
        String(b.creado_en || "").localeCompare(String(a.creado_en || ""))
    );
  }, [ficha, data]);

  const doctors = useMemo(() => {
    if (!ficha) return [];
    const map = new Map<string, { name: string; count: number; last: string; rol: string; telefono: string }>();
    timeline.forEach((e: any) => {
      const n = String(e.medico || "").trim();
      if (!n) return;
      const k = n.toLowerCase();
      const cur = map.get(k) || { name: n, count: 0, last: "", rol: "", telefono: "" };
      cur.count++;
      if (String(e.fecha) > cur.last) cur.last = String(e.fecha);
      map.set(k, cur);
    });
    (ficha.contactos_personales || []).forEach((c: any) => {
      if (!/(onc|\bdr|dra\b|doctor|médic|medic|cirujan|clínic|clinic|nutri)/i.test(`${c.rol} ${c.nombre}`)) return;
      const k = String(c.nombre).trim().toLowerCase();
      const cur = map.get(k) || { name: String(c.nombre), count: 0, last: "", rol: "", telefono: "" };
      cur.rol = c.rol;
      cur.telefono = c.telefono;
      map.set(k, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.last.localeCompare(a.last));
  }, [ficha, timeline]);

  const visibleTimeline = timeline.filter((e: any) => {
    if (timelineFilter !== "todo" && e.tipo !== timelineFilter) return false;
    if (doctorFilter && String(e.medico || "").toLowerCase() !== doctorFilter.toLowerCase()) return false;
    return true;
  });

  const { marks, eventsByDay, upcoming } = useMemo(() => {
    const marks: Record<string, { med: number; ses: number }> = {};
    const eventsByDay: Record<string, any[]> = {};
    if (!ficha || !data) return { marks, eventsByDay, upcoming: [] as any[] };
    const push = (key: string, ev: any, kind: "med" | "ses") => {
      marks[key] = marks[key] || { med: 0, ses: 0 };
      marks[key][kind]++;
      (eventsByDay[key] = eventsByDay[key] || []).push(ev);
    };
    (ficha.citas_medicas || []).forEach((c: any, idx: number) =>
      push(
        String(c.fecha).slice(0, 10),
        {
          kind: "med",
          idx,
          title: c.titulo,
          sub: `${c.hora || ""}${c.hora && c.lugar ? " · " : ""}${c.lugar || ""}`.trim(),
          hora: c.hora || "",
          lugar: c.lugar || "",
          medico: c.medico || "",
          notas: c.notas || "",
          date: String(c.fecha).slice(0, 10),
        },
        "med"
      )
    );
    (data.healerSessions || [])
      .filter((s: any) => s.estado_cita !== "cancelada")
      .forEach((s: any) => {
        const rawTime = String(s.fecha_sesion || "");
        const timePart = rawTime.includes("T") ? rawTime.slice(11, 16) : "";
        push(
          rawTime.slice(0, 10),
          {
            kind: "ses",
            sessionId: s.id,
            sample: Boolean(s.sample),
            title: s.enlace_o_lugar,
            sub: `${s.modalidad === "presencial" ? (isEs ? "Presencial Honolulu" : "In-person Honolulu") : "Zoom en vivo"}${timePart ? ` · ${timePart}` : ""}`,
            modalidad: s.modalidad || "online",
            estado: s.estado_cita || "programada",
            gratis: Boolean(s.es_sesion_gratuita_mensual),
            zoomUrl: s.zoom_url || "https://zoom.us/j/lovehealseffect-circle",
            date: rawTime.slice(0, 10),
          },
          "ses"
        );
      });
    const today = todayKey();
    const upcoming = Object.entries(eventsByDay)
      .filter(([k]) => k >= today)
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([, evs]) => evs);
    return { marks, eventsByDay, upcoming };
  }, [ficha, data]);

  const fmtDate = (d: string) =>
    new Date(`${String(d).slice(0, 10)}T12:00:00`).toLocaleDateString(isEs ? "es-ES" : "en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  if (loading || !data || !ficha) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF8F4] px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-[#F48EA6] to-[#B03052] text-2xl text-white shadow-lg">
            🌺
          </div>
          <p className="text-lg font-bold text-espresso">
            {t("Preparando tu espacio…", "Preparing your space…")}
          </p>
        </div>
      </div>
    );
  }

  const firstName = String(user.nombre || "").split(" ")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t("Buenos días", "Good morning") : hour < 19 ? t("Buenas tardes", "Good afternoon") : t("Buenas noches", "Good evening");
  const stage = STAGES.find((s) => s.id === ficha.etapa_actual) || STAGES[0];

  const filteredResources = resources.filter((r) => {
    if (resourceFilter === "todos") return true;
    if (resourceFilter === "gratis") return r.es_gratuito !== false;
    if (resourceFilter === "premium") return r.es_gratuito === false;
    return r.tipo_contenido === resourceFilter;
  });

  const healers: any[] = data.healers || [];
  const recoItems = (reco?.picks || [])
    .map((p: any) => ({ ...p, item: resources.find((r) => r.id === p.id) }))
    .filter((p: any) => p.item);

  const otherReminders = (briefing?.reminders || []).filter((r: any) => r.kind !== "med");
  const reminderIcon: Record<string, React.ComponentType<{ className?: string }>> = {
    cita: Stethoscope,
    sesion: CalendarHeart,
    practica: Wind,
    bitacora: BookOpen,
  };

  const onReminderClick = (r: any) => {
    if (r.kind === "practica") {
      const item = resources.find((x) => x.id === r.resourceId);
      if (item) openResource(item, canOpenItem(item));
    } else if (r.kind === "cita" || r.kind === "sesion") goToTab("alertas");
    else if (r.kind === "bitacora") openSheet("bitacora", { tipo: "nota", fecha: todayKey() });
  };

  /* ----------------------- Render ----------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF1EA] via-[#FBF6FF] to-[#EAF6F4] pb-44">
      <Toast message={toast} />

      <div className="mx-auto w-full max-w-md md:max-w-4xl lg:max-w-6xl xl:max-w-7xl px-4 sm:px-6 lg:px-8 transition-all">
        {/* ENCABEZADO */}
        <header className="flex items-center justify-between pt-7">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => goToTab("perfil")}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#F48EA6] to-[#B03052] text-lg font-bold text-white shadow-md"
              aria-label={t("Mi perfil", "My profile")}
            >
              {firstName.charAt(0)}
            </button>
            <div>
              <p className="text-xs font-medium text-espresso/55">{greeting}</p>
              <h1 className="text-2xl font-semibold tracking-[-0.025em] leading-tight text-espresso">
                Aloha, {firstName} 🌺
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-full bg-white p-0.5 text-[10px] font-bold shadow-sm">
              {(["en", "es"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l)}
                  className={`rounded-full px-2.5 py-1.5 transition ${locale === l ? "bg-espresso text-white" : "text-espresso/55"}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => goToTab("alertas")}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-espresso/70 shadow-sm"
              aria-label={t("Recordatorios", "Reminders")}
            >
              <Bell className="h-4 w-4" />
              {upcoming.length > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#D85678] ring-2 ring-white" />}
            </button>
          </div>
        </header>

        {/* ===================== RESUMEN (INICIO) ===================== */}
        {activeTab === "inicio" && (
          <InicioSection
            briefing={briefing}
            briefingLoading={briefingLoading}
            medReminders={medReminders}
            medsDone={medsDone}
            medsPct={medsPct}
            todayHabits={todayHabits}
            updateDaily={updateDaily}
            otherReminders={otherReminders}
            reminderIcon={reminderIcon}
            onReminderClick={onReminderClick}
            currentMood={currentMood}
            chooseMood={chooseMood}
            reco={reco}
            recoItems={recoItems}
            canOpenItem={canOpenItem}
            openResource={openResource}
            fv={fv}
            fs={fs}
            setForm={setForm}
            stage={stage}
            timeline={timeline}
            upcoming={upcoming}
            caregiver={caregiver}
            water={water}
            streak={streak}
            ficha={ficha}
            openSheet={openSheet}
            openConsult={openConsult}
            goToTab={goToTab}
            fmtDate={fmtDate}
            t={t}
            isEs={isEs}
          />
        )}

        {/* ===================== RECURSOS ===================== */}
        {(activeTab === "recursos" || activeTab === "practicas") && (
          <RecursosSection
            resources={resources}
            healers={healers}
            resourceFilter={resourceFilter}
            setResourceFilter={setResourceFilter}
            isPremium={isPremium}
            openSheet={openSheet}
            canOpenItem={canOpenItem}
            openResource={openResource}
            runAction={runAction}
            fmtDate={fmtDate}
            t={t}
            isEs={isEs}
          />
        )}

        {/* ===================== MI CAMINO ===================== */}
        {activeTab === "salud" && (
          <MiCaminoSection
            ficha={ficha}
            saludView={saludView}
            setSaludView={setSaludView}
            timelineFilter={timelineFilter}
            setTimelineFilter={setTimelineFilter}
            doctorFilter={doctorFilter}
            setDoctorFilter={setDoctorFilter}
            visibleTimeline={visibleTimeline}
            doctors={doctors}
            todayHabits={todayHabits}
            updateDaily={updateDaily}
            openSheet={openSheet}
            openConsult={openConsult}
            runAction={runAction}
            fmtDate={fmtDate}
            t={t}
            isEs={isEs}
          />
        )}

        {/* ===================== RECORDATORIOS ===================== */}
        {activeTab === "alertas" && (
          <RecordatoriosSection
            t={t}
            isEs={isEs}
            ficha={ficha}
            caregiver={caregiver}
            medReminders={medReminders}
            medsDone={medsDone}
            medsPct={medsPct}
            water={water}
            otherReminders={otherReminders}
            todayHabits={todayHabits}
            updateDaily={updateDaily}
            onReminderClick={onReminderClick}
            reminderIcon={reminderIcon}
            marks={marks}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            eventsByDay={eventsByDay}
            upcoming={upcoming}
            healerSessions={data.healerSessions || []}
            fmtDate={fmtDate}
            runAction={runAction}
            openSheet={openSheet}
            goToTab={goToTab}
            healers={healers}
          />
        )}

        {/* ===================== PERFIL ===================== */}
        {activeTab === "perfil" && (
          <PerfilSection
            t={t}
            isEs={isEs}
            locale={locale}
            setLocale={setLocale}
            user={user}
            firstName={firstName}
            stage={stage}
            ficha={ficha}
            isPremium={isPremium}
            streak={streak}
            timeline={timeline}
            upcoming={upcoming}
            caregiver={caregiver}
            openSheet={openSheet}
            data={data}
            handleLogout={handleLogout}
          />
        )}
      </div>

      {/* ===================== HOJAS ===================== */}

      <Sheet
        open={sheet === "player"}
        onClose={() => {
          setSheet(null);
          setPlayerItem(null);
        }}
        maxWidth="max-w-4xl lg:overflow-visible"
      >
        {playerItem && (
          <PracticePlayer
            key={playerItem.id}
            item={playerItem}
            isEs={isEs}
            healers={healers}
            onViewHealer={(name) => {
              setSheet(null);
              setPlayerItem(null);
              setResourceFilter(`healer:${name}`);
              goToTab("recursos");
            }}
            onBookHealer={(healerId) => {
              setPlayerItem(null);
              openSheet("book", healerId ? { healer: String(healerId) } : {});
            }}
          />
        )}
      </Sheet>

      {/* Contenido premium bloqueado */}
      <Sheet open={sheet === "premium" && !!lockedItem} onClose={() => setSheet(null)} title={t("Contenido Premium", "Premium content")}>
        {lockedItem && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF1B8] text-[#B98A00]"><Crown className="h-9 w-9" /></div>
            <h4 className="text-lg font-bold text-espresso">{isEs ? lockedItem.titulo_es : lockedItem.titulo_en || lockedItem.titulo_es}</h4>
            <p className="text-sm leading-relaxed text-espresso/70">{isEs ? lockedItem.descripcion_es : lockedItem.descripcion_en || lockedItem.descripcion_es}</p>
            <p className="rounded-2xl bg-[#FAF7F2] p-3 text-xs text-espresso/70">{t("Incluido en la membresía familiar de $10 USD/mes (paciente + cuidador).", "Included in the $10 USD/month family membership (patient + caregiver).")}</p>
            <PrimaryButton onClick={async () => { const ok = await runAction("create_ticket", { tipo: "soporte", asunto: "Activar membresía premium", descripcion: `Quiero acceder a: ${lockedItem.titulo_es}` }, t("¡Listo! El equipo te contactará para activar tu membresía.", "Done! The team will contact you to activate your membership.")); if (ok) setSheet(null); }}>
              <Crown className="h-4 w-4" />
              {t("Quiero activar mi membresía", "I want to activate my membership")}
            </PrimaryButton>
          </div>
        )}
      </Sheet>

      <Sheet open={sheet === "membership"} onClose={() => setSheet(null)} title={t("Membresía", "Membership")}>
        <div className="space-y-4">
          <div className={`rounded-3xl p-5 ${isPremium ? "bg-[#FFF1B8]" : "bg-[#FAF7F2]"}`}>
            <p className="flex items-center gap-2 text-sm font-bold text-espresso">{isPremium && <Crown className="h-4 w-4 text-[#B98A00]" />}{isPremium ? t("Tienes Premium ✨", "You have Premium ✨") : t("Estás en el plan gratuito", "You're on the free plan")}</p>
            <ul className="mt-3 space-y-1.5 text-xs text-espresso/75">
              <li>✓ {t("Recursos gratuitos, Love Circles y tu sesión mensual de coaching", "Free resources, Love Circles and your monthly coaching session")}</li>
              <li>{isPremium ? "✓" : "★"} {t("Meditaciones y series avanzadas, seminarios con invitados", "Advanced meditations and series, seminars with guests")}</li>
              <li>{isPremium ? "✓" : "★"} {t("Paciente + cuidador por $10 USD/mes", "Patient + caregiver for $10 USD/month")}</li>
            </ul>
          </div>
          {!isPremium && (
            <PrimaryButton onClick={async () => { const ok = await runAction("create_ticket", { tipo: "soporte", asunto: "Activar membresía premium", descripcion: "Quiero activar la membresía familiar de $10 USD/mes." }, t("¡Listo! El equipo te contactará.", "Done! The team will contact you.")); if (ok) setSheet(null); }}>
              <Crown className="h-4 w-4" />
              {t("Quiero activar mi membresía", "I want to activate my membership")}
            </PrimaryButton>
          )}
        </div>
      </Sheet>

      {/* ===================== MODAL DE INSCRIPCIÓN GRATUITA A LOVE CIRCLES ===================== */}
      <Sheet
        open={sheet === "circle_rsvp"}
        onClose={() => setSheet(null)}
        title={t("Inscripción Gratuita · Love Circles", "Free RSVP · Love Circles")}
      >
        <div className="space-y-4">
          <div className="rounded-3xl bg-gradient-to-br from-[#CFEDE8] via-[#E8F6F3] to-[#FDE3E8] p-4 text-espresso">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#239BA2] text-white">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#239BA2]">
                  {t("Support · 100% Gratuito en Vivo", "Support · 100% Free Live")}
                </p>
                <h4 className="text-base font-bold">
                  {t("Love Circle for Patients · Kelsie & Omar", "Love Circle for Patients · Kelsie & Omar")}
                </h4>
              </div>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-espresso/75">
              {t(
                "Un espacio seguro en Honolulu para conocernos, respirar juntas y recibir contención comunitaria sin costo. Modalidad virtual por Zoom.",
                "A safe space in Honolulu to meet us, breathe together, and receive community support at no cost. Online via Zoom."
              )}
            </p>
          </div>

          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const dateSelected = fv("fecha_circle") || "2026-11-29T18:00:00-10:00";
              const ok = await runAction(
                "book_healer_session",
                {
                  modalidad: "online",
                  fecha_sesion: dateSelected,
                  es_sesion_gratuita_mensual: true,
                  enlace_o_lugar: "https://zoom.us/j/lovehealseffect-circle (Healing Circle con Kelsie & Omar)",
                  asistente: fv("nombre", user?.nombre || "Erika"),
                  correo: fv("correo", user?.correo || ""),
                  rol_asistente: fv("rol_asistente", "paciente"),
                  mensaje: fv("mensaje_circle", ""),
                },
                t("¡Inscripción confirmada! Te esperamos con amor en Zoom.", "RSVP confirmed! We look forward to seeing you on Zoom.")
              );
              if (ok) {
                setSheet("circle_success");
              }
            }}
          >
            <Field label={t("Elige tu fecha de asistencia", "Choose your attendance date")}>
              <select
                className={inputCls}
                value={fv("fecha_circle", "2026-11-29T18:00:00-10:00")}
                onChange={fs("fecha_circle")}
              >
                <option value="2026-11-29T18:00:00-10:00">
                  {t("Sábado 29 Noviembre · 6:00 PM HST (Respirando Paz y Soltando Tensión)", "Sat Nov 29 · 6:00 PM HST (Breathing Peace & Releasing Tension)")}
                </option>
                <option value="2026-12-06T18:00:00-10:00">
                  {t("Sábado 6 Diciembre · 6:00 PM HST (Pacientes y Cuidadores: Sistema Nervioso)", "Sat Dec 6 · 6:00 PM HST (Patients & Caregivers: Nervous System)")}
                </option>
                <option value="2026-12-13T18:00:00-10:00">
                  {t("Sábado 13 Diciembre · 6:00 PM HST (Tapping EFT y Cuencos de Cuarzo)", "Sat Dec 13 · 6:00 PM HST (EFT Tapping & Quartz Bowls)")}
                </option>
                <option value="2026-12-20T18:00:00-10:00">
                  {t("Sábado 20 Diciembre · 6:00 PM HST (Cierre de Ciclo, Esperanza y Gratitud)", "Sat Dec 20 · 6:00 PM HST (Closing Cycle, Hope & Gratitude)")}
                </option>
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t("Tu Nombre", "Your Name")}>
                <input
                  required
                  className={inputCls}
                  value={fv("nombre", user?.nombre || "")}
                  onChange={fs("nombre")}
                  placeholder="Tu nombre"
                />
              </Field>
              <Field label={t("Tu Correo", "Your Email")}>
                <input
                  required
                  type="email"
                  className={inputCls}
                  value={fv("correo", user?.correo || "")}
                  onChange={fs("correo")}
                  placeholder="tu@correo.com"
                />
              </Field>
            </div>

            <Field label={t("¿Quién asiste a la sesión?", "Who is attending?")}>
              <select
                className={inputCls}
                value={fv("rol_asistente", "paciente")}
                onChange={fs("rol_asistente")}
              >
                <option value="paciente">{t("Asisto como paciente / sobreviviente", "Attending as patient / survivor")}</option>
                <option value="cuidador">{t("Asisto como cuidador / acompañante", "Attending as caregiver / companion")}</option>
                <option value="duo">{t("Asistiremos paciente y cuidador juntos", "Patient and caregiver attending together")}</option>
              </select>
            </Field>

            <Field label={t("¿Hay algo que quieras que sepamos antes de empezar? (Opcional)", "Anything you'd like us to know before we begin? (Optional)")}>
              <textarea
                className={`${inputCls} h-20 resize-none py-2`}
                placeholder={t("Ej. Es mi primera vez, estoy en semana post-quimio, o simplemente quiero escuchar...", "E.g. It's my first time, recovering from chemo, or just want to listen...")}
                value={fv("mensaje_circle")}
                onChange={fs("mensaje_circle")}
              />
            </Field>

            <div className="rounded-2xl bg-[#FFF6D6] p-3 text-xs text-espresso/80">
              <p className="flex items-center gap-1.5 font-bold text-[#8A6A00]">
                <span>🌿</span>
                {t("Evento 100% Libre de Costo · Sin Compromiso", "100% Free Event · No Strings Attached")}
              </p>
              <p className="mt-1 leading-relaxed">
                {t(
                  "En Love Heals Effect creemos que ninguna mujer ni familia debe transitar el cáncer a solas. Todos nuestros círculos comunitarios son gratuitos.",
                  "At Love Heals Effect we believe no woman or family should walk through cancer alone. All our community circles are free."
                )}
              </p>
            </div>

            <PrimaryButton type="submit">
              {t("Confirmar mi inscripción gratuita", "Confirm my free RSVP")}
            </PrimaryButton>
          </form>
        </div>
      </Sheet>

      {/* ===================== CONFIRMACIÓN EXITOSA DE INSCRIPCIÓN ===================== */}
      <Sheet
        open={sheet === "circle_success"}
        onClose={() => setSheet(null)}
        title={t("¡Lugar Reservado!", "Spot Reserved!")}
      >
        <div className="space-y-4 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D7F3EA] text-3xl">
            🌸
          </span>
          <h4 className="text-xl font-semibold tracking-[-0.025em] text-espresso">
            {t("¡Nos alegra profundamente recibirte!", "We are deeply grateful to welcome you!")}
          </h4>
          <p className="text-sm leading-relaxed text-espresso/75">
            {t(
              "Tu lugar gratuito está confirmado para el Círculo de Sanación por Zoom. Te enviamos la confirmación con recordatorio a tu correo.",
              "Your free spot is confirmed for the Healing Circle on Zoom. A confirmation with reminder has been sent to your email."
            )}
          </p>

          <div className="rounded-2xl border border-espresso/10 bg-[#FAF7F2] p-4 text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-[#239BA2]">
              {t("Enlace directo de acceso", "Direct Zoom Link")}
            </p>
            <p className="mt-1 text-xs font-bold text-espresso select-all break-all">
              https://zoom.us/j/lovehealseffect-circle
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText("https://zoom.us/j/lovehealseffect-circle");
                  showToast(t("Enlace de Zoom copiado", "Zoom link copied"));
                }}
                className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-espresso shadow-sm"
              >
                <Copy className="h-3.5 w-3.5" />
                {t("Copiar enlace", "Copy link")}
              </button>
              <a
                href="https://zoom.us/j/lovehealseffect-circle"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-[#239BA2] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {t("Entrar a Zoom", "Open Zoom")}
              </a>
            </div>
          </div>

          <PrimaryButton onClick={() => setSheet(null)}>
            {t("Entendido, ¡muchas gracias!", "Got it, thank you!")}
          </PrimaryButton>
        </div>
      </Sheet>

      {/* ===================== CONOCER A KELSIE & OMAR ===================== */}
      <Sheet
        open={sheet === "meet_founders"}
        onClose={() => setSheet(null)}
        title={t("Conoce a Kelsie & Omar", "Meet Kelsie & Omar")}
      >
        <div className="space-y-5">
          <div className="rounded-3xl bg-gradient-to-br from-[#FFF5DA] via-[#FFEADB] to-[#FDE3E8] p-5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#B03052]">
              {t("Nuestra Misión en Honolulu", "Our Mission in Honolulu")}
            </span>
            <h3 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-espresso">
              Filling “The Gap”
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-espresso/80">
              {t(
                "Love Heals Effect nació de una necesidad profunda: cerrar la brecha entre el frío tratamiento oncológico y el bienestar real del ser humano. Ofrecemos educación, círculos de contención comunitaria y prácticas holísticas para que ninguna paciente ni familia camine sola.",
                "Love Heals Effect was born from a deep need: filling the gap between cold cancer treatments and true human well-being. We offer education, community support circles, and holistic practices so no patient or family walks alone."
              )}
            </p>
          </div>

          {/* Kelsie */}
          <div className="rounded-2xl border border-espresso/10 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#E8809A] to-[#C94A6A] text-lg font-bold text-white">
                K
              </span>
              <div>
                <h4 className="text-base font-bold text-espresso">Kelsie Reynolds</h4>
                <p className="text-xs text-[#C94A6A] font-semibold">
                  Co-Founder · Holistic Breast Cancer Coach & BAM Specialist
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-espresso/75">
              {t(
                "Sobreviviente de cáncer de mama en Honolulu, Hawái. Tras su propio diagnóstico y recuperación, Kelsie desarrolló el método Body Awareness Movement (BAM), una práctica suave para descongestionar el sistema linfático, recuperar el rango de movimiento y reconectar con el cuerpo sin dolor.",
                "Breast cancer survivor in Honolulu, Hawaii. Following her diagnosis and recovery, Kelsie developed the Body Awareness Movement (BAM) method, gentle movement to decompress lymph nodes and restore bodily trust."
              )}
            </p>
          </div>

          {/* Omar */}
          <div className="rounded-2xl border border-espresso/10 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#239BA2] to-[#166064] text-lg font-bold text-white">
                O
              </span>
              <div>
                <h4 className="text-base font-bold text-espresso">Omar Melero</h4>
                <p className="text-xs text-[#239BA2] font-semibold">
                  Co-Founder · Integrative Coach & Caregiver Resilience Lead
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-espresso/75">
              {t(
                "Facilitador integrativo en Hawái. Omar lidera los círculos familiares y de cuidadores, enfocándose en la regulación del sistema nervioso, respiración diafragmática y herramientas prácticas para sostener a quien está cuidando sin agotarse en el camino.",
                "Integrative coach in Hawaii. Omar leads family and caregiver circles, focusing on nervous system regulation, diaphragmatic breathwork, and practical resilience tools."
              )}
            </p>
          </div>

          <PrimaryButton onClick={() => setSheet("circle_rsvp")}>
            <Users className="h-4 w-4" />
            {t("Inscribirme gratis a su próximo círculo", "RSVP for free to their next circle")}
          </PrimaryButton>
        </div>
      </Sheet>

      {/* Resumen para la cita (IA) */}
      <ConsultSummarySheet
        open={sheet === "consult"}
        onClose={() => setSheet(null)}
        audience={consult?.audience === "sanador" ? "sanador" : "medico"}
        onChangeAudience={(aud) => setConsult({ audience: aud })}
        patientName={data?.user?.nombre || t("Paciente", "Patient")}
        ficha={ficha}
        timeline={timeline}
        onToast={showToast}
        t={t}
        isEs={isEs}
      />

      {/* Bitácora: crear o editar entrada */}
      <Sheet
        open={sheet === "bitacora"}
        onClose={() => {
          recognitionRef.current?.stop();
          setRecording(false);
          setSheet(null);
        }}
        title={
          fv("id")
            ? t("Editar entrada de bitácora", "Edit journal entry")
            : t("Agregar a mi bitácora", "Add to my journal")
        }
      >
        <form
          className="space-y-3.5"
          onSubmit={async (e) => {
            e.preventDefault();
            const isEditing = Boolean(fv("id"));
            const ok = await runAction(
              isEditing ? "update_bitacora" : "add_bitacora",
              {
                ...(isEditing ? { id: fv("id") } : {}),
                tipo: fv("tipo", "nota"),
                titulo: fv("titulo") || fv("detalle").slice(0, 60) || t("Nota clínica", "Clinical note"),
                detalle: fv("detalle"),
                fecha: fv("fecha", todayKey()),
                medico: fv("medico"),
                lugar: fv("lugar"),
                etiquetas: fv("etiquetas")
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),
              },
              isEditing
                ? t("Entrada actualizada", "Entry updated")
                : t("Guardado en tu bitácora", "Saved to your journal")
            );
            if (ok) setSheet(null);
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("Tipo", "Type")}>
              <BitacoraTypeDropdown
                value={fv("tipo", "nota")}
                onChange={(val) => setForm((p) => ({ ...p, tipo: val }))}
                isEs={isEs}
              />
            </Field>
            <Field label={t("Fecha", "Date")}>
              <input
                type="date"
                className={inputCls}
                value={fv("fecha", todayKey())}
                onChange={fs("fecha")}
              />
            </Field>
          </div>

          <Field label={t("Título", "Title")}>
            <input
              required
              className={inputCls}
              value={fv("titulo")}
              onChange={fs("titulo")}
              placeholder={t("Ej. Control con oncología o síntoma del día", "E.g. Oncology checkup or symptom")}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("Médico / Especialista", "Doctor / Specialist")}>
              <input
                className={inputCls}
                value={fv("medico")}
                onChange={fs("medico")}
                placeholder="Dra. López"
              />
            </Field>
            <Field label={t("Lugar", "Place")}>
              <input
                className={inputCls}
                value={fv("lugar")}
                onChange={fs("lugar")}
                placeholder={t("Clínica o casa", "Clinic or home")}
              />
            </Field>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-bold text-espresso/80">
                {t("Detalle", "Details")}
              </span>
              <button
                type="button"
                onClick={toggleVoice}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition ${
                  recording
                    ? "animate-pulse bg-[#C94A6A] text-white"
                    : "bg-[#E5F2F1] text-[#239BA2] hover:bg-[#d2eae8]"
                }`}
              >
                {recording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                <span>{recording ? t("Detener dictado", "Stop dictation") : t("Dictar por voz", "Voice dictate")}</span>
              </button>
            </div>
            <textarea
              rows={3}
              className={inputCls}
              value={fv("detalle")}
              onChange={fs("detalle")}
              placeholder={t(
                "Describe síntomas, indicaciones del médico o cómo te sentiste…",
                "Describe symptoms, doctor notes, or how you felt…"
              )}
            />
          </div>

          <Field label={t("Etiquetas (separadas por coma)", "Tags (comma separated)")}>
            <input
              className={inputCls}
              value={fv("etiquetas")}
              onChange={fs("etiquetas")}
              placeholder="náuseas, tamoxifeno, descanso"
            />
          </Field>

          <PrimaryButton type="submit">
            {fv("id")
              ? t("Guardar cambios", "Save changes")
              : t("Guardar en mi bitácora", "Save to my journal")}
          </PrimaryButton>
        </form>
      </Sheet>

      <Sheet open={sheet === "add-med"} onClose={() => setSheet(null)} title={t("Agregar", "Add")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const isMed = fv("kind", "med") === "med";
            const ok = await runAction(
              isMed ? "add_medication" : "add_supplement",
              { nombre: fv("nombre"), dosis: fv("dosis") || "1 dosis", horario: fv("horario") || "08:00 AM", indicaciones: fv("indicaciones") },
              isMed ? t("Medicina agregada", "Medication added") : t("Suplemento agregado", "Supplement added")
            );
            if (ok) setSheet(null);
          }}
        >
          <div className="grid grid-cols-2 gap-1.5 rounded-full bg-[#FAF7F2] p-1.5">
            {([["med", t("Medicina", "Medication")], ["sup", t("Suplemento", "Supplement")]] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setForm((p) => ({ ...p, kind: id }))} className={`rounded-full py-2 text-xs font-bold ${fv("kind", "med") === id ? "bg-espresso text-white" : "text-espresso/60"}`}>{label}</button>
            ))}
          </div>
          <Field label={t("Nombre", "Name")}>
            <input required className={inputCls} value={fv("nombre")} onChange={fs("nombre")} placeholder={t("Ej. Tamoxifeno", "E.g. Tamoxifen")} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("Dosis", "Dose")}><input className={inputCls} value={fv("dosis")} onChange={fs("dosis")} placeholder="20 mg" /></Field>
            <Field label={t("Hora", "Time")}><input className={inputCls} value={fv("horario")} onChange={fs("horario")} placeholder="8:00 AM" /></Field>
          </div>
          {fv("kind", "med") === "med" && (
            <Field label={t("Indicaciones (opcional)", "Instructions (optional)")}>
              <input className={inputCls} value={fv("indicaciones")} onChange={fs("indicaciones")} placeholder={t("Tomar con alimentos", "Take with food")} />
            </Field>
          )}
          <PrimaryButton type="submit">{t("Guardar", "Save")}</PrimaryButton>
        </form>
      </Sheet>

      <Sheet open={sheet === "edit-ficha"} onClose={() => setSheet(null)} title={t("Mi ficha de salud", "My health chart")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await runAction("update_medical_info", { historia_medica: fv("historia"), alergias: fv("alergias"), datos_nutricionales: fv("nutricion") }, t("Ficha actualizada", "Chart updated"));
            if (ok) setSheet(null);
          }}
        >
          <Field label={t("Mi historia y cómo me he sentido", "My story and how I've felt")}><textarea rows={4} className={inputCls} value={fv("historia")} onChange={fs("historia")} /></Field>
          <Field label={t("Alergias", "Allergies")}><input className={inputCls} value={fv("alergias")} onChange={fs("alergias")} /></Field>
          <Field label={t("Alimentación e hidratación", "Nutrition & hydration")}><input className={inputCls} value={fv("nutricion")} onChange={fs("nutricion")} /></Field>
          <PrimaryButton type="submit">{t("Guardar cambios", "Save changes")}</PrimaryButton>
        </form>
      </Sheet>

      <Sheet open={sheet === "add-doc"} onClose={() => setSheet(null)} title={t("Subir documento", "Upload document")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setDocError("");
            if (!docFile) {
              setDocError(t("Adjunta un archivo PDF, Word o imagen (máx. 10 MB).", "Please attach a PDF, Word, or image file (max 10 MB)."));
              return;
            }
            setDocUploading(true);
            try {
              const fd = new FormData();
              fd.append("file", docFile);
              const upRes = await fetch("/api/documentos/upload", { method: "POST", body: fd });
              const upData = await upRes.json();
              if (!upRes.ok || !upData.ok) {
                setDocError(upData.error || t("No se pudo subir el archivo.", "Could not upload file."));
                return;
              }
              const ok = await runAction(
                "add_document",
                {
                  titulo: fv("titulo"),
                  tipo: fv("tipo"),
                  notas: fv("notas"),
                  archivoNombre: upData.archivoNombre,
                  archivoStorageName: upData.archivoStorageName,
                  archivoRuta: upData.archivoRuta,
                  mimeType: upData.mimeType,
                  sizeBytes: upData.sizeBytes,
                },
                t("Documento guardado", "Document saved")
              );
              if (ok) {
                setDocFile(null);
                setSheet(null);
              }
            } catch {
              setDocError(t("Error de conexión al subir el archivo.", "Connection error while uploading."));
            } finally {
              setDocUploading(false);
            }
          }}
        >
          <Field label={t("Título", "Title")}><input required className={inputCls} value={fv("titulo")} onChange={fs("titulo")} placeholder={t("Ej. Hemograma pre-quimio", "E.g. Pre-chemo blood count")} /></Field>
          <Field label={t("Tipo", "Type")}>
            <select className={inputCls} value={fv("tipo")} onChange={fs("tipo")}>
              <option value="Receta / Indicaciones del Oncólogo">{t("Receta / indicaciones", "Prescription / notes")}</option>
              <option value="Resultado de Laboratorio">{t("Laboratorio", "Lab result")}</option>
              <option value="Estudio de Imagen / Patología">{t("Imagen / patología", "Imaging / pathology")}</option>
            </select>
          </Field>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-[#D85678]/40 bg-[#FCECEE]/50 px-4 py-5 text-center text-sm font-bold text-[#C94A6A] transition hover:bg-[#FCECEE]">
            <Upload className="h-5 w-5" />
            <span className="max-w-full truncate">
              {docFile ? docFile.name : t("Elegir PDF, Word o foto (máx. 10 MB)", "Choose PDF, Word or photo (max 10 MB)")}
            </span>
            {docFile && (
              <span className="text-[11px] font-medium text-espresso/60">
                {docFile.size >= 1024 * 1024
                  ? `${(docFile.size / (1024 * 1024)).toFixed(1)} MB`
                  : `${Math.max(1, Math.round(docFile.size / 1024))} KB`}
              </span>
            )}
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setDocError("");
                if (file) {
                  setDocFile(file);
                  setForm((p) => ({ ...p, archivo: file.name }));
                }
              }}
            />
          </label>
          {docError && (
            <p className="rounded-xl bg-[#FCECEE] px-3 py-2 text-xs font-semibold text-[#C94A6A]">
              {docError}
            </p>
          )}
          <Field label={t("Lo más importante que dijo el médico", "Key points from the doctor")}><textarea rows={3} className={inputCls} value={fv("notas")} onChange={fs("notas")} /></Field>
          <PrimaryButton type="submit" disabled={docUploading}>
            {docUploading ? t("Subiendo archivo...", "Uploading file...") : t("Guardar documento", "Save document")}
          </PrimaryButton>
        </form>
      </Sheet>

      <Sheet open={sheet === "add-cita"} onClose={() => setSheet(null)} title={t("Nueva cita médica", "New medical visit")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await runAction("add_medical_appointment", { titulo: fv("titulo"), fecha: fv("fecha"), hora: fv("hora"), lugar: fv("lugar") || "Centro Oncológico" }, t("Cita agregada al calendario", "Visit added to calendar"));
            if (ok) setSheet(null);
          }}
        >
          <Field label={t("Motivo", "Reason")}><input required className={inputCls} value={fv("titulo")} onChange={fs("titulo")} placeholder={t("Control con oncología", "Oncology check-up")} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("Fecha", "Date")}><input required type="date" className={inputCls} value={fv("fecha")} onChange={fs("fecha")} /></Field>
            <Field label={t("Hora", "Time")}><input className={inputCls} value={fv("hora")} onChange={fs("hora")} /></Field>
          </div>
          <Field label={t("Lugar", "Place")}><input className={inputCls} value={fv("lugar")} onChange={fs("lugar")} placeholder="Queen's Medical Center" /></Field>
          <PrimaryButton type="submit" color="from-[#4DB6B0] to-[#239BA2]">{t("Agregar cita", "Add visit")}</PrimaryButton>
        </form>
      </Sheet>

      <Sheet open={sheet === "book"} onClose={() => setSheet(null)} title={t("Reservar con un sanador", "Book with a healer")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const h = healers.find((x) => String(x.id) === fv("healer"));
            const name = String(h?.especialidad || "Sanador").split("·")[0].trim();
            const modal = fv("modalidad", "online");
            const ok = await runAction(
              "book_healer_session",
              {
                sanador_usuario_id: h?.sanador_usuario_id || 3,
                modalidad: modal,
                fecha_sesion: new Date(`${fv("fecha")}T10:00:00`).toISOString(),
                es_sesion_gratuita_mensual: fv("gratis") === "1",
                enlace_o_lugar: `${name} (${modal === "online" ? t("Videollamada", "Video call") : t("Presencial", "In person")})`,
              },
              t("¡Sesión reservada!", "Session booked!")
            );
            if (ok) setSheet(null);
          }}
        >
          <div className="space-y-2.5">
            {healers.map((h) => {
              const active = String(h.id) === fv("healer");
              const name = String(h.especialidad).split("·")[0].trim();
              return (
                <button key={h.id} type="button" onClick={() => setForm((p) => ({ ...p, healer: String(h.id) }))} className={`flex w-full items-center gap-3 rounded-3xl border-2 p-3.5 text-left transition ${active ? "border-[#D85678] bg-[#FCECEE]/60" : "border-transparent bg-[#FAF7F2]"}`}>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F49678] to-[#D85678] text-lg font-bold text-white">{name.charAt(0)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-espresso">{name}</span>
                    <span className="block truncate text-xs text-espresso/60">{isEs ? h.short_bio_es : h.short_bio_en || h.short_bio_es}</span>
                  </span>
                  <span className="text-xs font-bold text-[#C94A6A]">${h.tarifa_hora_usd}</span>
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-1.5 rounded-full bg-[#FAF7F2] p-1.5">
            {([["online", "Online"], ["presencial", t("En persona", "In person")]] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setForm((p) => ({ ...p, modalidad: id }))} className={`rounded-full py-2 text-xs font-bold ${fv("modalidad", "online") === id ? "bg-espresso text-white" : "text-espresso/60"}`}>{label}</button>
            ))}
          </div>
          <Field label={t("Fecha", "Date")}><input required type="date" className={inputCls} value={fv("fecha")} onChange={fs("fecha")} /></Field>
          <label className="flex items-center gap-3 rounded-2xl bg-[#E7F2F1] px-4 py-3 text-sm font-semibold text-espresso">
            <input type="checkbox" checked={fv("gratis") === "1"} onChange={(e) => setForm((p) => ({ ...p, gratis: e.target.checked ? "1" : "0" }))} className="h-5 w-5 accent-[#D85678]" />
            {t("Usar mi sesión gratuita del mes", "Use my free session this month")}
          </label>
          <PrimaryButton type="submit">{t("Confirmar reserva", "Confirm booking")}</PrimaryButton>
        </form>
      </Sheet>

      {/* Mis datos */}
      <Sheet open={sheet === "profile"} onClose={() => setSheet(null)} title={t("Mis datos", "My details")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await runAction("update_profile", { nombre: fv("nombre"), telefono: fv("telefono"), idioma: fv("idioma") }, t("Datos actualizados", "Details updated"));
            if (ok) {
              if (fv("idioma") === "es" || fv("idioma") === "en") setLocale(fv("idioma") as "es" | "en");
              setSheet(null);
            }
          }}
        >
          <Field label={t("Nombre", "Name")}><input required className={inputCls} value={fv("nombre")} onChange={fs("nombre")} /></Field>
          <Field label={t("Teléfono", "Phone")}><input className={inputCls} value={fv("telefono")} onChange={fs("telefono")} /></Field>
          <div className="grid grid-cols-2 gap-1.5 rounded-full bg-[#FAF7F2] p-1.5">
            {([["es", "Español"], ["en", "English"]] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setForm((p) => ({ ...p, idioma: id }))} className={`rounded-full py-2 text-xs font-bold ${fv("idioma") === id ? "bg-espresso text-white" : "text-espresso/60"}`}>{label}</button>
            ))}
          </div>
          <p className="text-xs text-espresso/55">{t("Correo", "Email")}: {user.correo}</p>
          <PrimaryButton type="submit">{t("Guardar", "Save")}</PrimaryButton>
        </form>
      </Sheet>

      {/* Cambiar contraseña */}
      <Sheet open={sheet === "password"} onClose={() => setSheet(null)} title={t("Cambiar contraseña", "Change password")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (fv("nueva") !== fv("repetir")) {
              showToast(t("Las contraseñas nuevas no coinciden", "The new passwords don't match"));
              return;
            }
            const ok = await runAction("change_password", { actual: fv("actual"), nueva: fv("nueva") }, t("Contraseña actualizada", "Password updated"));
            if (ok) setSheet(null);
          }}
        >
          <Field label={t("Contraseña actual", "Current password")}><input required type="password" className={inputCls} value={fv("actual")} onChange={fs("actual")} /></Field>
          <Field label={t("Nueva contraseña", "New password")}><input required type="password" className={inputCls} value={fv("nueva")} onChange={fs("nueva")} /></Field>
          <Field label={t("Repite la nueva contraseña", "Repeat new password")}><input required type="password" className={inputCls} value={fv("repetir")} onChange={fs("repetir")} /></Field>
          <p className="text-xs text-espresso/55">{t("Debe incluir al menos una mayúscula y un número.", "It must include at least one capital letter and one number.")}</p>
          <PrimaryButton type="submit"><KeyRound className="h-4 w-4" />{t("Actualizar contraseña", "Update password")}</PrimaryButton>
        </form>
      </Sheet>

      {/* Cuidador: ver, cambiar o invitar */}
      <Sheet open={sheet === "caregiver"} onClose={() => setSheet(null)} title={t("Mi cuidador", "My caregiver")}>
        {caregiver.linked ? (
          <div className="space-y-4">
            <div className="rounded-3xl bg-[#E7F2F1] p-5 text-sm text-espresso">
              <p className="font-bold">✓ {t("Vinculados 1 a 1 con", "Linked 1-to-1 with")} {caregiver.nombre}</p>
              <p className="mt-1 text-xs text-espresso/65">{caregiver.correo} · {caregiver.relacion}</p>
              <p className="mt-3 text-xs text-espresso/65">{t("Comparten tu calendario, medicinas y documentos.", "You share calendar, medications and documents.")}</p>
            </div>
            {fv("confirm") === "1" ? (
              <div className="rounded-3xl bg-[#FCECEE] p-4">
                <p className="text-sm font-bold text-[#9E2A47]">{t("¿Seguro que quieres cambiar de cuidador?", "Are you sure you want to change caregiver?")}</p>
                <p className="mt-1 text-xs text-espresso/70">{t("Se desvinculará a tu cuidador actual; podrás invitar a otra persona enseguida.", "Your current caregiver will be unlinked; you can invite someone else right away.")}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setForm((p) => ({ ...p, confirm: "0" }))} className="rounded-full border border-espresso/15 py-2.5 text-xs font-bold text-espresso/70">{t("Cancelar", "Cancel")}</button>
                  <button type="button" onClick={() => runAction("unlink_caregiver", {}, t("Cuidador desvinculado", "Caregiver unlinked"))} className="rounded-full bg-[#C94A6A] py-2.5 text-xs font-bold text-white">{t("Sí, cambiar", "Yes, change")}</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setForm((p) => ({ ...p, confirm: "1" }))} className="w-full rounded-full border border-[#C94A6A]/40 py-3 text-sm font-bold text-[#C94A6A]">{t("Cambiar de cuidador", "Change caregiver")}</button>
            )}
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await runAction("invite_caregiver", { correo: fv("correo"), nombre: fv("nombre") }, t("Invitación enviada", "Invitation sent"));
              if (ok) setSheet(null);
            }}
          >
            <p className="text-sm text-espresso/70">{t("Tu cuidador tendrá su propio acceso y verá lo mismo que tú.", "Your caregiver gets their own login and sees what you see.")}</p>
            <Field label={t("Nombre", "Name")}><input className={inputCls} value={fv("nombre")} onChange={fs("nombre")} /></Field>
            <Field label={t("Correo", "Email")}><input required type="email" className={inputCls} value={fv("correo")} onChange={fs("correo")} /></Field>
            <PrimaryButton type="submit"><Send className="h-4 w-4" />{t("Enviar invitación", "Send invitation")}</PrimaryButton>
          </form>
        )}
      </Sheet>

      <Sheet open={sheet === "contacts"} onClose={() => setSheet(null)} title={t("Mis contactos y médicos", "My contacts & doctors")}>
        <div className="space-y-2.5">
          {ficha.contactos_personales.map((c: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 rounded-2xl bg-[#FAF7F2] px-4 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D7F3EA] text-[#239BA2]"><Phone className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-espresso">{c.nombre}</p>
                <p className="truncate text-xs text-espresso/60">{c.rol} · {c.telefono}</p>
              </div>
              <button type="button" onClick={() => runAction("delete_contact", { index: idx }, t("Contacto eliminado", "Removed"))} className="text-espresso/35 hover:text-[#C94A6A]" aria-label={t("Eliminar", "Delete")}><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await runAction("add_contact", { nombre: fv("nombre"), rol: fv("rol"), telefono: fv("telefono") }, t("Contacto guardado", "Contact saved"));
            if (ok) setForm({ rol: "Oncólogo / Clínica" });
          }}
        >
          <input required className={inputCls} placeholder={t("Nombre (ej. Dra. Lee)", "Name")} value={fv("nombre")} onChange={fs("nombre")} />
          <div className="grid grid-cols-2 gap-3">
            <input className={inputCls} placeholder={t("Rol (ej. Oncólogo)", "Role")} value={fv("rol")} onChange={fs("rol")} />
            <input className={inputCls} placeholder={t("Teléfono", "Phone")} value={fv("telefono")} onChange={fs("telefono")} />
          </div>
          <PrimaryButton type="submit"><Plus className="h-4 w-4" />{t("Agregar", "Add")}</PrimaryButton>
        </form>
      </Sheet>

      <Sheet open={sheet === "help"} onClose={() => setSheet(null)} title={t("Ayuda y comentarios", "Help & feedback")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await runAction("create_ticket", { tipo: fv("tipo", "feedback"), asunto: fv("asunto"), descripcion: fv("descripcion") }, t("¡Gracias! Lo recibió el equipo.", "Thank you! The team received it."));
            if (ok) setSheet(null);
          }}
        >
          <p className="text-sm text-espresso/70">{t("Cuéntanos qué mejorar o si necesitas ayuda. Llega directo a Omar, Kelsie y Erika.", "Tell us what to improve or if you need help. It goes straight to Omar, Kelsie and Erika.")}</p>
          <div className="grid grid-cols-3 gap-1.5 rounded-full bg-[#FAF7F2] p-1.5">
            {([["feedback", t("Idea", "Idea")], ["soporte", t("Ayuda", "Help")], ["bug", t("Problema", "Problem")]] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setForm((p) => ({ ...p, tipo: id }))} className={`rounded-full py-2 text-xs font-bold ${fv("tipo", "feedback") === id ? "bg-espresso text-white" : "text-espresso/60"}`}>{label}</button>
            ))}
          </div>
          <input required className={inputCls} placeholder={t("Asunto", "Subject")} value={fv("asunto")} onChange={fs("asunto")} />
          <textarea required rows={3} className={inputCls} placeholder={t("Cuéntanos más…", "Tell us more…")} value={fv("descripcion")} onChange={fs("descripcion")} />
          <PrimaryButton type="submit"><Send className="h-4 w-4" />{t("Enviar", "Send")}</PrimaryButton>
        </form>
        {data.tickets.length > 0 && (
          <div className="mt-5 space-y-2">
            {data.tickets.map((tk: any) => (
              <div key={tk.id} className="flex items-center justify-between rounded-2xl bg-[#FAF7F2] px-4 py-2.5 text-xs">
                <span className="truncate font-semibold text-espresso">{tk.asunto}</span>
                <span className="rounded-full bg-white px-2.5 py-0.5 font-bold text-[#239BA2]">{tk.estado}</span>
              </div>
            ))}
          </div>
        )}
      </Sheet>
    </div>
  );
}

export function PacienteDashboard() {
  return (
    <Suspense fallback={null}>
      <PacienteDashboardInner />
    </Suspense>
  );
}

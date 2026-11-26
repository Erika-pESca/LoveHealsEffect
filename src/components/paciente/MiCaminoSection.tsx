"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  FileText,
  HeartPulse,
  Leaf,
  MapPin,
  Pencil,
  Pill,
  Plus,
  ScanSearch,
  Search,
  Sparkles,
  Stethoscope,
  Sun,
  Syringe,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Card, PrimaryButton, SectionTitle } from "@/components/panel/ui";
import { DocumentCardsList } from "@/components/panel/DocumentCardsList";
import {
  HABIT_COLORS,
  STAGES,
  todayKey,
} from "./types";

const STAGE_ICONS = [ScanSearch, Syringe, Leaf, Sun];

/** Fotografías reales luminosas de acompañamiento clínico y bienestar según la etapa */
const STAGE_HERO_PHOTOS = [
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
];

/** Retratos reales de especialistas y sanadores para dar calidez humana a las tarjetas */
const SPECIALIST_AVATARS: Array<{ match: string; url: string }> = [
  {
    match: "kelsie",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
  },
  {
    match: "omar",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80",
  },
  {
    match: "sarah",
    url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=240&q=80",
  },
  {
    match: "maya",
    url: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=240&q=80",
  },
  {
    match: "dra",
    url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=240&q=80",
  },
  {
    match: "dr",
    url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=240&q=80",
  },
];

function getSpecialistAvatar(name?: string): string {
  const lower = (name || "").toLowerCase();
  const found = SPECIALIST_AVATARS.find((a) => lower.includes(a.match));
  return (
    found?.url ||
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=240&q=80"
  );
}

function parseCalendarBadge(dateStr?: string, isEs = true): { day: string; month: string } {
  if (!dateStr) return { day: "--", month: "---" };
  const parts = String(dateStr).slice(0, 10).split("-");
  if (parts.length === 3) {
    const mIdx = Math.max(0, Math.min(11, parseInt(parts[1], 10) - 1));
    const monthsEs = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
    const monthsEn = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return {
      day: parts[2],
      month: isEs ? monthsEs[mIdx] : monthsEn[mIdx],
    };
  }
  return { day: "HOY", month: "" };
}

/** Metadatos vectoriales sin emojis para las entradas de Bitácora */
const JOURNAL_TYPE_STYLE: Record<
  string,
  {
    es: string;
    en: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
    pastelBg: string;
    pillBg: string;
    pillText: string;
  }
> = {
  etapa: {
    es: "Etapa del proceso",
    en: "Journey stage",
    icon: Leaf,
    accent: "#5C8D67",
    pastelBg: "#EAF4EC",
    pillBg: "bg-[#EAF4EC]",
    pillText: "text-[#5C8D67]",
  },
  medicamento: {
    es: "Medicación",
    en: "Medication",
    icon: Pill,
    accent: "#C94A6A",
    pastelBg: "#FCECEE",
    pillBg: "bg-[#FCECEE]",
    pillText: "text-[#C94A6A]",
  },
  cita: {
    es: "Consulta médica",
    en: "Medical visit",
    icon: Stethoscope,
    accent: "#239BA2",
    pastelBg: "#E5F2F1",
    pillBg: "bg-[#E5F2F1]",
    pillText: "text-[#239BA2]",
  },
  consulta: {
    es: "Consulta médica",
    en: "Medical visit",
    icon: Stethoscope,
    accent: "#239BA2",
    pastelBg: "#E5F2F1",
    pillBg: "bg-[#E5F2F1]",
    pillText: "text-[#239BA2]",
  },
  procedimiento: {
    es: "Procedimiento",
    en: "Procedure",
    icon: Syringe,
    accent: "#239BA2",
    pastelBg: "#E6F4F2",
    pillBg: "bg-[#E6F4F2]",
    pillText: "text-[#239BA2]",
  },
  quimio: {
    es: "Sesión / Tratamiento",
    en: "Session / Treatment",
    icon: Syringe,
    accent: "#239BA2",
    pastelBg: "#E6F4F2",
    pillBg: "bg-[#E6F4F2]",
    pillText: "text-[#239BA2]",
  },
  sintoma: {
    es: "Síntoma y evolución",
    en: "Symptom & progress",
    icon: Activity,
    accent: "#C9526D",
    pastelBg: "#FFF0EC",
    pillBg: "bg-[#FFF0EC]",
    pillText: "text-[#C9526D]",
  },
  diagnostico: {
    es: "Estudio / Diagnóstico",
    en: "Diagnosis / Study",
    icon: ScanSearch,
    accent: "#B8862D",
    pastelBg: "#FFF4E2",
    pillBg: "bg-[#FFF4E2]",
    pillText: "text-[#B8862D]",
  },
  documento: {
    es: "Documento clínico",
    en: "Clinical document",
    icon: FileText,
    accent: "#B8862D",
    pastelBg: "#F4F2E6",
    pillBg: "bg-[#F4F2E6]",
    pillText: "text-[#B8862D]",
  },
  sanador: {
    es: "Sesión integrativa",
    en: "Integrative session",
    icon: Sparkles,
    accent: "#C94A6A",
    pastelBg: "#FFF5F7",
    pillBg: "bg-[#FFF5F7]",
    pillText: "text-[#C94A6A]",
  },
  nota: {
    es: "Nota personal",
    en: "Personal note",
    icon: ClipboardList,
    accent: "#5C8D67",
    pastelBg: "#EAF4EC",
    pillBg: "bg-[#EAF4EC]",
    pillText: "text-[#5C8D67]",
  },
};

const STAGE_GUIDE: Array<{
  taglineEs: string;
  taglineEn: string;
  focusEs: string;
  focusEn: string;
  accent: string;
  pastelBg: string;
}> = [
  {
    taglineEs: "Estudios y plan médico",
    taglineEn: "Studies & care plan",
    focusEs:
      "Reúne tus resultados de laboratorio y patología, anota tus dudas clave para el oncólogo y comprende tu hoja de ruta con calma.",
    focusEn:
      "Gather your lab and pathology results, note key questions for your oncologist, and understand your roadmap calmly.",
    accent: "#E8809A",
    pastelBg: "#FCECEE",
  },
  {
    taglineEs: "Ciclos y medicación",
    taglineEn: "Cycles & medication",
    focusEs:
      "Lleva al día tus tomas de medicamentos, registra cómo responde tu cuerpo en cada sesión y cuida tu hidratación y descanso.",
    focusEn:
      "Keep up with daily medications, log how your body responds to each session, and prioritize hydration and rest.",
    accent: "#239BA2",
    pastelBg: "#E5F2F1",
  },
  {
    taglineEs: "Descanso y cicatrización",
    taglineEn: "Rest & healing",
    focusEs:
      "Prioriza tu recuperación física y linfática, registra tu evolución diaria y apóyate en tus sanadores y prácticas suaves.",
    focusEn:
      "Prioritize physical and lymphatic recovery, log daily progress, and lean on your healers and gentle practices.",
    accent: "#5C8D67",
    pastelBg: "#EAF4EC",
  },
  {
    taglineEs: "Controles y bienestar",
    taglineEn: "Follow-ups & wellness",
    focusEs:
      "Organiza tus chequeos periódicos de control, mantén tus hábitos antiinflamatorios y celebra cada paso de tu nueva etapa.",
    focusEn:
      "Organize periodic checkups, maintain anti-inflammatory habits, and celebrate every step of your new chapter.",
    accent: "#B8862D",
    pastelBg: "#FFF4E2",
  },
];

export interface MiCaminoSectionProps {
  ficha: any;
  saludView: "linea" | "medicinas" | "medicos" | "ficha" | "documentos";
  setSaludView: (view: "linea" | "medicinas" | "medicos" | "ficha" | "documentos") => void;
  timelineFilter: string;
  setTimelineFilter: (filter: string) => void;
  doctorFilter: string;
  setDoctorFilter: (doctor: string) => void;
  visibleTimeline: any[];
  doctors: any[];
  todayHabits: Record<string, boolean>;
  updateDaily: (patch: Record<string, any>) => void;
  openSheet: (name: string, initial?: Record<string, string>) => void;
  openConsult: (audience: "medico" | "sanador") => void;
  runAction: (action: string, payload?: any, successToast?: string, options?: any) => Promise<any>;
  fmtDate: (d: string) => string;
  t: (es: string, en: string) => string;
  isEs: boolean;
}

export function MiCaminoSection({
  ficha,
  saludView,
  setSaludView,
  timelineFilter,
  setTimelineFilter,
  doctorFilter,
  setDoctorFilter,
  visibleTimeline,
  doctors,
  todayHabits,
  updateDaily,
  openSheet,
  openConsult,
  runAction,
  fmtDate,
  t,
  isEs,
}: MiCaminoSectionProps) {
  const [journalSearch, setJournalSearch] = useState("");
  const [pendingDeleteEntry, setPendingDeleteEntry] = useState<any | null>(null);
  const [previewStageIdx, setPreviewStageIdx] = useState<number | null>(null);
  const [showStageSelector, setShowStageSelector] = useState(false);

  const medCount = ficha.medicamentos_y_horarios?.length || 0;
  const docCount = ficha.documentos_oncologo?.length || 0;
  const stageIdx = Math.max(0, STAGES.findIndex((s) => s.id === ficha.etapa_actual));
  const inspectedIdx = previewStageIdx ?? stageIdx;
  const inspectedStage = STAGES[inspectedIdx] || STAGES[0];
  const inspectedGuide = STAGE_GUIDE[inspectedIdx] || STAGE_GUIDE[0];
  const InspectedStageIcon = STAGE_ICONS[inspectedIdx] || STAGE_ICONS[0];
  const activeStage = STAGES[stageIdx] || STAGES[0];
  const ActiveStageIcon = STAGE_ICONS[stageIdx] || STAGE_ICONS[0];
  const meds: any[] = ficha.medicamentos_y_horarios || [];
  const takenToday = meds.filter((m, idx) => todayHabits[`med-${m.id ?? idx}`]).length;
  const nextMed = meds.find((m, idx) => !todayHabits[`med-${m.id ?? idx}`]);

  const searchedTimeline = useMemo(() => {
    const q = journalSearch.trim().toLowerCase();
    if (!q) return visibleTimeline;
    return visibleTimeline.filter((e: any) => {
      const hay = [
        e.titulo,
        e.detalle,
        e.medico,
        e.lugar,
        ...(Array.isArray(e.etiquetas) ? e.etiquetas : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [visibleTimeline, journalSearch]);

  return (
    <main className="mt-5 space-y-6">
      {/* Panel resumen estilo Wellness Pastel con fotografía humana real y tarjetas en degradado */}
      <section className="animate-fade-in relative overflow-hidden rounded-[34px] border border-white bg-gradient-to-br from-[#FDF3EF] via-[#FCECEE]/65 to-[#E5F2F1]/80 p-5 sm:p-7 shadow-[0_16px_42px_rgba(232,128,154,0.12)]">
        <div aria-hidden="true" className="pointer-events-none absolute -left-14 -top-14 h-64 w-64 rounded-full bg-white/60 blur-2xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-[#239BA2]/15 blur-[60px]" />

        {/* 1. Cabecera limpia: Propósito a la izquierda + Botones de Resumen de Cita a la derecha */}
        <div className="relative flex flex-col gap-4 border-b border-espresso/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-1 text-[11px] font-bold text-espresso/75 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#5C8D67] animate-pulse" />
                <span className="uppercase tracking-wider font-extrabold text-[#5C8D67]">
                  {t("Mi camino clínico", "My clinical journey")}
                </span>
              </div>
              <span className="rounded-full bg-[#E5F2F1] px-3 py-1 text-[11px] font-bold text-[#239BA2]">
                {t(`Paso ${stageIdx + 1} de ${STAGES.length} · ${activeStage.es}`, `Step ${stageIdx + 1} of ${STAGES.length} · ${activeStage.en}`)}
              </span>
            </div>

            <h2 className="text-2xl font-bold leading-[1.12] tracking-tight text-espresso sm:text-3xl">
              {t("Hoy en tu ", "Today in your ")}
              <span className="font-serif italic text-[#C94A6A]">{t("proceso de sanación", "healing process")}</span>
            </h2>

            <p className="text-xs sm:text-sm text-espresso/75 leading-relaxed">
              {t(
                "Tu espacio personal de salud: lleva al día tus medicamentos, registra cómo te sientes en tu bitácora y genera en un clic el resumen para tu próxima consulta.",
                "Your personal health space: track daily meds, log how you feel in your journal, and generate a 1-click summary for your next visit."
              )}
            </p>
          </div>

          {/* Botones de Hojas de Resumen con retratos reales */}
          <div className="shrink-0">
            <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-espresso/55 lg:text-right">
              {t("Generar hoja de resumen para tu cita:", "Generate summary sheet for your visit:")}
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => openConsult("medico")}
                className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#E8809A] to-[#D85C7D] py-2 pl-2.5 pr-4 text-xs font-bold text-white shadow-[0_10px_22px_rgba(232,128,154,0.34)] transition hover:brightness-105 active:scale-95"
              >
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=160&q=80"
                  alt=""
                  className="h-7 w-7 rounded-full object-cover ring-2 ring-white/80"
                />
                <span>{t("Para mi médico", "For my doctor")}</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <button
                type="button"
                onClick={() => openConsult("sanador")}
                className="group inline-flex items-center gap-2.5 rounded-full border border-white bg-white/95 py-2 pl-2.5 pr-4 text-xs font-bold text-[#239BA2] shadow-sm transition hover:bg-white active:scale-95"
              >
                <div className="flex -space-x-1.5">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80"
                    alt=""
                    className="h-7 w-7 rounded-full object-cover ring-2 ring-white"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80"
                    alt=""
                    className="h-7 w-7 rounded-full object-cover ring-2 ring-white"
                  />
                </div>
                <span>{t("Para mi sanador", "For my healer")}</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Barra compacta de las 4 Etapas (Encima de las tarjetas de resumen, pequeña, clara e interactiva) */}
        <div className="relative mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-espresso/55">
              {t("¿En qué momento estás? (Toca una etapa para actualizar tu progreso)", "Where are you right now? (Tap a stage to update)")}
            </span>
            <span className="text-[11px] font-bold text-[#C94A6A]">
              {t(`Etapa actual: ${activeStage.es}`, `Current stage: ${activeStage.en}`)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {STAGES.map((s, idx) => {
              const isCurrent = s.id === ficha.etapa_actual;
              const isCompleted = idx < stageIdx;
              const StageIcon = STAGE_ICONS[idx % STAGE_ICONS.length];
              const guide = STAGE_GUIDE[idx] || STAGE_GUIDE[0];

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    runAction(
                      "update_stage",
                      { etapa_actual: s.id },
                      t(`Etapa actualizada: ${s.es}`, `Stage updated: ${s.en}`)
                    )
                  }
                  className={`group relative flex flex-col justify-between rounded-2xl px-3.5 py-2.5 text-left transition-all duration-200 active:scale-[0.98] border ${
                    isCurrent
                      ? "bg-white border-[#E8809A] ring-2 ring-[#E8809A]/30 shadow-sm"
                      : isCompleted
                        ? "bg-white/85 border-white hover:bg-white"
                        : "bg-white/60 border-white/70 hover:bg-white/90"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105"
                        style={{
                          backgroundColor: isCurrent ? guide.pastelBg : "#FAF7F2",
                          color: guide.accent,
                        }}
                      >
                        <StageIcon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-extrabold leading-tight text-espresso">
                          {isEs ? s.es : s.en}
                        </p>
                        <p className="truncate text-[10px] font-medium text-espresso/55">
                          {isEs ? guide.taglineEs : guide.taglineEn}
                        </p>
                      </div>
                    </div>

                    {isCurrent ? (
                      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[#E8809A] px-2 py-0.5 text-[9px] font-extrabold text-white shadow-sm">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                        {t("Actual", "Current")}
                      </span>
                    ) : isCompleted ? (
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAF4EC] text-[#5C8D67]">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-[#FAF7F2] px-2 py-0.5 text-[9px] font-bold text-espresso/45">
                        {t(`Paso ${idx + 1}`, `Step ${idx + 1}`)}
                      </span>
                    )}
                  </div>

                  {/* Línea fina inferior de progreso */}
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-espresso/10">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: isCurrent || isCompleted ? "100%" : "0%",
                        backgroundColor: isCurrent ? "#E8809A" : "#5C8D67",
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Tarjetas interactivas de resumen diario debajo de las etapas */}
        <div className="relative mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Tarjeta 1: Tu Etapa Actual */}
          <div className="relative overflow-hidden flex flex-col justify-between rounded-[26px] border border-white bg-gradient-to-br from-[#FFF5F7] via-white to-[#FFFDFB] p-5 text-left shadow-sm">
            <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#E8809A]/15 blur-xl" />
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#FCECEE] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#C94A6A]">
                  {t("Tu etapa", "Your stage")}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-[#E8809A] shadow-sm">
                  <ActiveStageIcon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 text-lg font-extrabold tracking-tight text-espresso">
                {isEs ? activeStage.es : activeStage.en}
              </p>
              <div className="mt-2.5 flex gap-1.5">
                {STAGES.map((s, i) => (
                  <span
                    key={s.id}
                    className={`h-2 flex-1 rounded-full ${
                      i <= stageIdx ? "bg-gradient-to-r from-[#E8809A] to-[#D85C7D]" : "bg-[#FCECEE]"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-espresso/60 pt-2.5 border-t border-espresso/5">
              <span>{t(`Paso ${stageIdx + 1} de ${STAGES.length}`, `Step ${stageIdx + 1} of ${STAGES.length}`)}</span>
              <span className="text-[#C94A6A]">{isEs ? STAGE_GUIDE[stageIdx]?.taglineEs : STAGE_GUIDE[stageIdx]?.taglineEn}</span>
            </div>
          </div>

          {/* Tarjeta 2: Medicinas */}
          <button
            type="button"
            onClick={() => {
              setSaludView("medicinas");
              const el = document.getElementById("seccion-contenido");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className={`group relative overflow-hidden flex flex-col justify-between rounded-[26px] p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-95 border ${
              saludView === "medicinas"
                ? "bg-gradient-to-br from-[#FCECEE] via-[#FFF5F7] to-white ring-2 ring-[#E8809A] border-[#E8809A]"
                : "bg-gradient-to-br from-[#FDF3EF] via-white to-[#FFFDFB] border-white"
            }`}
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#E8809A]/15 blur-xl" />
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-[#E8809A] shadow-sm">
                  <Pill className="h-4 w-4" />
                </span>
                {medCount > 0 && takenToday === medCount ? (
                  <span className="rounded-full bg-[#EAF4EC] px-2.5 py-0.5 text-[10px] font-extrabold text-[#5C8D67]">
                    {t("Al día", "All taken")}
                  </span>
                ) : (
                  <span className="rounded-full bg-[#FCECEE] px-2.5 py-0.5 text-[10px] font-extrabold text-[#C94A6A]">
                    {t("Tomas de hoy", "Today's doses")}
                  </span>
                )}
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <p className="text-2xl font-extrabold text-espresso">
                  {takenToday}
                  <span className="text-sm font-semibold text-espresso/45">/{medCount}</span>
                </p>
                <span className="text-xs font-bold text-espresso/75">
                  {t("medicinas hoy", "meds today")}
                </span>
              </div>
              <p className="mt-1 truncate text-[11px] font-medium text-espresso/60">
                {nextMed ? `${t("Próxima", "Next")}: ${nextMed.nombre}` : t("Sin medicinas pendientes", "No pending meds")}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-[#C94A6A] pt-2.5 border-t border-espresso/5">
              <span>{t("Ver y marcar tomas", "Check doses")}</span>
              <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </div>
          </button>

          {/* Tarjeta 3: Médicos (Con retratos reales apilados) */}
          <button
            type="button"
            onClick={() => {
              setSaludView("medicos");
              const el = document.getElementById("seccion-contenido");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className={`group relative overflow-hidden flex flex-col justify-between rounded-[26px] p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-95 border ${
              saludView === "medicos"
                ? "bg-gradient-to-br from-[#DFF0EE] via-[#F2FAF9] to-white ring-2 ring-[#239BA2] border-[#239BA2]"
                : "bg-gradient-to-br from-[#E6F4F2] via-white to-[#F7FCFB] border-white"
            }`}
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#239BA2]/15 blur-xl" />
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-[#239BA2] shadow-sm">
                  <Stethoscope className="h-4 w-4" />
                </span>
                <div className="flex -space-x-2">
                  {(doctors?.slice(0, 3) || []).map((doc: any, idx: number) => (
                    <img
                      key={doc.name || idx}
                      src={getSpecialistAvatar(doc.name)}
                      alt=""
                      className="h-7 w-7 rounded-full object-cover ring-2 ring-white"
                    />
                  ))}
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <p className="text-2xl font-extrabold text-espresso">{doctors?.length || 0}</p>
                <span className="text-xs font-bold text-espresso/75">
                  {t("especialistas", "specialists")}
                </span>
              </div>
              <p className="mt-1 truncate text-[11px] font-medium text-espresso/60">
                {doctors?.[0]?.name || t("Agrega tu oncólogo", "Add your oncologist")}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-[#239BA2] pt-2.5 border-t border-espresso/5">
              <span>{t("Ver directorio", "View directory")}</span>
              <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </div>
          </button>

          {/* Tarjeta 4: Documentos */}
          <button
            type="button"
            onClick={() => {
              setSaludView("documentos");
              const el = document.getElementById("seccion-contenido");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className={`group relative overflow-hidden flex flex-col justify-between rounded-[26px] p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-95 border ${
              saludView === "documentos"
                ? "bg-gradient-to-br from-[#FBF0D9] via-[#FFF9EE] to-white ring-2 ring-[#B8862D] border-[#B8862D]"
                : "bg-gradient-to-br from-[#FFF6E5] via-white to-[#FFFDF8] border-white"
            }`}
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#B8862D]/15 blur-xl" />
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-[#B8913A] shadow-sm">
                  <FileText className="h-4 w-4" />
                </span>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#B8913A] shadow-sm">
                  {t("PDF · Estudios", "PDF · Labs")}
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <p className="text-2xl font-extrabold text-espresso">{docCount}</p>
                <span className="text-xs font-bold text-espresso/75">
                  {t("documentos", "documents")}
                </span>
              </div>
              <p className="mt-1 truncate text-[11px] font-medium text-espresso/60">
                {ficha.documentos_oncologo?.[0]?.titulo || t("Sube recetas o PDF", "Upload Rx or PDF")}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-[#B8913A] pt-2.5 border-t border-espresso/5">
              <span>{t("Ver y subir archivos", "View & upload")}</span>
              <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </div>
          </button>
        </div>
      </section>

      {/* Menú de Navegación de los 5 Módulos (Con iconos vectoriales, subtítulos explicativos y contadores) */}
      <nav
        id="seccion-contenido"
        aria-label={t("Secciones de Mi camino", "My journey sections")}
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-5"
      >
        {(
          [
            {
              id: "linea" as const,
              label: t("Bitácora", "Journal"),
              sub: t("Historial y notas", "History & notes"),
              count: visibleTimeline.length,
              icon: ClipboardList,
              accent: "#E8809A",
              pastelBg: "#FCECEE",
            },
            {
              id: "medicinas" as const,
              label: t("Medicinas", "Meds"),
              sub: t("Tomas y dosis", "Doses & schedule"),
              count: medCount,
              icon: Pill,
              accent: "#C94A6A",
              pastelBg: "#FFF0F3",
            },
            {
              id: "medicos" as const,
              label: t("Médicos", "Doctors"),
              sub: t("Equipo clínico", "Care team"),
              count: doctors?.length || 0,
              icon: Stethoscope,
              accent: "#239BA2",
              pastelBg: "#E5F2F1",
            },
            {
              id: "ficha" as const,
              label: t("Mi ficha", "My chart"),
              sub: t("Datos y alergias", "Profile & allergies"),
              count: null,
              icon: HeartPulse,
              accent: "#5C8D67",
              pastelBg: "#EAF4EC",
            },
            {
              id: "documentos" as const,
              label: t("Documentos", "Documents"),
              sub: t("Exámenes y PDF", "Exams & files"),
              count: docCount,
              icon: FileText,
              accent: "#B8862D",
              pastelBg: "#FFF4E2",
            },
          ]
        ).map((tab) => {
          const active = saludView === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSaludView(tab.id)}
              className={`group flex items-center gap-3 rounded-2xl p-3.5 text-left transition-all duration-200 active:scale-[0.98] border ${
                active
                  ? "bg-white border-[#E8809A] ring-2 ring-[#E8809A]/30 shadow-[0_10px_24px_rgba(232,128,154,0.14)]"
                  : "bg-white/80 border-white hover:bg-white hover:shadow-sm"
              }`}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105"
                style={{
                  backgroundColor: active ? "#E8809A" : tab.pastelBg,
                  color: active ? "#FFFFFF" : tab.accent,
                }}
              >
                <TabIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate text-xs font-extrabold text-espresso sm:text-sm">
                    {tab.label}
                  </span>
                  {tab.count !== null && tab.count > 0 && (
                    <span
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        active ? "bg-[#FCECEE] text-[#C94A6A]" : "bg-[#FAF7F2] text-espresso/60"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </div>
                <span className="block truncate text-[11px] font-medium text-espresso/55">
                  {tab.sub}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* --- 1. Bitácora clínica y personal (Rediseñada sin emojis, con accesos rápidos en 1 clic) --- */}
      {saludView === "linea" && (
        <div className="space-y-4">
          {/* Panel superior de Bitácora: Propósito + Botones de registro rápido en 1 clic */}
          <div className="rounded-[28px] border border-white bg-white p-5 shadow-[0_10px_30px_rgba(38,35,34,0.05)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-espresso/5 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#239BA2]">
                  {t("Diario clínico y evolución", "Clinical diary & progress")}
                </span>
                <h3 className="mt-0.5 text-lg font-bold tracking-tight text-espresso sm:text-xl">
                  {t("¿Qué deseas registrar hoy en tu bitácora?", "What would you like to log today?")}
                </h3>
                <p className="text-xs text-espresso/60">
                  {t(
                    "Elige una opción rápida para anotar cómo te sientes, lo que te dijo el médico o cualquier avance.",
                    "Pick a quick option to note how you feel, doctor instructions, or any progress."
                  )}
                </p>
              </div>

              {/* Buscador + Nueva entrada */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 sm:w-56 sm:flex-initial">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-espresso/40" />
                  <input
                    type="text"
                    value={journalSearch}
                    onChange={(e) => setJournalSearch(e.target.value)}
                    placeholder={t("Buscar síntoma, médico...", "Search symptom, doctor...")}
                    className="w-full rounded-full border border-espresso/10 bg-[#FAF7F2] py-2 pl-9 pr-8 text-xs text-espresso placeholder:text-espresso/45 focus:border-[#239BA2] focus:bg-white focus:outline-none"
                  />
                  {journalSearch && (
                    <button
                      type="button"
                      onClick={() => setJournalSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-espresso/40 hover:text-espresso"
                      aria-label={t("Limpiar", "Clear")}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => openSheet("bitacora", { tipo: "nota", fecha: todayKey() })}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#E8809A] px-4 py-2 text-xs font-bold text-white shadow-[0_8px_18px_rgba(232,128,154,0.3)] transition hover:bg-[#d86c88] active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t("Nueva entrada", "New entry")}</span>
                </button>
              </div>
            </div>

            {/* 4 Tarjetas de Registro Rápido en 1 Clic (Superficies pastel con profundidad y color) */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  tipo: "sintoma",
                  titleEs: "Registrar síntoma",
                  titleEn: "Log symptom",
                  descEs: "Cómo se siente tu cuerpo hoy",
                  descEn: "How your body feels today",
                  icon: Activity,
                  accent: "#C9526D",
                  gradClass: "from-[#FFF0F3] via-[#FFF8F9] to-white border-[#E8809A]/25",
                },
                {
                  tipo: "cita",
                  titleEs: "Consulta médica",
                  titleEn: "Medical visit",
                  descEs: "Notas e indicaciones del doctor",
                  descEn: "Doctor notes & instructions",
                  icon: Stethoscope,
                  accent: "#239BA2",
                  gradClass: "from-[#E6F4F2] via-[#F3FAF9] to-white border-[#239BA2]/25",
                },
                {
                  tipo: "procedimiento",
                  titleEs: "Sesión o tratamiento",
                  titleEn: "Session or procedure",
                  descEs: "Quimio, radio o laboratorio",
                  descEn: "Chemo, radiation, or lab",
                  icon: Syringe,
                  accent: "#239BA2",
                  gradClass: "from-[#EBF5F5] via-[#F6FBFB] to-white border-[#6BB1AD]/30",
                },
                {
                  tipo: "nota",
                  titleEs: "Duda o nota personal",
                  titleEn: "Question or note",
                  descEs: "Preguntas para tu próxima cita",
                  descEn: "Questions for your next visit",
                  icon: ClipboardList,
                  accent: "#5C8D67",
                  gradClass: "from-[#EAF4EC] via-[#F5FAF6] to-white border-[#5C8D67]/25",
                },
              ].map((q) => {
                const QuickIcon = q.icon;
                return (
                  <button
                    key={q.tipo}
                    type="button"
                    onClick={() => openSheet("bitacora", { tipo: q.tipo, fecha: todayKey() })}
                    className={`group relative overflow-hidden flex items-center gap-3 rounded-2xl border bg-gradient-to-br ${q.gradClass} p-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]`}
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm transition group-hover:scale-105"
                      style={{ color: q.accent }}
                    >
                      <QuickIcon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-extrabold text-espresso">
                        {isEs ? q.titleEs : q.titleEn}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] font-medium text-espresso/60">
                        {isEs ? q.descEs : q.descEn}
                      </p>
                    </div>
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition group-hover:scale-110"
                      style={{ color: q.accent }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Filtros de categoría con iconos vectoriales y sin scroll horizontal */}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-espresso/5 pt-3.5">
              <span className="mr-1 text-[11px] font-bold text-espresso/45">
                {t("Filtrar por:", "Filter by:")}
              </span>
              {(
                [
                  { id: "todo", label: t("Todos", "All"), icon: ClipboardList },
                  { id: "sintoma", label: t("Síntomas", "Symptoms"), icon: Activity },
                  { id: "cita", label: t("Consultas", "Visits"), icon: Stethoscope },
                  { id: "procedimiento", label: t("Procedimientos", "Procedures"), icon: Syringe },
                  { id: "medicamento", label: t("Medicinas", "Medications"), icon: Pill },
                  { id: "sanador", label: t("Sanadores", "Healers"), icon: Sparkles },
                  { id: "nota", label: t("Notas", "Notes"), icon: FileText },
                ] as const
              ).map((f) => {
                const FilterIcon = f.icon;
                const active = timelineFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setTimelineFilter(f.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                      active
                        ? "bg-[#239BA2] text-white shadow-sm"
                        : "border border-espresso/10 bg-white text-espresso/70 hover:border-[#239BA2]/40 hover:text-espresso"
                    }`}
                  >
                    <FilterIcon className="h-3.5 w-3.5" />
                    <span>{f.label}</span>
                  </button>
                );
              })}

              {doctorFilter && (
                <button
                  type="button"
                  onClick={() => setDoctorFilter("")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#E5F2F1] px-3.5 py-1.5 text-xs font-bold text-[#239BA2]"
                >
                  <Stethoscope className="h-3.5 w-3.5" />
                  <span>{doctorFilter}</span>
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Cuadrícula de Tarjetas de Bitácora (Con cabecera pastel, hoja de calendario, retrato real de médico y profundidad visual) */}
          {searchedTimeline.length === 0 ? (
            <Card className="border border-dashed border-[#6BB1AD]/35 bg-white/80 py-10 text-center text-sm text-espresso/60">
              {journalSearch
                ? t("No se encontraron registros con esa búsqueda.", "No entries match your search.")
                : t(
                    "Aún no hay registros en esta categoría. Usa los botones superiores para crear tu primera nota.",
                    "No entries in this category yet. Use the top buttons to create your first note."
                  )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {searchedTimeline.map((e: any) => {
                const style = JOURNAL_TYPE_STYLE[e.tipo] || JOURNAL_TYPE_STYLE.nota;
                const EntryIcon = style.icon;
                const cal = parseCalendarBadge(e.fecha, isEs);

                return (
                  <article
                    key={e.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_10px_28px_rgba(38,35,34,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(38,35,34,0.1)]"
                  >
                    <div>
                      {/* Banda superior pastel con Hoja de Calendario Visual + Categoría + Acciones */}
                      <div
                        className="flex items-start justify-between gap-3 px-5 py-4 border-b border-white/80"
                        style={{ backgroundColor: style.pastelBg }}
                      >
                        <div className="flex min-w-0 items-center gap-3.5">
                          {/* Hoja de calendario visual con día y mes */}
                          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-white shadow-sm">
                            <span
                              className="text-sm font-extrabold leading-none"
                              style={{ color: style.accent }}
                            >
                              {cal.day}
                            </span>
                            <span className="mt-0.5 text-[9px] font-extrabold uppercase tracking-wider text-espresso/55">
                              {cal.month}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-sm"
                                style={{ color: style.accent }}
                              >
                                <EntryIcon className="h-3 w-3" />
                                <span>{isEs ? style.es : style.en}</span>
                              </span>
                            </div>
                            <h4 className="mt-1.5 text-base font-extrabold leading-snug text-espresso">
                              {e.titulo}
                            </h4>
                          </div>
                        </div>

                        {!e.readonly && (
                          <div className="flex shrink-0 items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                openSheet("bitacora", {
                                  id: String(e.id),
                                  tipo: e.tipo || "nota",
                                  fecha: e.fecha || todayKey(),
                                  titulo: e.titulo || "",
                                  detalle: e.detalle || "",
                                  medico: e.medico || "",
                                  lugar: e.lugar || "",
                                  etiquetas: Array.isArray(e.etiquetas)
                                    ? e.etiquetas.join(", ")
                                    : "",
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-espresso/75 shadow-sm transition hover:bg-white hover:text-[#239BA2]"
                              title={t("Editar registro", "Edit entry")}
                            >
                              <Pencil className="h-3 w-3" />
                              <span className="hidden sm:inline">{t("Editar", "Edit")}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteEntry(e)}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-espresso/50 shadow-sm transition hover:bg-white hover:text-[#C94A6A]"
                              aria-label={t("Eliminar", "Delete")}
                              title={t("Eliminar registro", "Delete entry")}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Cuerpo / Detalle con barra lateral de acento semántico */}
                      {e.detalle && (
                        <div className="px-5 pt-4">
                          <div
                            className="rounded-2xl border-l-4 bg-[#FAF7F2]/90 p-3.5 text-xs leading-relaxed text-espresso/80"
                            style={{ borderLeftColor: style.accent }}
                          >
                            {e.detalle}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pie de tarjeta: Especialista con retrato fotográfico real, Clínica/Lugar y Etiquetas */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 px-5 pb-4 pt-2">
                      {e.medico && (
                        <button
                          type="button"
                          onClick={() => setDoctorFilter(e.medico)}
                          className="inline-flex items-center gap-2 rounded-full bg-[#E5F2F1] py-1 pl-1 pr-3 text-[11px] font-bold text-[#239BA2] shadow-sm transition hover:bg-[#d5eae8]"
                          title={t("Filtrar por este especialista", "Filter by this specialist")}
                        >
                          <img
                            src={getSpecialistAvatar(e.medico)}
                            alt={e.medico}
                            className="h-5 w-5 rounded-full object-cover ring-1 ring-white"
                          />
                          <span>{e.medico}</span>
                        </button>
                      )}

                      {e.lugar && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF7F2] px-2.5 py-1 text-[11px] font-semibold text-espresso/70">
                          <MapPin className="h-3 w-3 text-[#E8809A]" />
                          <span>{e.lugar}</span>
                        </span>
                      )}

                      {(e.etiquetas || []).map((tag: string) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-[#FDF3EF] px-2.5 py-1 text-[10px] font-bold text-[#C9526D]"
                        >
                          <Tag className="h-2.5 w-2.5" />
                          <span>{tag}</span>
                        </span>
                      ))}

                      <span className="ml-auto rounded-full bg-[#FAF7F2] px-2.5 py-0.5 text-[10px] font-bold text-espresso/55">
                        {e.origen === "auto"
                          ? t("Automático", "Auto-logged")
                          : e.readonly
                            ? t("Sesión sanador", "Healer session")
                            : t("Escrito por ti", "Logged by you")}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Modal de confirmación para eliminar entrada de bitácora */}
          {pendingDeleteEntry && (
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-espresso/45 p-4 backdrop-blur-sm"
              onClick={() => setPendingDeleteEntry(null)}
            >
              <div
                className="w-full max-w-sm rounded-[28px] border border-white/90 bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FCECEE] text-[#C94A6A]">
                    <AlertTriangle className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-espresso">
                      {t("¿Eliminar registro?", "Delete entry?")}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-espresso/70">
                      {t("Estás a punto de eliminar", "You are about to delete")}{" "}
                      <span className="font-bold text-espresso">
                        “{pendingDeleteEntry.titulo}”
                      </span>
                      . {t("Esta acción no se puede deshacer.", "This action cannot be undone.")}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPendingDeleteEntry(null)}
                    className="rounded-full bg-[#FAF7F2] px-4 py-2 text-xs font-bold text-espresso/75 transition hover:bg-espresso/10"
                  >
                    {t("Cancelar", "Cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const idToDelete = pendingDeleteEntry.id;
                      setPendingDeleteEntry(null);
                      void runAction(
                        "delete_bitacora",
                        { id: idToDelete },
                        t("Entrada eliminada", "Entry removed")
                      );
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#C94A6A] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#b53d5c] active:scale-95"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{t("Sí, eliminar", "Yes, delete")}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- 2. Medicinas y suplementos --- */}
      {saludView === "medicinas" && (
        <div className="space-y-6">
          <div>
            <SectionTitle title={t("Medicamentos", "Medications")} />
            <div className="space-y-2.5">
              {ficha.medicamentos_y_horarios.length === 0 && (
                <Card className="text-center text-sm text-espresso/60">
                  {t("Aún no has agregado medicinas.", "No medications yet.")}
                </Card>
              )}
              {ficha.medicamentos_y_horarios.map((m: any, idx: number) => {
                const key = `med-${m.id ?? idx}`;
                const taken = Boolean(todayHabits[key]);
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-3 rounded-3xl ${
                      HABIT_COLORS[(idx + 1) % HABIT_COLORS.length]
                    } px-4 py-3.5`}
                  >
                    <button
                      type="button"
                      onClick={() => updateDaily({ habits: { [key]: !taken } })}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition ${
                        taken ? "border-[#7A4FD1] bg-[#7A4FD1] text-white" : "border-espresso/25 bg-white/70"
                      }`}
                      aria-label={t("Marcar como tomada", "Mark as taken")}
                    >
                      {taken && <Check className="h-4 w-4" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-bold text-espresso ${taken ? "line-through opacity-60" : ""}`}>
                        {m.nombre}
                      </p>
                      <p className="truncate text-xs text-espresso/65">
                        {m.dosis} · {m.horario}
                        {m.indicaciones ? ` · ${m.indicaciones}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => runAction("delete_medication", { index: idx }, t("Medicamento eliminado", "Removed"))}
                      className="text-espresso/35 transition hover:text-[#C94A6A]"
                      aria-label={t("Eliminar", "Delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <SectionTitle title={t("Suplementos y vitaminas", "Supplements & vitamins")} />
            <div className="space-y-2.5">
              {ficha.suplementos.length === 0 && (
                <Card className="text-center text-sm text-espresso/60">
                  {t("Sin suplementos registrados.", "No supplements yet.")}
                </Card>
              )}
              {ficha.suplementos.map((s: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 rounded-3xl bg-white px-4 py-3.5 shadow-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D7F3EA] text-[#239BA2]">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-espresso">{s.nombre}</p>
                    <p className="truncate text-xs text-espresso/60">
                      {s.dosis} · {s.horario}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => runAction("delete_supplement", { index: idx }, t("Suplemento eliminado", "Removed"))}
                    className="text-espresso/35 transition hover:text-[#C94A6A]"
                    aria-label={t("Eliminar", "Delete")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <PrimaryButton onClick={() => openSheet("add-med", { kind: "med" })}>
            <Plus className="h-5 w-5" />
            {t("Agregar medicina o suplemento", "Add medication or supplement")}
          </PrimaryButton>
          <p className="px-2 text-center text-xs text-espresso/50">
            {t("Cada cambio queda registrado solo en tu bitácora.", "Every change is automatically logged in your journal.")}
          </p>
        </div>
      )}

      {/* --- 3. Médicos tratantes --- */}
      {saludView === "medicos" && (
        <div className="space-y-3">
          {doctors.length === 0 && (
            <Card className="text-center text-sm text-espresso/60">
              {t(
                "Aquí verás los médicos con los que has pasado. Se llena solo cuando los mencionas en tu bitácora.",
                "You'll see the doctors you've visited here. It fills in as you mention them in your journal."
              )}
            </Card>
          )}
          {doctors.map((d) => (
            <button
              key={d.name}
              type="button"
              onClick={() => {
                setDoctorFilter(d.name);
                setTimelineFilter("todo");
                setSaludView("linea");
              }}
              className="flex w-full items-center gap-3 rounded-3xl bg-white p-4 text-left shadow-sm transition active:scale-[0.98]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D9E8FB] text-lg font-bold text-[#3D7BD6]">
                {d.name.replace(/^(dr\.?|dra\.?)\s*/i, "").charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-espresso">{d.name}</span>
                <span className="block truncate text-xs text-espresso/60">
                  {d.rol || t("Médico", "Doctor")} · {d.count} {t("registros", "entries")}
                  {d.last ? ` · ${t("última", "last")} ${fmtDate(d.last)}` : ""}
                </span>
                {d.telefono && <span className="block text-xs font-semibold text-[#239BA2]">{d.telefono}</span>}
              </span>
              <ChevronRight className="h-4 w-4 text-espresso/30" />
            </button>
          ))}
          <PrimaryButton onClick={() => openSheet("contacts", { rol: "Oncólogo" })}>
            <Plus className="h-5 w-5" />
            {t("Agregar médico", "Add doctor")}
          </PrimaryButton>
        </div>
      )}

      {/* --- 4. Mi Ficha (Diagnóstico, Alergias y Nutrición) --- */}
      {saludView === "ficha" && (
        <div className="space-y-3">
          {[
            { label: t("Mi historia", "My story"), value: ficha.historia_medica, bg: "bg-[#FAD4DC]", emoji: "📖" },
            { label: t("Alergias", "Allergies"), value: ficha.alergias, bg: "bg-[#FFF1B8]", emoji: "⚠️" },
            { label: t("Alimentación e hidratación", "Nutrition & hydration"), value: ficha.datos_nutricionales, bg: "bg-[#D7F3EA]", emoji: "🥗" },
          ].map((c) => (
            <div key={c.label} className={`rounded-3xl ${c.bg} p-5`}>
              <p className="text-xs font-bold text-espresso/65">
                {c.emoji} {c.label}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-espresso">
                {c.value || t("Aún sin completar. Toca editar para contarnos.", "Not filled in yet. Tap edit to tell us.")}
              </p>
            </div>
          ))}
          <PrimaryButton
            onClick={() =>
              openSheet("edit-ficha", {
                historia: ficha.historia_medica || "",
                alergias: ficha.alergias || "",
                nutricion: ficha.datos_nutricionales || "",
              })
            }
          >
            {t("Editar mi ficha", "Edit my chart")}
          </PrimaryButton>
        </div>
      )}

      {/* --- 5. Documentos médicos --- */}
      {saludView === "documentos" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/90 bg-white/85 px-5 py-3.5 shadow-sm">
            <div>
              <h3 className="text-lg font-semibold tracking-[-0.025em] text-espresso">
                {t("Documentos clínicos", "Clinical documents")}
              </h3>
              <p className="text-xs text-espresso/60">
                {t(
                  "Selecciona un documento para previsualizarlo a la derecha o sube uno nuevo.",
                  "Select a document to preview it on the right or upload a new one."
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => openSheet("add-doc", { tipo: "Receta / Indicaciones del Oncólogo" })}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#F48EA6] via-[#E6748E] to-[#C9526D] px-5 py-2.5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(230,116,142,0.28)] transition hover:brightness-105 active:scale-95"
            >
              <Upload className="h-4 w-4" />
              <span>{t("Subir documento", "Upload document")}</span>
            </button>
          </div>

          <DocumentCardsList
            documents={ficha.documentos_oncologo}
            emptyText={t(
              "Sube recetas, laboratorios o notas de tu oncólogo.",
              "Upload prescriptions, labs or notes from your oncologist."
            )}
            onDelete={(idx) =>
              runAction("delete_document", { index: idx }, t("Documento eliminado", "Removed"))
            }
            t={t}
          />
        </div>
      )}
    </main>
  );
}

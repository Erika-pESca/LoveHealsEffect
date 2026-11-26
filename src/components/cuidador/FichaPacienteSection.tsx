"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  ChevronRight,
  FileText,
  Leaf,
  Pill,
  Plus,
  ScanSearch,
  Search,
  Sparkles,
  Sun,
  Syringe,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Card, PrimaryButton } from "@/components/panel/ui";
import { DocumentCardsList } from "@/components/panel/DocumentCardsList";
import { STAGES, TIMELINE_META, todayKey } from "@/components/paciente/types";
import { TEAL } from "./types";

const STAGE_IMAGES = [
  "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1631558553280-fa082c260e15?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1544507888-56d73eb6046e?auto=format&fit=crop&w=700&q=80",
];

const STAGE_ICONS = [ScanSearch, Syringe, Leaf, Sun];

const MED_PASTELS = [
  { bg: "bg-[#FFF1B8]", text: "text-[#8A6A00]" },
  { bg: "bg-[#FFD6E5]", text: "text-[#9E2A47]" },
  { bg: "bg-[#CFEDE8]", text: "text-[#166064]" },
  { bg: "bg-[#E7E3FF]", text: "text-[#5648B8]" },
];

interface FichaPacienteSectionProps {
  t: (es: string, en: string) => string;
  isEs: boolean;
  patientFirst: string;
  openConsult: (audience: "medico" | "sanador") => void;
  saludView: "bitacora" | "medicinas" | "ficha" | "documentos";
  setSaludView: (v: "bitacora" | "medicinas" | "ficha" | "documentos") => void;
  openSheet: (sheet: string, initial?: Record<string, string>) => void;
  fp: any;
  fmtDate: (d: string) => string;
  runAction: (action: string, payload?: any, message?: string, options?: any) => Promise<any>;
  todayHabits: Record<string, boolean>;
  updateDaily: (patch: { habits?: Record<string, boolean> }) => void;
}

export function FichaPacienteSection({
  t,
  isEs,
  patientFirst,
  openConsult,
  saludView,
  setSaludView,
  openSheet,
  fp,
  fmtDate,
  runAction,
  todayHabits,
  updateDaily,
}: FichaPacienteSectionProps) {
  const [journalSearch, setJournalSearch] = useState("");
  const [timelineFilter, setTimelineFilter] = useState("todo");
  const [pendingDeleteEntry, setPendingDeleteEntry] = useState<any | null>(null);

  const meds: any[] = fp.medicamentos_y_horarios || [];
  const medCount = meds.length;
  const docCount = fp.documentos_oncologo?.length || 0;
  const journalList: any[] = fp.bitacora_clinica || [];
  const stageIdx = Math.max(0, STAGES.findIndex((s) => s.id === fp.etapa_actual));
  const activeStage = STAGES[stageIdx] || STAGES[0];
  const ActiveStageIcon = STAGE_ICONS[stageIdx] || STAGE_ICONS[0];
  const takenToday = meds.filter((m, idx) => todayHabits[`med-${m.id ?? idx}`]).length;
  const nextMed = meds.find((m, idx) => !todayHabits[`med-${m.id ?? idx}`]);

  const searchedTimeline = useMemo(() => {
    const byCat =
      timelineFilter === "todo"
        ? journalList
        : journalList.filter((e: any) => e.tipo === timelineFilter);
    const q = journalSearch.trim().toLowerCase();
    if (!q) return byCat;
    return byCat.filter((e: any) => {
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
  }, [journalList, timelineFilter, journalSearch]);

  return (
    <main className="mt-6 space-y-6 pb-12 font-sans text-[#261C14]">
      {/* ===================================================================== */}
      {/* 1. CABECERA AURA PASTEL (IDENTIDAD CUIDADOR) + 4 TARJETAS BENTO       */}
      {/* ===================================================================== */}
      <section className="animate-fade-in rounded-[32px] bg-gradient-to-br from-[#EAF6F4] via-[#F7FCFB] to-[#EEF4FF] p-5 shadow-xs ring-1 ring-[#261C14]/5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#1E747A] shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#239BA2]" />
              {t(`Cuidado 1 a 1 · ${patientFirst}`, `1-on-1 Care · ${patientFirst}`)}
            </span>
            <h2 className="mt-2.5 text-3xl font-bold leading-tight tracking-[-0.03em] text-[#261C14] sm:text-4xl">
              {t(`Acompañando la salud de `, `Supporting `)}
              <span className="font-serif italic font-normal text-[#239BA2]">
                {patientFirst}
              </span>
              {t(``, `'s health`)}
            </h2>
            <p className="mt-1 text-xs text-[#261C14]/60 sm:text-sm">
              {t(
                "Lo que registres o actualices aquí se refleja al instante en su cuenta.",
                "Everything you log or update here syncs instantly to her account."
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openConsult("sanador")}
              className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2.5 text-xs font-bold text-[#1E747A] shadow-2xs ring-1 ring-[#239BA2]/20 transition hover:bg-[#EAF6F4] active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("Resumen sanador", "Healer summary")}</span>
            </button>
            <button
              type="button"
              onClick={() => openConsult("medico")}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4DB6B0] to-[#239BA2] py-2 pl-5 pr-2 text-xs font-bold text-white shadow-[0_8px_20px_rgba(35,155,162,0.28)] transition hover:brightness-105 active:scale-95"
            >
              <span>{t("Preparar su cita", "Prepare visit")}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-white transition-transform group-hover:rotate-12">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>

        {/* 4 Tarjetas Bento Pastel idénticas a Paciente */}
        <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Bento 1: Etapa actual */}
          <div className="flex flex-col justify-between rounded-[26px] bg-white/95 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5648B8]">
                {t("Etapa", "Stage")}
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EFEAFF] text-[#5648B8]">
                <ActiveStageIcon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2">
              <p className="text-lg font-bold tracking-[-0.02em] text-[#261C14]">
                {isEs ? activeStage.es : activeStage.en}
              </p>
              <div className="mt-2.5 flex gap-1.5">
                {STAGES.map((s, i) => (
                  <span
                    key={s.id}
                    className={`h-1.5 flex-1 rounded-full ${
                      i <= stageIdx ? "bg-[#239BA2]" : "bg-[#EAF6F4]"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-[11px] font-medium text-[#261C14]/55">
                {t(`Paso ${stageIdx + 1} de ${STAGES.length}`, `Step ${stageIdx + 1} of ${STAGES.length}`)}
              </p>
            </div>
          </div>

          {/* Bento 2: Medicinas de hoy */}
          <button
            type="button"
            onClick={() => setSaludView("medicinas")}
            className="group flex flex-col justify-between rounded-[26px] bg-[#FFD6E5] p-4 text-left transition hover:brightness-97 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#9E2A47] shadow-2xs">
                <Pill className="h-4 w-4" />
              </span>
              <ChevronRight className="h-4 w-4 text-[#9E2A47]/60 transition group-hover:translate-x-0.5" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-[#9E2A47]">
                {takenToday}
                <span className="text-sm font-semibold text-[#9E2A47]/60">/{medCount}</span>
              </p>
              <p className="text-xs font-bold text-[#9E2A47]/85">
                {t("Medicinas de hoy", "Today's meds")}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-[#9E2A47]/70">
                {nextMed ? `${t("Próxima", "Next")}: ${nextMed.nombre}` : t("Todo al día", "All caught up")}
              </p>
            </div>
          </button>

          {/* Bento 3: Bitácora clínica */}
          <button
            type="button"
            onClick={() => setSaludView("bitacora")}
            className="group flex flex-col justify-between rounded-[26px] bg-[#CFEDE8] p-4 text-left transition hover:brightness-97 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#166064] shadow-2xs">
                <Sparkles className="h-4 w-4" />
              </span>
              <ChevronRight className="h-4 w-4 text-[#166064]/60 transition group-hover:translate-x-0.5" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-[#166064]">{journalList.length}</p>
              <p className="text-xs font-bold text-[#166064]/85">
                {t("Registros en bitácora", "Journal entries")}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-[#166064]/70">
                {journalList[0]?.titulo || t("Agrega una nota", "Add a note")}
              </p>
            </div>
          </button>

          {/* Bento 4: Documentos clínicos */}
          <button
            type="button"
            onClick={() => setSaludView("documentos")}
            className="group flex flex-col justify-between rounded-[26px] bg-[#FFF0B5] p-4 text-left transition hover:brightness-97 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#8A6A00] shadow-2xs">
                <FileText className="h-4 w-4" />
              </span>
              <ChevronRight className="h-4 w-4 text-[#8A6A00]/60 transition group-hover:translate-x-0.5" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-[#8A6A00]">{docCount}</p>
              <p className="text-xs font-bold text-[#8A6A00]/85">
                {t("Documentos clínicos", "Clinical documents")}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-[#8A6A00]/70">
                {fp.documentos_oncologo?.[0]?.titulo || t("Sube un archivo", "Upload a file")}
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. SELECCIÓN DE ETAPA CON TARJETAS FOTOGRÁFICAS                        */}
      {/* ===================================================================== */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#239BA2]">
              {t(`Etapa de ${patientFirst}`, `${patientFirst}'s stage`)}
            </span>
            <h3 className="mt-0.5 text-xl font-bold tracking-[-0.02em] text-[#261C14]">
              {isEs ? "¿En qué momento " : "Where is she "}
              <span className="font-serif italic font-normal text-[#239BA2]">
                {isEs ? "está?" : "right now?"}
              </span>
            </h3>
          </div>
        </div>

        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 py-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:py-1">
          {STAGES.map((s, idx) => {
            const active = s.id === fp.etapa_actual;
            const img = STAGE_IMAGES[idx % STAGE_IMAGES.length];
            const StageIcon = STAGE_ICONS[idx % STAGE_ICONS.length];
            return (
              <button
                key={s.id}
                type="button"
                onClick={() =>
                  runAction("update_patient_stage", { etapa_actual: s.id }, t(`Etapa: ${s.es}`, `Stage: ${s.en}`))
                }
                className={`group relative h-36 w-44 shrink-0 overflow-hidden rounded-[26px] text-left transition-all duration-200 focus:outline-none active:scale-[0.98] sm:w-auto ${
                  active
                    ? "z-10 scale-[1.02] ring-[3px] ring-[#239BA2] ring-offset-2 ring-offset-[#F2FAF8] shadow-[0_14px_30px_rgba(35,155,162,0.3)]"
                    : "opacity-80 saturate-[0.8] hover:opacity-100 hover:saturate-100 hover:-translate-y-0.5"
                }`}
              >
                <img
                  src={img}
                  alt={isEs ? s.es : s.en}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${
                    active
                      ? "from-[#124B4F]/92 via-[#1E747A]/45 to-transparent"
                      : "from-[#261C14]/80 via-[#261C14]/25 to-transparent"
                  }`}
                />
                <span
                  className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-2xs ${
                    active ? "bg-[#239BA2] text-white" : "bg-white/90 text-[#261C14]"
                  }`}
                >
                  {active ? (
                    <>
                      <Check className="h-3 w-3 stroke-[3]" />
                      {t("Etapa actual", "Current")}
                    </>
                  ) : (
                    t(`Paso ${idx + 1}`, `Step ${idx + 1}`)
                  )}
                </span>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span
                    className={`mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl backdrop-blur-md ${
                      active
                        ? "bg-white text-[#1E747A] shadow-sm"
                        : "bg-white/20 text-white ring-1 ring-white/40"
                    }`}
                  >
                    <StageIcon className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-bold leading-tight drop-shadow-sm">
                    {isEs ? s.es : s.en}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. PESTAÑAS EN CÁPSULA LIMPIA (IGUAL QUE EN PACIENTE)                  */}
      {/* ===================================================================== */}
      <div className="-mx-5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
        <div className="inline-flex min-w-full items-center gap-1 rounded-full bg-white p-1.5 shadow-xs ring-1 ring-[#261C14]/5 sm:min-w-0">
          {(
            [
              ["bitacora", t("Bitácora", "Journal"), journalList.length],
              ["medicinas", t("Medicinas", "Meds"), medCount],
              ["ficha", t("Ficha", "Chart"), null],
              ["documentos", t("Documentos", "Documents"), docCount],
            ] as const
          ).map(([id, label, count]) => {
            const active = saludView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSaludView(id)}
                className={`inline-flex flex-1 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition sm:flex-initial ${
                  active
                    ? "bg-gradient-to-r from-[#4DB6B0] to-[#239BA2] text-white shadow-[0_6px_16px_rgba(35,155,162,0.28)]"
                    : "text-[#261C14]/65 hover:bg-[#EAF6F4] hover:text-[#1E747A]"
                }`}
              >
                <span>{label}</span>
                {count !== null && count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      active ? "bg-white/25 text-white" : "bg-[#CFEDE8] text-[#166064]"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SUB-VISTA 1: BITÁCORA CON BUSCADOR Y FILTROS (IGUAL QUE EN PACIENTE)  */}
      {/* ===================================================================== */}
      {saludView === "bitacora" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col gap-3 rounded-[28px] bg-white px-5 py-4 shadow-xs ring-1 ring-[#261C14]/5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-[-0.02em] text-[#261C14]">
                {t(`Bitácora clínica de ${patientFirst}`, `${patientFirst}'s clinical journal`)}
              </h3>
              <p className="text-xs text-[#261C14]/60">
                {t(
                  "Registra síntomas, citas médicas y notas compartidas al instante.",
                  "Log symptoms, doctor visits, and notes synced instantly."
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1 sm:w-56 sm:flex-initial">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#261C14]/40" />
                <input
                  type="text"
                  value={journalSearch}
                  onChange={(e) => setJournalSearch(e.target.value)}
                  placeholder={t("Buscar en bitácora...", "Search journal...")}
                  className="w-full rounded-full border border-[#261C14]/10 bg-[#FAF7F2] py-2 pl-9 pr-8 text-xs text-[#261C14] placeholder:text-[#261C14]/45 focus:border-[#239BA2] focus:bg-white focus:outline-none"
                />
                {journalSearch && (
                  <button
                    type="button"
                    onClick={() => setJournalSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#261C14]/40 hover:text-[#261C14]"
                    aria-label={t("Limpiar", "Clear")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => openSheet("bitacora", { tipo: "nota", fecha: todayKey() })}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#4DB6B0] to-[#239BA2] px-4 py-2 text-xs font-bold text-white shadow-[0_6px_16px_rgba(35,155,162,0.28)] transition hover:brightness-105 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>{t("Nueva entrada", "New entry")}</span>
              </button>
            </div>
          </div>

          <div className="-mx-5 flex items-center gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
            {[
              ["todo", t("Todo", "All")],
              ["sintoma", t("Síntomas", "Symptoms")],
              ["cita", t("Citas", "Visits")],
              ["procedimiento", t("Procedimientos", "Procedures")],
              ["medicamento", t("Medicinas", "Medications")],
              ["sanador", t("Sanadores", "Healers")],
              ["nota", t("Notas", "Notes")],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTimelineFilter(id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  timelineFilter === id
                    ? "bg-gradient-to-r from-[#4DB6B0] to-[#239BA2] text-white shadow-2xs"
                    : "bg-white text-[#261C14]/65 ring-1 ring-[#261C14]/5 hover:bg-[#FAF7F2]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {searchedTimeline.length === 0 ? (
            <Card className="rounded-[28px] border border-dashed border-[#239BA2]/35 bg-white py-10 text-center text-sm text-[#261C14]/60">
              {journalSearch
                ? t("No se encontraron registros con esa búsqueda.", "No entries match your search.")
                : t("Aún no hay registros aquí. Toca «Nueva entrada» para empezar.", "No entries here yet. Tap «New entry» to begin.")}
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {searchedTimeline.map((e: any) => {
                const meta = TIMELINE_META[e.tipo] || TIMELINE_META.nota;
                return (
                  <div
                    key={e.id}
                    className="flex flex-col justify-between rounded-[26px] bg-white p-5 shadow-2xs ring-1 ring-[#261C14]/5 transition hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex min-w-0 items-start gap-3">
                          <span
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${meta.bg} text-lg`}
                          >
                            {meta.emoji}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-[#261C14]/45">
                              {fmtDate(e.fecha)} · {isEs ? meta.es : meta.en}
                            </p>
                            <p className="mt-0.5 text-sm font-bold leading-snug text-[#261C14]">
                              {e.titulo}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setPendingDeleteEntry(e)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FAF7F2] text-[#261C14]/45 transition hover:bg-[#E8809A] hover:text-white"
                          aria-label={t("Eliminar", "Delete")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {e.detalle && (
                        <p className="mt-3 text-xs leading-relaxed text-[#261C14]/70">
                          {e.detalle}
                        </p>
                      )}
                    </div>

                    <div className="mt-3.5 flex flex-wrap gap-1.5 border-t border-[#261C14]/5 pt-3">
                      {e.medico && (
                        <span className="rounded-full bg-[#EAF6F4] px-2.5 py-0.5 text-[10px] font-bold text-[#1E747A]">
                          🩺 {e.medico}
                        </span>
                      )}
                      {e.lugar && (
                        <span className="rounded-full bg-[#FAF7F2] px-2.5 py-0.5 text-[10px] font-bold text-[#261C14]/70">
                          📍 {e.lugar}
                        </span>
                      )}
                      {(e.etiquetas || []).map((tag: string) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#FCECEE] px-2.5 py-0.5 text-[10px] font-bold text-[#C94A6A]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {pendingDeleteEntry && (
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-[#261C14]/45 p-4 backdrop-blur-xs"
              onClick={() => setPendingDeleteEntry(null)}
            >
              <div
                className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FCECEE] text-[#C94A6A]">
                    <AlertTriangle className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-[#261C14]">
                      {t("¿Eliminar registro?", "Delete entry?")}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#261C14]/70">
                      {t("Estás a punto de eliminar", "You are about to delete")}{" "}
                      <span className="font-bold text-[#261C14]">“{pendingDeleteEntry.titulo}”</span>.
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPendingDeleteEntry(null)}
                    className="rounded-full bg-[#FAF7F2] px-4 py-2 text-xs font-bold text-[#261C14]/75"
                  >
                    {t("Cancelar", "Cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const idToDelete = pendingDeleteEntry.id;
                      setPendingDeleteEntry(null);
                      void runAction("delete_bitacora", { id: idToDelete }, t("Entrada eliminada", "Entry removed"));
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#C94A6A] px-4 py-2 text-xs font-bold text-white shadow-sm"
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

      {/* ===================================================================== */}
      {/* SUB-VISTA 2: MEDICINAS Y SUPLEMENTOS                                   */}
      {/* ===================================================================== */}
      {saludView === "medicinas" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-base font-bold text-[#261C14]">{t("Medicamentos", "Medications")}</h3>
                <span className="rounded-full bg-[#FCECEE] px-2.5 py-0.5 text-xs font-bold text-[#C94A6A]">
                  {meds.length}
                </span>
              </div>
              {meds.length === 0 ? (
                <Card className="rounded-[24px] text-center text-sm text-[#261C14]/60">
                  {t("Aún no hay medicinas registradas.", "No medications yet.")}
                </Card>
              ) : (
                <div className="space-y-2.5">
                  {meds.map((m: any, idx: number) => {
                    const key = `med-${m.id ?? idx}`;
                    const given = Boolean(todayHabits[key]);
                    const p = MED_PASTELS[idx % MED_PASTELS.length];
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-3 rounded-[24px] bg-white p-4 shadow-2xs ring-1 ring-[#261C14]/5"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <button
                            type="button"
                            onClick={() => updateDaily({ habits: { [key]: !given } })}
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition ${
                              given ? "bg-[#239BA2] text-white" : `${p.bg} ${p.text}`
                            }`}
                            aria-label={t("Marcar como dada", "Mark as given")}
                          >
                            {given ? <Check className="h-4 w-4" /> : <Pill className="h-4 w-4" />}
                          </button>
                          <div className="min-w-0">
                            <p className={`truncate text-sm font-bold text-[#261C14] ${given ? "line-through opacity-55" : ""}`}>
                              {m.nombre}
                            </p>
                            <p className="truncate text-xs text-[#261C14]/60">
                              {m.dosis} · {m.horario}
                              {m.indicaciones ? ` · ${m.indicaciones}` : ""}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => runAction("delete_medication", { index: idx }, t("Medicamento eliminado", "Removed"))}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FAF7F2] text-[#261C14]/45 transition hover:bg-[#E8809A] hover:text-white"
                          aria-label={t("Eliminar", "Delete")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-base font-bold text-[#261C14]">{t("Suplementos", "Supplements")}</h3>
                <span className="rounded-full bg-[#CFEDE8] px-2.5 py-0.5 text-xs font-bold text-[#166064]">
                  {fp.suplementos.length}
                </span>
              </div>
              {fp.suplementos.length === 0 ? (
                <Card className="rounded-[24px] text-center text-sm text-[#261C14]/60">
                  {t("Sin suplementos registrados.", "No supplements yet.")}
                </Card>
              ) : (
                <div className="space-y-2.5">
                  {fp.suplementos.map((s: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 rounded-[24px] bg-white p-4 shadow-2xs ring-1 ring-[#261C14]/5"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#CFEDE8] text-[#166064]">
                          <Leaf className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#261C14]">{s.nombre}</p>
                          <p className="truncate text-xs text-[#261C14]/60">
                            {s.dosis} · {s.horario}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => runAction("delete_supplement", { index: idx }, t("Suplemento eliminado", "Removed"))}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FAF7F2] text-[#261C14]/45 transition hover:bg-[#E8809A] hover:text-white"
                        aria-label={t("Eliminar", "Delete")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <PrimaryButton color={TEAL} onClick={() => openSheet("add-med", { kind: "med" })}>
            <Plus className="h-5 w-5" />
            {t("Agregar medicina o suplemento", "Add medication or supplement")}
          </PrimaryButton>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-VISTA 3: MI FICHA (3 TARJETAS BENTO PASTEL)                        */}
      {/* ===================================================================== */}
      {saludView === "ficha" && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { label: t("Historia y evolución", "History & progress"), value: fp.historia_medica, bg: "bg-[#FFD6E5]/85", text: "text-[#9E2A47]", emoji: "📖" },
              { label: t("Alergias", "Allergies"), value: fp.alergias, bg: "bg-[#FFF0B5]/85", text: "text-[#8A6A00]", emoji: "⚠️" },
              { label: t("Alimentación e hidratación", "Nutrition & hydration"), value: fp.datos_nutricionales, bg: "bg-[#CFEDE8]/85", text: "text-[#166064]", emoji: "🥗" },
            ].map((c) => (
              <div key={c.label} className={`rounded-[28px] ${c.bg} p-5`}>
                <p className={`text-xs font-bold uppercase tracking-wider ${c.text}`}>
                  {c.emoji} {c.label}
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-[#261C14]">
                  {c.value || t("Aún sin completar.", "Not filled in yet.")}
                </p>
              </div>
            ))}
          </div>
          <PrimaryButton
            color={TEAL}
            onClick={() =>
              openSheet("edit-ficha", {
                historia: fp.historia_medica || "",
                alergias: fp.alergias || "",
                nutricion: fp.datos_nutricionales || "",
              })
            }
          >
            {t("Editar ficha", "Edit chart")}
          </PrimaryButton>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-VISTA 4: DOCUMENTOS CLÍNICOS                                       */}
      {/* ===================================================================== */}
      {saludView === "documentos" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] bg-white px-5 py-4 shadow-xs ring-1 ring-[#261C14]/5">
            <div>
              <h3 className="text-lg font-bold tracking-[-0.02em] text-[#261C14]">
                {t(`Documentos de ${patientFirst}`, `${patientFirst}'s documents`)}
              </h3>
              <p className="text-xs text-[#261C14]/60">
                {t("Selecciona un documento para previsualizarlo o sube uno nuevo.", "Select a document to preview or upload a new one.")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => openSheet("add-doc", { tipo: "Receta / Indicaciones del Oncólogo" })}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4DB6B0] to-[#239BA2] px-5 py-2.5 text-xs font-bold text-white shadow-[0_6px_16px_rgba(35,155,162,0.28)] transition hover:brightness-105 active:scale-95"
            >
              <Upload className="h-4 w-4" />
              <span>{t("Subir documento", "Upload document")}</span>
            </button>
          </div>

          <DocumentCardsList
            documents={fp.documentos_oncologo}
            emptyText={t("Sube recetas o notas del oncólogo.", "Upload prescriptions or oncologist notes.")}
            onDelete={(idx) => runAction("delete_document", { index: idx }, t("Documento eliminado", "Removed"))}
            t={t}
          />
        </div>
      )}
    </main>
  );
}

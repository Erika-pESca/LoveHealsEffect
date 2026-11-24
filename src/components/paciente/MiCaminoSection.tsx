"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  ChevronRight,
  FileText,
  Leaf,
  Pencil,
  Pill,
  ScanSearch,
  Search,
  Sun,
  Syringe,
  Plus,
  Sparkles,
  Stethoscope,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Card, PrimaryButton, SectionTitle } from "@/components/panel/ui";
import { DocumentCardsList } from "@/components/panel/DocumentCardsList";
import {
  HABIT_COLORS,
  STAGES,
  TIMELINE_META,
  todayKey,
} from "./types";

const STAGE_IMAGES = [
  // Diagnóstico: consulta médica cercana
  "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=700&q=80",
  // Tratamiento: cuidado clínico oncológico
  "https://images.unsplash.com/photo-1631558553280-fa082c260e15?auto=format&fit=crop&w=700&q=80",
  // Recuperación: respiración, calma y autocuidado
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=700&q=80",
  // Post-tratamiento: bienestar, sol y nueva etapa
  "https://images.unsplash.com/photo-1544507888-56d73eb6046e?auto=format&fit=crop&w=700&q=80",
];

const STAGE_ICONS = [ScanSearch, Syringe, Leaf, Sun];

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

  const medCount = ficha.medicamentos_y_horarios?.length || 0;
  const docCount = ficha.documentos_oncologo?.length || 0;
  const stageIdx = Math.max(0, STAGES.findIndex((s) => s.id === ficha.etapa_actual));
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
      {/* Panel resumen con el lenguaje visual de la landing (crema + rosa + serif ligera) */}
      <section className="animate-fade-in relative overflow-hidden rounded-[32px] bg-[#F9F8F3] p-5 shadow-[0_18px_44px_rgba(45,43,42,0.07)] sm:p-7">
        <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[#E8809A]/[0.18] blur-[60px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-veranda-blue/[0.16] blur-[60px]" />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-cloud/35 bg-white/85 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#2D2B2A]/75 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5C8D67]" />
              {t("Mi camino", "My journey")}
            </span>
            <h2 className="mt-3 text-[28px] font-semibold leading-[1.08] tracking-[-0.03em] text-[#2D2B2A] sm:text-[36px]">
              {t("Hoy en tu ", "Today in your ")}
              <span className="font-light italic text-[#E8809A]">{t("proceso", "process")}</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => openConsult("medico")}
            className="group inline-flex items-center gap-3 rounded-full bg-[#E8809A] py-2 pl-5 pr-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(232,128,154,0.28)] transition hover:bg-veranda-blue"
          >
            <span>{t("Preparar mi cita", "Prepare my visit")}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2D2B2A] text-white transition-transform group-hover:rotate-12">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </button>
        </div>

        {/* Tarjetas intuitivas de acceso rápido */}
        <div className="relative mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Etapa + progreso */}
          <div className="rounded-[24px] bg-white p-4 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-veranda-blue">{t("Etapa", "Stage")}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FCECEE] text-[#E8809A]">
                <ActiveStageIcon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-espresso">{isEs ? activeStage.es : activeStage.en}</p>
            <div className="mt-3 flex gap-1.5">
              {STAGES.map((s, i) => (
                <span key={s.id} className={`h-1.5 flex-1 rounded-full ${i <= stageIdx ? "bg-[#E8809A]" : "bg-[#FCECEE]"}`} />
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-espresso/55">{t(`Paso ${stageIdx + 1} de ${STAGES.length}`, `Step ${stageIdx + 1} of ${STAGES.length}`)}</p>
          </div>

          {/* Medicinas */}
          <button type="button" onClick={() => setSaludView("medicinas")} className="group rounded-[24px] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FCECEE] text-[#E8809A]"><Pill className="h-4 w-4" /></span>
              <ChevronRight className="h-4 w-4 text-espresso/30 transition group-hover:translate-x-0.5 group-hover:text-[#E8809A]" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-espresso">{takenToday}<span className="text-sm font-medium text-espresso/45">/{medCount}</span></p>
            <p className="text-xs font-semibold text-espresso/65">{t("Medicinas tomadas hoy", "Meds taken today")}</p>
            <p className="mt-1 truncate text-[11px] text-espresso/50">{nextMed ? `${t("Próxima", "Next")}: ${nextMed.nombre}` : t("Sin medicinas aún", "No meds yet")}</p>
          </button>

          {/* Médicos */}
          <button type="button" onClick={() => setSaludView("medicos")} className="group rounded-[24px] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#E5F2F1] text-veranda-blue"><Stethoscope className="h-4 w-4" /></span>
              <ChevronRight className="h-4 w-4 text-espresso/30 transition group-hover:translate-x-0.5 group-hover:text-veranda-blue" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-espresso">{doctors?.length || 0}</p>
            <p className="text-xs font-semibold text-espresso/65">{t("Médicos tratantes", "Treating doctors")}</p>
            <p className="mt-1 truncate text-[11px] text-espresso/50">{doctors?.[0]?.name || t("Agrega tu oncólogo", "Add your oncologist")}</p>
          </button>

          {/* Documentos */}
          <button type="button" onClick={() => setSaludView("documentos")} className="group rounded-[24px] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F4F2E6] text-[#B8913A]"><FileText className="h-4 w-4" /></span>
              <ChevronRight className="h-4 w-4 text-espresso/30 transition group-hover:translate-x-0.5 group-hover:text-[#B8913A]" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-espresso">{docCount}</p>
            <p className="text-xs font-semibold text-espresso/65">{t("Documentos clínicos", "Clinical documents")}</p>
            <p className="mt-1 truncate text-[11px] text-espresso/50">{ficha.documentos_oncologo?.[0]?.titulo || t("Sube tu primer documento", "Upload your first document")}</p>
          </button>
        </div>

        {/* Acceso secundario para sanador */}
        <button
          type="button"
          onClick={() => openConsult("sanador")}
          className="relative mt-4 flex w-full items-center gap-3 rounded-[20px] border border-dashed border-[#E8809A]/40 bg-white/70 px-4 py-3 text-left transition hover:bg-white"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FCECEE] text-[#E8809A]"><Sparkles className="h-4 w-4" /></span>
          <span className="flex-1 text-xs text-espresso/70">
            <span className="font-bold text-espresso">{t("Resumen para mi sanador", "Summary for my healer")}</span>
            {" · "}{t("Omar, Kelsey y terapias integrativas", "Omar, Kelsey & integrative therapies")}
          </span>
          <ChevronRight className="h-4 w-4 text-espresso/30" />
        </button>
      </section>

      {/* Etapas como tarjetas con imagen (estilo tarjetas de la landing) */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-veranda-blue">
              {t("Tu etapa actual", "Your current stage")}
            </span>
            <h3 className="mt-0.5 text-xl font-semibold tracking-[-0.025em] text-espresso">
              {t("¿En qué momento estás?", "Where are you right now?")}
            </h3>
          </div>
        </div>

        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 py-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:py-1">
          {STAGES.map((s, idx) => {
            const active = s.id === ficha.etapa_actual;
            const img = STAGE_IMAGES[idx % STAGE_IMAGES.length];
            const StageIcon = STAGE_ICONS[idx % STAGE_ICONS.length];
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => runAction("update_stage", { etapa_actual: s.id }, t(`Etapa: ${s.es}`, `Stage: ${s.en}`))}
                className={`group relative h-36 w-44 shrink-0 overflow-hidden rounded-[24px] text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6748E] active:scale-[0.98] sm:w-auto ${
                  active
                    ? "z-10 scale-[1.02] ring-[3px] ring-[#E6748E] ring-offset-2 ring-offset-[#FAF7F2] shadow-[0_14px_30px_rgba(230,116,142,0.35)]"
                    : "opacity-75 saturate-[0.75] hover:opacity-100 hover:saturate-100 hover:-translate-y-0.5"
                }`}
              >
                <img src={img} alt={isEs ? s.es : s.en} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${
                    active
                      ? "from-[#8F2442]/92 via-[#C9526D]/45 to-transparent"
                      : "from-espresso/80 via-espresso/25 to-transparent"
                  }`}
                />
                <span
                  className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-sm ${
                    active
                      ? "bg-[#E6748E] text-white"
                      : "bg-white/90 text-[#2D2B2A]"
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
                        ? "bg-white text-[#C9526D] shadow-sm"
                        : "bg-white/20 text-white ring-1 ring-white/40"
                    }`}
                  >
                    <StageIcon className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-bold leading-tight drop-shadow-sm">{isEs ? s.es : s.en}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Pestañas en cápsula */}
      <div className="-mx-5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
        <div className="inline-flex min-w-full items-center gap-1 rounded-full border border-white/80 bg-white/85 p-1.5 shadow-[0_10px_28px_rgba(232,128,154,0.12)] backdrop-blur-xl sm:min-w-0">
          {([
            ["linea", t("Bitácora", "Journal"), null],
            ["medicinas", t("Medicinas", "Meds"), medCount],
            ["medicos", t("Médicos", "Doctors"), doctors?.length || 0],
            ["ficha", t("Mi ficha", "My chart"), null],
            ["documentos", t("Documentos", "Documents"), docCount],
          ] as const).map(([id, label, count]) => {
            const active = saludView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSaludView(id)}
                className={`inline-flex flex-1 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition sm:flex-initial ${
                  active
                    ? "bg-[#E8809A] text-white shadow-[0_6px_16px_rgba(232,128,154,0.35)]"
                    : "text-espresso/70 hover:text-espresso"
                }`}
              >
                <span>{label}</span>
                {count !== null && count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      active ? "bg-white/25 text-white" : "bg-[#FCECEE] text-[#D8326B]"
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

      {/* --- 1. Bitácora / línea de tiempo --- */}
      {saludView === "linea" && (
        <div className="space-y-4">
          {/* Cabecera moderna con buscador y botón Nueva entrada */}
          <div className="flex flex-col gap-3 rounded-3xl border border-white/90 bg-white/85 px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-[-0.025em] text-espresso">
                {t("Bitácora clínica y personal", "Clinical & personal journal")}
              </h3>
              <p className="text-xs text-espresso/60">
                {t(
                  "Registra síntomas, citas, procedimientos y notas compartidas con tu cuidador.",
                  "Track symptoms, visits, procedures, and notes shared with your caregiver."
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1 sm:w-56 sm:flex-initial">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-espresso/40" />
                <input
                  type="text"
                  value={journalSearch}
                  onChange={(e) => setJournalSearch(e.target.value)}
                  placeholder={t("Buscar en bitácora...", "Search journal...")}
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
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#F48EA6] via-[#E6748E] to-[#C9526D] px-4 py-2 text-xs font-bold text-white shadow-[0_8px_20px_rgba(230,116,142,0.28)] transition hover:brightness-105 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>{t("Nueva entrada", "New entry")}</span>
              </button>
            </div>
          </div>

          {/* Filtros de categoría con la paleta oficial */}
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
                    ? "bg-[#239BA2] text-white shadow-sm"
                    : "border border-espresso/10 bg-white text-espresso/70 hover:border-[#6BB1AD]/50"
                }`}
              >
                {label}
              </button>
            ))}

            {doctorFilter && (
              <button
                type="button"
                onClick={() => setDoctorFilter("")}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#E5F2F1] px-3.5 py-1.5 text-xs font-bold text-[#239BA2]"
              >
                🩺 {doctorFilter} <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Cuadrícula moderna de 2 columnas en escritorio */}
          {searchedTimeline.length === 0 ? (
            <Card className="border border-dashed border-[#6BB1AD]/35 bg-white/80 py-10 text-center text-sm text-espresso/60">
              {journalSearch
                ? t("No se encontraron registros con esa búsqueda.", "No entries match your search.")
                : t("Aún no hay registros aquí. Toca «Nueva entrada» para empezar.", "No entries here yet. Tap «New entry» to begin.")}
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              {searchedTimeline.map((e: any) => {
                const meta = TIMELINE_META[e.tipo] || TIMELINE_META.nota;
                return (
                  <div
                    key={e.id}
                    className="flex flex-col justify-between rounded-3xl border border-white/90 bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex min-w-0 items-start gap-3">
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${meta.bg} text-lg`}
                          >
                            {meta.emoji}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-espresso/50">
                              {fmtDate(e.fecha)} · {isEs ? meta.es : meta.en}
                            </p>
                            <p className="mt-0.5 text-sm font-bold leading-snug text-espresso">
                              {e.titulo}
                            </p>
                          </div>
                        </div>

                        {!e.readonly && (
                          <div className="flex shrink-0 items-center gap-1">
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
                              className="flex h-7 w-7 items-center justify-center rounded-full text-espresso/40 transition hover:bg-[#E5F2F1] hover:text-[#239BA2]"
                              aria-label={t("Editar", "Edit")}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteEntry(e)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-espresso/40 transition hover:bg-[#FCECEE] hover:text-[#C94A6A]"
                              aria-label={t("Eliminar", "Delete")}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {e.detalle && (
                        <p className="mt-2.5 text-xs leading-relaxed text-espresso/75">
                          {e.detalle}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-espresso/5 pt-2.5">
                      {e.medico && (
                        <span className="rounded-full bg-[#E5F2F1] px-2.5 py-0.5 text-[10px] font-bold text-[#239BA2]">
                          🩺 {e.medico}
                        </span>
                      )}
                      {e.lugar && (
                        <span className="rounded-full bg-[#FAF7F2] px-2.5 py-0.5 text-[10px] font-bold text-espresso/70">
                          📍 {e.lugar}
                        </span>
                      )}
                      {(e.etiquetas || []).map((tag: string) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#FDF3EF] px-2.5 py-0.5 text-[10px] font-bold text-[#C9526D]"
                        >
                          #{tag}
                        </span>
                      ))}
                      <span className="ml-auto rounded-full bg-espresso/5 px-2.5 py-0.5 text-[10px] font-semibold text-espresso/55">
                        {e.origen === "auto"
                          ? t("Automático", "Automatic")
                          : e.readonly
                            ? t("Sesión sanador", "Healer session")
                            : t("Escrito por ti", "Written by you")}
                      </span>
                    </div>
                  </div>
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

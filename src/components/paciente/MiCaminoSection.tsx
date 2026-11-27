"use client";

import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Check,
  ChevronRight,
  FileText,
  HeartPulse,
  Leaf,
  Pencil,
  Pill,
  Plus,
  ScanSearch,
  Sparkles,
  Stethoscope,
  Sun,
  Syringe,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { DocumentCardsList } from "@/components/panel/DocumentCardsList";
import { todayKey } from "./types";

const ENTRY_STYLE: Record<
  string,
  {
    es: string;
    en: string;
    icon: React.ComponentType<{ className?: string }>;
    bg: string;
    text: string;
  }
> = {
  etapa: { es: "Etapa", en: "Stage", icon: Leaf, bg: "bg-[#CFEDE8]", text: "text-[#166064]" },
  medicamento: { es: "Medicina", en: "Medication", icon: Pill, bg: "bg-[#FFD6E5]", text: "text-[#9E2A47]" },
  cita: { es: "Consulta", en: "Visit", icon: Stethoscope, bg: "bg-[#CBEFFF]", text: "text-[#147496]" },
  consulta: { es: "Consulta", en: "Visit", icon: Stethoscope, bg: "bg-[#CBEFFF]", text: "text-[#147496]" },
  procedimiento: { es: "Procedimiento", en: "Procedure", icon: Syringe, bg: "bg-[#E7E3FF]", text: "text-[#5648B8]" },
  sintoma: { es: "Cómo me sentí", en: "How I felt", icon: Activity, bg: "bg-[#FFF0B5]", text: "text-[#8A6A00]" },
  sanador: { es: "Sanador", en: "Healer", icon: HeartPulse, bg: "bg-[#FFD6E5]", text: "text-[#9E2A47]" },
  nota: { es: "Actualización", en: "Update", icon: FileText, bg: "bg-[#FAF7F2]", text: "text-[#261C14]" },
};

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
  const [showFullHistory, setShowFullHistory] = useState(false);

  const meds: any[] = ficha.medicamentos_y_horarios || [];
  const docCount = ficha.documentos_oncologo?.length || 0;
  const takenToday = meds.filter((m, idx) => todayHabits[`med-${m.id ?? idx}`]).length;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openEditFicha = () =>
    openSheet("edit-ficha", {
      historia: ficha.historia_medica || "",
      alergias: ficha.alergias || "",
      nutricion: ficha.datos_nutricionales || "",
    });

  return (
    <main className="mt-6 space-y-6 pb-24 font-sans text-[#261C14]">
      {/* ===================================================================== */}
      {/* 1. ENCABEZADO LIMPIO Y COMPACTO (MISMO ESTILO DE RECORDATORIOS/INICIO)*/}
      {/* ===================================================================== */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-[-0.03em] text-[#261C14] sm:text-4xl">
            {isEs ? "Mi ficha y " : "My chart & "}
            <span className="font-serif italic font-normal text-[#E8809A]">
              {isEs ? "mi camino" : "journey"}
            </span>
          </h2>
          <p className="mt-0.5 text-sm text-[#261C14]/60">
            {t(
              "Tu historia clínica y holística en un solo lugar para compartir sin repetir nada.",
              "Your clinical and holistic story in one place to share without repeating."
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => openConsult("sanador")}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E8809A] to-[#D85678] px-4 py-2.5 text-xs font-bold text-white shadow-[0_6px_16px_rgba(232,128,154,0.3)] transition hover:brightness-105 active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t("Resumen para sanador", "Healer summary")}</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => openConsult("medico")}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#4DB6B0] to-[#239BA2] px-4 py-2.5 text-xs font-bold text-white shadow-[0_6px_16px_rgba(35,155,162,0.28)] transition hover:brightness-105 active:scale-95"
          >
            <Stethoscope className="h-3.5 w-3.5" />
            <span>{t("Resumen para médico", "Doctor summary")}</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. ACCESOS DIRECTOS A CADA SECCIÓN                                    */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            id: "ficha-section",
            label: t("Mi ficha", "My chart"),
            sub: t("Historia, alergias y dieta", "History, allergies & diet"),
            icon: HeartPulse,
            iconBg: "bg-[#FFD6E5] text-[#9E2A47]",
            hoverRing: "hover:ring-[#E8809A]/50",
          },
          {
            id: "sentimientos-section",
            label: t("Cómo me he sentido", "How I've felt"),
            sub: t(`${visibleTimeline.length} registros`, `${visibleTimeline.length} entries`),
            icon: Activity,
            iconBg: "bg-[#FFF0B5] text-[#8A6A00]",
            hoverRing: "hover:ring-[#E8B84B]/50",
          },
          {
            id: "documentos-section",
            label: `${t("Documentos y estudios", "Documents & labs")}${docCount > 0 ? ` (${docCount})` : ""}`,
            sub: t("Subir y leer archivos", "Upload & read files"),
            icon: FileText,
            iconBg: "bg-[#E7E3FF] text-[#5648B8]",
            hoverRing: "hover:ring-[#5648B8]/40",
          },
          {
            id: "medicos-section",
            label: t("Médicos y medicinas", "Doctors & meds"),
            sub: t(
              `${doctors.length} especialistas · ${meds.length} med.`,
              `${doctors.length} specialists · ${meds.length} meds`
            ),
            icon: Stethoscope,
            iconBg: "bg-[#CFEDE8] text-[#166064]",
            hoverRing: "hover:ring-[#239BA2]/45",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              className={`group flex items-center gap-3 rounded-[22px] bg-white p-3.5 text-left shadow-2xs ring-1 ring-[#261C14]/8 transition hover:-translate-y-0.5 hover:shadow-sm ${item.hoverRing} active:scale-[0.98]`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-1 text-xs font-bold text-[#261C14]">
                  <span className="truncate">{item.label}</span>
                  <span className="shrink-0 text-[#261C14]/45 transition group-hover:translate-y-0.5 group-hover:text-[#261C14]">
                    ↓
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-[11px] font-medium text-[#261C14]/50">
                  {item.sub}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* 3. MI FICHA DE SALUD (ANCHO COMPLETO - SIN NADA AL LADO)               */}
      {/* ===================================================================== */}
      <section
        id="ficha-section"
        className="scroll-mt-6 rounded-[32px] bg-white p-6 shadow-xs ring-1 ring-[#261C14]/5 space-y-5 sm:p-7"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FCECEE] text-[#C94A6A]">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-[#261C14]">
                {t("Mi ficha de salud", "My health chart")}
              </h3>
              <p className="text-xs text-[#261C14]/55">
                {t(
                  "Edad, año de diagnóstico, tratamientos realizados, alergias y alimentación",
                  "Age, diagnosis year, treatments, allergies & nutrition"
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openEditFicha}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF6F4] px-4 py-2 text-xs font-bold text-[#1E747A] transition hover:bg-[#239BA2] hover:text-white active:scale-95"
          >
            <Pencil className="h-3.5 w-3.5" />
            {t("Editar mi ficha", "Edit my chart")}
          </button>
        </div>

        <div className="rounded-[24px] bg-[#FAF7F2] p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#261C14]/45">
            {t("Historia de mi caso", "My case story")}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#261C14]/85">
            {ficha.historia_medica ||
              t(
                "Toca «Editar mi ficha» para anotar tu edad, en qué año fuiste diagnosticada, tratamientos y lo más importante de tu proceso.",
                "Tap «Edit my chart» to note your age, diagnosis year, treatments, and key details of your journey."
              )}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div
            onClick={openEditFicha}
            className="cursor-pointer rounded-[24px] bg-[#FFF0B5] p-5 transition hover:brightness-97"
          >
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#8A6A00]">
              <AlertTriangle className="h-4 w-4" />
              {t("Alergias y cuidados", "Allergies & cautions")}
            </p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-[#261C14]">
              {ficha.alergias || t("Sin alergias registradas", "None recorded")}
            </p>
          </div>

          <div
            onClick={openEditFicha}
            className="cursor-pointer rounded-[24px] bg-[#CFEDE8] p-5 transition hover:brightness-97"
          >
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#166064]">
              <Leaf className="h-4 w-4" />
              {t("Alimentación e hidratación", "Nutrition & hydration")}
            </p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-[#261C14]">
              {ficha.datos_nutricionales || t("Sin indicaciones registradas", "No notes recorded")}
            </p>
          </div>

          <div
            onClick={() => scrollTo("medicos-section")}
            className="cursor-pointer rounded-[24px] bg-[#FFD6E5] p-5 transition hover:brightness-97"
          >
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#9E2A47]">
              <Pill className="h-4 w-4" />
              {t("Medicinas activas", "Active medications")}
            </p>
            <p className="mt-2 line-clamp-2 text-sm font-semibold leading-relaxed text-[#261C14]">
              {meds.length > 0
                ? meds.map((m) => `${m.nombre}${m.dosis ? ` (${m.dosis})` : ""}`).join(" · ")
                : t("Sin medicinas registradas", "No medications recorded")}
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. CÓMO ME HE SENTIDO (7 COLS) + MÉDICOS Y MEDICINAS (5 COLS)         */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* IZQUIERDA (7 cols): Cómo me he sentido */}
        <div className="lg:col-span-7">
          <div id="sentimientos-section" className="scroll-mt-6 h-full rounded-[32px] bg-white p-6 shadow-xs ring-1 ring-[#261C14]/5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF0B5] text-[#8A6A00]">
                  <Activity className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-[#261C14]">
                    {t("Cómo me he sentido", "How I've felt")}
                  </h3>
                  <p className="text-xs text-[#261C14]/55">
                    {t("Últimas actualizaciones y notas de tus sesiones", "Recent updates & session notes")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openSheet("bitacora", { tipo: "sintoma", fecha: todayKey() })}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E8809A] to-[#D85678] px-4 py-2 text-xs font-bold text-white shadow-2xs transition hover:brightness-105 active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("Anotar cómo estoy", "Log how I feel")}
              </button>
            </div>

            {visibleTimeline.length === 0 ? (
              <p className="rounded-2xl bg-[#FAF7F2] p-5 text-center text-xs text-[#261C14]/55">
                {t("Aún no hay registros recientes.", "No recent entries yet.")}
              </p>
            ) : (
              <div className="space-y-2.5">
                {visibleTimeline.slice(0, 4).map((e: any) => {
                  const st = ENTRY_STYLE[e.tipo] || ENTRY_STYLE.nota;
                  const Icon = st.icon;
                  return (
                    <div
                      key={e.id}
                      className="flex items-start justify-between gap-3 rounded-[22px] bg-[#FAF7F2] p-3.5"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${st.bg} ${st.text}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold text-[#239BA2]">{fmtDate(e.fecha)}</span>
                            <span className="text-[11px] font-semibold text-[#261C14]/45">· {isEs ? st.es : st.en}</span>
                          </div>
                          <p className="mt-0.5 text-sm font-bold text-[#261C14]">{e.titulo}</p>
                          {e.detalle && (
                            <p className="mt-0.5 line-clamp-2 text-xs text-[#261C14]/65">{e.detalle}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {visibleTimeline.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setShowFullHistory(true)}
                    className="flex w-full items-center justify-center gap-1 pt-1 text-xs font-bold text-[#239BA2] hover:underline"
                  >
                    {t(`Ver las ${visibleTimeline.length} actualizaciones`, `See all ${visibleTimeline.length} updates`)}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* DERECHA (5 cols): MÉDICOS + MEDICINAS */}
        <div id="medicos-section" className="scroll-mt-6 space-y-6 lg:col-span-5">
          {/* Médicos Tratantes */}
          <div className="rounded-[32px] bg-white p-6 shadow-xs ring-1 ring-[#261C14]/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#261C14]">
                  {t("Mis médicos tratantes", "My treating doctors")}
                </h3>
                <p className="text-xs text-[#261C14]/55">
                  {t("Equipo médico que sigue tu caso", "Medical team following your case")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openSheet("contacts", { rol: "Oncólogo" })}
                className="inline-flex items-center gap-1 rounded-full bg-[#EAF6F4] px-3 py-1.5 text-xs font-bold text-[#1E747A] transition hover:bg-[#239BA2] hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("Agregar", "Add")}
              </button>
            </div>

            {doctors.length === 0 ? (
              <p className="rounded-2xl bg-[#FAF7F2] p-4 text-center text-xs text-[#261C14]/55">
                {t("Agrega a tu oncólogo y médicos principales.", "Add your oncologist and main doctors.")}
              </p>
            ) : (
              <div className="space-y-2.5">
                {doctors.map((d) => (
                  <div key={d.name} className="flex items-center gap-3 rounded-2xl bg-[#FAF7F2] p-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#CFEDE8] text-sm font-bold text-[#166064]">
                      {d.name.replace(/^(dr\.?|dra\.?)\s*/i, "").charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-[#261C14]">{d.name}</p>
                      <p className="truncate text-[11px] text-[#261C14]/60">
                        {d.rol || t("Médico", "Doctor")} {d.telefono ? `· ${d.telefono}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medicinas Activas */}
          <div className="rounded-[32px] bg-white p-6 shadow-xs ring-1 ring-[#261C14]/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#261C14]">
                  {t("Medicinas activas", "Active medications")}
                </h3>
                <p className="text-xs text-[#261C14]/55">
                  {takenToday}/{meds.length} {t("tomadas hoy", "taken today")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openSheet("add-med", { kind: "med" })}
                className="inline-flex items-center gap-1 rounded-full bg-[#FCECEE] px-3 py-1.5 text-xs font-bold text-[#C94A6A] transition hover:bg-[#E8809A] hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("Agregar", "Add")}
              </button>
            </div>

            {meds.length === 0 ? (
              <p className="rounded-2xl bg-[#FAF7F2] p-4 text-center text-xs text-[#261C14]/55">
                {t("Sin medicinas registradas.", "No medications recorded.")}
              </p>
            ) : (
              <div className="space-y-2">
                {meds.map((m: any, idx: number) => {
                  const key = `med-${m.id ?? idx}`;
                  const taken = Boolean(todayHabits[key]);
                  return (
                    <div key={key} className="flex items-center justify-between gap-2 rounded-2xl bg-[#FAF7F2] p-3">
                      <button
                        type="button"
                        onClick={() => updateDaily({ habits: { [key]: !taken } })}
                        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                            taken ? "border-[#239BA2] bg-[#239BA2] text-white" : "border-[#261C14]/20 bg-white"
                          }`}
                        >
                          {taken && <Check className="h-3.5 w-3.5" />}
                        </span>
                        <div className="min-w-0">
                          <p className={`truncate text-xs font-bold text-[#261C14] ${taken ? "line-through opacity-55" : ""}`}>
                            {m.nombre}
                          </p>
                          <p className="truncate text-[10px] text-[#261C14]/55">
                            {m.dosis} · {m.horario}
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => runAction("delete_medication", { index: idx }, t("Eliminado", "Removed"))}
                        className="text-[#261C14]/30 hover:text-[#C94A6A]"
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
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. DOCUMENTOS Y ESTUDIOS (ANCHO COMPLETO DEBAJO DE CÓMO ME HE SENTIDO)*/}
      {/* ===================================================================== */}
      <section
        id="documentos-section"
        className="scroll-mt-6 rounded-[32px] bg-white p-6 shadow-xs ring-1 ring-[#261C14]/5 space-y-4 sm:p-7"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#261C14]">
              {t("Documentos y estudios", "Documents & labs")}
            </h3>
            <p className="text-xs text-[#261C14]/55">
              {t("Hospitalización, epicrisis, recetas y laboratorios (PDF, Word o foto)", "Hospital records, prescriptions & labs (PDF, Word or photo)")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => openSheet("add-doc", { tipo: "Receta / Indicaciones del Oncólogo" })}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E8809A] to-[#D85678] px-5 py-2.5 text-xs font-bold text-white shadow-2xs transition hover:brightness-105 active:scale-95"
          >
            <Upload className="h-3.5 w-3.5" />
            {t("Subir documento", "Upload document")}
          </button>
        </div>

        <DocumentCardsList
          documents={ficha.documentos_oncologo}
          emptyText={t(
            "Sube documentos de hospitalización, recetas o estudios en PDF, Word o foto.",
            "Upload hospital records, prescriptions or labs in PDF, Word or photo."
          )}
          onDelete={(idx) => runAction("delete_document", { index: idx }, t("Documento eliminado", "Removed"))}
          t={t}
        />
      </section>

      {/* MODAL HISTORIAL COMPLETO */}
      {showFullHistory && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-[#261C14]/50 p-0 backdrop-blur-xs sm:items-center sm:p-4 animate-fade-in"
          onClick={() => setShowFullHistory(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-t-[32px] bg-white p-6 shadow-2xl sm:rounded-[32px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#261C14]/5 pb-4">
              <h3 className="text-lg font-bold text-[#261C14]">
                {t("Todas las actualizaciones", "All updates")}
              </h3>
              <button type="button" onClick={() => setShowFullHistory(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF7F2]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-2.5">
              {visibleTimeline.map((e: any) => {
                const st = ENTRY_STYLE[e.tipo] || ENTRY_STYLE.nota;
                const Icon = st.icon;
                return (
                  <div key={e.id} className="flex items-start gap-3 rounded-2xl bg-[#FAF7F2] p-4">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${st.bg} ${st.text}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-[#239BA2]">
                        {fmtDate(e.fecha)} · {isEs ? st.es : st.en}
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-[#261C14]">{e.titulo}</p>
                      {e.detalle && <p className="mt-1 text-xs leading-relaxed text-[#261C14]/75">{e.detalle}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

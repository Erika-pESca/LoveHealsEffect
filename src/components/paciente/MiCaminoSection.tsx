"use client";

import React from "react";
import {
  Check,
  ChevronRight,
  FileText,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Card, PrimaryButton, SectionTitle } from "@/components/panel/ui";
import {
  HABIT_COLORS,
  STAGES,
  TIMELINE_META,
  todayKey,
} from "./types";

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
  return (
    <main className="mt-6 space-y-6">
      <div className="animate-fade-in">
        <h2 className="text-3xl font-semibold tracking-[-0.025em] leading-tight text-espresso">{t("Mi camino", "My journey")}</h2>
        <p className="mt-1 text-sm text-espresso/60">
          {t("Todo tu proceso en un solo lugar, para que nunca se te olvide nada.", "Your whole process in one place, so you never forget anything.")}
        </p>
      </div>

      {/* Etapa actual del paciente */}
      <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1">
        {STAGES.map((s) => {
          const active = s.id === ficha.etapa_actual;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => runAction("update_stage", { etapa_actual: s.id }, t(`Etapa: ${s.es}`, `Stage: ${s.en}`))}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition active:scale-95 ${
                active ? "bg-espresso text-white shadow-md" : "bg-white text-espresso/70 shadow-sm"
              }`}
            >
              <span>{s.emoji}</span>
              {isEs ? s.es : s.en}
            </button>
          );
        })}
      </div>

      {/* Preparar cita con IA */}
      <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#E4E0FA] via-[#F6E6FA] to-[#DDF1EE] p-5 shadow-sm">
        <span className="absolute -right-1 top-2 text-6xl opacity-90">📋</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-[#7A4FD1]">
          <Sparkles className="h-3 w-3" />PONO IA
        </span>
        <h3 className="mt-2 max-w-[72%] text-xl font-semibold tracking-[-0.025em] leading-tight text-espresso">
          {t("Prepara tu próxima cita sin olvidar nada", "Prepare your next visit without forgetting anything")}
        </h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openConsult("medico")}
            className="rounded-full bg-[#7A4FD1] px-4 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
          >
            🩺 {t("Para mi médico", "For my doctor")}
          </button>
          <button
            type="button"
            onClick={() => openConsult("sanador")}
            className="rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#7A4FD1] shadow-sm transition active:scale-95"
          >
            ✨ {t("Para mi sanador", "For my healer")}
          </button>
        </div>
      </div>

      {/* Subsecciones de Mi Camino */}
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {([
          ["linea", t("Bitácora", "Journal")],
          ["medicinas", t("Medicinas", "Meds")],
          ["medicos", t("Médicos", "Doctors")],
          ["ficha", t("Mi ficha", "My chart")],
          ["documentos", t("Documentos", "Documents")],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSaludView(id)}
            className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold transition ${
              saludView === id ? "bg-espresso text-white shadow" : "bg-white text-espresso/60 shadow-sm"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* --- 1. Bitácora / línea de tiempo --- */}
      {saludView === "linea" && (
        <div className="space-y-4">
          <PrimaryButton onClick={() => openSheet("bitacora", { tipo: "nota", fecha: todayKey() })}>
            <Plus className="h-5 w-5" />
            {t("Agregar a mi bitácora", "Add to my journal")}
          </PrimaryButton>

          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
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
                className={`shrink-0 rounded-full px-3.5 py-2 text-[11px] font-bold transition ${
                  timelineFilter === id ? "bg-[#7A4FD1] text-white" : "bg-white text-espresso/60 shadow-sm"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {doctorFilter && (
            <button
              type="button"
              onClick={() => setDoctorFilter("")}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#D9E8FB] px-3.5 py-1.5 text-xs font-bold text-[#3D7BD6]"
            >
              🩺 {doctorFilter} <X className="h-3 w-3" />
            </button>
          )}

          <div className="relative space-y-3 pl-1">
            {visibleTimeline.length === 0 && (
              <Card className="text-center text-sm text-espresso/60">
                {t("Aún no hay registros aquí.", "No entries here yet.")}
              </Card>
            )}
            {visibleTimeline.map((e: any) => {
              const meta = TIMELINE_META[e.tipo] || TIMELINE_META.nota;
              return (
                <div key={e.id} className="flex gap-3">
                  <span className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${meta.bg} text-lg`}>
                    {meta.emoji}
                  </span>
                  <div className="min-w-0 flex-1 rounded-3xl bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-espresso/50">
                          {fmtDate(e.fecha)} · {isEs ? meta.es : meta.en}
                        </p>
                        <p className="mt-0.5 text-sm font-bold leading-snug text-espresso">{e.titulo}</p>
                      </div>
                      {!e.readonly && (
                        <button
                          type="button"
                          onClick={() => runAction("delete_bitacora", { id: e.id }, t("Entrada eliminada", "Entry removed"))}
                          className="text-espresso/30 transition hover:text-[#C94A6A]"
                          aria-label={t("Eliminar", "Delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {e.detalle && <p className="mt-1.5 text-xs leading-relaxed text-espresso/70">{e.detalle}</p>}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {e.medico && (
                        <span className="rounded-full bg-[#D9E8FB] px-2.5 py-0.5 text-[10px] font-bold text-[#3D7BD6]">
                          🩺 {e.medico}
                        </span>
                      )}
                      {e.lugar && (
                        <span className="rounded-full bg-[#EFEAE2] px-2.5 py-0.5 text-[10px] font-bold text-espresso/70">
                          📍 {e.lugar}
                        </span>
                      )}
                      {(e.etiquetas || []).map((tag: string) => (
                        <span key={tag} className="rounded-full bg-[#FFE0D2] px-2.5 py-0.5 text-[10px] font-bold text-espresso/70">
                          {tag}
                        </span>
                      ))}
                      <span className="rounded-full bg-[#F1ECF5] px-2.5 py-0.5 text-[10px] font-bold text-[#7A4FD1]">
                        {e.origen === "ia"
                          ? `✨ ${t("Organizado por PONO", "Organized by PONO")}`
                          : e.origen === "auto"
                          ? t("Automático", "Automatic")
                          : t("Escrito por ti", "Written by you")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
        <div className="space-y-3">
          {ficha.documentos_oncologo.length === 0 && (
            <Card className="text-center text-sm text-espresso/60">
              {t("Sube recetas, laboratorios o notas de tu oncólogo.", "Upload prescriptions, labs or notes from your oncologist.")}
            </Card>
          )}
          {ficha.documentos_oncologo.map((d: any, idx: number) => (
            <div key={idx} className="flex items-start gap-3 rounded-3xl bg-white p-4 shadow-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FAD4DC] text-[#C94A6A]">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-espresso">{d.titulo}</p>
                <p className="text-xs text-espresso/55">
                  {d.tipo} · {d.fecha}
                </p>
                {d.notas && <p className="mt-1 text-xs text-espresso/75">{d.notas}</p>}
              </div>
              <button
                type="button"
                onClick={() => runAction("delete_document", { index: idx }, t("Documento eliminado", "Removed"))}
                className="text-espresso/35 transition hover:text-[#C94A6A]"
                aria-label={t("Eliminar", "Delete")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <PrimaryButton onClick={() => openSheet("add-doc", { tipo: "Receta / Indicaciones del Oncólogo" })}>
            <Upload className="h-5 w-5" />
            {t("Subir documento", "Upload document")}
          </PrimaryButton>
        </div>
      )}
    </main>
  );
}

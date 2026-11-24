"use client";

import React from "react";
import {
  Check,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { Card, PrimaryButton, SectionTitle } from "@/components/panel/ui";
import { DocumentCardsList } from "@/components/panel/DocumentCardsList";
import { HABIT_COLORS, todayKey } from "@/components/paciente/PacienteDashboard";
import { TEAL } from "./types";

interface FichaPacienteSectionProps {
  t: (es: string, en: string) => string;
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
  return (
    <main className="mt-6 space-y-6">
      <div className="animate-fade-in">
        <h2 className="text-3xl font-semibold tracking-[-0.025em] leading-tight text-espresso">
          {t(`Salud de ${patientFirst}`, `${patientFirst}'s health`)}
        </h2>
        <p className="mt-1 text-sm text-espresso/60">
          {t("Lo que actualices aquí lo ve ella al instante.", "What you update here, she sees instantly.")}
        </p>
      </div>

      {/* Preparar cita con PONO IA (para cuando el cuidador acompaña al médico o sanador) */}
      <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#CFEDE8] via-[#E8F6F3] to-[#E4E0FA] p-5 shadow-sm">
        <span className="absolute -right-1 top-2 text-6xl opacity-90">📋</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-[#239BA2]">
          <Sparkles className="h-3 w-3" />
          PONO IA · {t("Certeza en la consulta", "Certainty at the visit")}
        </span>
        <h3 className="mt-2 max-w-[74%] text-xl font-semibold tracking-[-0.025em] leading-tight text-espresso">
          {t(
            `Resumen listo de ${patientFirst} para mostrar al médico o sanador`,
            `Ready summary of ${patientFirst} to show the doctor or healer`
          )}
        </h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openConsult("medico")}
            className="rounded-full bg-[#239BA2] px-4 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
          >
            🩺 {t("Resumen para el médico", "Summary for doctor")}
          </button>
          <button
            type="button"
            onClick={() => openConsult("sanador")}
            className="rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#239BA2] shadow-sm transition active:scale-95"
          >
            ✨ {t("Resumen para el sanador", "Summary for healer")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 rounded-full bg-white p-1.5 shadow-sm">
        {([
          ["bitacora", t("Bitácora", "Journal")],
          ["medicinas", t("Medicinas", "Meds")],
          ["ficha", t("Ficha", "Chart")],
          ["documentos", t("Docs", "Docs")],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSaludView(id)}
            className={`rounded-full py-2.5 text-xs font-bold transition ${
              saludView === id ? "bg-espresso text-white shadow" : "text-espresso/60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {saludView === "bitacora" && (
        <div className="space-y-3">
          <PrimaryButton
            color={TEAL}
            onClick={() => openSheet("bitacora", { tipo: "nota", fecha: todayKey() })}
          >
            <Plus className="h-5 w-5" />
            {t("Registrar evolución o cita con PONO IA", "Log progress or visit with PONO AI")}
          </PrimaryButton>
          {(fp.bitacora_clinica || []).length === 0 && (
            <Card className="text-center text-sm text-espresso/60">
              {t(
                "Registra aquí síntomas, consultas médicas o cambios de medicación para que nunca se olvide nada.",
                "Log symptoms, doctor visits or medication changes here so nothing is ever forgotten."
              )}
            </Card>
          )}
          {(fp.bitacora_clinica || []).map((e: any) => (
            <div
              key={e.id}
              className="flex items-start justify-between gap-3 rounded-3xl bg-white p-4 shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-[#239BA2]">
                  {fmtDate(e.fecha)} · {String(e.tipo || "nota").toUpperCase()}
                </span>
                <p className="mt-0.5 text-sm font-bold text-espresso">{e.titulo}</p>
                {e.detalle && (
                  <p className="mt-1 text-xs leading-relaxed text-espresso/70">
                    {e.detalle}
                  </p>
                )}
                {e.medico && (
                  <span className="mt-1.5 inline-block rounded-full bg-[#D9E8FB] px-2.5 py-0.5 text-[10px] font-bold text-[#3D7BD6]">
                    🩺 {e.medico}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                  runAction(
                    "delete_bitacora",
                    { id: e.id },
                    t("Entrada eliminada", "Entry removed")
                  )
                }
                className="text-espresso/30 hover:text-[#C94A6A]"
                aria-label={t("Eliminar", "Delete")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {saludView === "medicinas" && (
        <div className="space-y-6">
          <div>
            <SectionTitle title={t("Medicamentos", "Medications")} />
            <div className="space-y-2.5">
              {fp.medicamentos_y_horarios.length === 0 && (
                <Card className="text-center text-sm text-espresso/60">
                  {t("Aún no hay medicinas registradas.", "No medications yet.")}
                </Card>
              )}
              {fp.medicamentos_y_horarios.map((m: any, idx: number) => {
                const key = `med-${m.id ?? idx}`;
                const given = Boolean(todayHabits[key]);
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-3 rounded-3xl ${
                      HABIT_COLORS[(idx + 1) % HABIT_COLORS.length]
                    } px-4 py-3.5`}
                  >
                    <button
                      type="button"
                      onClick={() => updateDaily({ habits: { [key]: !given } })}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition ${
                        given
                          ? "border-[#239BA2] bg-[#239BA2] text-white"
                          : "border-espresso/25 bg-white/70"
                      }`}
                      aria-label={t("Marcar como dada", "Mark as given")}
                    >
                      {given && <Check className="h-4 w-4" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-bold text-espresso ${
                          given ? "line-through opacity-60" : ""
                        }`}
                      >
                        {m.nombre}
                      </p>
                      <p className="truncate text-xs text-espresso/65">
                        {m.dosis} · {m.horario}
                        {m.indicaciones ? ` · ${m.indicaciones}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        runAction(
                          "delete_medication",
                          { index: idx },
                          t("Medicamento eliminado", "Removed")
                        )
                      }
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
            <SectionTitle title={t("Suplementos", "Supplements")} />
            <div className="space-y-2.5">
              {fp.suplementos.length === 0 && (
                <Card className="text-center text-sm text-espresso/60">
                  {t("Sin suplementos registrados.", "No supplements yet.")}
                </Card>
              )}
              {fp.suplementos.map((s: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-3xl bg-white px-4 py-3.5 shadow-sm"
                >
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
                    onClick={() =>
                      runAction(
                        "delete_supplement",
                        { index: idx },
                        t("Suplemento eliminado", "Removed")
                      )
                    }
                    className="text-espresso/35 transition hover:text-[#C94A6A]"
                    aria-label={t("Eliminar", "Delete")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <PrimaryButton color={TEAL} onClick={() => openSheet("add-med", { kind: "med" })}>
            <Plus className="h-5 w-5" />
            {t("Agregar medicina o suplemento", "Add medication or supplement")}
          </PrimaryButton>
        </div>
      )}

      {saludView === "ficha" && (
        <div className="space-y-3">
          {[
            { label: t("Historia y evolución", "History & progress"), value: fp.historia_medica, bg: "bg-[#FAD4DC]", emoji: "📖" },
            { label: t("Alergias", "Allergies"), value: fp.alergias, bg: "bg-[#FFF1B8]", emoji: "⚠️" },
            { label: t("Alimentación e hidratación", "Nutrition & hydration"), value: fp.datos_nutricionales, bg: "bg-[#D7F3EA]", emoji: "🥗" },
          ].map((c) => (
            <div key={c.label} className={`rounded-3xl ${c.bg} p-5`}>
              <p className="text-xs font-bold text-espresso/65">{c.emoji} {c.label}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-espresso">{c.value || t("Aún sin completar.", "Not filled in yet.")}</p>
            </div>
          ))}
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

      {saludView === "documentos" && (
        <div className="space-y-3">
          <DocumentCardsList
            documents={fp.documentos_oncologo}
            emptyText={t(
              "Sube recetas o notas del oncólogo.",
              "Upload prescriptions or oncologist notes."
            )}
            onDelete={(idx) =>
              runAction(
                "delete_document",
                { index: idx },
                t("Documento eliminado", "Removed")
              )
            }
            t={t}
          />
          <PrimaryButton
            color={TEAL}
            onClick={() => openSheet("add-doc", { tipo: "Receta / Indicaciones del Oncólogo" })}
          >
            <Upload className="h-5 w-5" />
            {t("Subir documento", "Upload document")}
          </PrimaryButton>
        </div>
      )}
    </main>
  );
}

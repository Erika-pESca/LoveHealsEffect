"use client";

import React from "react";
import {
  Calendar,
  Check,
  ChevronRight,
  Dumbbell,
  Flame,
  Heart,
  Pill,
  Play,
  Stethoscope,
  Users,
} from "lucide-react";
import { STAGES } from "@/components/paciente/PacienteDashboard";
import { CMOODS } from "./types";

interface InicioSectionProps {
  t: (es: string, en: string) => string;
  isEs: boolean;
  patientFirst: string;
  stage: { id: string; emoji: string; es: string; en: string };
  fc: any;
  fp: any;
  goToTab: (tab: string) => void;
  runAction: (action: string, payload?: any, message?: string, options?: any) => Promise<any>;
  currentMood: any;
  updateDaily: (patch: { mood?: string; habits?: Record<string, boolean> }) => void;
  suggested: any;
  setPlayerItem: (item: any) => void;
  setSheet: (sheet: string | null) => void;
  doneCount: number;
  habits: any[];
  progressPct: number;
  todayHabits: Record<string, boolean>;
  streak: number;
  weekDays: { key: string; letter: string; done: boolean; isToday: boolean }[];
  upcoming: any[];
  fmtDate: (d: string) => string;
}

const HABIT_PASTELS = [
  { bg: "bg-[#CFEDE8]", text: "text-[#166064]" },
  { bg: "bg-[#FFD6E5]", text: "text-[#9E2A47]" },
  { bg: "bg-[#FFF1B8]", text: "text-[#8A6A00]" },
  { bg: "bg-[#E7E3FF]", text: "text-[#5648B8]" },
];

export function InicioSection({
  t,
  isEs,
  patientFirst,
  stage,
  fc,
  fp,
  goToTab,
  runAction,
  currentMood,
  updateDaily,
  suggested,
  setPlayerItem,
  setSheet,
  doneCount,
  habits,
  progressPct,
  todayHabits,
  streak,
  weekDays,
  upcoming,
  fmtDate,
}: InicioSectionProps) {
  return (
    <main className="mt-6 space-y-6 pb-12 font-sans text-[#261C14]">
      {/* ===================================================================== */}
      {/* 1. CABECERA AURA PASTEL (CÉLULA FAMILIAR) + RACHA SEMANAL              */}
      {/* ===================================================================== */}
      <section className="animate-fade-in rounded-[32px] bg-gradient-to-br from-[#EAF6F4] via-[#FFF9F6] to-[#F3EEFF] p-6 shadow-xs ring-1 ring-[#261C14]/5">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#1E747A] shadow-2xs">
                <Heart className="h-3.5 w-3.5 text-[#239BA2]" />
                {t("Célula familiar 1 a 1", "1-to-1 family cell")}
              </span>
              {streak > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF0B5]/85 px-3 py-1 text-[11px] font-bold text-[#8A6A00]">
                  <Flame className="h-3.5 w-3.5 text-[#D97706]" />
                  {streak} {streak === 1 ? t("día cuidando", "day caring") : t("días cuidando", "days caring")}
                </span>
              )}
            </div>

            <h2 className="mt-2.5 text-2xl font-bold leading-snug tracking-[-0.02em] text-[#261C14] sm:text-3xl">
              {t(`Acompañando a `, `Supporting `)}
              <span className="font-serif italic font-normal text-[#239BA2]">
                {patientFirst}
              </span>
            </h2>
            <p className="mt-1 text-xs font-semibold text-[#261C14]/60 sm:text-sm">
              {stage.emoji} {isEs ? stage.es : stage.en} ·{" "}
              {fc?.relacion_familiar || t("Cuidador", "Caregiver")}
            </p>

            <button
              type="button"
              onClick={() => goToTab("salud-paciente")}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4DB6B0] to-[#239BA2] px-5 py-2.5 text-xs font-bold text-white shadow-[0_6px_16px_rgba(35,155,162,0.28)] transition hover:brightness-105 active:scale-95"
            >
              <Heart className="h-3.5 w-3.5" />
              {t(`Ver ficha de ${patientFirst}`, `View ${patientFirst}'s chart`)}
            </button>
          </div>

          {/* Tira semanal de 7 días */}
          <div className="flex items-center justify-between gap-2 rounded-[24px] bg-white/90 px-4 py-3 shadow-2xs sm:gap-3.5">
            {weekDays.map((d) => (
              <div key={d.key} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-[#261C14]/45">{d.letter}</span>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${
                    d.done
                      ? "bg-gradient-to-br from-[#4DB6B0] to-[#239BA2] text-white shadow-2xs"
                      : d.isToday
                        ? "border-2 border-dashed border-[#239BA2] bg-[#EAF6F4] text-[#1E747A]"
                        : "border-2 border-[#261C14]/10 bg-[#FAF7F2] text-transparent"
                  }`}
                >
                  {d.done ? <Check className="h-4 w-4" /> : "·"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. CORAZÓN DEL DÍA (2 COLUMNAS: MI DÍA DE CUIDADO + ÁNIMO CUIDADOR)  */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* IZQUIERDA (7 cols): Tareas del día de cuidado */}
        <div className="lg:col-span-7">
          <div className="h-full rounded-[32px] bg-white p-6 shadow-xs ring-1 ring-[#261C14]/5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#261C14]">
                  {t("Mi día de cuidado", "My caregiving day")}
                </h3>
                <p className="text-xs text-[#261C14]/55">
                  {doneCount} {t("de", "of")} {habits.length} {t("completadas hoy", "completed today")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => goToTab("salud-paciente")}
                className="rounded-full bg-[#EAF6F4] px-3.5 py-1.5 text-xs font-bold text-[#1E747A] transition hover:bg-[#239BA2] hover:text-white"
              >
                {t("Ver medicinas", "View meds")}
              </button>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-[#FAF7F2]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#6BB1AD] to-[#239BA2] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="space-y-2.5">
              {habits.map((h: any, i: number) => {
                const done = Boolean(todayHabits[h.key]);
                const Icon = h.icon;
                const p = HABIT_PASTELS[i % HABIT_PASTELS.length];
                return (
                  <button
                    key={h.key}
                    type="button"
                    onClick={() => updateDaily({ habits: { [h.key]: !done } })}
                    className={`flex w-full items-center justify-between gap-3 rounded-[22px] px-4 py-3 text-left transition active:scale-[0.99] ${
                      done ? "bg-[#FAF7F2]/60 opacity-65" : "bg-[#FAF7F2] hover:bg-[#F3EDE3]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${p.bg} ${p.text}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p
                          className={`truncate text-sm font-bold text-[#261C14] ${
                            done ? "line-through" : ""
                          }`}
                        >
                          {h.label}
                        </p>
                        <p className="truncate text-xs text-[#261C14]/55">{h.sub}</p>
                      </div>
                    </div>

                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${
                        done
                          ? "border-[#239BA2] bg-[#239BA2] text-white"
                          : "border-[#261C14]/20 bg-white"
                      }`}
                    >
                      {done && <Check className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* DERECHA (5 cols): Ánimo del cuidador + pausa recomendada */}
        <div className="lg:col-span-5">
          <div className="flex h-full flex-col justify-between rounded-[32px] bg-white p-6 shadow-xs ring-1 ring-[#261C14]/5 space-y-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#239BA2]">
                {t("Autocuidado", "Self-care")}
              </span>
              <h3 className="mt-0.5 text-lg font-bold text-[#261C14]">
                {t("Y tú, ¿cómo estás hoy?", "And you, how are you today?")}
              </h3>

              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {CMOODS.map((m) => {
                  const active = currentMood?.id === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => updateDaily({ mood: m.id })}
                      className={`flex flex-col items-center gap-1.5 rounded-[22px] ${m.bg} px-2 py-4 transition active:scale-95 ${
                        active
                          ? "scale-[1.03] shadow-sm ring-2 ring-[#239BA2]"
                          : "opacity-90 hover:opacity-100"
                      }`}
                    >
                      <span className={`text-2xl ${active ? "animate-pop" : ""}`}>{m.emoji}</span>
                      <span className="text-[11px] font-bold text-[#261C14]/80">
                        {isEs ? m.es : m.en}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {currentMood ? (
              <div className="space-y-3 rounded-2xl bg-[#FAF7F2] p-4 animate-fade-in">
                <p className="text-xs leading-relaxed text-[#261C14]/80">
                  {isEs ? currentMood.msgEs : currentMood.msgEn}
                </p>
                {suggested && (
                  <button
                    type="button"
                    onClick={() => {
                      setPlayerItem(suggested);
                      setSheet("player");
                    }}
                    className="flex w-full items-center justify-between gap-2 rounded-xl bg-white p-3 text-left shadow-2xs transition hover:shadow-sm"
                  >
                    <span className="truncate text-xs font-bold text-[#1E747A]">
                      {isEs ? suggested.titulo_es : suggested.titulo_en || suggested.titulo_es}
                    </span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#239BA2] text-white">
                      <Play className="h-3 w-3" />
                    </span>
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-[#FAF7F2] p-4 text-center text-xs text-[#261C14]/60">
                {t(
                  "Marca cómo te sientes para recibir una pausa breve pensada para ti.",
                  "Tap how you feel to receive a brief pause designed for you."
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. ETAPA DE LA PACIENTE + ACCESOS RÁPIDOS + PRÓXIMA CITA              */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Etapa de la paciente + Acceso rápido (7 cols) */}
        <div className="space-y-5 rounded-[32px] bg-white p-6 shadow-xs ring-1 ring-[#261C14]/5 lg:col-span-7">
          <div>
            <h3 className="text-base font-bold text-[#261C14]">
              {t(`Etapa de ${patientFirst}`, `${patientFirst}'s stage`)}
            </h3>
            <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
              {STAGES.map((s) => {
                const active = s.id === fp.etapa_actual;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      runAction(
                        "update_patient_stage",
                        { etapa_actual: s.id },
                        t(`Etapa: ${s.es}`, `Stage: ${s.en}`)
                      )
                    }
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition active:scale-95 ${
                      active
                        ? "bg-gradient-to-r from-[#4DB6B0] to-[#239BA2] text-white shadow-2xs"
                        : "bg-[#FAF7F2] text-[#261C14]/70 hover:bg-[#EAF6F4]"
                    }`}
                  >
                    <span>{s.emoji}</span>
                    {isEs ? s.es : s.en}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#261C14]/5 pt-4">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#261C14]/45">
              {t("Acceso rápido", "Quick access")}
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: t("Medicinas", "Meds"), icon: Pill, bg: "bg-[#FFD6E5]", fg: "text-[#9E2A47]", go: () => goToTab("salud-paciente") },
                { label: t("Agenda", "Agenda"), icon: Stethoscope, bg: "bg-[#CFEDE8]", fg: "text-[#166064]", go: () => goToTab("alertas") },
                { label: t("Autocuidado", "Self-care"), icon: Dumbbell, bg: "bg-[#EFEAFF]", fg: "text-[#5648B8]", go: () => goToTab("autocuidado") },
                { label: t("Círculo", "Circle"), icon: Users, bg: "bg-[#FFF0B5]", fg: "text-[#8A6A00]", go: () => goToTab("autocuidado") },
              ].map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={q.go}
                  className={`flex flex-col items-center gap-2 rounded-[22px] ${q.bg} py-4 transition hover:brightness-97 active:scale-95`}
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-white ${q.fg} shadow-2xs`}>
                    <q.icon className="h-4 w-4" />
                  </span>
                  <span className={`text-xs font-bold ${q.fg}`}>{q.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Próxima cita (5 cols) */}
        <div className="lg:col-span-5">
          <button
            type="button"
            onClick={() => goToTab("alertas")}
            className="flex h-full w-full flex-col justify-between rounded-[32px] bg-[#CFEDE8] p-6 text-left transition hover:brightness-97"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#166064] shadow-2xs">
                <Calendar className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#166064]">
                {t("Próxima cita", "Next visit")}
              </span>
            </div>

            <div className="mt-6">
              {upcoming[0] ? (
                <>
                  <p className="text-2xl font-bold text-[#166064]">
                    {upcoming[0].date.slice(8, 10)}/{upcoming[0].date.slice(5, 7)}
                  </p>
                  <p className="mt-1 text-base font-bold text-[#261C14]">{upcoming[0].title}</p>
                  <p className="mt-0.5 text-xs text-[#166064]/80">{fmtDate(upcoming[0].date)}</p>
                </>
              ) : (
                <p className="text-sm font-semibold text-[#166064]">
                  {t("Sin citas próximas. ¡Toca para agendar!", "No upcoming visits. Tap to schedule!")}
                </p>
              )}
            </div>

            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#166064]">
              <span>{t("Ir a la agenda familiar", "Go to family schedule")}</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}

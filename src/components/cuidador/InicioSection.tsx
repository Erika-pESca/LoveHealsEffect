"use client";

import React from "react";
import {
  Check,
  Dumbbell,
  Flame,
  Heart,
  Pill,
  Play,
  Stethoscope,
  Users,
} from "lucide-react";
import { Card, SectionTitle } from "@/components/panel/ui";
import { HABIT_COLORS, STAGES } from "@/components/paciente/PacienteDashboard";
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
    <main className="mt-6 space-y-7">
      {/* Tarjeta de la célula */}
      <section className="animate-fade-in">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#CFEDE8] via-[#E8F6F3] to-[#FDE3E8] p-6 shadow-[0_14px_34px_rgba(35,155,162,0.15)]">
          <span className="absolute -right-1 top-3 select-none text-7xl opacity-90">🤝</span>
          <span className="inline-block rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-[#239BA2]">
            {t("Célula familiar 1 a 1", "1-to-1 family cell")}
          </span>
          <h2 className="mt-3 max-w-[72%] text-2xl font-semibold tracking-[-0.025em] leading-tight text-espresso">
            {t(`Acompañando a ${patientFirst}`, `Supporting ${patientFirst}`)}
          </h2>
          <p className="mt-1 text-xs font-semibold text-espresso/60">
            {stage.emoji} {isEs ? stage.es : stage.en} · {fc?.relacion_familiar || t("Cuidador", "Caregiver")}
          </p>
          <button
            type="button"
            onClick={() => goToTab("salud-paciente")}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#239BA2] px-6 py-3 text-sm font-bold text-white shadow-lg transition active:scale-95"
          >
            <Heart className="h-4 w-4" />
            {t(`Ver ficha de ${patientFirst}`, `View ${patientFirst}'s chart`)}
          </button>
        </div>
      </section>

      {/* Etapa de la paciente */}
      <section>
        <SectionTitle title={t(`Etapa de ${patientFirst}`, `${patientFirst}'s stage`)} />
        <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1">
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
      </section>

      {/* Ánimo del cuidador */}
      <section>
        <SectionTitle title={t("Y tú, ¿cómo estás hoy?", "And you, how are you today?")} />
        <div className="grid grid-cols-3 gap-3">
          {CMOODS.map((m) => {
            const active = currentMood?.id === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => updateDaily({ mood: m.id })}
                className={`flex flex-col items-center gap-1.5 rounded-3xl ${m.bg} px-2 py-4 transition active:scale-95 ${
                  active ? "scale-[1.04] shadow-md ring-2 ring-[#239BA2]" : "opacity-90 hover:opacity-100"
                }`}
              >
                <span className={`text-3xl ${active ? "animate-pop" : ""}`}>{m.emoji}</span>
                <span className="text-[11px] font-bold text-espresso/80">{isEs ? m.es : m.en}</span>
              </button>
            );
          })}
        </div>
        {currentMood && (
          <div className="mt-3 animate-fade-in rounded-2xl bg-white/80 px-4 py-3 text-sm leading-relaxed text-espresso/80 shadow-sm">
            {isEs ? currentMood.msgEs : currentMood.msgEn}
            {suggested && (
              <button
                type="button"
                onClick={() => {
                  setPlayerItem(suggested);
                  setSheet("player");
                }}
                className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#239BA2]"
              >
                <Play className="h-3.5 w-3.5" />
                {isEs ? suggested.titulo_es : suggested.titulo_en || suggested.titulo_es}
              </button>
            )}
          </div>
        )}
      </section>

      {/* Tareas del día */}
      <section>
        <SectionTitle
          title={t("Mi día de cuidado", "My caregiving day")}
          action={t("Ver medicinas", "View meds")}
          onAction={() => goToTab("salud-paciente")}
        />
        <Card className="mb-3 !p-4">
          <div className="flex items-center justify-between text-xs font-bold text-espresso/70">
            <span>
              {doneCount}/{habits.length} {t("completadas", "done")}
            </span>
            <span className="text-[#239BA2]">{progressPct}%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#E3F1EF]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6BB1AD] to-[#239BA2] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </Card>
        <div className="space-y-2.5">
          {habits.map((h: any, i: number) => {
            const done = Boolean(todayHabits[h.key]);
            const Icon = h.icon;
            return (
              <button
                key={h.key}
                type="button"
                onClick={() => updateDaily({ habits: { [h.key]: !done } })}
                className={`flex w-full items-center gap-3 rounded-3xl ${
                  HABIT_COLORS[i % HABIT_COLORS.length]
                } px-4 py-3.5 text-left transition active:scale-[0.98] ${done ? "opacity-60" : ""}`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-espresso/70">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm font-bold text-espresso ${done ? "line-through" : ""}`}>
                    {h.label}
                  </span>
                  <span className="block truncate text-xs text-espresso/60">{h.sub}</span>
                </span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    done ? "border-[#239BA2] bg-[#239BA2] text-white" : "border-espresso/25 bg-white/70"
                  }`}
                >
                  {done && <Check className="h-4 w-4" />}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Racha */}
      <section>
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFE7D6] text-[#F2711C]">
              <Flame className="h-6 w-6" />
            </span>
            <div>
              <div className="text-2xl font-semibold tracking-[-0.025em] text-espresso">
                {streak} {streak === 1 ? t("día", "day") : t("días", "days")}
              </div>
              <p className="text-xs text-espresso/60">
                {streak > 0
                  ? t("Cuidarte también es cuidar. ¡Sigue así!", "Caring for yourself is caring too. Keep going!")
                  : t("Marca cómo estás o una tarea para empezar tu racha.", "Log how you feel or a task to start your streak.")}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            {weekDays.map((d) => (
              <div key={d.key} className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-bold text-espresso/45">{d.letter}</span>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs ${
                    d.done
                      ? "bg-[#239BA2] text-white"
                      : d.isToday
                      ? "border-2 border-dashed border-[#239BA2] text-[#239BA2]"
                      : "bg-[#E3F1EF] text-transparent"
                  }`}
                >
                  {d.done ? <Check className="h-4 w-4" /> : "·"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Acceso rápido */}
      <section>
        <SectionTitle title={t("Acceso rápido", "Quick access")} />
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: t("Medicinas", "Meds"), icon: Pill, bg: "bg-[#FAD4DC]", fg: "text-[#C94A6A]", go: () => goToTab("salud-paciente") },
            { label: t("Agenda", "Agenda"), icon: Stethoscope, bg: "bg-[#D7F3EA]", fg: "text-[#239BA2]", go: () => goToTab("alertas") },
            { label: t("Autocuidado", "Self-care"), icon: Dumbbell, bg: "bg-[#E4E0FA]", fg: "text-[#7A4FD1]", go: () => goToTab("autocuidado") },
            { label: t("Círculo", "Circle"), icon: Users, bg: "bg-[#FFF1B8]", fg: "text-[#B98A00]", go: () => goToTab("autocuidado") },
          ].map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={q.go}
              className="flex flex-col items-center gap-2 rounded-3xl bg-white py-4 shadow-sm transition active:scale-95"
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${q.bg} ${q.fg}`}>
                <q.icon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-bold text-espresso/75">{q.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Próxima cita */}
      <section>
        <button type="button" onClick={() => goToTab("alertas")} className="block w-full text-left">
          <Card>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#239BA2]">{t("Próxima cita", "Next visit")}</span>
            {upcoming[0] ? (
              <>
                <p className="mt-1 text-sm font-bold text-espresso">{upcoming[0].title}</p>
                <p className="text-xs text-espresso/60">{fmtDate(upcoming[0].date)}</p>
              </>
            ) : (
              <p className="mt-1 text-sm text-espresso/60">{t("Sin citas próximas. ¡Agrega una!", "No upcoming visits. Add one!")}</p>
            )}
          </Card>
        </button>
      </section>
    </main>
  );
}

"use client";

import React, { useMemo } from "react";
import {
  Bell,
  Calendar,
  Check,
  ChevronRight,
  Droplets,
  Flame,
  HeartHandshake,
  Lock,
  Pill,
  Play,
  Send,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import { inputCls } from "@/components/panel/ui";
import {
  MOODS,
  TIMELINE_META,
  todayKey,
  TYPE_META,
} from "./types";

export interface InicioSectionProps {
  briefing: any;
  briefingLoading: boolean;
  medReminders: any[];
  medsDone: number;
  medsPct: number;
  todayHabits: Record<string, boolean>;
  updateDaily: (patch: Record<string, any>) => void;
  otherReminders: any[];
  reminderIcon: Record<string, any>;
  onReminderClick: (r: any) => void;
  currentMood: any;
  chooseMood: (moodId: string, note?: string) => void;
  reco: any;
  recoItems: any[];
  canOpenItem: (item: any) => boolean;
  openResource: (item: any, can: boolean) => void;
  fv: (k: string, d?: string) => string;
  fs: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setForm: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  stage: any;
  timeline: any[];
  upcoming: any[];
  caregiver: any;
  water: number;
  streak: number;
  ficha: any;
  openSheet: (name: string, initial?: Record<string, string>) => void;
  openConsult: (audience: "medico" | "sanador") => void;
  goToTab: (tab: string) => void;
  fmtDate: (d: string) => string;
  t: (es: string, en: string) => string;
  isEs: boolean;
}

const MED_PASTELS = [
  { bg: "bg-[#FFF1B8]", text: "text-[#8A6A00]" },
  { bg: "bg-[#FFD6E5]", text: "text-[#9E2A47]" },
  { bg: "bg-[#CFEDE8]", text: "text-[#166064]" },
  { bg: "bg-[#E7E3FF]", text: "text-[#5648B8]" },
];

export function InicioSection({
  briefing,
  briefingLoading,
  medReminders,
  medsDone,
  medsPct,
  todayHabits,
  updateDaily,
  otherReminders,
  reminderIcon,
  onReminderClick,
  currentMood,
  chooseMood,
  reco,
  recoItems,
  canOpenItem,
  openResource,
  fv,
  fs,
  setForm,
  stage,
  timeline,
  upcoming,
  caregiver,
  water,
  streak,
  ficha,
  openSheet,
  openConsult,
  goToTab,
  fmtDate,
  t,
  isEs,
}: InicioSectionProps) {
  /* Tira semanal de 7 días */
  const weekDays = useMemo(() => {
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7;
    const labels = isEs
      ? ["L", "M", "M", "J", "V", "S", "D"]
      : ["M", "T", "W", "T", "F", "S", "S"];
    return labels.map((lbl, idx) => {
      const d = new Date(now);
      d.setDate(now.getDate() - dayOfWeek + idx);
      return {
        label: lbl,
        num: d.getDate(),
        isToday: idx === dayOfWeek,
        isPast: idx < dayOfWeek,
      };
    });
  }, [isEs]);

  return (
    <main className="mt-6 space-y-6 pb-12 font-sans text-[#261C14]">
      {/* ===================================================================== */}
      {/* 1. CABECERA SERENA AURA PASTEL + RACHA + SEMANA                       */}
      {/* ===================================================================== */}
      <section className="rounded-[32px] bg-gradient-to-br from-[#FFF1E6] via-[#FFF8FA] to-[#F1ECFF] p-6 shadow-xs ring-1 ring-[#261C14]/5">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#C94A6A] shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-[#E8809A]" />
                {t("PONO · Tu día", "PONO · Your day")}
              </span>
              {streak > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D9F4A5]/80 px-3 py-1 text-[11px] font-bold text-[#3A5A1C]">
                  <Flame className="h-3.5 w-3.5 text-[#D97706]" />
                  {streak} {streak === 1 ? t("día de cuidado", "day streak") : t("días de cuidado", "days streak")}
                </span>
              )}
            </div>

            <h2 className="mt-2.5 text-2xl font-bold leading-snug tracking-[-0.02em] text-[#261C14] sm:text-3xl">
              {isEs ? "Un paso suave hoy, " : "One gentle step today, "}
              <span className="font-serif italic font-normal text-[#E8809A]">
                {isEs ? "siempre acompañada." : "always supported."}
              </span>
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-[#261C14]/70">
              {briefingLoading && !briefing
                ? t("PONO está preparando tu resumen del día…", "PONO is preparing your daily summary…")
                : briefing?.message || t("Aquí tienes tus cuidados esenciales para hoy.", "Here is your essential care for today.")}
            </p>
          </div>

          {/* Tira semanal limpia */}
          <div className="flex items-center justify-between gap-2 rounded-[24px] bg-white/90 px-4 py-3 shadow-2xs sm:gap-3.5">
            {weekDays.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-[#261C14]/45">{d.label}</span>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${
                    d.isToday
                      ? "bg-gradient-to-br from-[#E8809A] to-[#D85678] text-white shadow-[0_4px_12px_rgba(232,128,154,0.35)]"
                      : d.isPast
                        ? "border-2 border-[#239BA2]/55 bg-[#EAF6F4] text-[#1E747A]"
                        : "border-2 border-[#261C14]/10 bg-[#FAF7F2] text-[#261C14]/50"
                  }`}
                >
                  {d.num}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas inteligentes (solo si existen) */}
        {(briefing?.insights || []).length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {(briefing?.insights || []).map((ins: any) => (
              <div
                key={ins.id}
                className="flex items-start gap-3 rounded-2xl bg-white/90 p-3.5 shadow-2xs"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFF1B8] text-sm">
                  💡
                </span>
                <div className="flex-1">
                  <p className="text-xs leading-relaxed text-[#261C14]/80">{ins.text}</p>
                  {ins.action && (
                    <button
                      type="button"
                      onClick={() =>
                        ins.action === "consult"
                          ? openConsult("medico")
                          : openSheet("bitacora", { tipo: "nota", fecha: todayKey() })
                      }
                      className="mt-1 text-xs font-bold text-[#C94A6A] hover:underline"
                    >
                      {ins.action === "consult"
                        ? t("Ver resumen para la cita →", "See visit summary →")
                        : t("Contarle a PONO cómo estoy →", "Tell PONO how I feel →")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===================================================================== */}
      {/* 2. CORAZÓN DEL DÍA (2 COLUMNAS ESPACIOSAS: RUTINA DIARIA + ÁNIMO)     */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* IZQUIERDA (7 cols): Medicinas de Hoy + Hidratación */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-[32px] bg-white p-6 shadow-xs ring-1 ring-[#261C14]/5 space-y-6">
            {/* Bloque Medicinas */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FCECEE] text-[#C94A6A]">
                    <Pill className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-[#261C14]">
                      {t("Tus medicinas de hoy", "Today's medications")}
                    </h3>
                    <p className="text-xs text-[#261C14]/55">
                      {medsDone} {t("de", "of")} {medReminders.length} {t("completadas", "completed")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => goToTab("alertas")}
                  className="rounded-full bg-[#FAF7F2] px-3.5 py-1.5 text-xs font-bold text-[#239BA2] transition hover:bg-[#EAF6F4]"
                >
                  {t("Administrar botiquín", "Manage kit")}
                </button>
              </div>

              {medReminders.length > 0 && (
                <div className="mt-3.5 h-2.5 overflow-hidden rounded-full bg-[#FAF7F2]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#E8809A] to-[#239BA2] transition-all duration-500"
                    style={{ width: `${medsPct}%` }}
                  />
                </div>
              )}

              <div className="mt-4 space-y-2.5">
                {medReminders.length === 0 ? (
                  <p className="rounded-2xl bg-[#FAF7F2] p-5 text-center text-xs text-[#261C14]/55">
                    {t("No tienes medicinas registradas para hoy.", "No medications scheduled for today.")}
                  </p>
                ) : (
                  medReminders.map((m: any, i: number) => {
                    const done = Boolean(todayHabits[m.key]);
                    const p = MED_PASTELS[i % MED_PASTELS.length];
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => updateDaily({ habits: { [m.key]: !done } })}
                        className={`flex w-full items-center justify-between gap-3 rounded-[22px] px-4 py-3 text-left transition active:scale-[0.99] ${
                          done ? "bg-[#FAF7F2]/60 opacity-65" : "bg-[#FAF7F2] hover:bg-[#F3EDE3]"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${p.bg} ${p.text}`}
                          >
                            <Pill className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p
                              className={`truncate text-sm font-bold text-[#261C14] ${
                                done ? "line-through" : ""
                              }`}
                            >
                              {m.label}
                            </p>
                            <p className="truncate text-xs text-[#261C14]/55">{m.sub}</p>
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
                  })
                )}
              </div>
            </div>

            {/* Bloque Hidratación con fondo azul clarito suave */}
            <div className="rounded-[24px] bg-gradient-to-br from-[#EAF6FF] via-[#E5F4FC] to-[#DEF2FA] p-4 ring-1 ring-[#63B3ED]/25 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-[#1B84B8] shadow-2xs">
                    <Droplets className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#154A66]">
                      {t("Hidratación del día", "Daily hydration")}
                    </h4>
                    <p className="text-xs text-[#154A66]/70">
                      {water}/8 {t("vasos de agua o infusión", "glasses of water or tea")}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#1B84B8] shadow-2xs">
                  {Math.round((water / 8) * 100)}%
                </span>
              </div>

              <div className="mt-3.5 flex justify-between gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => updateDaily({ water: water === i + 1 ? i : i + 1 })}
                    className={`flex h-11 flex-1 items-center justify-center rounded-2xl transition active:scale-90 ${
                      i < water
                        ? "bg-gradient-to-t from-[#239BA2] to-[#4DB8E8] text-white shadow-2xs"
                        : "bg-white/80 text-[#7CB5D2] hover:bg-white"
                    }`}
                    aria-label={`${i + 1} vasos`}
                  >
                    <Droplets className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* DERECHA (5 cols): ¿Cómo te sientes hoy? + Recomendación de PONO */}
        <div className="lg:col-span-5">
          <div className="h-full rounded-[32px] bg-white p-6 shadow-xs ring-1 ring-[#261C14]/5 flex flex-col justify-between space-y-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C94A6A]">
                {t("Reflexión diaria", "Daily check-in")}
              </span>
              <h3 className="mt-0.5 text-lg font-bold text-[#261C14]">
                {t("¿Cómo te sientes hoy?", "How are you feeling today?")}
              </h3>

              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {MOODS.map((m) => {
                  const active = currentMood?.id === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => chooseMood(m.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-[22px] ${m.bg} px-2 py-4 transition active:scale-95 ${
                        active
                          ? "scale-[1.03] shadow-sm ring-2 ring-[#E8809A]"
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

            {reco ? (
              <div className="space-y-3 rounded-2xl bg-[#FAF7F2] p-4 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E8809A] to-[#D85678] text-white">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-xs leading-relaxed text-[#261C14]/80">
                    {reco.loading
                      ? t("PONO está buscando lo mejor para ti…", "PONO is finding the best for you…")
                      : reco.message}
                  </p>
                </div>

                {recoItems.map((p: any) => {
                  const meta = TYPE_META[p.item.tipo_contenido] || TYPE_META.guia_autocuidado;
                  const Icon = meta.icon;
                  const can = canOpenItem(p.item);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => openResource(p.item, can)}
                      className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-2xs transition hover:shadow-sm"
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta.grad} text-[#261C14]/75`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-[#261C14]">
                          {isEs ? p.item.titulo_es : p.item.titulo_en || p.item.titulo_es}
                        </span>
                        <span className="block truncate text-[11px] text-[#261C14]/55">{p.reason}</span>
                      </span>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#239BA2] text-white">
                        {can ? <Play className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                  );
                })}

                {!reco.loading && (
                  <form
                    className="flex gap-2 pt-1"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (fv("note").trim()) {
                        chooseMood(reco.mood, fv("note"));
                        setForm((p) => ({ ...p, note: "" }));
                      }
                    }}
                  >
                    <input
                      className={`${inputCls} !py-2 text-xs`}
                      placeholder={t("Cuéntame un poco más…", "Tell me a bit more…")}
                      value={fv("note")}
                      onChange={fs("note")}
                    />
                    <button
                      type="submit"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#E8809A] to-[#D85678] text-white shadow-2xs"
                      aria-label={t("Enviar", "Send")}
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-[#FAF7F2] p-4 text-center text-xs text-[#261C14]/60">
                {t(
                  "Toca cómo te sientes arriba y PONO te recomendará una práctica suave para este momento.",
                  "Tap how you feel above and PONO will suggest a gentle practice for this moment."
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. COMUNIDAD + ACCESOS RÁPIDOS (2 TARJETAS GRANDES Y CLARAS)          */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Love Circle Hero (7 cols) */}
        <div className="lg:col-span-7">
          <div className="group flex h-full flex-col justify-between overflow-hidden rounded-[32px] bg-gradient-to-br from-[#F9E3EC] via-[#FDEFF4] to-[#E6F4F2] p-5 shadow-xs ring-1 ring-[#261C14]/5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
            <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-[22px] sm:h-52 sm:w-56">
              <img
                src="/img/love-circle.jpg"
                alt="Love Circle for Patients"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-[#239BA2] px-2.5 py-1 text-[10px] font-bold text-white shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                {t("En vivo · Gratis", "Live · Free")}
              </span>
            </div>

            <div className="mt-4 flex flex-col justify-between sm:mt-0">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#239BA2]">
                  Honolulu · Zoom
                </span>
                <h3 className="mt-1 font-serif text-2xl font-bold leading-snug text-[#261C14]">
                  Love Circle for Patients
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#261C14]/70 sm:text-sm">
                  {t(
                    "Un espacio abierto junto a Kelsie y Omar para respirar juntas, compartir y sentirte acompañada sin costo.",
                    "An open space with Kelsie & Omar to breathe together, share, and feel supported at zero cost."
                  )}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => openSheet("circle_rsvp")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E8809A] to-[#D85678] px-5 py-2.5 text-xs font-bold text-white shadow-[0_6px_14px_rgba(232,128,154,0.3)] transition hover:brightness-105 active:scale-95"
                >
                  <Users className="h-3.5 w-3.5" />
                  {t("Inscribirme gratis", "RSVP Free")}
                </button>
                <button
                  type="button"
                  onClick={() => goToTab("recursos")}
                  className="rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#261C14] shadow-2xs transition hover:bg-[#FAF7F2]"
                >
                  {t("Explorar recursos", "Explore resources")} →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tu Red y Camino (5 cols) */}
        <div className="lg:col-span-5">
          <div className="flex h-full flex-col justify-between rounded-[32px] bg-white p-6 shadow-xs ring-1 ring-[#261C14]/5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#261C14]">
                {t("Tu agenda y mi camino", "Schedule & my journey")}
              </h3>
              <button
                type="button"
                onClick={() => goToTab("salud")}
                className="rounded-full bg-[#EFEAFF] px-2.5 py-0.5 text-[10px] font-bold text-[#5648B8] transition hover:brightness-95"
              >
                {stage.emoji} {isEs ? stage.es : stage.en} →
              </button>
            </div>

            <div className="space-y-2">
              {/* Próxima cita */}
              <button
                type="button"
                onClick={() => goToTab("alertas")}
                className="flex w-full items-center justify-between gap-3 rounded-2xl bg-[#CFEDE8]/65 p-3 text-left transition hover:brightness-97"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#166064]">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#166064]/75">
                      {t("Próxima cita", "Next visit")}
                    </span>
                    <p className="truncate text-xs font-bold text-[#261C14]">
                      {upcoming[0] ? `${upcoming[0].title} · ${fmtDate(upcoming[0].date)}` : t("Sin citas próximas", "No upcoming visits")}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#166064]" />
              </button>

              {/* Cuidador 1 a 1 */}
              <button
                type="button"
                onClick={() => openSheet("caregiver", { correo: ficha?.correo_invitacion_cuidador || "" })}
                className="flex w-full items-center justify-between gap-3 rounded-2xl bg-[#FCECEE]/75 p-3 text-left transition hover:brightness-97"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#C94A6A]">
                    <HeartHandshake className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#C94A6A]/75">
                      {t("Cuidador 1 a 1", "1-on-1 Caregiver")}
                    </span>
                    <p className="truncate text-xs font-bold text-[#261C14]">
                      {caregiver?.linked ? `${caregiver.nombre} · ✓ ${t("Sincronizados", "Synced")}` : t("Invitar a quien te acompaña", "Invite your companion")}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#C94A6A]" />
              </button>

              {/* Último registro en Mi Camino */}
              {timeline[0] && (() => {
                const meta = TIMELINE_META[timeline[0].tipo] || TIMELINE_META.nota;
                return (
                  <button
                    type="button"
                    onClick={() => goToTab("salud")}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl bg-[#FAF7F2] p-3 text-left transition hover:bg-[#F3EDE3]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.bg} text-sm`}>
                        {meta.emoji}
                      </span>
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-[#261C14]/45">
                          {t("Último en bitácora", "Latest in journal")}
                        </span>
                        <p className="truncate text-xs font-bold text-[#261C14]">{timeline[0].titulo}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[#261C14]/35" />
                  </button>
                );
              })()}

              {/* Recordatorio / sesión extra */}
              {otherReminders.slice(0, 1).map((r: any) => {
                const Icon = reminderIcon[r.kind] || Bell;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onReminderClick(r)}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl bg-[#FAF7F2] p-3 text-left transition hover:bg-[#F3EDE3]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#239BA2]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <p className="truncate text-xs font-bold text-[#261C14]">{r.title}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[#261C14]/35" />
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => openSheet("bitacora", { tipo: "nota", fecha: todayKey() })}
                className="rounded-full bg-[#FCECEE] py-2.5 text-xs font-bold text-[#C94A6A] transition hover:bg-[#E8809A] hover:text-white active:scale-95"
              >
                + {t("Bitácora", "Journal")}
              </button>
              <button
                type="button"
                onClick={() => openConsult("medico")}
                className="inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-[#4DB6B0] to-[#239BA2] py-2.5 text-xs font-bold text-white shadow-2xs transition hover:brightness-105 active:scale-95"
              >
                <Stethoscope className="h-3.5 w-3.5" />
                {t("Preparar cita", "Prep visit")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

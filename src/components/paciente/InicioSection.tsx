"use client";

import React from "react";
import {
  Bell,
  Check,
  ChevronRight,
  Droplets,
  Flame,
  Lock,
  Play,
  Send,
  Sparkles,
} from "lucide-react";
import { Card, inputCls, SectionTitle } from "@/components/panel/ui";
import {
  HABIT_COLORS,
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
  return (
    <main className="mt-6 space-y-7">
      {/* PONO IA: recordatorios del día */}
      <section className="animate-fade-in">
        <div className="rounded-[32px] bg-gradient-to-br from-[#F6E6FA] via-white to-[#DDF1EE] p-5 shadow-[0_14px_34px_rgba(122,79,209,0.12)]">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#7A4FD1] text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7A4FD1]">
              {t("PONO IA · Tu día", "PONO AI · Your day")}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-espresso/85">
            {briefingLoading && !briefing
              ? t("PONO está preparando tu día…", "PONO is preparing your day…")
              : briefing?.message || t("Aquí tienes lo importante de hoy.", "Here's what matters today.")}
          </p>

          {/* Alertas inteligentes */}
          {(briefing?.insights || []).map((ins: any) => (
            <div key={ins.id} className="mt-3 flex items-start gap-3 rounded-2xl bg-[#FFF6D6] p-3.5">
              <span className="mt-0.5 text-lg">💡</span>
              <div className="flex-1">
                <p className="text-xs leading-relaxed text-espresso/85">{ins.text}</p>
                {ins.action && (
                  <button
                    type="button"
                    onClick={() =>
                      ins.action === "consult"
                        ? openConsult("medico")
                        : openSheet("bitacora", { tipo: "nota", fecha: todayKey() })
                    }
                    className="mt-1.5 text-xs font-bold text-[#7A4FD1] underline"
                  >
                    {ins.action === "consult"
                      ? t("Ver mi resumen para la cita", "See my appointment summary")
                      : t("Contarle a PONO cómo estoy", "Tell PONO how I am")}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Medicinas de hoy */}
          {medReminders.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-espresso/70">
                <span>💊 {t("Medicinas de hoy", "Today's medications")}</span>
                <span className="text-[#7A4FD1]">
                  {medsDone}/{medReminders.length}
                </span>
              </div>
              <div className="mb-3 h-2 overflow-hidden rounded-full bg-[#EAE2F5]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#F48EA6] to-[#7A4FD1] transition-all duration-500"
                  style={{ width: `${medsPct}%` }}
                />
              </div>
              <div className="space-y-2">
                {medReminders.map((m: any, i: number) => {
                  const done = Boolean(todayHabits[m.key]);
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => updateDaily({ habits: { [m.key]: !done } })}
                      className={`flex w-full items-center gap-3 rounded-2xl ${
                        HABIT_COLORS[i % HABIT_COLORS.length]
                      } px-4 py-3 text-left transition active:scale-[0.98] ${done ? "opacity-55" : ""}`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                          done ? "border-[#7A4FD1] bg-[#7A4FD1] text-white" : "border-espresso/25 bg-white/70"
                        }`}
                      >
                        {done && <Check className="h-4 w-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-sm font-bold text-espresso ${done ? "line-through" : ""}`}>
                          {m.label}
                        </span>
                        <span className="block truncate text-xs text-espresso/60">{m.sub}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Citas, sesiones y práctica sugerida */}
          {otherReminders.length > 0 && (
            <div className="mt-4 space-y-2">
              {otherReminders.map((r: any) => {
                const Icon = reminderIcon[r.kind] || Bell;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onReminderClick(r)}
                    className="flex w-full items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 text-left shadow-sm transition active:scale-[0.98]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1ECF5] text-[#7A4FD1]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-espresso">{r.title}</span>
                      <span className="block truncate text-xs text-espresso/60">{r.sub}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-espresso/30" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===================== CÍRCULO DE SANACIÓN GRATUITO (EN VIVO POR ZOOM) ===================== */}
      <section className="animate-fade-in">
        <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#1C2E2B] via-[#243A36] to-[#36272B] p-5 sm:p-6 text-white shadow-[0_14px_34px_rgba(28,46,43,0.22)]">
          <div className="absolute right-0 top-0 h-full w-1/2 opacity-30 pointer-events-none overflow-hidden">
            <img
              src="/img/love-circle.jpg"
              alt="Healing Circle"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative z-10 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#239BA2] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                {t("En Vivo Cada Semana", "Live Every Week")}
              </span>
              <span className="rounded-full bg-[#5C8D67] px-2 py-0.5 text-[10px] font-bold text-white">
                ✓ {t("100% Gratuito (Support)", "100% Free (Support)")}
              </span>
              <span className="text-[11px] text-white/70">
                🌴 {t("Honolulu · Zoom", "Honolulu · Zoom")}
              </span>
            </div>

            <h3 className="mt-2.5 text-xl sm:text-2xl font-semibold tracking-[-0.025em] leading-tight text-white">
              {t("Love Circle for Patients · Kelsie & Omar", "Love Circle for Patients · Kelsie & Omar")}
            </h3>
            <p className="mt-1 text-xs text-white/80 leading-relaxed line-clamp-2">
              {t(
                "Espacio abierto para cerrar la brecha (Filling The Gap): conócenos, comparte y respira en un ambiente amoroso sin costo.",
                "Open space to fill the gap: meet us, share, and breathe in a loving free setting."
              )}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openSheet("circle_rsvp")}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#239BA2] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:brightness-110 active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t("Inscribirme gratis (RSVP)", "RSVP for Free")}
              </button>
              <button
                type="button"
                onClick={() => goToTab("recursos")}
                className="rounded-full bg-white/15 backdrop-blur-md px-4 py-2 text-xs font-bold text-white transition hover:bg-white/25 active:scale-95"
              >
                {t("Ver todos los recursos gratuitos", "View all free resources")} →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Ánimo + recomendación de PONO */}
      <section>
        <SectionTitle title={t("¿Cómo te sientes hoy?", "How are you feeling today?")} />
        <div className="grid grid-cols-3 gap-3">
          {MOODS.map((m) => {
            const active = currentMood?.id === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => chooseMood(m.id)}
                className={`flex flex-col items-center gap-1.5 rounded-3xl ${m.bg} px-2 py-4 transition active:scale-95 ${
                  active ? "scale-[1.04] shadow-md ring-2 ring-[#D85678]" : "opacity-90 hover:opacity-100"
                }`}
              >
                <span className={`text-3xl ${active ? "animate-pop" : ""}`}>{m.emoji}</span>
                <span className="text-[11px] font-bold text-espresso/80">{isEs ? m.es : m.en}</span>
              </button>
            );
          })}
        </div>

        {reco && (
          <div className="mt-3 animate-fade-in space-y-3 rounded-3xl bg-white/90 p-4 shadow-sm">
            <div className="flex items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#7A4FD1] text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <p className="text-sm leading-relaxed text-espresso/85">
                {reco.loading ? t("PONO está buscando lo mejor para ti…", "PONO is finding the best for you…") : reco.message}
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
                  className="flex w-full items-center gap-3 rounded-2xl bg-[#FAF7F2] p-3 text-left transition active:scale-[0.98]"
                >
                  <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta.grad} text-espresso/70`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-espresso">{isEs ? p.item.titulo_es : p.item.titulo_en || p.item.titulo_es}</span>
                    <span className="block text-xs leading-snug text-espresso/65">{p.reason}</span>
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7A4FD1] text-white">
                    {can ? <Play className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  </span>
                </button>
              );
            })}

            {!reco.loading && (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (fv("note").trim()) {
                    chooseMood(reco.mood, fv("note"));
                    setForm((p) => ({ ...p, note: "" }));
                  }
                }}
              >
                <input
                  className={inputCls}
                  placeholder={t("¿Quieres contarme más? (ej. no pude dormir)", "Want to tell me more? (e.g. couldn't sleep)")}
                  value={fv("note")}
                  onChange={fs("note")}
                />
                <button
                  type="submit"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#7A4FD1] text-white"
                  aria-label={t("Enviar", "Send")}
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        )}
      </section>

      {/* Mi camino de un vistazo */}
      <section>
        <SectionTitle title={t("Mi camino de un vistazo", "My journey at a glance")} action={t("Ver todo", "See all")} onAction={() => goToTab("salud")} />
        <Card>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E4E0FA] px-3 py-1 text-xs font-bold text-[#7A4FD1]">
              {stage.emoji} {isEs ? stage.es : stage.en}
            </span>
            <span className="text-xs text-espresso/55">
              {timeline.length} {t("registros", "entries")}
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {timeline.length === 0 && (
              <p className="text-sm text-espresso/60">
                {t("Aún no hay registros. Cuéntale a PONO cómo vas y él lo organiza.", "No entries yet. Tell PONO how you're doing and he organizes it.")}
              </p>
            )}
            {timeline.slice(0, 3).map((e: any) => {
              const meta = TIMELINE_META[e.tipo] || TIMELINE_META.nota;
              return (
                <div key={e.id} className="flex items-center gap-3 rounded-2xl bg-[#FAF7F2] px-3 py-2.5">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.bg} text-base`}>{meta.emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-espresso">{e.titulo}</span>
                    <span className="block text-[11px] text-espresso/55">{fmtDate(e.fecha)}</span>
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => openSheet("bitacora", { tipo: "nota", fecha: todayKey() })}
              className="rounded-full bg-[#FCECEE] py-2.5 text-xs font-bold text-[#C94A6A] transition active:scale-95"
            >
              + {t("Agregar a mi bitácora", "Add to my journal")}
            </button>
            <button
              type="button"
              onClick={() => openConsult("medico")}
              className="rounded-full bg-[#7A4FD1] py-2.5 text-xs font-bold text-white transition active:scale-95"
            >
              ✨ {t("Preparar mi cita", "Prepare my visit")}
            </button>
          </div>
        </Card>
      </section>

      {/* Próxima cita + cuidador */}
      <section className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => goToTab("alertas")} className="text-left">
          <Card className="h-full">
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
        <button type="button" onClick={() => openSheet("caregiver", { correo: ficha.correo_invitacion_cuidador || "" })} className="text-left">
          <Card className="h-full">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C94A6A]">{t("Mi cuidador", "My caregiver")}</span>
            {caregiver.linked ? (
              <>
                <p className="mt-1 text-sm font-bold text-espresso">{caregiver.nombre}</p>
                <p className="text-xs text-[#2A5C35]">✓ {t("Sincronizados 1 a 1", "Synced 1-to-1")}</p>
              </>
            ) : (
              <p className="mt-1 text-sm text-espresso/60">{t("Invita a quien te acompaña", "Invite who supports you")}</p>
            )}
          </Card>
        </button>
      </section>

      {/* Agua + racha */}
      <section className="space-y-3">
        <Card>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D9E8FB] text-[#3D7BD6]">
              <Droplets className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-espresso">{t("Hidratación", "Hydration")}</h3>
              <p className="text-xs text-espresso/55">{water}/8 {t("vasos", "glasses")}</p>
            </div>
          </div>
          <div className="mt-3 flex justify-between gap-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => updateDaily({ water: water === i + 1 ? i : i + 1 })}
                className={`flex h-10 flex-1 items-center justify-center rounded-xl transition active:scale-90 ${
                  i < water ? "bg-[#9CC3F4] text-white" : "bg-[#EEF3FA] text-[#9CB3D6]"
                }`}
                aria-label={`${i + 1}`}
              >
                <Droplets className="h-4 w-4" />
              </button>
            ))}
          </div>
        </Card>
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
                  ? t("¡Cuidarte cada día suma! Sigue así.", "Caring for yourself adds up! Keep going.")
                  : t("Marca tu ánimo o una medicina para empezar tu racha.", "Log your mood or a medication to start your streak.")}
              </p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}

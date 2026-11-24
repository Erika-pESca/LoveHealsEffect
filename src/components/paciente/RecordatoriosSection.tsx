"use client";

import React, { useMemo, useState } from "react";
import {
  Bell,
  Calendar,
  CalendarHeart,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Droplets,
  ExternalLink,
  HeartHandshake,
  MapPin,
  Moon,
  Pill,
  Plus,
  RefreshCw,
  Sparkles,
  Stethoscope,
  Sun,
  Sunrise,
  Trash2,
  Users,
  Video,
  X,
} from "lucide-react";
import { Card, inputCls, PrimaryButton } from "@/components/panel/ui";
import { MiniCalendar, todayKey } from "@/components/paciente/PacienteDashboard";

interface RecordatoriosSectionProps {
  t: (es: string, en: string) => string;
  isEs: boolean;
  ficha?: any;
  caregiver?: any;
  medReminders: any[];
  medsDone?: number;
  medsPct?: number;
  water?: number;
  otherReminders: any[];
  todayHabits: Record<string, boolean>;
  updateDaily: (patch: { habits?: Record<string, boolean>; water?: number }) => void;
  onReminderClick: (reminder: any) => void;
  reminderIcon: Record<string, any>;
  marks: Record<string, { med: number; ses: number }>;
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  eventsByDay: Record<string, any[]>;
  upcoming?: any[];
  healerSessions?: any[];
  fmtDate: (dayKey: string) => string;
  runAction: (action: string, payload?: any, msg?: string, options?: any) => Promise<any>;
  openSheet: (sheet: string, initial?: Record<string, string>) => void;
  goToTab?: (tab: string) => void;
  healers: any[];
}

type ViewBlock = "resumen" | "medicinas" | "citas" | "sesiones";

/** Clasifica cada medicina/suplemento en Mañana, Mediodía/Tarde o Noche según el horario escrito. */
function slotOf(text: string): "manana" | "tarde" | "noche" {
  const s = text.toLowerCase();
  if (/(noche|dormir|cena|pm|20:|21:|22:|night|bed|dinner|evening)/.test(s)) return "noche";
  if (/(mediod|tarde|almuerzo|12:|13:|14:|15:|16:|17:|lunch|afternoon|noon)/.test(s)) return "tarde";
  return "manana";
}

export function RecordatoriosSection({
  t,
  isEs,
  ficha,
  caregiver,
  medReminders,
  medsDone = 0,
  medsPct = 0,
  water = 0,
  todayHabits,
  updateDaily,
  marks,
  selectedDay,
  setSelectedDay,
  eventsByDay,
  upcoming = [],
  healerSessions = [],
  fmtDate,
  runAction,
  openSheet,
  goToTab,
  healers,
}: RecordatoriosSectionProps) {
  const [block, setBlock] = useState<ViewBlock>("resumen");
  const [detailEvent, setDetailEvent] = useState<any | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [copied, setCopied] = useState(false);

  /* ---------------- Medicinas + Suplementos unificados para hoy ---------------- */
  const dailyMedsAndSupps = useMemo(() => {
    const meds = (ficha?.medicamentos_y_horarios || []).map((m: any, i: number) => ({
      key: `med-${m.id ?? i}`,
      index: i,
      kind: "medicamento" as const,
      nombre: m.nombre,
      dosis: m.dosis || "",
      horario: m.horario || (isEs ? "Mañana" : "Morning"),
      indicaciones: m.indicaciones || "",
      slot: slotOf(`${m.horario || ""} ${m.indicaciones || ""}`),
    }));
    const supps = (ficha?.suplementos || []).map((s: any, i: number) => ({
      key: `supp-${i}`,
      index: i,
      kind: "suplemento" as const,
      nombre: s.nombre,
      dosis: s.dosis || "",
      horario: s.horario || (isEs ? "Con comidas" : "With meals"),
      indicaciones: "",
      slot: slotOf(s.horario || ""),
    }));
    return meds.length > 0 || supps.length > 0
      ? [...meds, ...supps]
      : medReminders.map((m: any, i: number) => ({
          key: m.key,
          index: i,
          kind: "medicamento" as const,
          nombre: m.label,
          dosis: String(m.sub || "").split("·")[0]?.trim() || "",
          horario: String(m.sub || "").split("·")[1]?.trim() || "",
          indicaciones: "",
          slot: slotOf(m.sub || ""),
        }));
  }, [ficha, medReminders, isEs]);

  const totalDailyDone = dailyMedsAndSupps.filter((item) => Boolean(todayHabits[item.key])).length;
  const totalDailyPct = dailyMedsAndSupps.length
    ? Math.round((totalDailyDone / dailyMedsAndSupps.length) * 100)
    : medsPct;

  /* ---------------- Citas médicas ordenadas ---------------- */
  const medicalVisits = useMemo(() => {
    const raw = Array.isArray(ficha?.citas_medicas) ? ficha.citas_medicas : [];
    return raw
      .map((c: any, idx: number) => ({
        kind: "med" as const,
        idx,
        title: c.titulo,
        date: String(c.fecha || "").slice(0, 10),
        hora: c.hora || "09:30 AM",
        lugar: c.lugar || "",
        medico: c.medico || "",
        notas: c.notas || "",
        sub: `${c.hora || ""}${c.hora && c.lugar ? " · " : ""}${c.lugar || ""}`.trim(),
      }))
      .sort((a: any, b: any) => a.date.localeCompare(b.date));
  }, [ficha]);

  /* ---------------- Sesiones con sanadores y Love Circles reservados ---------------- */
  const activeBookings = useMemo(() => {
    return (healerSessions || [])
      .filter((s: any) => s.estado_cita !== "cancelada")
      .map((s: any) => {
        const raw = String(s.fecha_sesion || "");
        const date = raw.slice(0, 10);
        const hora = raw.includes("T") ? raw.slice(11, 16) : "18:00";
        const isCircle = /circle|círculo/i.test(String(s.enlace_o_lugar || ""));
        return {
          kind: "ses" as const,
          sessionId: s.id,
          sample: Boolean(s.sample),
          isCircle,
          title: s.enlace_o_lugar || "Sesión Love Heals Effect",
          date,
          hora: `${hora} HST`,
          modalidad: s.modalidad || "online",
          estado: s.estado_cita || "programada",
          gratis: Boolean(s.es_sesion_gratuita_mensual),
          zoomUrl: s.zoom_url || "https://zoom.us/j/lovehealseffect-circle",
          sub:
            s.modalidad === "presencial"
              ? isEs
                ? "Presencial en Honolulu, O'ahu"
                : "In person in Honolulu, O'ahu"
              : isEs
                ? "En línea · Zoom en vivo"
                : "Online · Live Zoom",
        };
      })
      .sort((a: any, b: any) => a.date.localeCompare(b.date));
  }, [healerSessions, isEs]);

  /* ---------------- Sugerencias automáticas preventivas (CERO mención a IA) ---------------- */
  const nextVisit = medicalVisits.find((v: any) => v.date >= todayKey()) || medicalVisits[0];
  const nextBooking = activeBookings.find((b: any) => b.date >= todayKey()) || activeBookings[0];

  const openDetail = (ev: any) => {
    setDetailEvent(ev);
    setRescheduleDate(ev.date || todayKey());
    setRescheduleTime(ev.hora?.replace(" HST", "") || "10:00 AM");
    setCopied(false);
  };

  const selectedDayEvents = eventsByDay[selectedDay] || [];

  const SLOTS = [
    {
      id: "manana" as const,
      icon: Sunrise,
      labelEs: "Mañana",
      labelEn: "Morning",
      accent: "text-[#D97706] bg-[#FEF3C7]",
    },
    {
      id: "tarde" as const,
      icon: Sun,
      labelEs: "Mediodía y tarde",
      labelEn: "Midday & afternoon",
      accent: "text-[#239BA2] bg-[#CFEDE8]",
    },
    {
      id: "noche" as const,
      icon: Moon,
      labelEs: "Noche y descanso",
      labelEn: "Evening & rest",
      accent: "text-[#7A4FD1] bg-[#EAE2F5]",
    },
  ];

  return (
    <main className="mt-6 space-y-6 pb-10">
      {/* ===================== 1. ENCABEZADO + SINCRONIZACIÓN 1 A 1 CON CUIDADOR ===================== */}
      <section className="animate-fade-in space-y-4">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8809A]/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#C94A6A]">
              <Bell className="h-3.5 w-3.5" />
              {t("Agenda y Cuidado Compartido 1 a 1", "Shared 1-on-1 Care Schedule")}
            </span>
            <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#2D2B2A] sm:text-4xl">
              {isEs ? "Tus recordatorios y " : "Your reminders & "}
              <span className="font-light italic text-[#E8809A]">
                {isEs ? "acompañamiento diario." : "daily accompaniment."}
              </span>
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-espresso/65">
              {t(
                "Organiza tus medicinas, citas médicas y sesiones con sanadores en un solo lugar, sincronizado automáticamente con quien te cuida.",
                "Organize your medications, medical visits, and healer sessions in one place, automatically synced with your caregiver."
              )}
            </p>
          </div>

          {/* Botones rápidos superiores */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openSheet("add-cita", { fecha: selectedDay, hora: "09:30 AM" })}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#239BA2] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-105 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              {t("Nueva cita médica", "New medical visit")}
            </button>
            <button
              type="button"
              onClick={() =>
                openSheet("book", {
                  healer: String(healers[0]?.id ?? ""),
                  modalidad: "online",
                  fecha: selectedDay,
                  gratis: "1",
                })
              }
              className="inline-flex items-center gap-1.5 rounded-full bg-[#E8809A] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-105 active:scale-95"
            >
              <CalendarHeart className="h-4 w-4" />
              {t("Reservar con sanador", "Book with healer")}
            </button>
          </div>
        </div>

        {/* Tarjeta de Sincronización 1 a 1 Paciente ↔ Cuidador */}
        <div className="flex flex-col justify-between gap-3 rounded-[26px] border border-[#239BA2]/20 bg-gradient-to-r from-[#EAF6F4] via-white to-[#FFF5EE] p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#239BA2] text-white shadow-sm">
              <HeartHandshake className="h-6 w-6" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-espresso">
                  {caregiver?.linked
                    ? t(` Agenda compartida 1 a 1 con ${caregiver.nombre}`, `1-on-1 schedule synced with ${caregiver.nombre}`)
                    : t("Sincroniza tu agenda 1 a 1 con tu cuidador", "Sync your schedule 1-on-1 with your caregiver")}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    caregiver?.linked
                      ? "bg-[#5C8D67]/15 text-[#2A5C35]"
                      : "bg-[#FFF1B8] text-[#8A6A00]"
                  }`}
                >
                  {caregiver?.linked
                    ? `✓ ${t("Activo en tiempo real", "Live sync active")}`
                    : t("Invitación disponible", "Invite available")}
                </span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-espresso/65">
                {caregiver?.linked
                  ? t(
                      `${caregiver.relacion || "Tu acompañante"} recibe visibilidad automática de tus próximas citas médicas, horarios de medicinas y Love Circles.`,
                      `${caregiver.relacion || "Your caregiver"} automatically sees your upcoming medical visits, medication schedule, and Love Circles.`
                    )
                  : t(
                      "Cuando vinculas a tu familiar o acompañante, ambos ven las mismas citas, tomas del día y recordatorios preventivos sin tener que repetir información.",
                      "When you link your family caregiver, you both see the same visits, daily meds, and preventive reminders effortlessly."
                    )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              openSheet("caregiver", { correo: ficha?.correo_invitacion_cuidador || "" })
            }
            className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#239BA2] shadow-sm ring-1 ring-[#239BA2]/25 transition hover:bg-[#239BA2] hover:text-white"
          >
            {caregiver?.linked
              ? t("Ver vínculo familiar", "View family link")
              : t("Vincular cuidador", "Link caregiver")}
          </button>
        </div>
      </section>

      {/* ===================== 2. PESTAÑAS INTEGRADAS POR BLOQUES ===================== */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
        {(
          [
            {
              id: "resumen" as const,
              label: t("✨ Todo integrado", "✨ All-in-one"),
              badge: null,
            },
            {
              id: "medicinas" as const,
              label: t("💊 Hoy: Medicinas y hábitos", "💊 Today: Meds & habits"),
              badge: `${totalDailyDone}/${dailyMedsAndSupps.length}`,
            },
            {
              id: "citas" as const,
              label: t("🩺 Citas médicas", "🩺 Medical visits"),
              badge: String(medicalVisits.length),
            },
            {
              id: "sesiones" as const,
              label: t("🌺 Sesiones y Love Circles", "🌺 Sessions & Love Circles"),
              badge: String(activeBookings.length),
            },
          ]
        ).map((tab) => {
          const active = block === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setBlock(tab.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition active:scale-95 ${
                active
                  ? "bg-espresso text-white shadow-md"
                  : "bg-white text-espresso/70 shadow-sm hover:bg-espresso/5"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    active ? "bg-white/20 text-white" : "bg-[#FAF7F2] text-espresso/65"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================================================================== */}
      {/*  BLOQUE 1: VISTA INTEGRAL (2 COLUMNAS EN ESCRITORIO)               */}
      {/* ================================================================== */}
      {block === "resumen" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 animate-fade-in">
          {/* Columna Izquierda (7 cols): Hoy (Medicinas + Hidratación) + Sugerencias preventivas */}
          <div className="space-y-5 lg:col-span-7">
            {/* Tarjeta de Tomas y Hábitos de Hoy */}
            <Card className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#C94A6A]">
                    {t("Planificador de hoy", "Today's planner")}
                  </span>
                  <h3 className="text-xl font-semibold tracking-[-0.02em] text-espresso">
                    {t("Medicinas, suplementos y cuidado diario", "Medications, supplements & daily care")}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => openSheet("add-med", { kind: "med" })}
                  className="inline-flex items-center gap-1 rounded-full bg-[#FCECEE] px-3.5 py-1.5 text-xs font-bold text-[#C94A6A] transition hover:bg-[#E8809A] hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("Agregar", "Add")}
                </button>
              </div>

              {/* Barra de progreso */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-espresso/70">
                  <span>
                    {totalDailyDone} {t("de", "of")} {dailyMedsAndSupps.length}{" "}
                    {t("completados hoy", "completed today")}
                  </span>
                  <span className="text-[#239BA2]">{totalDailyPct}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[#FAF7F2]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#E8809A] to-[#239BA2] transition-all duration-500"
                    style={{ width: `${totalDailyPct}%` }}
                  />
                </div>
              </div>

              {/* Lista resumida interactiva por horario */}
              <div className="space-y-2">
                {dailyMedsAndSupps.slice(0, 5).map((m) => {
                  const done = Boolean(todayHabits[m.key]);
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => updateDaily({ habits: { [m.key]: !done } })}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition ${
                        done ? "bg-[#EAF6F4]/70 opacity-70" : "bg-[#FAF7F2] hover:bg-[#F4EFE6]"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                          done
                            ? "border-[#239BA2] bg-[#239BA2] text-white"
                            : "border-espresso/25 bg-white"
                        }`}
                      >
                        {done && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <Pill className="h-4 w-4 shrink-0 text-[#C94A6A]" />
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-sm font-semibold text-espresso ${done ? "line-through" : ""}`}>
                          {m.nombre} {m.dosis && <span className="font-normal text-espresso/60">· {m.dosis}</span>}
                        </span>
                        <span className="block truncate text-xs text-espresso/55">{m.horario}</span>
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-espresso/60">
                        {done ? t("Tomada", "Taken") : t("Marcar", "Mark")}
                      </span>
                    </button>
                  );
                })}
                {dailyMedsAndSupps.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setBlock("medicinas")}
                    className="w-full pt-1 text-center text-xs font-bold text-[#C94A6A] hover:underline"
                  >
                    {t(`Ver las ${dailyMedsAndSupps.length} tomas por horario (Mañana / Tarde / Noche) →`, `See all ${dailyMedsAndSupps.length} items by time of day →`)}
                  </button>
                )}
              </div>

              {/* Hidratación rápida */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F2FAF9] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Droplets className="h-5 w-5 text-[#239BA2]" />
                  <div>
                    <p className="text-xs font-bold text-espresso">
                      {t("Hidratación suave del día", "Gentle daily hydration")}
                    </p>
                    <p className="text-[11px] text-espresso/60">
                      {water}/8 {t("vasos de agua o infusión", "glasses of water or herbal tea")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => updateDaily({ water: idx + 1 === water ? idx : idx + 1 })}
                      className={`h-6 w-3.5 rounded-full transition ${
                        idx < water ? "bg-[#239BA2]" : "bg-[#239BA2]/20 hover:bg-[#239BA2]/40"
                      }`}
                      aria-label={`${idx + 1} vasos`}
                    />
                  ))}
                </div>
              </div>
            </Card>

            {/* Recordatorios preventivos y sugerencias automáticas de la plataforma */}
            <Card className="space-y-3 bg-gradient-to-br from-[#FFF9F2] via-white to-[#F6F3FF]">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E8809A]/20 text-[#C94A6A]">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#C94A6A]">
                    {t("Acompañamiento preventivo automático", "Automatic preventive reminders")}
                  </span>
                  <h3 className="text-base font-semibold text-espresso">
                    {t("Sugerencias para tu semana", "Suggestions for your week")}
                  </h3>
                </div>
              </div>

              <div className="space-y-2.5">
                {nextVisit && (
                  <button
                    type="button"
                    onClick={() => openDetail(nextVisit)}
                    className="flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left shadow-sm transition hover:shadow-md"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#D7F3EA] text-[#239BA2]">
                      <Stethoscope className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#239BA2]">
                        {t("Próximo control médico", "Next medical visit")} · {fmtDate(nextVisit.date)}
                      </span>
                      <span className="block truncate text-sm font-semibold text-espresso">{nextVisit.title}</span>
                      <span className="block truncate text-xs text-espresso/60">
                        {nextVisit.notas || nextVisit.sub}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-espresso/35" />
                  </button>
                )}

                {nextBooking && (
                  <button
                    type="button"
                    onClick={() => openDetail(nextBooking)}
                    className="flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left shadow-sm transition hover:shadow-md"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FCECEE] text-[#C94A6A]">
                      <Users className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#C94A6A]">
                        {t("Reserva confirmada", "Confirmed booking")} · {fmtDate(nextBooking.date)}
                      </span>
                      <span className="block truncate text-sm font-semibold text-espresso">{nextBooking.title}</span>
                      <span className="block truncate text-xs text-espresso/60">{nextBooking.sub}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-espresso/35" />
                  </button>
                )}

                {goToTab && (
                  <button
                    type="button"
                    onClick={() => goToTab("recursos")}
                    className="flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left shadow-sm transition hover:shadow-md"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF5DA] text-[#B98A00]">
                      <CalendarHeart className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-espresso">
                        {t("Explorar próximos Love Circles gratuitos", "Explore upcoming free Love Circles")}
                      </span>
                      <span className="block text-xs text-espresso/60">
                        {t("Inscríbete sola o junto a tu cuidador a los encuentros del mes", "Sign up solo or with your caregiver for this month's circles")}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-espresso/35" />
                  </button>
                )}
              </div>
            </Card>
          </div>

          {/* Columna Derecha (5 cols): Calendario interactivo + Agenda del día + Próximas fechas */}
          <div className="space-y-5 lg:col-span-5">
            <Card>
              <MiniCalendar
                marks={marks}
                selected={selectedDay}
                onSelect={setSelectedDay}
                isEs={isEs}
              />
            </Card>

            {/* Eventos del día seleccionado */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-espresso/45">
                    {t("Día seleccionado", "Selected day")}
                  </span>
                  <h3 className="text-base font-semibold capitalize text-espresso">
                    {fmtDate(selectedDay)}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => openSheet("add-cita", { fecha: selectedDay, hora: "10:00 AM" })}
                  className="rounded-full bg-[#FAF7F2] px-3 py-1.5 text-xs font-bold text-[#239BA2] transition hover:bg-[#EAF6F4]"
                >
                  + {t("Agendar aquí", "Add here")}
                </button>
              </div>

              {selectedDayEvents.length === 0 ? (
                <p className="rounded-2xl bg-[#FAF7F2] p-4 text-xs leading-relaxed text-espresso/60">
                  {t(
                    "No tienes citas ni sesiones este día. Toca un día marcado en el calendario o revisa tus próximas fechas abajo. 🌿",
                    "No visits or sessions on this day. Tap a marked day on the calendar or see your upcoming dates below. 🌿"
                  )}
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map((ev: any, i: number) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => openDetail(ev)}
                      className="flex w-full items-center gap-3 rounded-2xl bg-[#FAF7F2] p-3 text-left transition hover:bg-[#F3EEE6]"
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          ev.kind === "med"
                            ? "bg-[#D7F3EA] text-[#239BA2]"
                            : "bg-[#FCECEE] text-[#C94A6A]"
                        }`}
                      >
                        {ev.kind === "med" ? (
                          <Stethoscope className="h-5 w-5" />
                        ) : (
                          <CalendarHeart className="h-5 w-5" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-espresso">{ev.title}</span>
                        <span className="block truncate text-xs text-espresso/60">{ev.sub}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-espresso/35" />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Próximos eventos cercanos siempre visibles */}
            {upcoming.length > 0 && (
              <Card className="space-y-2.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#239BA2]">
                  {t("Próximos en tu calendario", "Coming up on your calendar")}
                </span>
                {upcoming.slice(0, 4).map((ev: any, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedDay(ev.date);
                      openDetail(ev);
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl border border-espresso/5 bg-[#FAF7F2]/60 p-3 text-left transition hover:bg-[#FAF7F2]"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${
                        ev.kind === "med"
                          ? "bg-[#D7F3EA] text-[#1E747A]"
                          : "bg-[#FCECEE] text-[#C94A6A]"
                      }`}
                    >
                      {ev.date.slice(8, 10)}/{ev.date.slice(5, 7)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-espresso">{ev.title}</span>
                      <span className="block truncate text-xs text-espresso/55">
                        {fmtDate(ev.date)} · {ev.sub}
                      </span>
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-espresso/65 shadow-sm">
                      {t("Ver", "View")}
                    </span>
                  </button>
                ))}
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/*  BLOQUE 2: MEDICINAS Y SUPLEMENTOS POR MOMENTO DEL DÍA             */}
      {/* ================================================================== */}
      {block === "medicinas" && (
        <section className="space-y-5 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[26px] bg-white p-5 shadow-sm">
            <div>
              <h3 className="text-xl font-semibold tracking-[-0.02em] text-espresso">
                {t("Horario diario de medicinas y suplementos", "Daily medication & supplement schedule")}
              </h3>
              <p className="text-xs text-espresso/60">
                {t(
                  "Marca cada toma realizada. Tu progreso se guarda automáticamente en tu registro del día.",
                  "Check off each dose taken. Your progress is automatically saved to your daily log."
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openSheet("add-med", { kind: "med" })}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#E8809A] px-4 py-2 text-xs font-bold text-white shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("Nueva medicina", "New medication")}
              </button>
              <button
                type="button"
                onClick={() => openSheet("add-med", { kind: "supp" })}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF7F2] px-4 py-2 text-xs font-bold text-espresso"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("Nuevo suplemento", "New supplement")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {SLOTS.map((s) => {
              const Icon = s.icon;
              const items = dailyMedsAndSupps.filter((m) => m.slot === s.id);
              return (
                <Card key={s.id} className="flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${s.accent}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {isEs ? s.labelEs : s.labelEn}
                      </span>
                      <span className="text-xs font-semibold text-espresso/45">
                        {items.filter((i) => todayHabits[i.key]).length}/{items.length}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2.5">
                      {items.length === 0 ? (
                        <p className="rounded-2xl bg-[#FAF7F2] p-4 text-xs text-espresso/50">
                          {t("Sin tomas asignadas en este horario.", "No doses scheduled for this time.")}
                        </p>
                      ) : (
                        items.map((m) => {
                          const done = Boolean(todayHabits[m.key]);
                          return (
                            <div
                              key={m.key}
                              className={`rounded-2xl border p-3.5 transition ${
                                done
                                  ? "border-[#239BA2]/30 bg-[#EAF6F4]/50"
                                  : "border-espresso/5 bg-[#FAF7F2]"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <button
                                  type="button"
                                  onClick={() => updateDaily({ habits: { [m.key]: !done } })}
                                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                                    done
                                      ? "border-[#239BA2] bg-[#239BA2] text-white"
                                      : "border-espresso/25 bg-white"
                                  }`}
                                >
                                  {done && <Check className="h-3.5 w-3.5" />}
                                </button>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className={`text-sm font-semibold text-espresso ${done ? "line-through opacity-70" : ""}`}>
                                      {m.nombre}
                                    </span>
                                    {m.dosis && (
                                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#C94A6A]">
                                        {m.dosis}
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-0.5 text-xs text-espresso/65">{m.horario}</p>
                                  {m.indicaciones && (
                                    <p className="mt-1 text-[11px] text-espresso/55">{m.indicaciones}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* ================================================================== */}
      {/*  BLOQUE 3: CITAS MÉDICAS Y CONTROLES                               */}
      {/* ================================================================== */}
      {block === "citas" && (
        <section className="space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[26px] bg-white p-5 shadow-sm">
            <div>
              <h3 className="text-xl font-semibold tracking-[-0.02em] text-espresso">
                {t("Citas médicas, controles y laboratorios", "Medical visits, checkups & labs")}
              </h3>
              <p className="text-xs text-espresso/60">
                {t(
                  "Toca cualquier cita para ver sus indicaciones, reprogramarla o compartir detalles con tu cuidador.",
                  "Tap any appointment to see notes, reschedule, or coordinate with your caregiver."
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => openSheet("add-cita", { fecha: selectedDay, hora: "09:30 AM" })}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#239BA2] px-4 py-2.5 text-xs font-bold text-white shadow-sm"
            >
              <Plus className="h-4 w-4" />
              {t("Agendar cita médica", "Add medical visit")}
            </button>
          </div>

          {medicalVisits.length === 0 ? (
            <Card className="py-10 text-center text-sm text-espresso/60">
              {t("Aún no tienes citas médicas registradas. 🌿", "No medical visits scheduled yet. 🌿")}
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {medicalVisits.map((c: any) => (
                <div
                  key={`${c.idx}-${c.date}`}
                  className="flex flex-col justify-between rounded-[26px] bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D7F3EA] px-3 py-1 text-[11px] font-bold text-[#1E747A]">
                        <Stethoscope className="h-3.5 w-3.5" />
                        {fmtDate(c.date)} · {c.hora}
                      </span>
                      <span className="text-[11px] font-semibold text-[#5C8D67]">
                        ✓ {t("Visible para cuidador", "Visible to caregiver")}
                      </span>
                    </div>
                    <h4 className="mt-3 text-lg font-semibold leading-snug tracking-[-0.015em] text-espresso">
                      {c.title}
                    </h4>
                    {c.lugar && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-espresso/65">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#239BA2]" />
                        <span>{c.lugar}</span>
                      </p>
                    )}
                    {c.notas && (
                      <p className="mt-2 rounded-2xl bg-[#FAF7F2] p-3 text-xs leading-relaxed text-espresso/75">
                        📋 {c.notas}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-espresso/5 pt-3">
                    <button
                      type="button"
                      onClick={() => openDetail(c)}
                      className="text-xs font-bold text-[#239BA2] hover:underline"
                    >
                      {t("Ver ficha / Reprogramar", "Details / Reschedule")} →
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        runAction(
                          "delete_medical_appointment",
                          { index: c.idx },
                          t("Cita médica eliminada", "Medical visit removed")
                        )
                      }
                      className="text-espresso/35 transition hover:text-[#C94A6A]"
                      aria-label={t("Eliminar", "Delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ================================================================== */}
      {/*  BLOQUE 4: SESIONES CON SANADORES Y LOVE CIRCLES RESERVADOS        */}
      {/* ================================================================== */}
      {block === "sesiones" && (
        <section className="space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[26px] bg-white p-5 shadow-sm">
            <div>
              <h3 className="text-xl font-semibold tracking-[-0.02em] text-espresso">
                {t("Mis reservas: Sesiones 1 a 1 y Love Circles", "My bookings: 1-on-1 Sessions & Love Circles")}
              </h3>
              <p className="text-xs text-espresso/60">
                {t(
                  "Accede a tu enlace directo de Zoom, revisa tus confirmaciones o reprograma tu horario.",
                  "Access your direct Zoom link, check confirmations, or reschedule your session."
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  openSheet("book", {
                    healer: String(healers[0]?.id ?? ""),
                    modalidad: "online",
                    fecha: selectedDay,
                    gratis: "1",
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-full bg-[#E8809A] px-4 py-2.5 text-xs font-bold text-white shadow-sm"
              >
                <Plus className="h-4 w-4" />
                {t("Reservar con sanador", "Book with healer")}
              </button>
              <button
                type="button"
                onClick={() => openSheet("circle_rsvp")}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF7F2] px-4 py-2.5 text-xs font-bold text-espresso"
              >
                <Users className="h-4 w-4 text-[#239BA2]" />
                {t("Inscribirme a Love Circle", "Join a Love Circle")}
              </button>
            </div>
          </div>

          {activeBookings.length === 0 ? (
            <Card className="py-10 text-center text-sm text-espresso/60">
              {t("Aún no tienes sesiones ni Love Circles reservados. 🌿", "No sessions or Love Circles booked yet. 🌿")}
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {activeBookings.map((b: any) => (
                <div
                  key={`${b.sessionId}-${b.date}`}
                  className="flex flex-col justify-between rounded-[26px] bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FCECEE] px-3 py-1 text-[11px] font-bold text-[#C94A6A]">
                        {b.isCircle ? <Users className="h-3.5 w-3.5" /> : <CalendarHeart className="h-3.5 w-3.5" />}
                        {fmtDate(b.date)} · {b.hora}
                      </span>
                      <span className="rounded-full bg-[#5C8D67]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#2A5C35]">
                        ✓ {b.gratis ? t("Incluida gratis", "Included free") : t("Confirmada", "Confirmed")}
                      </span>
                    </div>

                    <h4 className="mt-3 text-lg font-semibold leading-snug tracking-[-0.015em] text-espresso">
                      {b.title}
                    </h4>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-espresso/65">
                      <Video className="h-3.5 w-3.5 text-[#239BA2]" />
                      <span>{b.sub}</span>
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-espresso/5 pt-3">
                    {b.modalidad === "online" && (
                      <a
                        href={b.zoomUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#239BA2] px-3.5 py-1.5 text-xs font-bold text-white transition hover:brightness-105"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {t("Abrir Zoom", "Open Zoom")}
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => openDetail(b)}
                      className="text-xs font-bold text-[#C94A6A] hover:underline"
                    >
                      {t("Ver detalles / Reprogramar", "Details / Reschedule")} →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ================================================================== */}
      {/*  MODAL INTERACTIVO DE DETALLE / REPROGRAMACIÓN DE CITA O SESIÓN    */}
      {/* ================================================================== */}
      {detailEvent && (
        <div className="fixed inset-0 z-[65] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button
            type="button"
            aria-label={t("Cerrar", "Close")}
            onClick={() => setDetailEvent(null)}
            className="absolute inset-0 bg-espresso/50 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-t-[32px] bg-white p-6 shadow-2xl animate-sheet-up sm:rounded-[32px]">
            <div className="flex items-start justify-between gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                  detailEvent.kind === "med"
                    ? "bg-[#D7F3EA] text-[#1E747A]"
                    : "bg-[#FCECEE] text-[#C94A6A]"
                }`}
              >
                {detailEvent.kind === "med" ? (
                  <Stethoscope className="h-3.5 w-3.5" />
                ) : (
                  <CalendarHeart className="h-3.5 w-3.5" />
                )}
                {detailEvent.kind === "med"
                  ? t("Cita médica", "Medical visit")
                  : t("Sesión / Love Circle", "Session / Love Circle")}
              </span>
              <button
                type="button"
                onClick={() => setDetailEvent(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF7F2] text-espresso/70 hover:bg-[#FCECEE]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="mt-3 text-xl font-semibold leading-snug tracking-[-0.02em] text-espresso">
              {detailEvent.title}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[#239BA2]">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {fmtDate(detailEvent.date)}
                {detailEvent.hora ? ` · ${detailEvent.hora}` : ""}
              </span>
            </p>

            {detailEvent.lugar && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-espresso/70">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#C94A6A]" />
                <span>{detailEvent.lugar}</span>
              </p>
            )}

            {detailEvent.notas && (
              <div className="mt-3 rounded-2xl bg-[#FAF7F2] p-3.5 text-xs leading-relaxed text-espresso/80">
                <strong className="block font-bold text-espresso">
                  {t("Indicaciones y notas:", "Notes & preparation:")}
                </strong>
                {detailEvent.notas}
              </div>
            )}

            {/* Si es sesión online, acceso rápido al enlace de Zoom */}
            {detailEvent.kind === "ses" && detailEvent.modalidad !== "presencial" && (
              <div className="mt-3 rounded-2xl border border-[#239BA2]/20 bg-[#EAF6F4]/70 p-3.5">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#1E747A]">
                  {t("Acceso a tu sesión virtual", "Virtual session access")}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    href={detailEvent.zoomUrl || "https://zoom.us/j/lovehealseffect-circle"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#239BA2] px-4 py-2 text-xs font-bold text-white shadow-sm"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t("Entrar a Zoom", "Join Zoom")}
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        detailEvent.zoomUrl || "https://zoom.us/j/lovehealseffect-circle"
                      );
                      setCopied(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-espresso shadow-sm"
                  >
                    {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-[#5C8D67]" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? t("Enlace copiado", "Link copied") : t("Copiar enlace", "Copy link")}
                  </button>
                </div>
              </div>
            )}

            {/* Reprogramar fecha */}
            <div className="mt-4 rounded-2xl bg-[#FAF7F2] p-4 space-y-2.5">
              <p className="flex items-center gap-1.5 text-xs font-bold text-espresso">
                <RefreshCw className="h-3.5 w-3.5 text-[#239BA2]" />
                {t("¿Necesitas reprogramar la fecha?", "Need to reschedule?")}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className={inputCls}
                />
                <input
                  type="text"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  placeholder="10:00 AM"
                  className={inputCls}
                />
              </div>
              <PrimaryButton
                color="from-[#4DB6B0] to-[#239BA2]"
                onClick={async () => {
                  if (detailEvent.kind === "med") {
                    await runAction(
                      "update_medical_appointment",
                      { index: detailEvent.idx, fecha: rescheduleDate, hora: rescheduleTime },
                      t("Cita reprogramada y sincronizada con tu cuidador", "Visit rescheduled & synced with your caregiver")
                    );
                  } else {
                    await runAction(
                      "reschedule_healer_session",
                      { id: detailEvent.sessionId, fecha_sesion: `${rescheduleDate}T18:00:00-10:00` },
                      t("Sesión reprogramada con éxito", "Session rescheduled")
                    );
                  }
                  setSelectedDay(rescheduleDate);
                  setDetailEvent(null);
                }}
              >
                <Clock className="h-4 w-4" />
                {t("Guardar nueva fecha", "Save new date")}
              </PrimaryButton>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-espresso/50">
                ✓ {t("Sincronizado con tu célula familiar 1 a 1", "Synced with your 1-on-1 family cell")}
              </span>
              <button
                type="button"
                onClick={async () => {
                  if (detailEvent.kind === "med") {
                    await runAction(
                      "delete_medical_appointment",
                      { index: detailEvent.idx },
                      t("Cita eliminada", "Visit removed")
                    );
                  } else {
                    await runAction(
                      "cancel_healer_session",
                      { id: detailEvent.sessionId },
                      t("Reserva cancelada", "Booking cancelled")
                    );
                  }
                  setDetailEvent(null);
                }}
                className="font-bold text-[#C94A6A] hover:underline"
              >
                {detailEvent.kind === "med"
                  ? t("Eliminar cita", "Delete visit")
                  : t("Cancelar reserva", "Cancel booking")}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

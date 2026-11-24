"use client";

import React, { useMemo, useState } from "react";
import {
  Bell,
  Calendar,
  CalendarHeart,
  Check,
  ChevronRight,
  Clock,
  ExternalLink,
  HeartHandshake,
  MapPin,
  Moon,
  Pill,
  Plus,
  Sparkles,
  Stethoscope,
  Sun,
  Sunrise,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Card, PrimaryButton } from "@/components/panel/ui";
import { MiniCalendar } from "@/components/paciente/PacienteDashboard";
import { todayKey } from "./types";

interface RecordatoriosSectionProps {
  t: (es: string, en: string) => string;
  isEs: boolean;
  ficha?: any;
  caregiver?: any;
  healerSessions?: any[];
  medReminders: any[];
  otherReminders: any[];
  todayHabits: Record<string, boolean>;
  updateDaily: (patch: { habits?: Record<string, boolean> }) => void;
  onReminderClick: (reminder: any) => void;
  reminderIcon: Record<string, any>;
  marks: Record<string, { med: number; ses: number; cir?: number }>;
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  eventsByDay: Record<string, any[]>;
  fmtDate: (dayKey: string) => string;
  runAction: (action: string, payload?: any, msg?: string, options?: any) => Promise<any>;
  openSheet: (sheet: string, initial?: Record<string, string>) => void;
  openConsult?: (audience: "medico" | "sanador") => void;
  goToTab?: (tab: string) => void;
  healers: any[];
}

interface AgendaEvent {
  id: string;
  kind: "med" | "ses" | "cir";
  idx?: number;
  date: string;
  time: string;
  title: string;
  place: string;
  notes?: string;
  host?: string;
  iso?: string;
  free?: boolean;
}

/** Eventos comunitarios gratuitos del mes visibles también en el calendario. */
const COMMUNITY_CIRCLE_DATES = [
  {
    id: "cir-1",
    date: "2026-11-29",
    iso: "2026-11-29T18:00:00-10:00",
    time: "06:00 PM HST",
    titleEs: "Love Circle: Respirar en paz y soltar tensión",
    titleEn: "Love Circle: Breathe in peace, release tension",
    placeEs: "Zoom en vivo o presencial en Honolulu",
    placeEn: "Live Zoom or in-person Honolulu",
    notesEs: "Encuentro 100% gratuito de respiración suave y compañía con Kelsie y Omar.",
    notesEn: "100% free gentle breathwork & companionship circle with Kelsie & Omar.",
    host: "Kelsie Reynolds & Omar Melero",
  },
  {
    id: "cir-2",
    date: "2026-12-06",
    iso: "2026-12-06T18:00:00-10:00",
    time: "06:00 PM HST",
    titleEs: "Healing Circle Familiar: Pacientes y cuidadores juntos",
    titleEn: "Family Healing Circle: Patients & caregivers together",
    placeEs: "Zoom en vivo · Células familiares 1 a 1",
    placeEn: "Live Zoom · 1-on-1 Family cells",
    notesEs: "Espacio abierto para asistir sola o con tu cuidador y regular juntos el cansancio en casa.",
    notesEn: "Attend solo or with your caregiver to co-regulate household stress together.",
    host: "Omar Melero & Kelsie Reynolds",
  },
  {
    id: "cir-3",
    date: "2026-12-13",
    iso: "2026-12-13T18:00:00-10:00",
    time: "06:00 PM HST",
    titleEs: "Taller Sonoro: Tapping EFT y cuencos de cuarzo",
    titleEn: "Sound Workshop: EFT Tapping & quartz bowls",
    placeEs: "Zoom en vivo · Audio 432 Hz",
    placeEn: "Live Zoom · 432 Hz Audio",
    notesEs: "Puntos suaves de Tapping para soltar ansiedad e insomnio + baño de cuencos en directo.",
    notesEn: "Gentle EFT points to release anxiety & insomnia + live quartz sound bath.",
    host: "Omar Melero & Kelsie Reynolds",
  },
  {
    id: "cir-4",
    date: "2026-12-20",
    iso: "2026-12-20T18:00:00-10:00",
    time: "06:00 PM HST",
    titleEs: "Open Workshop: Cocina alcalina y cierre en gratitud",
    titleEn: "Open Workshop: Alkaline kitchen & gratitude circle",
    placeEs: "Zoom interactivo · Recetario incluido",
    placeEn: "Interactive Zoom · Recipe guide included",
    notesEs: "Caldos e infusiones suaves para días de náusea o poco apetito y círculo de gratitud.",
    notesEn: "Soothing broths & teas for low-appetite days plus closing gratitude circle.",
    host: "Kelsie Reynolds & Dra. Maya Lin",
  },
];

type TabFilter = "todo" | "medicinas" | "citas" | "sanadores";

function classifyMoment(horario: string): "manana" | "tarde" | "noche" {
  const h = (horario || "").toLowerCase();
  if (/(noche|cena|dormir|night|dinner|sleep|bed|pm\b)/.test(h) && !/12:00\s*pm/.test(h)) {
    if (/(mediod|almuerz|tarde|lunch|noon|afternoon|0?[1-5]:)/.test(h)) return "tarde";
    return "noche";
  }
  if (/(mediod|almuerz|tarde|12\s*horas|lunch|noon|afternoon)/.test(h)) return "tarde";
  return "manana";
}

export function RecordatoriosSection({
  t,
  isEs,
  ficha,
  caregiver,
  healerSessions = [],
  otherReminders,
  todayHabits,
  updateDaily,
  onReminderClick,
  reminderIcon,
  selectedDay,
  setSelectedDay,
  fmtDate,
  runAction,
  openSheet,
  openConsult,
  goToTab,
  healers,
}: RecordatoriosSectionProps) {
  const [filter, setFilter] = useState<TabFilter>("todo");
  const [activeEvent, setActiveEvent] = useState<AgendaEvent | null>(null);

  /* ---------------- 1. Medicamentos + Suplementos unificados ---------------- */
  const dailyDoses = useMemo(() => {
    const meds = (ficha?.medicamentos_y_horarios || []).map((m: any, i: number) => ({
      key: `med-${m.id ?? i}`,
      kind: "med" as const,
      idx: i,
      name: m.nombre,
      dose: m.dosis || "",
      schedule: m.horario || "",
      notes: m.indicaciones || "",
      moment: classifyMoment(m.horario || ""),
    }));
    const sups = (ficha?.suplementos || []).map((s: any, i: number) => ({
      key: `sup-${i}`,
      kind: "sup" as const,
      idx: i,
      name: s.nombre,
      dose: s.dosis || "",
      schedule: s.horario || "",
      notes: "",
      moment: classifyMoment(s.horario || ""),
    }));
    return [...meds, ...sups];
  }, [ficha]);

  const dosesDone = dailyDoses.filter((d) => Boolean(todayHabits[d.key])).length;
  const dosesPct = dailyDoses.length ? Math.round((dosesDone / dailyDoses.length) * 100) : 0;

  /* ---------------- 2. Calendario unificado (Citas + Sanadores + Circles) ---------------- */
  const { enrichedMarks, allEventsByDay, upcomingAll, medicalVisits, wellnessEvents } = useMemo(() => {
    const marksMap: Record<string, { med: number; ses: number; cir: number }> = {};
    const byDay: Record<string, AgendaEvent[]> = {};

    const add = (ev: AgendaEvent) => {
      if (!ev.date) return;
      marksMap[ev.date] = marksMap[ev.date] || { med: 0, ses: 0, cir: 0 };
      marksMap[ev.date][ev.kind]++;
      (byDay[ev.date] = byDay[ev.date] || []).push(ev);
    };

    // Citas médicas
    (ficha?.citas_medicas || []).forEach((c: any, idx: number) => {
      add({
        id: `med-visit-${c.id ?? idx}`,
        kind: "med",
        idx,
        date: String(c.fecha || "").slice(0, 10),
        time: c.hora || "09:30 AM",
        title: c.titulo,
        place: c.lugar || t("Centro médico", "Medical center"),
        notes: c.notas || "",
      });
    });

    // Sesiones reservadas con sanadores
    (healerSessions || [])
      .filter((s: any) => s.estado_cita !== "cancelada")
      .forEach((s: any, idx: number) => {
        const d = String(s.fecha_sesion || "").slice(0, 10);
        const h = String(s.fecha_sesion || "").includes("T")
          ? new Date(s.fecha_sesion).toLocaleTimeString(isEs ? "es-ES" : "en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "06:00 PM";
        add({
          id: `ses-${s.id ?? idx}`,
          kind: "ses",
          date: d,
          time: h,
          title: s.enlace_o_lugar || t("Sesión con sanador", "Healer session"),
          place:
            s.modalidad === "presencial"
              ? t("En persona · Honolulu", "In person · Honolulu")
              : t("En línea · Zoom", "Online · Zoom"),
          notes: s.es_sesion_gratuita_mensual
            ? t("Sesión mensual gratuita incluida en tu acompañamiento.", "Free monthly session included in your care.")
            : "",
          free: Boolean(s.es_sesion_gratuita_mensual),
        });
      });

    // Healing & Love Circles gratuitos del mes
    COMMUNITY_CIRCLE_DATES.forEach((c) => {
      add({
        id: c.id,
        kind: "cir",
        date: c.date,
        iso: c.iso,
        time: c.time,
        title: isEs ? c.titleEs : c.titleEn,
        place: isEs ? c.placeEs : c.placeEn,
        notes: isEs ? c.notesEs : c.notesEn,
        host: c.host,
        free: true,
      });
    });

    const today = todayKey();
    const allSorted = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([, list]) => list);

    const upcomingList = allSorted.filter((e) => e.date >= today);
    return {
      enrichedMarks: marksMap,
      allEventsByDay: byDay,
      upcomingAll: upcomingList,
      medicalVisits: allSorted.filter((e) => e.kind === "med"),
      wellnessEvents: allSorted.filter((e) => e.kind === "ses" || e.kind === "cir"),
    };
  }, [ficha, healerSessions, isEs]);

  const nextMedical = upcomingAll.find((e) => e.kind === "med") || medicalVisits[0] || null;
  const nextWellness = upcomingAll.find((e) => e.kind === "ses" || e.kind === "cir") || null;
  const selectedEvents = allEventsByDay[selectedDay] || [];

  const momentGroups = [
    {
      id: "manana" as const,
      icon: Sunrise,
      color: "text-[#D97706] bg-[#FEF3C7]",
      label: t("Por la mañana", "Morning"),
    },
    {
      id: "tarde" as const,
      icon: Sun,
      color: "text-[#239BA2] bg-[#CFEDE8]",
      label: t("Al mediodía / tarde", "Midday / afternoon"),
    },
    {
      id: "noche" as const,
      icon: Moon,
      color: "text-[#7A4FD1] bg-[#EAE2F5]",
      label: t("Por la noche", "Evening / bedtime"),
    },
  ];

  const eventMeta = (kind: AgendaEvent["kind"]) => {
    if (kind === "med")
      return {
        icon: Stethoscope,
        badge: t("Cita médica", "Medical visit"),
        bg: "bg-[#D7F3EA] text-[#1E747A]",
        pill: "bg-[#239BA2]/10 text-[#1E747A]",
      };
    if (kind === "ses")
      return {
        icon: CalendarHeart,
        badge: t("Sesión con sanador", "Healer session"),
        bg: "bg-[#FFE7D6] text-[#C85A17]",
        pill: "bg-[#F49678]/20 text-[#B84C0E]",
      };
    return {
      icon: Users,
      badge: t("Healing Circle · Gratis", "Healing Circle · Free"),
      bg: "bg-[#EAE2F5] text-[#7A4FD1]",
      pill: "bg-[#7A4FD1]/10 text-[#7A4FD1]",
    };
  };

  return (
    <main className="mt-6 space-y-7 pb-10">
      {/* ===================== ENCABEZADO + SINCRONIZACIÓN 1:1 ===================== */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end animate-fade-in">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#CFEDE8]/75 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#1E747A]">
            <Bell className="h-3.5 w-3.5" />
            {t("Planificador y Agenda Compartida", "Shared Planner & Schedule")}
          </span>
          <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#2D2B2A] sm:text-4xl">
            {isEs ? "Tus recordatorios " : "Your reminders "}
            <span className="font-light italic text-[#E8809A]">
              {isEs ? "día a día y sin estrés." : "day by day, stress-free."}
            </span>
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-espresso/65">
            {t(
              "Medicinas, suplementos, consultas médicas, sesiones con sanadores y Healing Circles organizados en un solo lugar para ti y quien te cuida.",
              "Medications, supplements, medical visits, healer sessions, and Healing Circles organized in one calm space for you and your caregiver."
            )}
          </p>
        </div>

        {/* Estado de Célula Familiar 1:1 */}
        <button
          type="button"
          onClick={() =>
            openSheet("caregiver", { correo: ficha?.correo_invitacion_cuidador || "" })
          }
          className="flex shrink-0 items-center gap-2.5 self-start rounded-2xl border border-espresso/8 bg-white px-4 py-2.5 text-left shadow-sm transition hover:shadow-md sm:self-auto"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FCECEE] text-[#C94A6A]">
            <HeartHandshake className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-espresso/45">
              {t("Agenda familiar 1 a 1", "1-on-1 Family sync")}
            </span>
            <span className="block text-xs font-bold text-espresso">
              {caregiver?.linked
                ? `${t("Compartida con", "Shared with")} ${caregiver.nombre}`
                : t("Invitar a mi cuidador/a →", "Invite my caregiver →")}
            </span>
          </span>
        </button>
      </section>

      {/* ===================== 3 TARJETAS DE RESUMEN RÁPIDO ===================== */}
      <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {/* 1. Tomas del día */}
        <button
          type="button"
          onClick={() => setFilter("medicinas")}
          className="rounded-[26px] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#C94A6A]">
              <Pill className="h-3.5 w-3.5" />
              {t("Tomas de hoy", "Today's doses")}
            </span>
            <span className="rounded-full bg-[#FCECEE] px-2.5 py-0.5 text-[11px] font-bold text-[#C94A6A]">
              {dosesPct}%
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-espresso">
            {dosesDone} <span className="text-sm font-normal text-espresso/50">/ {dailyDoses.length}</span>
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#FAF7F2]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#F48EA6] to-[#DC5678] transition-all duration-500"
              style={{ width: `${dosesPct}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-espresso/55">
            {dosesDone === dailyDoses.length && dailyDoses.length > 0
              ? t("¡Todas tus tomas de hoy listas! ✨", "All doses completed today! ✨")
              : t("Toca para marcar medicinas y suplementos", "Tap to check off meds & supplements")}
          </p>
        </button>

        {/* 2. Próxima cita médica */}
        <button
          type="button"
          onClick={() => {
            if (nextMedical) {
              setSelectedDay(nextMedical.date);
              setActiveEvent(nextMedical);
            } else {
              openSheet("add-cita", { fecha: selectedDay, hora: "09:30 AM" });
            }
          }}
          className="rounded-[26px] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#239BA2]">
            <Stethoscope className="h-3.5 w-3.5" />
            {t("Próxima consulta médica", "Next medical visit")}
          </span>
          {nextMedical ? (
            <>
              <p className="mt-2 truncate text-base font-semibold tracking-[-0.015em] text-espresso">
                {nextMedical.title}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[#239BA2]">
                {fmtDate(nextMedical.date)} · {nextMedical.time}
              </p>
              <p className="mt-1 truncate text-[11px] text-espresso/55">📍 {nextMedical.place}</p>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm font-semibold text-espresso">
                {t("Sin citas médicas registradas", "No medical visits yet")}
              </p>
              <p className="mt-1 text-xs font-bold text-[#239BA2]">+ {t("Agendar nueva cita", "Add visit")}</p>
            </>
          )}
        </button>

        {/* 3. Próxima sesión holística / Healing Circle */}
        <button
          type="button"
          onClick={() => {
            if (nextWellness) {
              setSelectedDay(nextWellness.date);
              setActiveEvent(nextWellness);
            } else {
              openSheet("circle_rsvp");
            }
          }}
          className="rounded-[26px] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#7A4FD1]">
            <Sparkles className="h-3.5 w-3.5" />
            {t("Próximo círculo o sanador", "Next circle or healer")}
          </span>
          {nextWellness ? (
            <>
              <p className="mt-2 truncate text-base font-semibold tracking-[-0.015em] text-espresso">
                {nextWellness.title}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[#7A4FD1]">
                {fmtDate(nextWellness.date)} · {nextWellness.time}
              </p>
              <p className="mt-1 truncate text-[11px] text-espresso/55">✨ {nextWellness.place}</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-espresso/60">
              {t("Explora los próximos Healing Circles", "Explore upcoming Healing Circles")}
            </p>
          )}
        </button>
      </section>

      {/* ===================== PESTAÑAS INTERACTIVAS DE FILTRO ===================== */}
      <div className="-mx-4 flex items-center justify-between gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
        <div className="flex gap-2">
          {(
            [
              ["todo", t("Todo mi plan", "All my plan")],
              ["medicinas", `💊 ${t("Medicinas y suplementos", "Meds & supplements")} (${dailyDoses.length})`],
              ["citas", `🩺 ${t("Citas y chequeos", "Medical visits")} (${medicalVisits.length})`],
              ["sanadores", `✨ ${t("Sanadores y Circles", "Healers & Circles")} (${wellnessEvents.length})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition active:scale-95 ${
                filter === id
                  ? "bg-espresso text-white shadow-sm"
                  : "bg-white text-espresso/65 shadow-sm hover:bg-espresso/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Acciones rápidas */}
        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={() => openSheet("add-med", { kind: "med" })}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-espresso shadow-sm transition hover:bg-espresso/5"
          >
            <Plus className="h-3.5 w-3.5 text-[#C94A6A]" />
            {t("Medicina", "Medication")}
          </button>
          <button
            type="button"
            onClick={() => openSheet("add-cita", { fecha: selectedDay, hora: "09:30 AM" })}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#239BA2] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:brightness-105"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("Nueva cita", "New visit")}
          </button>
        </div>
      </div>

      {/* ======================================================================== */}
      {/* VISTA 1: TODO MI PLAN (2 COLUMNAS EN COMPUTADOR, APILADO EN CELULAR)     */}
      {/* ======================================================================== */}
      {filter === "todo" && (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Columna izquierda: Rutina de medicinas de hoy + Sugerencias preventivas */}
          <div className="space-y-5 lg:col-span-7">
            <Card className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#C94A6A]">
                    {t("Rutina diaria", "Daily routine")}
                  </span>
                  <h3 className="text-xl font-semibold tracking-[-0.02em] text-espresso">
                    {t("Medicinas y suplementos de hoy", "Today's medications & supplements")}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => openSheet("add-med", { kind: "med" })}
                  className="inline-flex items-center gap-1 rounded-full bg-[#FCECEE] px-3 py-1.5 text-xs font-bold text-[#C94A6A] transition hover:brightness-95"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("Agregar", "Add")}
                </button>
              </div>

              {dailyDoses.length === 0 ? (
                <p className="rounded-2xl bg-[#FAF7F2] p-4 text-sm text-espresso/60">
                  {t("Aún no has registrado medicamentos o suplementos.", "No medications or supplements added yet.")}
                </p>
              ) : (
                <div className="space-y-4">
                  {momentGroups.map((group) => {
                    const items = dailyDoses.filter((d) => d.moment === group.id);
                    if (items.length === 0) return null;
                    const GroupIcon = group.icon;
                    return (
                      <div key={group.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${group.color}`}>
                            <GroupIcon className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-espresso/55">
                            {group.label}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {items.map((item) => {
                            const done = Boolean(todayHabits[item.key]);
                            return (
                              <button
                                key={item.key}
                                type="button"
                                onClick={() => updateDaily({ habits: { [item.key]: !done } })}
                                className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition active:scale-[0.99] ${
                                  done
                                    ? "border-[#5C8D67]/25 bg-[#F2F8F4] opacity-75"
                                    : "border-espresso/5 bg-[#FAF7F2] hover:bg-white hover:shadow-sm"
                                }`}
                              >
                                <span
                                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                                    done
                                      ? "border-[#5C8D67] bg-[#5C8D67] text-white"
                                      : "border-espresso/25 bg-white"
                                  }`}
                                >
                                  {done && <Check className="h-3.5 w-3.5" />}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="flex flex-wrap items-center gap-2">
                                    <strong
                                      className={`text-sm font-semibold text-espresso ${
                                        done ? "line-through" : ""
                                      }`}
                                    >
                                      {item.name}
                                    </strong>
                                    {item.dose && (
                                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#C94A6A]">
                                        {item.dose}
                                      </span>
                                    )}
                                    <span className="rounded-full bg-espresso/5 px-2 py-0.5 text-[10px] font-semibold text-espresso/55">
                                      {item.kind === "med"
                                        ? t("Medicina", "Medication")
                                        : t("Suplemento", "Supplement")}
                                    </span>
                                  </span>
                                  {item.schedule && (
                                    <span className="mt-0.5 block text-xs text-espresso/65">
                                      🕐 {item.schedule}
                                    </span>
                                  )}
                                  {item.notes && (
                                    <span className="mt-0.5 block text-[11px] text-[#239BA2]">
                                      💡 {item.notes}
                                    </span>
                                  )}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Sugerencias preventivas de acompañamiento (según ANEXO oficial) */}
            <Card className="bg-gradient-to-br from-[#FFF8F4] via-white to-[#F2FAF9] space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#239BA2] text-white">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#239BA2]">
                    {t("Apoyo preventivo sugerido", "Preventive care suggestions")}
                  </span>
                  <h4 className="text-sm font-semibold text-espresso">
                    {t("Pequeños pasos para sentirte acompañada esta semana", "Gentle steps to feel supported this week")}
                  </h4>
                </div>
              </div>

              <div className="space-y-2">
                {otherReminders.map((r: any) => {
                  const Icon = reminderIcon[r.kind] || Bell;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => onReminderClick(r)}
                      className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm transition hover:shadow"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAE2F5] text-[#7A4FD1]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-espresso">{r.title}</span>
                        <span className="block truncate text-[11px] text-espresso/60">{r.sub}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-espresso/35" />
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => openSheet("circle_rsvp")}
                  className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm transition hover:shadow"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#CFEDE8] text-[#1E747A]">
                    <Users className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-espresso">
                      {t("Reserva tu lugar en el próximo Love Circle gratuito", "Save your spot in the next free Love Circle")}
                    </span>
                    <span className="block text-[11px] text-espresso/60">
                      {t("Sábados 6:00 PM HST · Puedes asistir sola o con tu cuidador", "Saturdays 6:00 PM HST · Join solo or with your caregiver")}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-espresso/35" />
                </button>

                {openConsult && nextMedical && (
                  <button
                    type="button"
                    onClick={() => openConsult("medico")}
                    className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm transition hover:shadow"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FCECEE] text-[#C94A6A]">
                      <Stethoscope className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-espresso">
                        {t("Preparar preguntas para mi próxima consulta", "Prepare questions for my next doctor visit")}
                      </span>
                      <span className="block truncate text-[11px] text-espresso/60">{nextMedical.title}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-espresso/35" />
                  </button>
                )}
              </div>
            </Card>
          </div>

          {/* Columna derecha: Calendario mensual + Día seleccionado + Próximos eventos */}
          <div className="space-y-5 lg:col-span-5">
            <Card>
              <MiniCalendar
                marks={enrichedMarks}
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
                  <h3 className="text-lg font-semibold capitalize tracking-[-0.02em] text-espresso">
                    {fmtDate(selectedDay)}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => openSheet("add-cita", { fecha: selectedDay, hora: "09:30 AM" })}
                  className="rounded-full bg-[#FAF7F2] px-3 py-1.5 text-xs font-bold text-[#239BA2] transition hover:bg-[#CFEDE8]/60"
                >
                  + {t("Agendar aquí", "Add here")}
                </button>
              </div>

              {selectedEvents.length === 0 ? (
                <p className="rounded-2xl bg-[#FAF7F2] px-4 py-3 text-xs text-espresso/60">
                  {t(
                    "No tienes citas ni eventos este día. Debajo puedes ver tus próximas fechas o tocar otro punto del calendario. 🌿",
                    "Nothing scheduled on this day. See your upcoming dates below or tap any marked day on the calendar. 🌿"
                  )}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {selectedEvents.map((ev) => {
                    const meta = eventMeta(ev.kind);
                    const Icon = meta.icon;
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => setActiveEvent(ev)}
                        className="flex w-full items-center gap-3 rounded-2xl bg-[#FAF7F2] p-3.5 text-left transition hover:bg-white hover:shadow-sm"
                      >
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${meta.bg}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-espresso">{ev.title}</span>
                          <span className="block truncate text-xs text-espresso/60">
                            {ev.time} · {ev.place}
                          </span>
                        </span>
                        <ChevronRight className="h-4 w-4 text-espresso/35" />
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Próximos en tu agenda (nunca deja a la paciente a ciegas) */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold tracking-[-0.015em] text-espresso">
                  {t("Próximas fechas en tu agenda", "Upcoming on your schedule")}
                </h3>
                <span className="text-xs font-semibold text-espresso/45">{upcomingAll.length}</span>
              </div>
              <div className="space-y-2">
                {upcomingAll.slice(0, 5).map((ev) => {
                  const meta = eventMeta(ev.kind);
                  const Icon = meta.icon;
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => {
                        setSelectedDay(ev.date);
                        setActiveEvent(ev);
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl border border-espresso/5 bg-[#FAF7F2]/70 p-3 text-left transition hover:bg-white hover:shadow-sm"
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-espresso">{ev.title}</span>
                        <span className="block truncate text-[11px] text-espresso/60">
                          {fmtDate(ev.date)} · {ev.time}
                        </span>
                      </span>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${meta.pill}`}>
                        {t("Ver", "View")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Botones principales de reserva */}
            <div className="grid gap-3 sm:grid-cols-2">
              <PrimaryButton
                color="from-[#4DB6B0] to-[#239BA2]"
                onClick={() => openSheet("add-cita", { fecha: selectedDay, hora: "09:30 AM" })}
              >
                <Stethoscope className="h-4 w-4" />
                {t("Nueva cita médica", "New medical visit")}
              </PrimaryButton>
              <PrimaryButton
                onClick={() =>
                  openSheet("book", {
                    healer: String(healers[0]?.id ?? ""),
                    modalidad: "online",
                    fecha: selectedDay,
                    gratis: "1",
                  })
                }
              >
                <CalendarHeart className="h-4 w-4" />
                {t("Reservar sanador", "Book healer")}
              </PrimaryButton>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================================== */}
      {/* VISTA 2: SOLO MEDICINAS Y SUPLEMENTOS                                    */}
      {/* ======================================================================== */}
      {filter === "medicinas" && (
        <section className="space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-espresso/70">
              {t(
                "Marca cada toma realizada hoy. Tu progreso queda guardado y visible también para tu cuidador.",
                "Check off each dose taken today. Your progress is saved and synced with your caregiver."
              )}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openSheet("add-med", { kind: "med" })}
                className="rounded-full bg-[#C94A6A] px-4 py-2 text-xs font-bold text-white shadow-sm"
              >
                + {t("Agregar medicina", "Add medication")}
              </button>
              <button
                type="button"
                onClick={() => openSheet("add-med", { kind: "sup" })}
                className="rounded-full bg-white px-4 py-2 text-xs font-bold text-espresso shadow-sm"
              >
                + {t("Agregar suplemento", "Add supplement")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {momentGroups.map((group) => {
              const items = dailyDoses.filter((d) => d.moment === group.id);
              const GroupIcon = group.icon;
              return (
                <Card key={group.id} className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${group.color}`}>
                      <GroupIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-espresso">{group.label}</h3>
                      <p className="text-[11px] text-espresso/50">
                        {items.length} {t("programados", "scheduled")}
                      </p>
                    </div>
                  </div>
                  {items.length === 0 ? (
                    <p className="rounded-2xl bg-[#FAF7F2] p-3 text-xs text-espresso/55">
                      {t("Sin tomas en este horario.", "No doses in this slot.")}
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {items.map((item) => {
                        const done = Boolean(todayHabits[item.key]);
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => updateDaily({ habits: { [item.key]: !done } })}
                            className={`flex w-full items-start gap-3 rounded-2xl p-3 text-left transition ${
                              done ? "bg-[#F2F8F4] opacity-75" : "bg-[#FAF7F2] hover:bg-espresso/5"
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                done ? "border-[#5C8D67] bg-[#5C8D67] text-white" : "border-espresso/25 bg-white"
                              }`}
                            >
                              {done && <Check className="h-3 w-3" />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold text-espresso">
                                {item.name} {item.dose ? `· ${item.dose}` : ""}
                              </span>
                              <span className="block text-xs text-espresso/60">{item.schedule}</span>
                              {item.notes && (
                                <span className="mt-1 block text-[11px] text-[#239BA2]">💡 {item.notes}</span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* ======================================================================== */}
      {/* VISTA 3: CITAS Y CHEQUEOS MÉDICOS                                        */}
      {/* ======================================================================== */}
      {filter === "citas" && (
        <section className="space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-espresso/70">
              {t(
                "Consultas oncológicas, controles, laboratorios y terapias clínicas programadas.",
                "Scheduled oncology consultations, checkups, lab work, and clinical therapies."
              )}
            </p>
            <button
              type="button"
              onClick={() => openSheet("add-cita", { fecha: selectedDay, hora: "09:30 AM" })}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#239BA2] px-5 py-2.5 text-xs font-bold text-white shadow-sm"
            >
              <Plus className="h-4 w-4" />
              {t("Nueva cita o chequeo", "New medical visit")}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {medicalVisits.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-col justify-between rounded-[26px] bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D7F3EA] px-3 py-1 text-[11px] font-bold text-[#1E747A]">
                      <Stethoscope className="h-3.5 w-3.5" />
                      {fmtDate(ev.date)} · {ev.time}
                    </span>
                    {typeof ev.idx === "number" && (
                      <button
                        type="button"
                        onClick={() =>
                          runAction("delete_medical_appointment", { index: ev.idx }, t("Cita eliminada", "Removed"))
                        }
                        className="text-espresso/35 transition hover:text-[#C94A6A]"
                        aria-label={t("Eliminar", "Delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <h4 className="mt-3 text-lg font-semibold tracking-[-0.015em] text-espresso">{ev.title}</h4>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-espresso/65">
                    <MapPin className="h-3.5 w-3.5 text-[#239BA2]" />
                    {ev.place}
                  </p>
                  {ev.notes && (
                    <p className="mt-2.5 rounded-2xl bg-[#FAF7F2] p-3 text-xs leading-relaxed text-espresso/75">
                      📋 <strong>{t("Recordatorio:", "Note:")}</strong> {ev.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-espresso/5 pt-3">
                  <button
                    type="button"
                    onClick={() => setActiveEvent(ev)}
                    className="rounded-full bg-[#FAF7F2] px-3.5 py-1.5 text-xs font-bold text-espresso hover:bg-espresso/10"
                  >
                    {t("Ver detalles", "View details")}
                  </button>
                  {openConsult && (
                    <button
                      type="button"
                      onClick={() => openConsult("medico")}
                      className="rounded-full bg-[#EAE2F5] px-3.5 py-1.5 text-xs font-bold text-[#7A4FD1]"
                    >
                      ✨ {t("Preparar resumen para el médico", "Prepare visit summary")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ======================================================================== */}
      {/* VISTA 4: SESIONES CON SANADORES Y HEALING CIRCLES                        */}
      {/* ======================================================================== */}
      {filter === "sanadores" && (
        <section className="space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-espresso/70">
              {t(
                "Tus sesiones 1 a 1 con sanadores y todos los encuentros gratuitos del mes en Honolulu y Zoom.",
                "Your 1-on-1 healer sessions and all free monthly community gatherings in Honolulu & Zoom."
              )}
            </p>
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
                className="inline-flex items-center gap-1.5 rounded-full bg-[#E8809A] px-4 py-2 text-xs font-bold text-white shadow-sm"
              >
                <CalendarHeart className="h-4 w-4" />
                {t("Reservar sesión 1 a 1", "Book 1-on-1 session")}
              </button>
              {goToTab && (
                <button
                  type="button"
                  onClick={() => goToTab("recursos")}
                  className="rounded-full bg-white px-4 py-2 text-xs font-bold text-espresso shadow-sm"
                >
                  {t("Explorar en Recursos →", "Explore in Resources →")}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {wellnessEvents.map((ev) => {
              const meta = eventMeta(ev.kind);
              const Icon = meta.icon;
              return (
                <div
                  key={ev.id}
                  className="flex flex-col justify-between rounded-[26px] bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${meta.pill}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {meta.badge}
                      </span>
                      <span className="text-xs font-bold text-espresso/60">
                        {fmtDate(ev.date)} · {ev.time}
                      </span>
                    </div>
                    <h4 className="mt-3 text-lg font-semibold tracking-[-0.015em] text-espresso">{ev.title}</h4>
                    <p className="mt-1 text-xs font-medium text-espresso/60">📍 {ev.place}</p>
                    {ev.host && (
                      <p className="mt-0.5 text-xs font-semibold text-[#C94A6A]">
                        {t("Con", "With")} {ev.host}
                      </p>
                    )}
                    {ev.notes && (
                      <p className="mt-2.5 text-xs leading-relaxed text-espresso/75">{ev.notes}</p>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-espresso/5 pt-3">
                    {ev.kind === "cir" ? (
                      <button
                        type="button"
                        onClick={() => openSheet("circle_rsvp", ev.iso ? { fecha_circle: ev.iso } : {})}
                        className="rounded-full bg-[#239BA2] px-4 py-2 text-xs font-bold text-white shadow-sm"
                      >
                        {t("Inscribirme gratis a esta fecha", "Sign up free for this date")}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveEvent(ev)}
                        className="rounded-full bg-[#FAF7F2] px-4 py-2 text-xs font-bold text-espresso"
                      >
                        {t("Ver acceso y detalles", "View link & details")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ===================== FICHA INTERACTIVA DE EVENTO / CITA ===================== */}
      {activeEvent && (
        <div className="fixed inset-0 z-[65] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button
            type="button"
            aria-label={t("Cerrar", "Close")}
            onClick={() => setActiveEvent(null)}
            className="absolute inset-0 bg-espresso/50 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-lg rounded-t-[32px] bg-white p-6 shadow-2xl animate-sheet-up sm:rounded-[32px] space-y-4">
            <div className="flex items-start justify-between gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${eventMeta(activeEvent.kind).pill}`}>
                {eventMeta(activeEvent.kind).badge}
              </span>
              <button
                type="button"
                onClick={() => setActiveEvent(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF7F2] text-espresso/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-semibold leading-tight tracking-[-0.02em] text-espresso">
                {activeEvent.title}
              </h3>
              {activeEvent.host && (
                <p className="mt-1 text-xs font-semibold text-[#C94A6A]">
                  {t("Facilitado por", "Facilitated by")} {activeEvent.host}
                </p>
              )}
            </div>

            <div className="space-y-2 rounded-2xl bg-[#FAF7F2] p-4 text-xs text-espresso/80">
              <p className="flex items-center gap-2 font-semibold text-espresso">
                <Calendar className="h-4 w-4 text-[#239BA2]" />
                <span className="capitalize">{fmtDate(activeEvent.date)}</span>
                <span>·</span>
                <Clock className="h-4 w-4 text-[#E8809A]" />
                <span>{activeEvent.time}</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-[#239BA2]" />
                <span>{activeEvent.place}</span>
              </p>
              {activeEvent.notes && (
                <p className="border-t border-espresso/5 pt-2 leading-relaxed text-espresso/75">
                  {activeEvent.notes}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              {activeEvent.kind === "cir" && (
                <PrimaryButton
                  color="from-[#239BA2] to-[#1D8389]"
                  onClick={() => {
                    const iso = activeEvent.iso;
                    setActiveEvent(null);
                    openSheet("circle_rsvp", iso ? { fecha_circle: iso } : {});
                  }}
                >
                  <Calendar className="h-4 w-4" />
                  {t("Inscribirme gratis a este encuentro", "Sign up free for this gathering")}
                </PrimaryButton>
              )}

              {activeEvent.kind === "med" && openConsult && (
                <PrimaryButton
                  color="from-[#7A4FD1] to-[#5E38B5]"
                  onClick={() => {
                    setActiveEvent(null);
                    openConsult("medico");
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                  {t("Preparar resumen y preguntas para mi médico", "Prepare summary & questions for my doctor")}
                </PrimaryButton>
              )}

              {activeEvent.kind === "ses" && activeEvent.title.startsWith("http") && (
                <a
                  href={activeEvent.title.split(" ")[0]}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#239BA2] px-5 py-3 text-sm font-bold text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t("Entrar a la sala virtual", "Join online room")}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

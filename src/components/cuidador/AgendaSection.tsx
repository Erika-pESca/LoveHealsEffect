"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar,
  CalendarHeart,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Edit2,
  ExternalLink,
  Leaf,
  MapPin,
  Moon,
  Pill,
  Plus,
  RefreshCw,
  Stethoscope,
  Sun,
  Sunrise,
  Trash2,
  X,
} from "lucide-react";
import { inputCls, PrimaryButton } from "@/components/panel/ui";
import { todayKey } from "@/components/paciente/PacienteDashboard";

interface AgendaSectionProps {
  t: (es: string, en: string) => string;
  isEs: boolean;
  patientFirst: string;
  fp?: any;
  marks: Record<string, { med: number; ses: number }>;
  selectedDay: string;
  setSelectedDay: (d: string) => void;
  fmtDate: (d: string) => string;
  eventsByDay: Record<string, any[]>;
  upcoming?: any[];
  healerSessions?: any[];
  runAction: (action: string, payload?: any, message?: string, options?: any) => Promise<any>;
  openSheet: (sheet: string, initial?: Record<string, string>) => void;
  healers: any[];
}

type MainTab = "calendario" | "medicinas";

const SCHEDULE_PASTELS = [
  { bg: "bg-[#FFD6E5]", iconBg: "bg-white text-[#C94A6A]", tag: "bg-white/80 text-[#9E2A47]" },
  { bg: "bg-[#FFF0B5]", iconBg: "bg-white text-[#9A7400]", tag: "bg-white/80 text-[#7A5C00]" },
  { bg: "bg-[#CBEFFF]", iconBg: "bg-white text-[#147496]", tag: "bg-white/80 text-[#115D78]" },
  { bg: "bg-[#D2F5C4]", iconBg: "bg-white text-[#2E7A38]", tag: "bg-white/80 text-[#225C2A]" },
];

const HEALING_CIRCLES = [
  {
    iso: "2026-11-29T18:00:00-10:00",
    dayNum: "29",
    monthShortEs: "Nov",
    monthShortEn: "Nov",
    fullDateEs: "Sábado 29 de Noviembre · 6:00 PM HST",
    fullDateEn: "Saturday, November 29 · 6:00 PM HST",
    time: "6:00 PM HST",
    topicEs: "Respirar en paz y soltar tensión",
    topicEn: "Breathe in peace & release tension",
    summaryEs: "Encuentro guiado por Kelsie y Omar para suavizar el sistema nervioso junto a la familia.",
    summaryEn: "Guided gathering with Kelsie and Omar to regulate the nervous system together.",
    videoUrl: "https://www.youtube.com/embed/inpok4MKVLM?rel=0",
    pastel: "bg-[#FFD6E5]",
  },
  {
    iso: "2026-12-06T18:00:00-10:00",
    dayNum: "6",
    monthShortEs: "Dic",
    monthShortEn: "Dec",
    fullDateEs: "Sábado 6 de Diciembre · 6:00 PM HST",
    fullDateEn: "Saturday, December 6 · 6:00 PM HST",
    time: "6:00 PM HST",
    topicEs: "Pacientes y cuidadores juntos",
    topicEn: "Patients & caregivers together",
    summaryEs: "Sesión especial con Omar Melero para regular el estrés en familia sin agotamiento.",
    summaryEn: "Special session with Omar Melero to balance family stress without burnout.",
    videoUrl: "https://www.youtube.com/embed/inpok4MKVLM?rel=0",
    pastel: "bg-[#CFEDE8]",
  },
  {
    iso: "2026-12-13T18:00:00-10:00",
    dayNum: "13",
    monthShortEs: "Dic",
    monthShortEn: "Dec",
    fullDateEs: "Sábado 13 de Diciembre · 6:00 PM HST",
    fullDateEn: "Saturday, December 13 · 6:00 PM HST",
    time: "6:00 PM HST",
    topicEs: "Tapping y cuencos de cuarzo",
    topicEn: "EFT Tapping & Quartz Bowls",
    summaryEs: "Liberación emocional suave con puntos de EFT Tapping y baño sonoro con cuencos de cuarzo.",
    summaryEn: "Gentle emotional release with EFT Tapping and Hawaiian crystal singing bowls.",
    videoUrl: "https://www.youtube.com/embed/inpok4MKVLM?rel=0",
    pastel: "bg-[#FFF0B5]",
  },
];

function getTimeSlot(horario: string) {
  const s = (horario || "").toLowerCase();
  if (/(noche|dormir|cena|pm|19:|20:|21:|22:|night|bed|dinner)/.test(s) && !/(12:|1:|2:|3:|4:|5:|6:)/.test(s)) {
    return { id: "noche" as const, bg: "bg-[#E7E3FF]", icon: Moon };
  }
  if (/(mediod|tarde|almuerzo|12:|13:|14:|15:|16:|17:|18:|01:00 pm|06:00 pm|lunch|afternoon)/.test(s)) {
    return { id: "tarde" as const, bg: "bg-[#CBEFFF]", icon: Sun };
  }
  return { id: "manana" as const, bg: "bg-[#FFF1B8]", icon: Sunrise };
}

export function AgendaSection({
  t,
  isEs,
  patientFirst,
  fp,
  marks,
  selectedDay,
  setSelectedDay,
  fmtDate,
  eventsByDay,
  upcoming = [],
  runAction,
  openSheet,
  healers,
}: AgendaSectionProps) {
  const [tab, setTab] = useState<MainTab>("calendario");
  const [medFilter, setMedFilter] = useState<"all" | "manana" | "tarde" | "noche">("all");
  const [viewDate, setViewDate] = useState(() => {
    const [y, m] = (selectedDay || todayKey()).split("-").map(Number);
    return { y: y || 2026, m: (m || 11) - 1 };
  });

  const [detailEvent, setDetailEvent] = useState<any | null>(null);
  const [selectedCircle, setSelectedCircle] = useState<any | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [copiedZoom, setCopiedZoom] = useState(false);

  const [medModal, setMedModal] = useState<{
    open: boolean;
    kind: "med" | "supp";
    nombre: string;
    dosis: string;
    horario: string;
    indicaciones: string;
  }>({
    open: false,
    kind: "med",
    nombre: "",
    dosis: "",
    horario: "08:00 AM",
    indicaciones: "",
  });

  const listaMedicamentos = useMemo(() => {
    const raw = Array.isArray(fp?.medicamentos_y_horarios) ? fp.medicamentos_y_horarios : [];
    return raw.map((m: any, idx: number) => ({
      index: idx,
      nombre: m.nombre,
      dosis: m.dosis || "",
      horario: m.horario || "08:00 AM",
      indicaciones: m.indicaciones || "",
    }));
  }, [fp]);

  const listaSuplementos = useMemo(() => {
    const raw = Array.isArray(fp?.suplementos) ? fp.suplementos : [];
    return raw.map((s: any, idx: number) => ({
      index: idx,
      nombre: s.nombre,
      dosis: s.dosis || "",
      horario: s.horario || "01:00 PM",
      indicaciones: s.indicaciones || "",
    }));
  }, [fp]);

  const calendarDays = useMemo(() => {
    const first = new Date(viewDate.y, viewDate.m, 1);
    const totalDays = new Date(viewDate.y, viewDate.m + 1, 0).getDate();
    const startOffset = (first.getDay() + 6) % 7;
    const cells: { key: string; day: number }[] = [];
    for (let i = 0; i < startOffset; i++) cells.push({ key: `empty-${i}`, day: 0 });
    for (let d = 1; d <= totalDays; d++) {
      const mm = String(viewDate.m + 1).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      cells.push({ key: `${viewDate.y}-${mm}-${dd}`, day: d });
    }
    return cells;
  }, [viewDate]);

  const weekHeaders = isEs
    ? ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const selectedDayEvents = useMemo(() => {
    return (eventsByDay[selectedDay] || []).filter((ev: any) => ev.kind === "med" || ev.kind === "ses");
  }, [eventsByDay, selectedDay]);

  const nextMed = upcoming.find((u: any) => u.kind === "med");
  const nextSes = upcoming.find((u: any) => u.kind === "ses");
  const todayStr = todayKey();

  const openDetail = (ev: any) => {
    setDetailEvent(ev);
    setRescheduleDate(ev.date || todayKey());
    setRescheduleTime(ev.hora?.replace(" HST", "") || "10:00 AM");
    setCopiedZoom(false);
  };

  const handleSaveMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medModal.nombre.trim()) return;
    await runAction(
      medModal.kind === "med" ? "add_medication" : "add_supplement",
      {
        nombre: medModal.nombre,
        dosis: medModal.dosis || "1 dosis",
        horario: medModal.horario || "08:00 AM",
        indicaciones: medModal.indicaciones,
      },
      t("Agregado al botiquín", "Added to kit")
    );
    setMedModal((prev) => ({ ...prev, open: false }));
  };

  return (
    <main className="mt-6 space-y-6 pb-12 font-sans text-[#261C14]">
      {/* BARRA SUPERIOR CON IDENTIDAD CUIDADOR */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-[-0.03em] text-[#261C14] sm:text-4xl">
            {isEs ? "Agenda familiar · " : "Family schedule · "}
            <span className="font-serif italic font-normal text-[#239BA2]">
              {patientFirst}
            </span>
          </h2>
          <p className="mt-0.5 text-sm text-[#261C14]/60">
            {t(
              `Citas, sesiones y botiquín de ${patientFirst} coordinados 1 a 1.`,
              `${patientFirst}'s visits, sessions, and kit coordinated 1-on-1.`
            )}
          </p>
        </div>

        <div className="flex items-center rounded-full bg-white p-1.5 shadow-xs ring-1 ring-[#261C14]/5">
          <button
            type="button"
            onClick={() => setTab("calendario")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition ${
              tab === "calendario"
                ? "bg-gradient-to-r from-[#4DB6B0] to-[#239BA2] text-white shadow-[0_6px_16px_rgba(35,155,162,0.28)]"
                : "text-[#261C14]/65 hover:bg-[#EAF6F4] hover:text-[#1E747A]"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            {t("Calendario y Citas", "Calendar & Visits")}
          </button>
          <button
            type="button"
            onClick={() => setTab("medicinas")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition ${
              tab === "medicinas"
                ? "bg-gradient-to-r from-[#4B8FD8] to-[#3B76B8] text-white shadow-[0_6px_16px_rgba(75,143,216,0.28)]"
                : "text-[#261C14]/65 hover:bg-[#EAF6FF] hover:text-[#3B76B8]"
            }`}
          >
            <Pill className="h-3.5 w-3.5" />
            {t("Botiquín y Horarios", "Meds & Times")}
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                tab === "medicinas" ? "bg-white/25 text-white" : "bg-[#CFEDE8] text-[#166064]"
              }`}
            >
              {listaMedicamentos.length + listaSuplementos.length}
            </span>
          </button>
        </div>
      </div>

      {/* VISTA 1: CALENDARIO PROTAGONISTA + SCHEDULE PASTEL + HEALING CIRCLES */}
      {tab === "calendario" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* IZQUIERDA (7 cols): Calendario grande + 2 Bento cards */}
            <div className="space-y-4 lg:col-span-7">
              <div className="rounded-[32px] bg-white p-6 shadow-xs ring-1 ring-[#261C14]/5 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#261C14]/5 pb-5">
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif text-3xl font-bold capitalize tracking-tight text-[#261C14] sm:text-4xl">
                      {new Date(viewDate.y, viewDate.m, 1).toLocaleDateString(
                        isEs ? "es-ES" : "en-US",
                        { month: "long" }
                      )}
                    </h3>
                    <span className="rounded-full bg-[#EAF6F4] px-3 py-1 text-xs font-extrabold text-[#1E747A]">
                      {viewDate.y}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 rounded-full bg-[#FAF7F2] p-1 ring-1 ring-[#261C14]/5">
                    <button
                      type="button"
                      onClick={() =>
                        setViewDate((p) => (p.m === 0 ? { y: p.y - 1, m: 11 } : { y: p.y, m: p.m - 1 }))
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#261C14]/65 transition hover:bg-white hover:text-[#239BA2]"
                      aria-label={t("Mes anterior", "Previous month")}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {[-1, 0, 1].map((offset) => {
                      const d = new Date(viewDate.y, viewDate.m + offset, 1);
                      const shortM = d
                        .toLocaleDateString(isEs ? "es-ES" : "en-US", { month: "short" })
                        .replace(".", "");
                      return (
                        <button
                          key={offset}
                          type="button"
                          onClick={() => setViewDate({ y: d.getFullYear(), m: d.getMonth() })}
                          className={`rounded-full px-3.5 py-1.5 text-xs font-bold capitalize transition ${
                            offset === 0
                              ? "bg-[#239BA2] text-white shadow-[0_4px_12px_rgba(35,155,162,0.32)]"
                              : "text-[#261C14]/60 hover:bg-white/80 hover:text-[#261C14]"
                          }`}
                        >
                          {shortM}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() =>
                        setViewDate((p) => (p.m === 11 ? { y: p.y + 1, m: 0 } : { y: p.y, m: p.m + 1 }))
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#261C14]/65 transition hover:bg-white hover:text-[#239BA2]"
                      aria-label={t("Mes siguiente", "Next month")}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-7 gap-1 text-center">
                  {weekHeaders.map((d) => (
                    <span key={d} className="text-xs font-bold uppercase tracking-wider text-[#261C14]/40">
                      {d}
                    </span>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-7 gap-y-2.5 place-items-center">
                  {calendarDays.map((cell) => {
                    if (cell.day === 0) return <span key={cell.key} className="h-11 w-11 sm:h-12 sm:w-12" />;
                    const mark = marks[cell.key];
                    const hasMed = Boolean(mark?.med);
                    const hasSes = Boolean(mark?.ses);
                    const isSelected = selectedDay === cell.key;
                    const isToday = todayStr === cell.key;

                    let bubbleCls = "bg-[#FAF7F2] text-[#261C14]/80 hover:bg-[#F0EAE0]";
                    if (hasMed && hasSes) bubbleCls = "bg-[#CBEFFF] text-[#115D78] font-bold";
                    else if (hasMed) bubbleCls = "bg-[#CFEDE8] text-[#166064] font-bold";
                    else if (hasSes) bubbleCls = "bg-[#FFD6E5] text-[#9E2A47] font-bold";

                    if (isSelected) {
                      bubbleCls =
                        "bg-gradient-to-br from-[#4DB6B0] to-[#239BA2] text-white font-bold shadow-[0_6px_16px_rgba(35,155,162,0.35)] scale-105";
                    }

                    return (
                      <button
                        key={cell.key}
                        type="button"
                        onClick={() => setSelectedDay(cell.key)}
                        className={`relative flex h-11 w-11 flex-col items-center justify-center rounded-full text-sm transition sm:h-12 sm:w-12 ${bubbleCls} ${
                          isToday && !isSelected ? "ring-2 ring-[#239BA2]" : ""
                        }`}
                      >
                        <span>{cell.day}</span>
                        {(hasMed || hasSes) && (
                          <span className="mt-0.5 flex gap-0.5">
                            {hasMed && (
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isSelected ? "bg-[#CFEDE8]" : "bg-[#239BA2]"
                                }`}
                              />
                            )}
                            {hasSes && (
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isSelected ? "bg-[#FFD6E5]" : "bg-[#E8809A]"
                                }`}
                              />
                            )}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-[#261C14]/5 pt-4 text-xs font-semibold text-[#261C14]/65">
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full bg-[#CFEDE8]" />
                    {t("Cita médica", "Medical visit")}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full bg-[#FFD6E5]" />
                    {t("Sanador / Círculo", "Healer / Circle")}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full bg-[#239BA2]" />
                    {t("Seleccionado", "Selected")}
                  </span>
                </div>
              </div>

              {/* 2 Bento cards debajo del calendario */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => nextMed && (setSelectedDay(nextMed.date), openDetail(nextMed))}
                  className="flex flex-col justify-between rounded-[26px] bg-[#CFEDE8] p-4 sm:p-5 text-left transition hover:brightness-97 active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#166064]">
                      <Stethoscope className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#166064]/75">
                      {t("Próxima cita", "Next visit")}
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-[#166064]">
                      {nextMed ? `${nextMed.date.slice(8, 10)}/${nextMed.date.slice(5, 7)}` : "--"}
                    </p>
                    <p className="truncate text-xs font-semibold text-[#166064]/80">
                      {nextMed ? nextMed.title : t("Sin citas", "No visits")}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => nextSes && (setSelectedDay(nextSes.date), openDetail(nextSes))}
                  className="flex flex-col justify-between rounded-[26px] bg-[#FFD6E5] p-4 sm:p-5 text-left transition hover:brightness-97 active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#9E2A47]">
                      <CalendarHeart className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E2A47]/75">
                      {t("Sanación", "Healing")}
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-[#9E2A47]">
                      {nextSes ? `${nextSes.date.slice(8, 10)}/${nextSes.date.slice(5, 7)}` : "--"}
                    </p>
                    <p className="truncate text-xs font-semibold text-[#9E2A47]/80">
                      {nextSes ? nextSes.title : t("Reserva gratis", "Book free")}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* DERECHA (5 cols): Schedule Pastel + Healing Circles */}
            <div className="space-y-4 lg:col-span-5">
              <div className="rounded-[32px] bg-white p-6 shadow-xs ring-1 ring-[#261C14]/5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#261C14]/45">
                      {t("Agenda del día", "Day schedule")}
                    </span>
                    <h3 className="text-xl font-bold capitalize text-[#261C14]">
                      {fmtDate(selectedDay)}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openSheet("add-cita", { fecha: selectedDay, hora: "09:30 AM" })}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#4DB6B0] to-[#239BA2] px-4 py-2 text-xs font-bold text-white shadow-[0_6px_16px_rgba(35,155,162,0.28)] transition hover:brightness-105 active:scale-95"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t("Nueva cita", "New visit")}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openSheet("book", {
                          healer: String(healers[0]?.id ?? ""),
                          para: "cuidador",
                          modalidad: "online",
                          fecha: selectedDay,
                          gratis: "1",
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#FCECEE] px-4 py-2 text-xs font-bold text-[#C94A6A] ring-1 ring-[#E8809A]/25 transition hover:bg-[#E8809A] hover:text-white active:scale-95"
                    >
                      <CalendarHeart className="h-3.5 w-3.5" />
                      {t("Sanador", "Healer")}
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {selectedDayEvents.length > 0 ? (
                    selectedDayEvents.map((ev: any, idx: number) => {
                      const style = SCHEDULE_PASTELS[idx % SCHEDULE_PASTELS.length];
                      const isMed = ev.kind === "med";
                      return (
                        <div
                          key={idx}
                          onClick={() => openDetail(ev)}
                          className={`group cursor-pointer rounded-[24px] ${style.bg} p-4 transition hover:scale-[1.01] hover:shadow-sm`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <span
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-2xs ${style.iconBg}`}
                              >
                                {isMed ? <Stethoscope className="h-5 w-5" /> : <CalendarHeart className="h-5 w-5" />}
                              </span>
                              <div className="min-w-0">
                                <h4 className="truncate text-base font-bold text-[#261C14]">{ev.title}</h4>
                                <p className="truncate text-xs font-medium text-[#261C14]/70">
                                  {ev.hora || "09:30 AM"} {ev.sub ? `· ${ev.sub}` : ""}
                                </p>
                              </div>
                            </div>
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#261C14]">
                              <ChevronRight className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-[24px] bg-[#FAF7F2] p-5 text-center">
                      <p className="text-sm font-bold text-[#261C14]/75">
                        {t("Día libre de citas médicas 🌿", "No appointments scheduled today 🌿")}
                      </p>
                      <p className="mt-1 text-xs text-[#261C14]/55">
                        {t("Aquí abajo ves las próximas fechas confirmadas.", "See upcoming confirmed dates below.")}
                      </p>
                    </div>
                  )}
                </div>

                {upcoming.length > 0 && (
                  <div className="mt-6 border-t border-[#261C14]/5 pt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#261C14]/45">
                        {t("Próximas fechas", "Upcoming dates")}
                      </span>
                      <span className="text-xs font-bold text-[#261C14]/50">{upcoming.length}</span>
                    </div>
                    <div className="space-y-2.5">
                      {upcoming.slice(0, 3).map((ev: any, idx: number) => {
                        const style = SCHEDULE_PASTELS[(idx + 1) % SCHEDULE_PASTELS.length];
                        const isMed = ev.kind === "med";
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedDay(ev.date);
                              openDetail(ev);
                            }}
                            className={`flex cursor-pointer items-center justify-between gap-3 rounded-[22px] ${style.bg} px-4 py-3 transition hover:brightness-97`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.iconBg}`}>
                                {isMed ? <Stethoscope className="h-4 w-4" /> : <CalendarHeart className="h-4 w-4" />}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-[#261C14]">{ev.title}</p>
                                <p className="truncate text-[11px] font-medium text-[#261C14]/65">
                                  {fmtDate(ev.date)} · {ev.hora || ev.sub}
                                </p>
                              </div>
                            </div>
                            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#261C14]">
                              {ev.date.slice(8, 10)}/{ev.date.slice(5, 7)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Tarjeta Healing Circles idéntica a Paciente */}
              <div className="rounded-[32px] bg-white p-5 shadow-xs ring-1 ring-[#261C14]/5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-center">
                  <div className="relative h-44 overflow-hidden rounded-[22px] sm:col-span-5 sm:h-full min-h-[175px]">
                    <img src="/img/love-circle.jpg" alt="Healing Circles" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="rounded-full bg-[#239BA2] px-2.5 py-0.5 text-[10px] font-bold text-white">
                        100% gratis
                      </span>
                      <h4 className="mt-1 font-serif text-lg font-bold leading-tight text-white">
                        Healing Circles
                      </h4>
                      <p className="text-[11px] text-white/85">Kelsie & Omar · Zoom</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 sm:col-span-7">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[#261C14]/45">
                      {t("Próximos círculos en vivo", "Upcoming live circles")}
                    </span>
                    <div className="space-y-2">
                      {HEALING_CIRCLES.map((c, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedCircle(c)}
                          className={`flex w-full items-center justify-between gap-2 rounded-2xl ${c.pastel} px-3.5 py-2.5 text-left transition hover:brightness-97`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex h-8 w-9 shrink-0 flex-col items-center justify-center rounded-xl bg-white text-[10px] font-extrabold leading-tight text-[#261C14]">
                              <span>{c.dayNum}</span>
                              <span className="text-[8px] uppercase text-[#261C14]/55">
                                {isEs ? c.monthShortEs : c.monthShortEn}
                              </span>
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-[#261C14]">
                                {isEs ? c.topicEs : c.topicEn}
                              </p>
                              <p className="text-[10px] font-medium text-[#261C14]/65">{c.time}</p>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#261C14]">
                            {t("Ver", "View")}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 2: BOTIQUÍN Y HORARIOS (IDÉNTICO A PACIENTE) */}
      {tab === "medicinas" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="flex flex-col justify-between rounded-[28px] bg-[#FFD6E5] p-5 md:col-span-4">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#9E2A47] shadow-2xs">
                  <Pill className="h-5 w-5" />
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setMedModal({ open: true, kind: "med", nombre: "", dosis: "", horario: "08:00 AM", indicaciones: "" })
                  }
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[#9E2A47] shadow-2xs transition hover:bg-[#9E2A47] hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("Agregar", "Add")}
                </button>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-[#9E2A47]">{listaMedicamentos.length}</p>
                <p className="text-xs font-bold text-[#9E2A47]/80">
                  {t("Medicamentos prescritos", "Prescribed medications")}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-[28px] bg-[#CFEDE8] p-5 md:col-span-4">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#166064] shadow-2xs">
                  <Leaf className="h-5 w-5" />
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setMedModal({ open: true, kind: "supp", nombre: "", dosis: "", horario: "01:00 PM", indicaciones: "" })
                  }
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[#166064] shadow-2xs transition hover:bg-[#166064] hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("Agregar", "Add")}
                </button>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-[#166064]">{listaSuplementos.length}</p>
                <p className="text-xs font-bold text-[#166064]/80">
                  {t("Suplementos y apoyo", "Supplements & support")}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-[28px] bg-white p-5 shadow-xs ring-1 ring-[#261C14]/5 md:col-span-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#261C14]/45">
                  {t(`Sincronizado con ${patientFirst}`, `Synced with ${patientFirst}`)}
                </span>
                <h3 className="mt-0.5 text-base font-bold text-[#261C14]">
                  {t("Filtrar por horario", "Filter by time")}
                </h3>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(
                  [
                    { id: "all", label: t("Todos", "All") },
                    { id: "manana", label: t("Mañana", "Morning") },
                    { id: "tarde", label: t("Tarde", "Afternoon") },
                    { id: "noche", label: t("Noche", "Night") },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setMedFilter(f.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      medFilter === f.id
                        ? "bg-[#E8809A] text-white shadow-2xs"
                        : "bg-[#FAF7F2] text-[#261C14]/65 hover:bg-[#FCECEE]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <h4 className="px-1 text-base font-bold text-[#261C14]">
                {t("Medicamentos prescritos", "Prescribed medications")}
              </h4>
              <div className="space-y-2.5">
                {listaMedicamentos
                  .filter((m: any) => medFilter === "all" || getTimeSlot(m.horario).id === medFilter)
                  .map((m: any) => {
                    const slot = getTimeSlot(m.horario);
                    const SlotIcon = slot.icon;
                    return (
                      <div
                        key={m.index}
                        className="flex items-center justify-between gap-3 rounded-[24px] bg-white p-4 shadow-2xs ring-1 ring-[#261C14]/5"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${slot.bg} text-[#261C14]`}>
                            <SlotIcon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h5 className="truncate text-sm font-bold text-[#261C14] sm:text-base">{m.nombre}</h5>
                              {m.dosis && (
                                <span className="rounded-full bg-[#FCECEE] px-2.5 py-0.5 text-[10px] font-bold text-[#C94A6A]">
                                  {m.dosis}
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 truncate text-xs text-[#261C14]/60">
                              <strong className="font-semibold text-[#239BA2]">{m.horario}</strong>
                              {m.indicaciones ? ` · ${m.indicaciones}` : ""}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => runAction("delete_medication", { index: m.index }, t("Eliminado", "Removed"))}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FAF7F2] text-[#261C14]/50 transition hover:bg-[#E8809A] hover:text-white"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="px-1 text-base font-bold text-[#261C14]">
                {t("Suplementos y apoyo", "Supplements & support")}
              </h4>
              <div className="space-y-2.5">
                {listaSuplementos
                  .filter((s: any) => medFilter === "all" || getTimeSlot(s.horario).id === medFilter)
                  .map((s: any) => {
                    const slot = getTimeSlot(s.horario);
                    const SlotIcon = slot.icon;
                    return (
                      <div
                        key={s.index}
                        className="flex items-center justify-between gap-3 rounded-[24px] bg-white p-4 shadow-2xs ring-1 ring-[#261C14]/5"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${slot.bg} text-[#261C14]`}>
                            <SlotIcon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h5 className="truncate text-sm font-bold text-[#261C14] sm:text-base">{s.nombre}</h5>
                              {s.dosis && (
                                <span className="rounded-full bg-[#EAF6F4] px-2.5 py-0.5 text-[10px] font-bold text-[#1E747A]">
                                  {s.dosis}
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 truncate text-xs text-[#261C14]/60">
                              <strong className="font-semibold text-[#239BA2]">{s.horario}</strong>
                              {s.indicaciones ? ` · ${s.indicaciones}` : ""}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => runAction("delete_supplement", { index: s.index }, t("Eliminado", "Removed"))}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FAF7F2] text-[#261C14]/50 transition hover:bg-[#E8809A] hover:text-white"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE EVENTO */}
      {detailEvent && (
        <div className="fixed inset-0 z-[65] flex items-end justify-center p-0 sm:items-center sm:p-4 animate-fade-in">
          <div onClick={() => setDetailEvent(null)} className="absolute inset-0 bg-[#261C14]/50 backdrop-blur-xs" />
          <div className="relative z-10 w-full max-w-lg rounded-t-[32px] bg-white p-6 shadow-2xl sm:rounded-[32px]">
            <div className="flex items-start justify-between gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-bold ${detailEvent.kind === "med" ? "bg-[#CFEDE8] text-[#166064]" : "bg-[#FFD6E5] text-[#9E2A47]"}`}>
                {detailEvent.kind === "med" ? <Stethoscope className="h-3.5 w-3.5" /> : <CalendarHeart className="h-3.5 w-3.5" />}
                {detailEvent.kind === "med" ? t("Cita médica", "Medical visit") : t("Sesión Love Heals", "Love Heals Session")}
              </span>
              <button type="button" onClick={() => setDetailEvent(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF7F2]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <h3 className="mt-3 text-xl font-bold text-[#261C14]">{detailEvent.title}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[#239BA2]">
              <Calendar className="h-3.5 w-3.5" />
              {fmtDate(detailEvent.date)} {detailEvent.hora ? `· ${detailEvent.hora}` : ""}
            </p>
            {detailEvent.lugar && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-[#261C14]/70">
                <MapPin className="h-3.5 w-3.5 text-[#E8809A]" />
                {detailEvent.lugar}
              </p>
            )}
            {detailEvent.kind === "med" && (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    await runAction("delete_medical_appointment", { index: detailEvent.idx }, t("Cita eliminada", "Visit deleted"));
                    setDetailEvent(null);
                  }}
                  className="text-xs font-bold text-[#C94A6A] hover:underline"
                >
                  {t("Eliminar cita", "Delete visit")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL HEALING CIRCLE */}
      {selectedCircle && (
        <div className="fixed inset-0 z-[65] flex items-end justify-center p-0 sm:items-center sm:p-4 animate-fade-in">
          <div onClick={() => setSelectedCircle(null)} className="absolute inset-0 bg-[#261C14]/50 backdrop-blur-xs" />
          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-[32px] bg-white p-6 shadow-2xl sm:rounded-[32px]">
            <div className="flex items-start justify-between">
              <span className="rounded-full bg-[#CFEDE8] px-3.5 py-1 text-[11px] font-bold text-[#166064]">Zoom · 100% Gratis</span>
              <button type="button" onClick={() => setSelectedCircle(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF7F2]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <h3 className="mt-3 font-serif text-2xl font-bold text-[#261C14]">{isEs ? selectedCircle.topicEs : selectedCircle.topicEn}</h3>
            <p className="mt-1 text-xs font-bold text-[#239BA2]">{isEs ? selectedCircle.fullDateEs : selectedCircle.fullDateEn}</p>
            {selectedCircle.videoUrl && (
              <div className="mt-4 aspect-video w-full overflow-hidden rounded-2xl bg-[#FAF7F2]">
                <iframe src={selectedCircle.videoUrl} title={selectedCircle.topicEs} className="h-full w-full" allowFullScreen />
              </div>
            )}
            <p className="mt-4 text-xs leading-relaxed text-[#261C14]/75 sm:text-sm">
              {isEs ? selectedCircle.summaryEs : selectedCircle.summaryEn}
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={async () => {
                  await runAction(
                    "book_healer_session",
                    {
                      asistente_rol: "cuidador",
                      modalidad: "online",
                      fecha_sesion: selectedCircle.iso,
                      es_sesion_gratuita_mensual: true,
                      enlace_o_lugar: `Love Circle · ${selectedCircle.topicEs}`,
                    },
                    t("¡Inscripción confirmada!", "RSVP confirmed!")
                  );
                  setSelectedCircle(null);
                }}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#4DB6B0] to-[#239BA2] py-3 text-xs font-bold text-white"
              >
                <Check className="h-4 w-4" />
                {t("Inscribirnos gratis", "Join for free")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR MEDICINA/SUPLEMENTO */}
      {medModal.open && (
        <div className="fixed inset-0 z-[65] flex items-end justify-center p-0 sm:items-center sm:p-4 animate-fade-in">
          <div onClick={() => setMedModal((p) => ({ ...p, open: false }))} className="absolute inset-0 bg-[#261C14]/50 backdrop-blur-xs" />
          <div className="relative z-10 w-full max-w-md rounded-t-[32px] bg-white p-6 shadow-2xl sm:rounded-[32px]">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#261C14]">
                {medModal.kind === "med" ? t("Nueva medicina", "New medication") : t("Nuevo suplemento", "New supplement")}
              </h3>
              <button type="button" onClick={() => setMedModal((p) => ({ ...p, open: false }))} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF7F2]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveMed} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#261C14]/70">{t("Nombre", "Name")}</label>
                <input required type="text" value={medModal.nombre} onChange={(e) => setMedModal((p) => ({ ...p, nombre: e.target.value }))} className={`mt-1 ${inputCls}`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#261C14]/70">{t("Dosis", "Dose")}</label>
                  <input type="text" value={medModal.dosis} onChange={(e) => setMedModal((p) => ({ ...p, dosis: e.target.value }))} placeholder="20 mg" className={`mt-1 ${inputCls}`} />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#261C14]/70">{t("Horario", "Time")}</label>
                  <input type="text" value={medModal.horario} onChange={(e) => setMedModal((p) => ({ ...p, horario: e.target.value }))} placeholder="08:00 AM" className={`mt-1 ${inputCls}`} />
                </div>
              </div>
              <PrimaryButton type="submit">{t("Guardar", "Save")}</PrimaryButton>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

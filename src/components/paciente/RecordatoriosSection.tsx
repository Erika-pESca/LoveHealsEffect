"use client";

import React from "react";
import {
  Bell,
  CalendarHeart,
  Check,
  ChevronRight,
  Pill,
  Sparkles,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { Card, PrimaryButton, SectionTitle } from "@/components/panel/ui";
import { MiniCalendar } from "@/components/paciente/PacienteDashboard";

interface RecordatoriosSectionProps {
  t: (es: string, en: string) => string;
  isEs: boolean;
  medReminders: any[];
  otherReminders: any[];
  todayHabits: Record<string, boolean>;
  updateDaily: (patch: { habits?: Record<string, boolean> }) => void;
  onReminderClick: (reminder: any) => void;
  reminderIcon: Record<string, any>;
  marks: Record<string, { med: number; ses: number }>;
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  eventsByDay: Record<string, any[]>;
  fmtDate: (dayKey: string) => string;
  runAction: (action: string, payload?: any, msg?: string, options?: any) => Promise<any>;
  openSheet: (sheet: string, initial?: Record<string, string>) => void;
  healers: any[];
}

export function RecordatoriosSection({
  t,
  isEs,
  medReminders,
  otherReminders,
  todayHabits,
  updateDaily,
  onReminderClick,
  reminderIcon,
  marks,
  selectedDay,
  setSelectedDay,
  eventsByDay,
  fmtDate,
  runAction,
  openSheet,
  healers,
}: RecordatoriosSectionProps) {
  return (
    <main className="mt-6 space-y-6">
      <div className="animate-fade-in">
        <h2 className="font-serif text-3xl font-bold leading-tight text-espresso">
          {t("Recordatorios", "Reminders")}
        </h2>
        <p className="mt-1 text-sm text-espresso/60">
          {t(
            "Citas, medicinas, prácticas y sesiones. PONO te los recuerda; compartido con tu cuidador.",
            "Visits, medications, practices and sessions. PONO reminds you; shared with your caregiver."
          )}
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7A4FD1] text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7A4FD1]">
            {t("PONO te recuerda", "PONO reminds you")}
          </span>
        </div>
        <div className="mt-3 space-y-2">
          {medReminders.map((m: any) => {
            const done = Boolean(todayHabits[m.key]);
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => updateDaily({ habits: { [m.key]: !done } })}
                className={`flex w-full items-center gap-3 rounded-2xl bg-[#FAF7F2] px-3.5 py-2.5 text-left ${
                  done ? "opacity-55" : ""
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    done
                      ? "border-[#7A4FD1] bg-[#7A4FD1] text-white"
                      : "border-espresso/25 bg-white"
                  }`}
                >
                  {done && <Check className="h-3.5 w-3.5" />}
                </span>
                <Pill className="h-4 w-4 text-[#C94A6A]" />
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-espresso">
                  {m.label}
                </span>
                <span className="text-xs text-espresso/55">
                  {m.sub.split("·").pop()?.trim()}
                </span>
              </button>
            );
          })}
          {otherReminders.map((r: any) => {
            const Icon = reminderIcon[r.kind] || Bell;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onReminderClick(r)}
                className="flex w-full items-center gap-3 rounded-2xl bg-[#FAF7F2] px-3.5 py-2.5 text-left"
              >
                <Icon className="h-4 w-4 text-[#7A4FD1]" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-espresso">
                    {r.title}
                  </span>
                  <span className="block truncate text-xs text-espresso/55">
                    {r.sub}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-espresso/30" />
              </button>
            );
          })}
          {medReminders.length === 0 && otherReminders.length === 0 && (
            <p className="text-sm text-espresso/60">
              {t("Nada pendiente por ahora. 🌿", "Nothing pending right now. 🌿")}
            </p>
          )}
        </div>
      </Card>

      <Card>
        <MiniCalendar
          marks={marks}
          selected={selectedDay}
          onSelect={setSelectedDay}
          isEs={isEs}
        />
      </Card>

      <div>
        <SectionTitle title={fmtDate(selectedDay)} />
        <div className="space-y-2.5">
          {(eventsByDay[selectedDay] || []).length === 0 && (
            <Card className="text-center text-sm text-espresso/60">
              {t("Nada programado este día. 🌿", "Nothing scheduled. 🌿")}
            </Card>
          )}
          {(eventsByDay[selectedDay] || []).map((ev: any, i: number) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-3xl bg-white px-4 py-3.5 shadow-sm"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                  ev.kind === "med"
                    ? "bg-[#D7F3EA] text-[#239BA2]"
                    : "bg-[#FFE7D6] text-[#F2711C]"
                }`}
              >
                {ev.kind === "med" ? (
                  <Stethoscope className="h-5 w-5" />
                ) : (
                  <CalendarHeart className="h-5 w-5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-espresso">{ev.title}</p>
                <p className="truncate text-xs text-espresso/60">{ev.sub}</p>
              </div>
              {ev.kind === "med" && (
                <button
                  type="button"
                  onClick={() =>
                    runAction(
                      "delete_medical_appointment",
                      { index: ev.idx },
                      t("Cita eliminada", "Removed")
                    )
                  }
                  className="text-espresso/35 transition hover:text-[#C94A6A]"
                  aria-label={t("Eliminar", "Delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <PrimaryButton
          color="from-[#4DB6B0] to-[#239BA2]"
          onClick={() =>
            openSheet("add-cita", { fecha: selectedDay, hora: "09:30 AM" })
          }
        >
          <Stethoscope className="h-5 w-5" />
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
          <CalendarHeart className="h-5 w-5" />
          {t("Reservar con un sanador", "Book with a healer")}
        </PrimaryButton>
      </div>
    </main>
  );
}

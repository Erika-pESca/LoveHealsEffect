"use client";

import React from "react";
import {
  CalendarHeart,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { Card, PrimaryButton, SectionTitle } from "@/components/panel/ui";
import { MiniCalendar } from "@/components/paciente/PacienteDashboard";
import { TEAL } from "./types";

interface AgendaSectionProps {
  t: (es: string, en: string) => string;
  isEs: boolean;
  patientFirst: string;
  marks: Record<string, { med: number; ses: number }>;
  selectedDay: string;
  setSelectedDay: (d: string) => void;
  fmtDate: (d: string) => string;
  eventsByDay: Record<string, any[]>;
  runAction: (action: string, payload?: any, message?: string, options?: any) => Promise<any>;
  openSheet: (sheet: string, initial?: Record<string, string>) => void;
  healers: any[];
}

export function AgendaSection({
  t,
  isEs,
  patientFirst,
  marks,
  selectedDay,
  setSelectedDay,
  fmtDate,
  eventsByDay,
  runAction,
  openSheet,
  healers,
}: AgendaSectionProps) {
  return (
    <main className="mt-6 space-y-6">
      <div className="animate-fade-in">
        <h2 className="text-3xl font-semibold tracking-[-0.025em] leading-tight text-espresso">
          {t("Agenda familiar", "Family schedule")}
        </h2>
        <p className="mt-1 text-sm text-espresso/60">
          {t(
            `Citas de ${patientFirst} y sesiones con sanadores.`,
            `${patientFirst}'s visits and healer sessions.`
          )}
        </p>
      </div>

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
          color={TEAL}
          onClick={() => openSheet("add-cita", { fecha: selectedDay, hora: "09:30 AM" })}
        >
          <Stethoscope className="h-5 w-5" />
          {t("Nueva cita médica", "New medical visit")}
        </PrimaryButton>
        <PrimaryButton
          onClick={() =>
            openSheet("book", {
              healer: String(healers[0]?.id ?? ""),
              para: "cuidador",
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

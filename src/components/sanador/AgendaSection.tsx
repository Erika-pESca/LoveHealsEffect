"use client";

import React from "react";
import { Card } from "@/components/panel/ui";

interface AgendaSectionProps {
  t: (es: string, en: string) => string;
  isEs: boolean;
  sessions: any[];
  gross: number;
  fee: number;
  bookingFilter: "programada" | "completada" | "todas";
  setBookingFilter: (filter: "programada" | "completada" | "todas") => void;
  visibleSessions: any[];
  patientOf: (fichaId: number) => any;
  fmtDate: (d: string) => string;
  openLog: (patientId?: number, sessionId?: number) => void;
  runAction: (action: string, payload: Record<string, any>, message: string) => Promise<boolean>;
}

export function AgendaSection({
  t,
  isEs,
  sessions,
  gross,
  fee,
  bookingFilter,
  setBookingFilter,
  visibleSessions,
  patientOf,
  fmtDate,
  openLog,
  runAction,
}: AgendaSectionProps) {
  return (
    <main className="mt-6 space-y-5">
      <div className="animate-fade-in">
        <h2 className="text-3xl font-semibold tracking-[-0.025em] leading-tight text-espresso">
          {t("Reservas", "Bookings")}
        </h2>
        <p className="mt-1 text-sm text-espresso/60">
          {t("Sesiones online y en persona.", "Online and in-person sessions.")}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { v: sessions.length, l: t("Reservadas", "Booked"), bg: "bg-[#E4E0FA]" },
          { v: `$${gross}`, l: t("Facturación", "Billing"), bg: "bg-[#D7F3EA]" },
          { v: `$${fee}`, l: t("Fee LHEAPP 15%", "LHEAPP fee 15%"), bg: "bg-[#FAD4DC]" },
        ].map((s) => (
          <div key={s.l} className={`rounded-3xl ${s.bg} py-4 text-center`}>
            <div className="text-2xl font-semibold tracking-[-0.025em] text-espresso">{s.v}</div>
            <div className="text-[10px] font-bold text-espresso/60">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-1.5 rounded-full bg-white p-1.5 shadow-sm">
        {(
          [
            ["programada", t("Programadas", "Scheduled")],
            ["completada", t("Completadas", "Completed")],
            ["todas", t("Todas", "All")],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setBookingFilter(id)}
            className={`rounded-full py-2.5 text-xs font-bold transition ${
              bookingFilter === id
                ? "bg-espresso text-white shadow"
                : "text-espresso/60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visibleSessions.length === 0 && (
          <Card className="text-center text-sm text-espresso/60">
            {t("Nada por aquí. 🌿", "Nothing here. 🌿")}
          </Card>
        )}
        {visibleSessions.map((s) => {
          const p = patientOf(s.ficha_paciente_id);
          return (
            <div key={s.id} className="rounded-[26px] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F48EA6] to-[#B03052] font-semibold text-white">
                  {(p?.nombre_paciente || "P").charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-espresso">
                    {p?.nombre_paciente || t("Paciente", "Patient")}
                  </p>
                  <p className="truncate text-xs text-espresso/60">{s.enlace_o_lugar}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    s.estado_cita === "completada"
                      ? "bg-[#5C8D67]/15 text-[#2A5C35]"
                      : s.estado_cita === "cancelada"
                      ? "bg-espresso/10 text-espresso/60"
                      : "bg-[#FFF1B8] text-[#8A6A00]"
                  }`}
                >
                  {s.estado_cita}
                </span>
              </div>
              <p className="mt-2 text-xs text-espresso/60">
                {fmtDate(s.fecha_sesion)} · {String(s.modalidad).toUpperCase()} ·{" "}
                {t("Asiste", "Attends")}: {s.asistente_rol}
                {s.es_sesion_gratuita_mensual ? ` · ${t("gratuita", "free")}` : ""}
              </p>
              {s.estado_cita === "programada" && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openLog(s.ficha_paciente_id, s.id)}
                    className="flex-1 rounded-full bg-[#D85678] py-2 text-xs font-bold text-white"
                  >
                    {t("Registrar bitácora", "Log session")}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      runAction(
                        "update_session_status",
                        { session_id: s.id, estado_cita: "cancelada" },
                        t("Sesión cancelada", "Session cancelled")
                      )
                    }
                    className="rounded-full border border-espresso/15 px-4 py-2 text-xs font-bold text-espresso/70"
                  >
                    {t("Cancelar", "Cancel")}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

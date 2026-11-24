"use client";

import React from "react";
import { Card } from "@/components/panel/ui";

interface TicketsSectionProps {
  t: (es: string, en: string) => string;
  isEs: boolean;
  openTickets: any[];
  ticketFilter: "abiertos" | "resueltos";
  setTicketFilter: (filter: "abiertos" | "resueltos") => void;
  shownTickets: any[];
  setSelectedId: (id: number | null) => void;
  openSheet: (sheet: string, initial?: Record<string, string>) => void;
}

export function TicketsSection({
  t,
  isEs,
  openTickets,
  ticketFilter,
  setTicketFilter,
  shownTickets,
  setSelectedId,
  openSheet,
}: TicketsSectionProps) {
  return (
    <main className="mt-6 space-y-5">
      <div className="animate-fade-in">
        <h2 className="text-3xl font-semibold tracking-[-0.025em] leading-tight text-espresso">
          {t("Tickets y feedback", "Tickets & feedback")}
        </h2>
        <p className="mt-1 text-sm text-espresso/60">
          {t(
            "Lo que reportan pacientes, cuidadores y sanadores.",
            "What patients, caregivers and healers report."
          )}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-1.5 rounded-full bg-white p-1.5 shadow-sm">
        {(
          [
            ["abiertos", `${t("Abiertos", "Open")} (${openTickets.length})`],
            ["resueltos", t("Resueltos", "Resolved")],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTicketFilter(id)}
            className={`rounded-full py-2.5 text-xs font-bold transition ${
              ticketFilter === id
                ? "bg-espresso text-white shadow"
                : "text-espresso/60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {shownTickets.length === 0 && (
          <Card className="text-center text-sm text-espresso/60">
            {t("Todo en orden por aquí. 🌿", "All clear here. 🌿")}
          </Card>
        )}
        {shownTickets.map((tk: any) => (
          <button
            key={tk.id}
            type="button"
            onClick={() => {
              setSelectedId(tk.id);
              openSheet("ticket", { respuesta: tk.respuesta_admin || "" });
            }}
            className="block w-full rounded-[26px] bg-white p-4 text-left shadow-sm transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${
                  tk.tipo === "bug"
                    ? "bg-[#FAD4DC] text-[#C94A6A]"
                    : tk.tipo === "soporte"
                    ? "bg-[#D9E8FB] text-[#3D7BD6]"
                    : "bg-[#FFF1B8] text-[#8A6A00]"
                }`}
              >
                {tk.tipo}
              </span>
              <span className="text-[11px] font-semibold text-espresso/50">
                {tk.rol_usuario}
              </span>
            </div>
            <p className="mt-2 text-sm font-bold text-espresso">{tk.asunto}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-espresso/65">{tk.descripcion}</p>
          </button>
        ))}
      </div>
    </main>
  );
}

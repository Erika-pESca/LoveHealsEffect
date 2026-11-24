"use client";

import React from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import { STAGES } from "@/components/paciente/PacienteDashboard";

interface PacientesSectionProps {
  t: (es: string, en: string) => string;
  isEs: boolean;
  fichas: any[];
  setPatientId: (id: number | null) => void;
  openSheet: (sheet: string, initial?: Record<string, string>) => void;
}

export function PacientesSection({
  t,
  isEs,
  fichas,
  setPatientId,
  openSheet,
}: PacientesSectionProps) {
  return (
    <main className="mt-6 space-y-5">
      <div className="animate-fade-in">
        <h2 className="text-3xl font-semibold tracking-[-0.025em] leading-tight text-espresso">
          {t("Mis pacientes", "My patients")}
        </h2>
        <p className="mt-1 text-sm text-espresso/60">
          {t(
            "Toca una ficha para leer el resumen de PONO IA antes de la sesión.",
            "Tap a chart to read the PONO AI summary before the session."
          )}
        </p>
      </div>
      <div className="space-y-3">
        {fichas.map((f) => {
          const stage = STAGES.find((s) => s.id === f.etapa_actual) || STAGES[0];
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setPatientId(f.id);
                openSheet("patient");
              }}
              className="flex w-full items-center gap-4 rounded-[26px] bg-white p-4 text-left shadow-[0_8px_22px_rgba(80,60,90,0.07)] transition active:scale-[0.98]"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F48EA6] to-[#B03052] text-xl font-semibold tracking-[-0.025em] text-white">
                {(f.nombre_paciente || "P").charAt(0)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-bold text-espresso">
                  {f.nombre_paciente}
                </span>
                <span className="mt-0.5 block text-xs text-espresso/60">
                  {stage.emoji} {isEs ? stage.es : stage.en} ·{" "}
                  {f.caregiverName
                    ? `${t("con", "with")} ${f.caregiverName.split(" ")[0]}`
                    : t("sin cuidador", "no caregiver")}
                </span>
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#E7F2F1] px-2.5 py-0.5 text-[10px] font-bold text-[#239BA2]">
                  <Sparkles className="h-3 w-3" />
                  {t("Resumen PONO IA listo", "PONO AI summary ready")}
                </span>
              </span>
              <ChevronRight className="h-5 w-5 text-espresso/30" />
            </button>
          );
        })}
      </div>
    </main>
  );
}

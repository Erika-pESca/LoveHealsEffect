"use client";

import React from "react";
import { Heart, UserPlus, Users } from "lucide-react";
import { PrimaryButton, SectionTitle } from "@/components/panel/ui";
import { STAGES } from "@/components/paciente/PacienteDashboard";
import { DARK, ROLE_STYLE } from "./types";

interface FamiliasSectionProps {
  t: (es: string, en: string) => string;
  isEs: boolean;
  familyCells: any[];
  users: any[];
  setSelectedId: (id: number | null) => void;
  openSheet: (sheet: string, initial?: Record<string, string>) => void;
}

export function FamiliasSection({
  t,
  isEs,
  familyCells,
  users,
  setSelectedId,
  openSheet,
}: FamiliasSectionProps) {
  return (
    <main className="mt-6 space-y-6">
      <div className="animate-fade-in">
        <h2 className="font-serif text-3xl font-bold leading-tight text-espresso">
          {t("Familias y usuarios", "Families & users")}
        </h2>
        <p className="mt-1 text-sm text-espresso/60">
          {t("Vínculos 1 a 1, roles y suscripciones.", "1-to-1 links, roles and subscriptions.")}
        </p>
      </div>

      <div>
        <SectionTitle title={t("Células familiares", "Family cells")} />
        <div className="space-y-3">
          {familyCells.map((cell: any) => {
            const stage = STAGES.find((s) => s.id === cell.etapa_actual) || STAGES[0];
            return (
              <div key={cell.id} className="rounded-[26px] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-serif text-base font-bold text-espresso">
                    {cell.nombre_familia}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      cell.estado_vinculo === "vinculado"
                        ? "bg-[#5C8D67]/15 text-[#2A5C35]"
                        : "bg-[#FFF1B8] text-[#8A6A00]"
                    }`}
                  >
                    {cell.estado_vinculo === "vinculado"
                      ? `✓ ${t("Vinculados", "Linked")}`
                      : t("Pendiente", "Pending")}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1.5 rounded-full bg-[#FAD4DC] px-3 py-1.5 font-bold text-espresso">
                    <Heart className="h-3 w-3 text-[#C94A6A]" />
                    {String(cell.nombre_paciente).split(" ")[0]}
                  </span>
                  <span className="text-espresso/30">↔</span>
                  <span className="flex items-center gap-1.5 rounded-full bg-[#D7F3EA] px-3 py-1.5 font-bold text-espresso">
                    <Users className="h-3 w-3 text-[#239BA2]" />
                    {cell.caregiverUser
                      ? String(cell.caregiverUser.nombre).split(" ")[0]
                      : t("Pendiente", "Pending")}
                  </span>
                </div>
                <p className="mt-2.5 text-xs text-espresso/55">
                  {stage.emoji} {isEs ? stage.es : stage.en} · {cell.sessionsCount}{" "}
                  {t("sesiones", "sessions")}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <SectionTitle title={t("Usuarios", "Users")} />
        <div className="overflow-hidden rounded-[28px] bg-white shadow-sm">
          {users.map((u: any, i: number) => {
            const rs = ROLE_STYLE[u.rol] || ROLE_STYLE.paciente;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setSelectedId(u.id);
                  openSheet("user");
                }}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[#FAF7F2] ${
                  i > 0 ? "border-t border-espresso/5" : ""
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${rs.bg} ${rs.fg} font-serif text-lg font-bold`}
                >
                  {String(u.nombre).charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-espresso">
                    {u.nombre}
                  </span>
                  <span className="block truncate text-xs text-espresso/55">
                    {u.correo}
                  </span>
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    u.nivel_suscripcion === "pagada"
                      ? "bg-[#FFF1B8] text-[#8A6A00]"
                      : "bg-espresso/5 text-espresso/55"
                  }`}
                >
                  {u.nivel_suscripcion === "pagada" ? "★ $10" : t("Gratis", "Free")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <PrimaryButton
        color={DARK}
        onClick={() =>
          openSheet("new-user", { rol: "paciente", plan: "gratuita", pass: "Love2026" })
        }
      >
        <UserPlus className="h-5 w-5" />
        {t("Crear usuario del piloto", "Create pilot user")}
      </PrimaryButton>
    </main>
  );
}

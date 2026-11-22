"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Heart, Sparkles, Users } from "lucide-react";
import { Card, SectionTitle } from "@/components/panel/ui";
import { DARK } from "./types";

interface InicioSectionProps {
  t: (es: string, en: string) => string;
  isEs: boolean;
  metrics: any;
  pilotPct: number;
  goToTab: (tab: string) => void;
  familyCells: any[];
  setSelectedId: (id: number | null) => void;
  openSheet: (sheet: string, initial?: Record<string, string>) => void;
}

export function InicioSection({
  t,
  isEs,
  metrics,
  pilotPct,
  goToTab,
  familyCells,
  setSelectedId,
  openSheet,
}: InicioSectionProps) {
  return (
    <main className="mt-6 space-y-7">
      <section className="animate-fade-in">
        <div
          className={`relative overflow-hidden rounded-[32px] bg-gradient-to-br ${DARK} p-6 text-white shadow-[0_14px_34px_rgba(38,35,34,0.3)]`}
        >
          <span className="absolute -right-1 top-3 select-none text-7xl opacity-90">🌺</span>
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold">
            {t("Piloto V1 · Honolulu", "V1 Pilot · Honolulu")}
          </span>
          <h2 className="mt-3 max-w-[72%] font-serif text-3xl font-bold leading-tight">
            {metrics.totalFamilies} {t("de 3 familias", "of 3 families")}
          </h2>
          <div className="mt-3 h-2.5 max-w-[75%] overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#F48EA6] to-[#F7A27F] transition-all"
              style={{ width: `${pilotPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold text-white/75">
            {metrics.linkedFamilies} {t("vinculadas 1 a 1", "linked 1-to-1")}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {[
          {
            v: metrics.totalUsers,
            l: t("Usuarios", "Users"),
            sub: `${metrics.totalPatients} ${t("pacientes", "patients")} · ${metrics.totalCaregivers} ${t(
              "cuidadores",
              "caregivers"
            )}`,
            bg: "bg-[#D7F3EA]",
            go: () => goToTab("familias"),
          },
          {
            v: metrics.paidUsers,
            l: t("Membresías $10", "$10 memberships"),
            sub: `${metrics.totalSessions} ${t("sesiones", "sessions")}`,
            bg: "bg-[#FFF1B8]",
            go: () => goToTab("familias"),
          },
          {
            v: metrics.totalFamilies,
            l: t("Familias 1 a 1", "1-to-1 families"),
            sub: `${metrics.linkedFamilies} ${t("vinculadas", "linked")}`,
            bg: "bg-[#FAD4DC]",
            go: () => goToTab("familias"),
          },
          {
            v: metrics.openTickets,
            l: t("Tickets abiertos", "Open tickets"),
            sub: t("Toca para revisar", "Tap to review"),
            bg: "bg-[#E4E0FA]",
            go: () => goToTab("alertas"),
          },
        ].map((m) => (
          <button
            key={m.l}
            type="button"
            onClick={m.go}
            className={`rounded-3xl ${m.bg} p-4 text-left transition active:scale-[0.97]`}
          >
            <div className="font-serif text-4xl font-bold text-espresso">{m.v}</div>
            <div className="mt-0.5 text-xs font-bold text-espresso/80">{m.l}</div>
            <div className="mt-0.5 text-[10px] font-semibold text-espresso/55">{m.sub}</div>
          </button>
        ))}
      </section>

      <section>
        <SectionTitle title={t("Entrenar a PONO IA", "Train PONO AI")} />
        <p className="-mt-1 mb-3 text-xs text-espresso/60">
          {t(
            "Revisa y aprueba el resumen que verán Omar y Kelsie de cada paciente.",
            "Review and approve the summary Omar and Kelsie see for each patient."
          )}
        </p>
        <div className="space-y-2.5">
          {familyCells.length === 0 && (
            <Card className="text-center text-sm text-espresso/60">
              {t("Aún no hay familias registradas.", "No families registered yet.")}
            </Card>
          )}
          {familyCells.map((cell: any) => (
            <button
              key={cell.id}
              type="button"
              onClick={() => {
                setSelectedId(cell.id);
                openSheet("pono", { resumen: cell.resumen_ia_pono || "" });
              }}
              className="flex w-full items-center gap-3 rounded-3xl bg-white px-4 py-3.5 text-left shadow-sm transition active:scale-[0.98]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E7F2F1] text-[#239BA2]">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-espresso">
                  {cell.nombre_paciente}
                </span>
                <span className="block truncate text-xs text-espresso/60">
                  {cell.nombre_familia}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 text-espresso/30" />
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle title={t("Ver como…", "View as…")} />
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: "/paciente", label: t("Paciente", "Patient"), bg: "bg-[#FAD4DC]", fg: "text-[#C94A6A]", icon: Heart },
            { href: "/cuidador", label: t("Cuidador", "Caregiver"), bg: "bg-[#D7F3EA]", fg: "text-[#239BA2]", icon: Users },
            { href: "/sanador", label: t("Sanador", "Healer"), bg: "bg-[#FFE7D6]", fg: "text-[#F2711C]", icon: Sparkles },
          ].map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="flex flex-col items-center gap-2 rounded-3xl bg-white py-4 shadow-sm transition active:scale-95"
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${p.bg} ${p.fg}`}>
                <p.icon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-bold text-espresso/75">{p.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

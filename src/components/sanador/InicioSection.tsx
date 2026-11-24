"use client";

import React from "react";
import {
  CalendarHeart,
  Mic,
  Plus,
  Sparkles,
  UserCog,
  Users,
} from "lucide-react";
import { Card, SectionTitle } from "@/components/panel/ui";
import { CORAL } from "./types";

interface InicioSectionProps {
  t: (es: string, en: string) => string;
  isEs: boolean;
  todayCount: number;
  programmed: any[];
  openLog: (patientId?: number, sessionId?: number) => void;
  fichas: any[];
  published: any[];
  goToTab: (tab: string) => void;
  patientOf: (fichaId: number) => any;
  setPatientId: (id: number | null) => void;
  openSheet: (sheet: string, initial?: Record<string, string>) => void;
  fmtDate: (d: string) => string;
}

export function InicioSection({
  t,
  isEs,
  todayCount,
  programmed,
  openLog,
  fichas,
  published,
  goToTab,
  patientOf,
  setPatientId,
  openSheet,
  fmtDate,
}: InicioSectionProps) {
  return (
    <main className="mt-6 space-y-7">
      <section className="animate-fade-in">
        <div
          className={`relative overflow-hidden rounded-[32px] bg-gradient-to-br ${CORAL} p-6 text-white shadow-[0_14px_34px_rgba(216,86,120,0.3)]`}
        >
          <span className="absolute -right-1 top-3 select-none text-7xl opacity-90">🌺</span>
          <span className="inline-block rounded-full bg-white/25 px-3 py-1 text-[11px] font-bold">
            {t("Tu agenda", "Your agenda")}
          </span>
          <h2 className="mt-3 max-w-[70%] text-3xl font-semibold tracking-[-0.025em] leading-tight">
            {todayCount > 0
              ? t(
                  `${todayCount} sesión${todayCount > 1 ? "es" : ""} hoy`,
                  `${todayCount} session${todayCount > 1 ? "s" : ""} today`
                )
              : t("Hoy sin sesiones", "No sessions today")}
          </h2>
          <p className="mt-1 text-xs font-semibold text-white/85">
            {programmed.length} {t("programadas en total", "scheduled in total")}
          </p>
          <button
            type="button"
            onClick={() => openLog()}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#D85678] shadow-lg transition active:scale-95"
          >
            <Mic className="h-4 w-4" />
            {t("Registrar bitácora", "Record session log")}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {[
          { v: fichas.length, l: t("Pacientes", "Patients"), bg: "bg-[#FAD4DC]" },
          { v: programmed.length, l: t("Programadas", "Scheduled"), bg: "bg-[#D7F3EA]" },
          { v: published.length, l: t("Recursos", "Resources"), bg: "bg-[#FFF1B8]" },
        ].map((s) => (
          <div key={s.l} className={`rounded-3xl ${s.bg} py-4 text-center`}>
            <div className="text-3xl font-semibold tracking-[-0.025em] text-espresso">{s.v}</div>
            <div className="text-[11px] font-bold text-espresso/60">{s.l}</div>
          </div>
        ))}
      </section>

      <section>
        <SectionTitle
          title={t("Próximas sesiones", "Upcoming sessions")}
          action={t("Ver todas", "See all")}
          onAction={() => goToTab("alertas")}
        />
        <div className="space-y-2.5">
          {programmed.length === 0 && (
            <Card className="text-center text-sm text-espresso/60">
              {t("No hay sesiones programadas. 🌿", "No sessions scheduled. 🌿")}
            </Card>
          )}
          {programmed.slice(0, 4).map((s) => {
            const p = patientOf(s.ficha_paciente_id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setPatientId(s.ficha_paciente_id);
                  openSheet("patient");
                }}
                className="flex w-full items-center gap-3 rounded-3xl bg-white px-4 py-3.5 text-left shadow-sm transition active:scale-[0.98]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F48EA6] to-[#B03052] text-lg font-bold text-white">
                  {(p?.nombre_paciente || "P").charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-espresso">
                    {p?.nombre_paciente || t("Paciente", "Patient")}
                  </span>
                  <span className="block truncate text-xs text-espresso/60">
                    {fmtDate(s.fecha_sesion)} · {String(s.modalidad).toUpperCase()}
                  </span>
                </span>
                <span className="flex items-center gap-1 rounded-full bg-[#E7F2F1] px-3 py-1 text-[11px] font-bold text-[#239BA2]">
                  <Sparkles className="h-3 w-3" />
                  PONO
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <SectionTitle title={t("Acceso rápido", "Quick access")} />
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: t("Pacientes", "Patients"), icon: Users, bg: "bg-[#FAD4DC]", fg: "text-[#C94A6A]", go: () => goToTab("pacientes") },
            {
              label: t("Publicar", "Publish"),
              icon: Plus,
              bg: "bg-[#E4E0FA]",
              fg: "text-[#7A4FD1]",
              go: () => openSheet("publish", { tipo: "video_bam", publico: "ambos" }),
            },
            { label: t("Reservas", "Bookings"), icon: CalendarHeart, bg: "bg-[#D7F3EA]", fg: "text-[#239BA2]", go: () => goToTab("alertas") },
            { label: t("Mi ficha", "Profile"), icon: UserCog, bg: "bg-[#FFF1B8]", fg: "text-[#B98A00]", go: () => goToTab("perfil") },
          ].map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={q.go}
              className="flex flex-col items-center gap-2 rounded-3xl bg-white py-4 shadow-sm transition active:scale-95"
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${q.bg} ${q.fg}`}>
                <q.icon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-bold text-espresso/75">{q.label}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

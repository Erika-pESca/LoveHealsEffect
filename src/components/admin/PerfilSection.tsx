"use client";

import React from "react";
import {
  ChevronRight,
  Database,
  Download,
  Globe,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { PrimaryButton, SectionTitle } from "@/components/panel/ui";
import { DARK } from "./types";

interface PerfilSectionProps {
  t: (es: string, en: string) => string;
  isEs: boolean;
  adminUser: any;
  users: any[];
  familyCells: any[];
  contents: any[];
  sessions: any[];
  payments: any[];
  tickets: any[];
  handleExport: () => void;
  setLocale: (l: "en" | "es") => void;
  handleLogout: () => void;
}

export function PerfilSection({
  t,
  isEs,
  adminUser,
  users,
  familyCells,
  contents,
  sessions,
  payments,
  tickets,
  handleExport,
  setLocale,
  handleLogout,
}: PerfilSectionProps) {
  return (
    <main className="mt-6 space-y-6">
      <div className="animate-fade-in text-center">
        <div
          className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${DARK} text-white shadow-lg`}
        >
          <ShieldCheck className="h-10 w-10 text-[#E8809A]" />
        </div>
        <h2 className="mt-3 font-serif text-2xl font-bold text-espresso">
          {adminUser.nombre}
        </h2>
        <p className="text-xs text-espresso/55">{adminUser.correo}</p>
      </div>

      <div>
        <SectionTitle title={t("Base de datos (7 tablas)", "Database (7 tables)")} />
        <div className="overflow-hidden rounded-[28px] bg-white shadow-sm">
          {[
            { n: "usuarios", c: users.length },
            { n: "ficha_paciente", c: familyCells.length },
            { n: "ficha_cuidador", c: familyCells.length },
            { n: "sanadores_y_contenidos", c: contents.length },
            { n: "citas_y_bitacora_sanador", c: sessions.length },
            { n: "pagos_y_suscripciones", c: payments.length },
            { n: "tickets_feedback", c: tickets.length },
          ].map((r, i) => (
            <div
              key={r.n}
              className={`flex items-center gap-3 px-5 py-3 ${
                i > 0 ? "border-t border-espresso/5" : ""
              }`}
            >
              <Database className="h-4 w-4 text-espresso/35" />
              <span className="flex-1 font-mono text-xs font-bold text-espresso">
                {r.n}
              </span>
              <span className="rounded-full bg-[#E7F2F1] px-3 py-1 text-[11px] font-bold text-[#239BA2]">
                {r.c}
              </span>
            </div>
          ))}
        </div>
      </div>

      <PrimaryButton color={DARK} onClick={handleExport}>
        <Download className="h-5 w-5" />
        {t("Exportar base de datos (JSON)", "Export database (JSON)")}
      </PrimaryButton>

      <div className="overflow-hidden rounded-[28px] bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setLocale(isEs ? "en" : "es")}
          className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-[#FAF7F2]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EFEAE2] text-espresso/70">
            <Globe className="h-5 w-5" />
          </span>
          <span className="flex-1 text-sm font-bold text-espresso">
            {t("Idioma", "Language")}
          </span>
          <span className="text-xs text-espresso/50">{isEs ? "Español" : "English"}</span>
          <ChevronRight className="h-4 w-4 text-espresso/30" />
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 border-t border-espresso/5 px-5 py-4 text-left text-[#C94A6A] transition hover:bg-[#FCECEE]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FCECEE]">
            <LogOut className="h-5 w-5" />
          </span>
          <span className="flex-1 text-sm font-bold">{t("Cerrar sesión", "Log out")}</span>
        </button>
      </div>
    </main>
  );
}

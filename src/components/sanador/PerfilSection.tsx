"use client";

import React from "react";
import {
  ChevronRight,
  Globe,
  HelpCircle,
  LogOut,
  Sparkles,
  UserCog,
} from "lucide-react";
import { CORAL } from "./types";

interface PerfilSectionProps {
  t: (es: string, en: string) => string;
  isEs: boolean;
  data: any;
  profiles: any[];
  openSheet: (sheet: string, initial?: Record<string, string>) => void;
  setLocale: (l: "en" | "es") => void;
  handleLogout: () => void;
}

export function PerfilSection({
  t,
  isEs,
  data,
  profiles,
  openSheet,
  setLocale,
  handleLogout,
}: PerfilSectionProps) {
  return (
    <main className="mt-6 space-y-6">
      <div className="animate-fade-in text-center">
        <div
          className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${CORAL} text-white shadow-lg`}
        >
          <Sparkles className="h-10 w-10" />
        </div>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-espresso">
          Omar Melero &amp; Kelsie Reynolds
        </h2>
        <p className="text-xs text-espresso/55">{data?.user?.correo}</p>
        <span className="mt-2 inline-block rounded-full bg-[#FAD4DC] px-3 py-1 text-[11px] font-bold text-[#C94A6A]">
          {t("Sanadores · Piloto V1", "Healers · V1 Pilot")}
        </span>
      </div>

      <div className="overflow-hidden rounded-[28px] bg-white shadow-sm">
        {profiles.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() =>
              openSheet("profile", {
                id: String(p.id),
                especialidad: p.especialidad || "",
                tarifa: String(p.tarifa_hora_usd ?? 85),
                bioEs: p.short_bio_es || "",
                bioEn: p.short_bio_en || "",
                modalidades: p.modalidades || "ambas",
              })
            }
            className={`flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-[#FFF5F0] ${
              i > 0 ? "border-t border-espresso/5" : ""
            }`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFE7D6] text-[#F2711C]">
              <UserCog className="h-5 w-5" />
            </span>
            <span className="flex-1 text-sm font-bold text-espresso">
              {t("Ficha pública de", "Public profile of")}{" "}
              {String(p.especialidad).split("·")[0].trim()}
            </span>
            <span className="text-xs text-espresso/50">${p.tarifa_hora_usd}/h</span>
            <ChevronRight className="h-4 w-4 text-espresso/30" />
          </button>
        ))}
        {[
          {
            icon: Globe,
            label: t("Idioma", "Language"),
            hint: isEs ? "Español" : "English",
            action: () => setLocale(isEs ? "en" : "es"),
          },
          {
            icon: HelpCircle,
            label: t("Ayuda y comentarios", "Help & feedback"),
            hint: "",
            action: () => openSheet("help", { tipo: "feedback" }),
          },
        ].map((row) => (
          <button
            key={row.label}
            type="button"
            onClick={row.action}
            className="flex w-full items-center gap-3 border-t border-espresso/5 px-5 py-4 text-left transition hover:bg-[#FFF5F0]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFE7D6] text-[#F2711C]">
              <row.icon className="h-5 w-5" />
            </span>
            <span className="flex-1 text-sm font-bold text-espresso">{row.label}</span>
            <span className="text-xs text-espresso/50">{row.hint}</span>
            <ChevronRight className="h-4 w-4 text-espresso/30" />
          </button>
        ))}
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

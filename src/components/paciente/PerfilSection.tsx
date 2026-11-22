"use client";

import React from "react";
import {
  ChevronRight,
  Crown,
  Globe,
  HelpCircle,
  KeyRound,
  LogOut,
  Phone,
  UserCog,
  Users,
} from "lucide-react";

interface PerfilSectionProps {
  t: (es: string, en: string) => string;
  isEs: boolean;
  locale: string;
  setLocale: (l: "en" | "es") => void;
  user: any;
  firstName: string;
  stage: { id: string; emoji: string; es: string; en: string };
  ficha: any;
  isPremium: boolean;
  streak: number;
  timeline: any[];
  upcoming: any[];
  caregiver: { linked: boolean; nombre: string; correo: string };
  openSheet: (sheet: string, initial?: Record<string, string>) => void;
  data: any;
  handleLogout: () => void;
}

export function PerfilSection({
  t,
  isEs,
  locale,
  setLocale,
  user,
  firstName,
  stage,
  ficha,
  isPremium,
  streak,
  timeline,
  upcoming,
  caregiver,
  openSheet,
  data,
  handleLogout,
}: PerfilSectionProps) {
  return (
    <main className="mt-6 space-y-6">
      <div className="animate-fade-in text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#F48EA6] to-[#B03052] font-serif text-4xl font-bold text-white shadow-lg">
          {firstName.charAt(0)}
        </div>
        <h2 className="mt-3 font-serif text-2xl font-bold text-espresso">
          {user.nombre}
        </h2>
        <p className="text-xs text-espresso/55">{user.correo}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-[#E4E0FA] px-3 py-1 text-[11px] font-bold text-[#7A4FD1]">
            {stage.emoji} {isEs ? stage.es : stage.en} · {ficha.nombre_familia}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ${
              isPremium
                ? "bg-[#FFF1B8] text-[#8A6A00]"
                : "bg-espresso/5 text-espresso/60"
            }`}
          >
            {isPremium && <Crown className="h-3 w-3" />}
            {isPremium ? "Premium" : t("Plan gratuito", "Free plan")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { v: streak, l: t("Días de racha", "Day streak") },
          { v: timeline.length, l: t("En mi bitácora", "In my journal") },
          { v: upcoming.length, l: t("Próximas citas", "Upcoming") },
        ].map((s) => (
          <div
            key={s.l}
            className="rounded-3xl bg-white py-4 text-center shadow-sm"
          >
            <div className="font-serif text-2xl font-bold text-espresso">
              {s.v}
            </div>
            <div className="text-[11px] font-semibold text-espresso/55">
              {s.l}
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[28px] bg-white shadow-sm">
        {[
          {
            icon: UserCog,
            label: t("Mis datos", "My details"),
            hint: user.nombre,
            action: () =>
              openSheet("profile", {
                nombre: user.nombre || "",
                telefono: user.telefono || "",
                idioma: user.idioma_preferido || locale,
              }),
          },
          {
            icon: KeyRound,
            label: t("Cambiar contraseña", "Change password"),
            hint: "",
            action: () => openSheet("password"),
          },
          {
            icon: Users,
            label: t("Mi cuidador", "My caregiver"),
            hint: caregiver.linked
              ? caregiver.nombre
              : t("Invitar", "Invite"),
            action: () =>
              openSheet("caregiver", {
                correo: ficha.correo_invitacion_cuidador || "",
              }),
          },
          {
            icon: Crown,
            label: t("Membresía", "Membership"),
            hint: isPremium ? "Premium" : t("Gratuita", "Free"),
            action: () => openSheet("membership"),
          },
          {
            icon: Phone,
            label: t("Mis contactos", "My contacts"),
            hint: `${ficha.contactos_personales?.length || 0}`,
            action: () =>
              openSheet("contacts", { rol: "Oncólogo / Clínica" }),
          },
          {
            icon: Globe,
            label: t("Idioma", "Language"),
            hint: isEs ? "Español" : "English",
            action: () => setLocale(isEs ? "en" : "es"),
          },
          {
            icon: HelpCircle,
            label: t("Ayuda y comentarios", "Help & feedback"),
            hint: data.tickets?.length ? `${data.tickets.length}` : "",
            action: () => openSheet("help", { tipo: "feedback" }),
          },
        ].map((row, i) => (
          <button
            key={row.label}
            type="button"
            onClick={row.action}
            className={`flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-[#FAF7F2] ${
              i > 0 ? "border-t border-espresso/5" : ""
            }`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F4EEFA] text-[#7A4FD1]">
              <row.icon className="h-5 w-5" />
            </span>
            <span className="flex-1 text-sm font-bold text-espresso">
              {row.label}
            </span>
            <span className="max-w-[110px] truncate text-xs text-espresso/50">
              {row.hint}
            </span>
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
          <span className="flex-1 text-sm font-bold">
            {t("Cerrar sesión", "Log out")}
          </span>
        </button>
      </div>
    </main>
  );
}

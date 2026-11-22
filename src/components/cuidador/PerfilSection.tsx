"use client";

import React from "react";
import {
  ChevronRight,
  Globe,
  HelpCircle,
  LogOut,
  Phone,
  UserCog,
  Users,
} from "lucide-react";

interface PerfilSectionProps {
  t: (es: string, en: string) => string;
  isEs: boolean;
  setLocale: (l: "en" | "es") => void;
  firstName: string;
  user: any;
  fc: any;
  fp: any;
  streak: number;
  doneCount: number;
  habits: any[];
  upcoming: any[];
  openSheet: (sheet: string, initial?: Record<string, string>) => void;
  patientInfo: any;
  data: any;
  handleLogout: () => void;
}

export function PerfilSection({
  t,
  isEs,
  setLocale,
  firstName,
  user,
  fc,
  fp,
  streak,
  doneCount,
  habits,
  upcoming,
  openSheet,
  patientInfo,
  data,
  handleLogout,
}: PerfilSectionProps) {
  return (
    <main className="mt-6 space-y-6">
      <div className="animate-fade-in text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#6BB1AD] to-[#239BA2] font-serif text-4xl font-bold text-white shadow-lg">
          {firstName.charAt(0)}
        </div>
        <h2 className="mt-3 font-serif text-2xl font-bold text-espresso">{user.nombre}</h2>
        <p className="text-xs text-espresso/55">{user.correo}</p>
        <span className="mt-2 inline-block rounded-full bg-[#D7F3EA] px-3 py-1 text-[11px] font-bold text-[#239BA2]">
          {fc?.relacion_familiar || t("Cuidador", "Caregiver")} · {fp.nombre_familia}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { v: streak, l: t("Días de racha", "Day streak") },
          { v: `${doneCount}/${habits.length}`, l: t("Tareas hoy", "Tasks today") },
          { v: upcoming.length, l: t("Próximas citas", "Upcoming") },
        ].map((s) => (
          <div key={s.l} className="rounded-3xl bg-white py-4 text-center shadow-sm">
            <div className="font-serif text-2xl font-bold text-espresso">{s.v}</div>
            <div className="text-[11px] font-semibold text-espresso/55">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[28px] bg-white shadow-sm">
        {[
          {
            icon: UserCog,
            label: t("Mi ficha de cuidador", "My caregiver profile"),
            hint: fc?.nivel_experiencia || "",
            action: () =>
              openSheet("profile", {
                relacion: fc?.relacion_familiar || "",
                nivel: fc?.nivel_experiencia || "Inicial",
                horarios: fc?.horarios_disponibles || "",
                areas: fc?.areas_de_interes || "",
                habitos: fc?.habitos_autocuidado || "",
              }),
          },
          {
            icon: Users,
            label: t("Vínculo con mi paciente", "Link with my patient"),
            hint: patientInfo.linked ? "✓" : t("Pendiente", "Pending"),
            action: () =>
              openSheet("patient", {
                nombre: fp.nombre_paciente || "",
                correo: fp.correo_invitacion_paciente || "",
                etapa: fp.etapa_actual,
              }),
          },
          {
            icon: Phone,
            label: t("Contactos", "Contacts"),
            hint: `${fp.contactos_personales?.length || 0}`,
            action: () => openSheet("contacts", { rol: "Oncólogo / Emergencia" }),
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
            className={`flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-[#F2FAF8] ${
              i > 0 ? "border-t border-espresso/5" : ""
            }`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E3F1EF] text-[#239BA2]">
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

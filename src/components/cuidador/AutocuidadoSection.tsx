"use client";

import React from "react";
import { Play } from "lucide-react";
import { TYPE_META } from "@/components/paciente/PacienteDashboard";

interface AutocuidadoSectionProps {
  t: (es: string, en: string) => string;
  isEs: boolean;
  runAction: (action: string, payload?: any, message?: string, options?: any) => Promise<any>;
  resourceFilter: string;
  setResourceFilter: (filter: string) => void;
  filteredResources: any[];
  setPlayerItem: (item: any) => void;
  setSheet: (sheet: string | null) => void;
  fmtDate: (d: string) => string;
}

export function AutocuidadoSection({
  t,
  isEs,
  runAction,
  resourceFilter,
  setResourceFilter,
  filteredResources,
  setPlayerItem,
  setSheet,
  fmtDate,
}: AutocuidadoSectionProps) {
  return (
    <main className="mt-6 space-y-6">
      <div className="animate-fade-in">
        <h2 className="font-serif text-3xl font-bold leading-tight text-espresso">
          {t("Para ti, cuidador/a", "For you, caregiver")}
        </h2>
        <p className="mt-1 text-sm text-espresso/60">
          {t(
            "Cuidar a quien amas empieza por cuidarte.",
            "Caring for a loved one starts with caring for yourself."
          )}
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#CFEDE8] to-[#E4E0FA] p-5">
        <span className="absolute -right-2 top-2 text-6xl opacity-90">🌿</span>
        <span className="inline-block rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-[#239BA2]">
          Love Circle · {t("gratis", "free")}
        </span>
        <h3 className="mt-2 max-w-[75%] font-serif text-xl font-bold text-espresso">
          {t("Círculo de cuidadores con Omar", "Caregivers circle with Omar")}
        </h3>
        <button
          type="button"
          onClick={() =>
            runAction(
              "book_healer_session",
              {
                asistente_rol: "cuidador",
                modalidad: "online",
                fecha_sesion: new Date(Date.now() + 4 * 86400000).toISOString(),
                es_sesion_gratuita_mensual: true,
                enlace_o_lugar: "Love Circle for Caregivers · Zoom con Omar Melero",
              },
              t("¡Tu cupo quedó reservado!", "Your spot is reserved!")
            )
          }
          className="mt-4 rounded-full bg-[#239BA2] px-5 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
        >
          {t("Reservar mi cupo", "Reserve my spot")}
        </button>
      </div>

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {[
          { id: "todos", es: "Todo", en: "All" },
          { id: "guia_autocuidado", es: "Guías y cocina", en: "Guides & cooking" },
          { id: "meditacion_audio", es: "Pausas y descanso", en: "Pauses & rest" },
          { id: "workshop", es: "Workshops", en: "Workshops" },
          { id: "love_circle", es: "Círculos", en: "Circles" },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setResourceFilter(f.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
              resourceFilter === f.id
                ? "bg-[#239BA2] text-white shadow-md"
                : "bg-white text-espresso/65 shadow-sm"
            }`}
          >
            {isEs ? f.es : f.en}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredResources.map((item) => {
          const meta =
            TYPE_META[item.tipo_contenido] || TYPE_META.guia_autocuidado;
          const Icon = meta.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setPlayerItem(item);
                setSheet("player");
              }}
              className="flex w-full items-center gap-4 rounded-[26px] bg-white p-3.5 text-left shadow-[0_8px_22px_rgba(35,155,162,0.08)] transition active:scale-[0.98]"
            >
              <span
                className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.grad} text-espresso/70`}
              >
                <Icon className="h-8 w-8" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#239BA2]">
                  {isEs ? meta.es : meta.en}
                  {!item.es_gratuito && ` · $${item.costo_usd}`}
                </span>
                <span className="mt-0.5 block text-sm font-bold leading-snug text-espresso line-clamp-2">
                  {isEs ? item.titulo_es : item.titulo_en || item.titulo_es}
                </span>
                {item.fecha_evento && (
                  <span className="mt-0.5 block text-xs text-espresso/55">
                    {fmtDate(item.fecha_evento)}
                  </span>
                )}
              </span>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#239BA2] text-white shadow-md">
                <Play className="h-5 w-5" />
              </span>
            </button>
          );
        })}
      </div>
    </main>
  );
}

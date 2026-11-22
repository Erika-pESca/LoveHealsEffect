"use client";

import React from "react";
import { ChevronRight, Crown, Lock, Play } from "lucide-react";
import { Card } from "@/components/panel/ui";
import { TYPE_META } from "./types";

export interface RecursosSectionProps {
  resources: any[];
  resourceFilter: string;
  setResourceFilter: (filter: string) => void;
  isPremium: boolean;
  openSheet: (name: string, initial?: Record<string, string>) => void;
  canOpenItem: (item: any) => boolean;
  openResource: (item: any, can: boolean) => void;
  runAction: (action: string, payload?: any, successToast?: string, options?: any) => Promise<any>;
  fmtDate: (d: string) => string;
  t: (es: string, en: string) => string;
  isEs: boolean;
}

export function RecursosSection({
  resources,
  resourceFilter,
  setResourceFilter,
  isPremium,
  openSheet,
  canOpenItem,
  openResource,
  runAction,
  fmtDate,
  t,
  isEs,
}: RecursosSectionProps) {
  const filteredResources = resources.filter((r) => {
    if (resourceFilter === "todos") return true;
    if (resourceFilter === "gratis") return r.es_gratuito !== false;
    if (resourceFilter === "premium") return r.es_gratuito === false;
    return r.tipo_contenido === resourceFilter;
  });

  return (
    <main className="mt-6 space-y-6">
      <div className="animate-fade-in">
        <h2 className="font-serif text-3xl font-bold leading-tight text-espresso">{t("Recursos", "Resources")}</h2>
        <p className="mt-1 text-sm text-espresso/60">
          {t("Gratuitos y premium: movimiento, calma, guías y comunidad.", "Free and premium: movement, calm, guides and community.")}
        </p>
      </div>

      {!isPremium && (
        <button
          type="button"
          onClick={() => openSheet("membership")}
          className="flex w-full items-center gap-3 rounded-3xl bg-gradient-to-r from-[#FFF1B8] to-[#FDE3E8] p-4 text-left shadow-sm transition active:scale-[0.98]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-[#B98A00]">
            <Crown className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-bold text-espresso">
              {t("Desbloquea todo con la membresía", "Unlock everything with membership")}
            </span>
            <span className="block text-xs text-espresso/65">
              {t("$10 USD/mes por familia (paciente + cuidador)", "$10 USD/month per family (patient + caregiver)")}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 text-espresso/40" />
        </button>
      )}

      <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#FDE3E8] to-[#E4E0FA] p-5">
        <span className="absolute -right-2 top-2 text-6xl opacity-90">🌺</span>
        <span className="inline-block rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-[#C94A6A]">
          Love Circle · {t("gratis", "free")}
        </span>
        <h3 className="mt-2 max-w-[75%] font-serif text-xl font-bold text-espresso">
          {t("Círculo de sanación con Kelsie y Omar", "Healing circle with Kelsie and Omar")}
        </h3>
        <button
          type="button"
          onClick={() =>
            runAction(
              "book_healer_session",
              {
                modalidad: "online",
                fecha_sesion: new Date(Date.now() + 3 * 86400000).toISOString(),
                es_sesion_gratuita_mensual: true,
                enlace_o_lugar: "Love Circle for Patients · Zoom con Kelsie Reynolds",
              },
              t("¡Tu cupo quedó reservado!", "Your spot is reserved!")
            )
          }
          className="mt-4 rounded-full bg-[#7A4FD1] px-5 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
        >
          {t("Reservar mi cupo", "Reserve my spot")}
        </button>
      </div>

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {[
          { id: "todos", es: "Todo", en: "All" },
          { id: "gratis", es: "Gratis", en: "Free" },
          { id: "premium", es: "★ Premium", en: "★ Premium" },
          { id: "video_bam", es: "Movimiento", en: "Movement" },
          { id: "meditacion_audio", es: "Meditación", en: "Meditation" },
          { id: "musicoterapia", es: "Música", en: "Music" },
          { id: "guia_autocuidado", es: "Guías", en: "Guides" },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setResourceFilter(f.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
              resourceFilter === f.id ? "bg-[#7A4FD1] text-white shadow-md" : "bg-white text-espresso/65 shadow-sm"
            }`}
          >
            {isEs ? f.es : f.en}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredResources.map((item) => {
          const meta = TYPE_META[item.tipo_contenido] || TYPE_META.guia_autocuidado;
          const Icon = meta.icon;
          const can = canOpenItem(item);
          const premium = item.es_gratuito === false;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => openResource(item, can)}
              className="flex w-full items-center gap-4 rounded-[26px] bg-white p-3.5 text-left shadow-[0_8px_22px_rgba(80,60,90,0.07)] transition active:scale-[0.98]"
            >
              <span className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.grad} text-espresso/70`}>
                <Icon className="h-8 w-8" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#7A4FD1]">
                  {isEs ? meta.es : meta.en}
                  {premium ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF1B8] px-2 py-0.5 text-[10px] text-[#8A6A00]">
                      <Crown className="h-3 w-3" />${item.costo_usd}
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#5C8D67]/15 px-2 py-0.5 text-[10px] text-[#2A5C35]">
                      {t("Gratis", "Free")}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-sm font-bold leading-snug text-espresso line-clamp-2">
                  {isEs ? item.titulo_es : item.titulo_en || item.titulo_es}
                </span>
                {item.fecha_evento && <span className="mt-0.5 block text-xs text-espresso/55">{fmtDate(item.fecha_evento)}</span>}
              </span>
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-md ${can ? "bg-[#7A4FD1]" : "bg-espresso/70"}`}>
                {can ? <Play className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              </span>
            </button>
          );
        })}
        {filteredResources.length === 0 && (
          <Card className="text-center text-sm text-espresso/60">
            {t("No hay recursos en esta categoría todavía.", "No resources in this category yet.")}
          </Card>
        )}
      </div>
    </main>
  );
}

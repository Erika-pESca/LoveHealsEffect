"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { PrimaryButton } from "@/components/panel/ui";
import { TYPE_META } from "@/components/paciente/PacienteDashboard";
import { CORAL } from "./types";

interface ContenidosSectionProps {
  t: (es: string, en: string) => string;
  isEs: boolean;
  openSheet: (sheet: string, initial?: Record<string, string>) => void;
  published: any[];
  runAction: (action: string, payload: Record<string, any>, message: string) => Promise<boolean>;
}

export function ContenidosSection({
  t,
  isEs,
  openSheet,
  published,
  runAction,
}: ContenidosSectionProps) {
  return (
    <main className="mt-6 space-y-5">
      <div className="animate-fade-in">
        <h2 className="font-serif text-3xl font-bold leading-tight text-espresso">
          {t("Mis contenidos", "My content")}
        </h2>
        <p className="mt-1 text-sm text-espresso/60">
          {t(
            "Lo que publiques aparece al instante para pacientes y cuidadores.",
            "What you publish appears instantly for patients and caregivers."
          )}
        </p>
      </div>
      <PrimaryButton
        color={CORAL}
        onClick={() => openSheet("publish", { tipo: "video_bam", publico: "ambos" })}
      >
        <Plus className="h-5 w-5" />
        {t("Publicar recurso o evento", "Publish resource or event")}
      </PrimaryButton>
      <div className="space-y-3">
        {published.map((item) => {
          const meta = TYPE_META[item.tipo_contenido] || TYPE_META.guia_autocuidado;
          const Icon = meta.icon;
          return (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-[26px] bg-white p-3.5 shadow-[0_8px_22px_rgba(80,60,90,0.07)]"
            >
              <span
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.grad} text-espresso/70`}
              >
                <Icon className="h-7 w-7" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#D85678]">
                  {isEs ? meta.es : meta.en} · {item.publico_objetivo}
                </span>
                <span className="mt-0.5 block text-sm font-bold leading-snug text-espresso line-clamp-2">
                  {item.titulo_es}
                </span>
                {item.fecha_evento && (
                  <span className="block text-xs text-espresso/55">
                    {String(item.fecha_evento).slice(0, 16).replace("T", " ")}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() =>
                  runAction(
                    "delete_content",
                    { id: item.id },
                    t("Recurso eliminado", "Removed")
                  )
                }
                className="text-espresso/35 transition hover:text-[#C94A6A]"
                aria-label={t("Eliminar", "Delete")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}

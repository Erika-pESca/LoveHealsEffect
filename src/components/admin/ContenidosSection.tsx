"use client";

import React from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { PrimaryButton } from "@/components/panel/ui";
import { TYPE_META } from "@/components/paciente/PacienteDashboard";
import { DARK } from "./types";

interface ContenidosSectionProps {
  t: (es: string, en: string) => string;
  isEs: boolean;
  openSheet: (sheet: string, initial?: Record<string, string>) => void;
  contents: any[];
  runAction: (action: string, payload: Record<string, any>, message: string) => Promise<boolean>;
}

export function ContenidosSection({
  t,
  isEs,
  openSheet,
  contents,
  runAction,
}: ContenidosSectionProps) {
  return (
    <main className="mt-6 space-y-5">
      <div className="animate-fade-in">
        <h2 className="font-serif text-3xl font-bold leading-tight text-espresso">
          {t("Contenidos ES | EN", "Content ES | EN")}
        </h2>
        <p className="mt-1 text-sm text-espresso/60">
          {t(
            "Publica anuncios, guías y eventos en español e inglés sin tocar código.",
            "Publish announcements, guides and events in Spanish and English without code."
          )}
        </p>
      </div>
      <PrimaryButton
        color={DARK}
        onClick={() => openSheet("cms", { tipo: "guia_autocuidado", publico: "ambos" })}
      >
        <Plus className="h-5 w-5" />
        {t("Publicar contenido bilingüe", "Publish bilingual content")}
      </PrimaryButton>
      <div className="space-y-3">
        {contents.map((c: any) => {
          const isProfile = c.tipo_registro === "perfil_sanador";
          const meta = TYPE_META[c.tipo_contenido] || TYPE_META.guia_autocuidado;
          const Icon = isProfile ? Users : meta.icon;
          return (
            <div
              key={c.id}
              className="flex items-center gap-4 rounded-[26px] bg-white p-3.5 shadow-sm"
            >
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${
                  isProfile ? "from-[#FFE7D6] to-[#FAD4DC]" : meta.grad
                } text-espresso/70`}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-espresso/50">
                  {isProfile
                    ? t("Perfil de sanador", "Healer profile")
                    : isEs
                    ? meta.es
                    : meta.en}{" "}
                  · {c.publico_objetivo || "—"}
                </span>
                <span className="mt-0.5 block text-sm font-bold leading-snug text-espresso line-clamp-2">
                  {c.titulo_es || c.especialidad}
                </span>
              </span>
              {!isProfile && (
                <button
                  type="button"
                  onClick={() =>
                    runAction(
                      "delete_cms_content",
                      { id: c.id },
                      t("Contenido eliminado", "Removed")
                    )
                  }
                  className="text-espresso/35 transition hover:text-[#C94A6A]"
                  aria-label={t("Eliminar", "Delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

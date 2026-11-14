"use client";

import React, { useState } from "react";
import { CheckCircle2, HeartHandshake, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const TAB_STYLES = [
  "bg-gradient-to-r from-[#D45D74] to-[#C44A62] text-white shadow-md shadow-rose-900/20",
  "bg-gradient-to-r from-[#3D7A62] to-[#2B614D] text-white shadow-md shadow-emerald-900/20",
  "bg-gradient-to-r from-[#C26748] to-[#A85135] text-white shadow-md shadow-orange-900/20",
  "bg-gradient-to-r from-[#C9861E] to-[#AA6C12] text-white shadow-md shadow-amber-900/20",
];

export function JourneyTabsSection() {
  const { dict } = useLanguage();
  const [activeIdx, setActiveIdx] = useState(0);

  const currentStage = dict.journey.tabs[activeIdx] || dict.journey.tabs[0];

  return (
    <section
      id="etapas"
      className="relative w-full overflow-hidden bg-surface-container-low/60 py-16 lg:py-24"
    >
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-tertiary-fixed/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary-fixed/30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {dict.journey.badge}
          </span>
          <h2 className="mt-2 font-serif text-3xl font-bold text-espresso sm:text-4xl">
            {dict.journey.title}
          </h2>
          <p className="mt-3 text-sm text-on-surface-variant sm:text-base">
            {dict.journey.subtitle}
          </p>
        </div>

        {/* Pestañas de Etapas con los colores distintivos de NARA */}
        <div className="mx-auto mb-10 flex max-w-4xl flex-wrap items-center justify-center gap-2 rounded-full border border-espresso/10 bg-white/90 p-2 shadow-sm backdrop-blur-md">
          {dict.journey.tabs.map((tab, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all duration-300 sm:text-sm ${
                  isActive
                    ? `${TAB_STYLES[idx]} scale-[1.02] font-bold`
                    : "text-espresso/75 hover:bg-espresso/5 hover:text-espresso"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tarjeta de Contenido de la Etapa Activa */}
        <div className="grid grid-cols-1 items-center gap-8 rounded-3xl bg-white p-6 shadow-[0_8px_32px_rgba(45,49,66,0.06)] lg:grid-cols-12 lg:p-10">
          <div className="flex flex-col gap-4 lg:col-span-7">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary-container px-3.5 py-1 text-xs font-bold text-espresso">
              <HeartHandshake className="h-3.5 w-3.5 text-primary" />
              {currentStage.pill}
            </span>

            <h3 className="font-serif text-2xl font-bold text-espresso sm:text-3xl">
              {currentStage.title}
            </h3>

            <p className="text-sm leading-relaxed text-on-surface-variant sm:text-base">
              {currentStage.desc}
            </p>

            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl bg-cream p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h4 className="text-sm font-bold text-espresso">
                    {currentStage.card1Title}
                  </h4>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    {currentStage.card1Desc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-cream p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-tertiary" />
                <div>
                  <h4 className="text-sm font-bold text-espresso">
                    {currentStage.card2Title}
                  </h4>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    {currentStage.card2Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-container shadow-md">
              <img
                src={currentStage.image}
                alt={currentStage.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/95 p-3.5 backdrop-blur-sm">
                <p className="text-xs font-bold text-primary">
                  {currentStage.tipLabel}
                </p>
                <p className="mt-0.5 text-xs italic text-espresso">
                  {currentStage.tipQuote}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


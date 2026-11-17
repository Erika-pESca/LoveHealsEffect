"use client";

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function JourneyTabsSection() {
  const { dict } = useLanguage();
  const [activeIdx, setActiveIdx] = useState(0);

  const currentStage = dict.journey.tabs[activeIdx] || dict.journey.tabs[0];

  return (
    <section id="etapas" className="w-full py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-veranda-blue">
            {dict.journey.badge}
          </span>
          <h2 className="mt-1 font-serif text-2xl font-bold text-espresso sm:text-3xl">
            {dict.journey.title}
          </h2>
        </div>

        {/* Pestañas deslizables en móvil */}
        <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1">
          {dict.journey.tabs.map((tab, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-veranda-blue text-white shadow-sm"
                    : "bg-white text-espresso/75 shadow-sm hover:bg-lychee/50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tarjeta limpia estilo App */}
        <div className="grid grid-cols-1 items-center gap-6 rounded-[28px] bg-white p-5 shadow-sm lg:grid-cols-12 lg:p-8">
          <div className="space-y-4 lg:col-span-7">
            <span className="inline-block rounded-full bg-[#E5F2F1] px-3 py-1 text-[11px] font-bold text-[#2D5F5D]">
              {currentStage.pill}
            </span>
            <h3 className="font-serif text-xl font-bold text-espresso sm:text-2xl">
              {currentStage.title}
            </h3>
            <p className="text-xs leading-relaxed text-espresso/70 sm:text-sm">
              {currentStage.desc}
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2.5 rounded-2xl bg-[#F4F2E6] p-3.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-veranda-blue" />
                <div>
                  <h4 className="text-xs font-bold text-espresso">
                    {currentStage.card1Title}
                  </h4>
                  <p className="mt-0.5 text-[11px] text-espresso/70">
                    {currentStage.card1Desc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-2xl bg-[#FCECEE] p-3.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cupid-pink" />
                <div>
                  <h4 className="text-xs font-bold text-espresso">
                    {currentStage.card2Title}
                  </h4>
                  <p className="mt-0.5 text-[11px] text-espresso/70">
                    {currentStage.card2Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <img
                src={currentStage.image}
                alt={currentStage.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/55 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/95 p-3">
                <p className="text-[11px] font-bold text-veranda-blue">
                  {currentStage.tipLabel}
                </p>
                <p className="mt-0.5 text-[11px] italic text-espresso/80">
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

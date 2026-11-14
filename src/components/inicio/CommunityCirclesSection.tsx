"use client";

import React from "react";
import { Calendar, Sparkles, Video } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function CommunityCirclesSection() {
  const { dict } = useLanguage();

  return (
    <section id="circulos" className="w-full bg-cream py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-rose-soft px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-dark">
            {dict.circles.badge}
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold text-espresso sm:text-4xl">
            {dict.circles.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-espresso/75 sm:text-base">
            {dict.circles.subtitle}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {dict.circles.items.map((item, idx) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-3xl border border-espresso/10 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-[#E6EFE3] px-3 py-1 text-[11px] font-bold text-[#2E664F]">
                    {item.tag}
                  </span>
                  {idx === 0 ? (
                    <Video className="h-5 w-5 text-rose-dark" />
                  ) : idx === 1 ? (
                    <Sparkles className="h-5 w-5 text-primary" />
                  ) : (
                    <Calendar className="h-5 w-5 text-tertiary" />
                  )}
                </div>

                <h3 className="mt-5 font-serif text-xl font-bold text-espresso">
                  {item.title}
                </h3>

                <p className="mt-1 text-xs font-bold text-primary">
                  {item.facilitator}
                </p>
                <p className="mt-0.5 text-xs font-medium text-espresso/60">
                  {item.schedule}
                </p>

                <p className="mt-4 text-xs leading-relaxed text-espresso/75 sm:text-sm">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 border-t border-espresso/10 pt-4">
                <a
                  href="#inicio"
                  className="inline-flex w-full items-center justify-center rounded-full bg-espresso px-5 py-2.5 text-xs font-bold text-white transition hover:bg-primary"
                >
                  {item.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


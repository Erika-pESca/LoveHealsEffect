"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Sparkles, Video } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const CARD_BG = ["bg-[#E5F2F1]", "bg-[#FCECEE]", "bg-[#F4F2E6]"];

export function CommunityCirclesSection() {
  const { dict } = useLanguage();

  return (
    <section id="circulos" className="w-full py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-veranda-blue">
            {dict.circles.badge}
          </span>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-espresso sm:text-3xl">
            {dict.circles.title}
          </h2>
          <p className="mt-1.5 text-xs text-espresso/70 sm:text-sm">
            {dict.circles.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {dict.circles.items.map((item, idx) => (
            <div
              key={item.id}
              className={`flex flex-col justify-between rounded-[24px] p-6 ${CARD_BG[idx % CARD_BG.length]}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-espresso/80">
                    {item.tag}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-veranda-blue">
                    {idx === 0 ? (
                      <Video className="h-4 w-4" />
                    ) : idx === 1 ? (
                      <Sparkles className="h-4 w-4 text-cupid-pink" />
                    ) : (
                      <Calendar className="h-4 w-4" />
                    )}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-espresso">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs font-semibold text-[#2D5F5D]">
                  {item.facilitator}
                </p>
                <p className="text-[11px] text-espresso/60">{item.schedule}</p>

                <p className="mt-3 text-xs leading-relaxed text-espresso/75">
                  {item.desc}
                </p>
              </div>

              <div className="mt-5">
                <Link
                  href="/auth/registro"
                  className="inline-flex w-full items-center justify-between rounded-full bg-veranda-blue px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-cupid-pink"
                >
                  <span>{item.cta}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

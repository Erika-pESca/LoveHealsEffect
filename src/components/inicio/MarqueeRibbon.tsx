"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export function MarqueeRibbon() {
  const { dict } = useLanguage();

  return (
    <div className="select-none overflow-hidden border-y border-[#E8809A]/25 bg-[#F3E1DE] py-4 sm:py-5">
      <div
        style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
        className="flex w-max animate-marquee items-center whitespace-nowrap"
      >
        {[0, 1].map((blockIdx) => (
          <React.Fragment key={blockIdx}>
            {dict.marquee.map((item, idx) => (
              <React.Fragment key={`${blockIdx}-${idx}`}>
                <span
                  className={`mx-7 text-2xl sm:text-4xl lg:text-[44px] ${
                    item.outline
                      ? "text-outline-italic"
                      : "font-light tracking-tight text-[#2D2B2A]"
                  }`}
                >
                  {item.text}
                </span>
                <span className="mx-2 h-2 w-2 shrink-0 rounded-full bg-[#E8809A]" />
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

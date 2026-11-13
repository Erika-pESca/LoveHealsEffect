"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export function MarqueeRibbon() {
  const { dict } = useLanguage();

  return (
    <div className="select-none overflow-hidden border-y border-espresso/10 bg-cream py-6">
      <div className="flex w-max animate-marquee items-center whitespace-nowrap">
        {[0, 1].map((blockIdx) => (
          <React.Fragment key={blockIdx}>
            {dict.marquee.map((item, idx) => (
              <React.Fragment key={`${blockIdx}-${idx}`}>
                <span
                  className={`mx-7 text-3xl sm:text-5xl lg:text-[52px] ${
                    item.outline
                      ? "text-outline-italic"
                      : "font-light tracking-tight text-espresso"
                  }`}
                >
                  {item.text}
                </span>
                <span className="mx-2 h-3 w-3 shrink-0 rounded-full bg-[#E27D90]" />
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}


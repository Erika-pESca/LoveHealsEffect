"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { dict } = useLanguage();

  return (
    <footer className="w-full border-t border-espresso/10 bg-[#F3EFEA] text-espresso">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-soft shadow-sm">
                <svg viewBox="0 0 36 36" className="h-6 w-6" fill="none">
                  <path
                    d="M18 30C18 30 6 21.8 6 13C6 9.1 9.1 6 13 6C15.3 6 17.3 7.2 18 9C18.7 7.2 20.7 6 23 6C26.9 6 30 9.1 30 13C30 21.8 18 30 18 30Z"
                    fill="#E27D90"
                  />
                  <path
                    d="M18 29V16.5M18 20C18 17.2 20.8 15 23.5 15.5C23 18.2 20.8 20 18 20ZM18 22.2C18 20 15.5 18.3 13 18.8C13.5 21 15.5 22.2 18 22.2Z"
                    stroke="#415938"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <span className="block font-serif text-xl font-bold text-primary">
                  {dict.nav.brandName} {dict.nav.brandAccent}
                </span>
                <span className="-mt-0.5 block text-xs text-espresso/60">
                  {dict.footer.subtitle}
                </span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-espresso/75 sm:text-sm">
              {dict.footer.mission}
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-tertiary">
              <ShieldCheck className="h-4 w-4" />
              <span>{dict.footer.endorsed}</span>
            </div>
          </div>

          <div className="text-xs text-espresso/60">
            <p>{dict.footer.copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

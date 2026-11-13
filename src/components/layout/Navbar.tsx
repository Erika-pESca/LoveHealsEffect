"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, UserCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Navbar() {
  const { locale, setLocale, dict } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-espresso/10 bg-[#FAF8F5]/95 backdrop-blur-md shadow-[0_4px_20px_rgba(38,35,34,0.04)]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        {/* LOGO / MARCA (Diseño original de NARA adaptado a Love Heals Effect) */}
        <Link href="/" className="group inline-flex shrink-0 items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-soft shadow-sm transition-transform group-hover:scale-105">
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
          <div className="leading-tight">
            <span className="block text-base font-extrabold tracking-tight text-espresso">
              {dict.nav.brandName}{" "}
              <span className="text-primary">{dict.nav.brandAccent}</span>
            </span>
            <span className="-mt-0.5 block font-serif text-xs italic text-tertiary">
              {dict.nav.brandSubtitle}
            </span>
          </div>
        </Link>

        {/* NAVEGACIÓN DESKTOP */}
        <nav className="hidden items-center gap-2 md:flex">
          <a
            href="#inicio"
            className="rounded-xl px-3.5 py-2 text-xs font-bold text-espresso transition-colors hover:bg-espresso/5 lg:text-sm"
          >
            {dict.nav.home}
          </a>
          <a
            href="#etapas"
            className="rounded-xl px-3.5 py-2 text-xs font-bold text-espresso/80 transition-colors hover:bg-espresso/5 hover:text-espresso lg:text-sm"
          >
            {dict.nav.stages}
          </a>
          <a
            href="#circulos"
            className="rounded-xl px-3.5 py-2 text-xs font-bold text-espresso/80 transition-colors hover:bg-espresso/5 hover:text-espresso lg:text-sm"
          >
            {dict.nav.circles}
          </a>
        </nav>

        {/* ACCIONES: SELECTOR EN/ES + LOGIN QR */}
        <div className="hidden items-center gap-3 md:flex">
          <div className="inline-flex items-center rounded-full border border-espresso/15 bg-white p-1 text-xs font-bold shadow-sm">
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`rounded-full px-3 py-1 transition-colors ${
                locale === "en"
                  ? "bg-espresso text-white"
                  : "text-espresso/70 hover:text-espresso"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale("es")}
              className={`rounded-full px-3 py-1 transition-colors ${
                locale === "es"
                  ? "bg-espresso text-white"
                  : "text-espresso/70 hover:text-espresso"
              }`}
            >
              ES
            </button>
          </div>

          <a
            href="#inicio"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#C4546A] to-[#8f4b3d] px-5 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:opacity-95 lg:text-sm"
          >
            <UserCheck className="h-4 w-4" />
            <span>{dict.nav.loginBtn}</span>
          </a>
        </div>

        {/* BOTÓN MENÚ MÓVIL */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex items-center justify-center rounded-xl p-2 text-espresso hover:bg-espresso/5 md:hidden"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* MENÚ MÓVIL */}
      {mobileOpen && (
        <div className="border-t border-espresso/10 bg-[#FAF8F5] px-4 pb-6 pt-3 md:hidden">
          <div className="flex flex-col space-y-2">
            <a
              href="#inicio"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-bold text-espresso hover:bg-espresso/5"
            >
              {dict.nav.home}
            </a>
            <a
              href="#etapas"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-bold text-espresso hover:bg-espresso/5"
            >
              {dict.nav.stages}
            </a>
            <a
              href="#circulos"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-bold text-espresso hover:bg-espresso/5"
            >
              {dict.nav.circles}
            </a>

            <div className="flex items-center justify-between border-t border-espresso/10 pt-3">
              <div className="inline-flex items-center rounded-full border border-espresso/15 bg-white p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLocale("en")}
                  className={`rounded-full px-3 py-1 ${
                    locale === "en" ? "bg-espresso text-white" : "text-espresso/70"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLocale("es")}
                  className={`rounded-full px-3 py-1 ${
                    locale === "es" ? "bg-espresso text-white" : "text-espresso/70"
                  }`}
                >
                  ES
                </button>
              </div>

              <a
                href="#inicio"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#C4546A] to-[#8f4b3d] px-5 py-2 text-xs font-extrabold text-white"
              >
                <UserCheck className="h-4 w-4" />
                <span>{dict.nav.loginBtn}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

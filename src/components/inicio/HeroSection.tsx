"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { MarqueeRibbon } from "@/components/inicio/MarqueeRibbon";
import { StorySection } from "@/components/inicio/StorySection";

export function HeroSection() {
  const { locale } = useLanguage();
  const isEs = locale === "es";

  return (
    <>
      {/* HERO CON FONDO CLARO DEL BOCETO (#F9F8F3) E IMAGEN A LA DERECHA DESVANECIDA */}
      <section
        id="inicio"
        className="relative -mt-14 flex min-h-[540px] items-center overflow-hidden bg-[#F9F8F3] pb-16 pt-28 text-[#2D2B2A] sm:min-h-[600px] sm:pt-32"
      >
        {/* Imagen a la derecha con desvanecido suave hacia #F9F8F3 */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[62%]">
          <img
            src="/img/header.jpg"
            alt="Love Heals Effect Hawaii"
            className="h-full w-full object-cover object-center brightness-[1.18] saturate-[0.92]"
          />
          <div className="absolute inset-0 bg-white/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F9F8F3] via-[#F9F8F3]/85 via-30% to-transparent" />
          <div className="absolute inset-0 bg-[#F9F8F3]/65 lg:hidden" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6">
          <div className="relative max-w-xl space-y-5">
            {/* Círculo rosado suave justo detrás de las letras */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-10 top-1/2 -z-10 h-[320px] w-[320px] -translate-y-1/2 rounded-full bg-[#E8809A]/[0.2] blur-[55px]"
            />

            <span className="inline-flex items-center gap-2 rounded-full border border-sky-cloud/35 bg-white/85 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#2D2B2A]/75 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5C8D67]" />
              {isEs
                ? "O'AHU · MAUI · HAWÁI · PILOTO V1.0"
                : "O'AHU · MAUI · HAWAI'I ISLAND"}
            </span>

            <h1
              style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
              className="text-[42px] font-semibold leading-[1.06] tracking-[-0.03em] text-[#2D2B2A] sm:text-[60px]"
            >
              {isEs ? (
                <>
                  <span className="block">Uniendo cuidado</span>
                  <span className="block">clínico y</span>
                  <span className="block font-light italic text-[#E8809A]">
                    bienestar holístico
                  </span>
                  <span className="block">en Hawái.</span>
                </>
              ) : (
                <>
                  <span className="block">Bridging clinical</span>
                  <span className="block">care and</span>
                  <span className="block font-light italic text-[#E8809A]">
                    holistic wellness
                  </span>
                  <span className="block">in Hawaii.</span>
                </>
              )}
            </h1>

            <p className="max-w-md text-sm leading-relaxed text-[#2D2B2A]/70 sm:text-base">
              {isEs
                ? "Meditaciones guiadas, prácticas suaves y una comunidad cercana para personas que viven una enfermedad — y para quienes los aman y cuidan 1:1."
                : "Guided meditations, gentle practices and caring community for people living with illness — and for the ones who love them."}
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-2">
              <Link
                href="/auth/registro"
                className="group inline-flex items-center gap-3 rounded-full bg-[#E8809A] py-2 pl-6 pr-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(232,128,154,0.28)] transition hover:bg-veranda-blue"
              >
                <span>
                  {isEs ? "Registrarme gratis" : "Explore Free Resources"}
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2D2B2A] text-white transition-transform group-hover:rotate-12">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>

              <Link
                href="/auth/login"
                className="border-b-2 border-[#E8809A]/65 pb-0.5 text-sm font-medium text-[#2D2B2A] transition hover:border-veranda-blue hover:text-veranda-blue"
              >
                {isEs ? "Ya tengo cuenta" : "See upcoming circles"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarqueeRibbon />

      <StorySection />
    </>
  );
}

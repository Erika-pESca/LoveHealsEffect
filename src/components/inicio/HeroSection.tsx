"use client";

import React from "react";
import { ArrowRight, Heart, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function HeroSection() {
  const { dict } = useLanguage();

  return (
    <section
      id="inicio"
      className="relative flex min-h-[85vh] w-full flex-col justify-between overflow-hidden"
    >
      {/* Fondo del Mar con Transición Suave desde el Blanco/Crema Izquierdo (Diseño original NARA) */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85"
          alt="Serene ocean at sunset in Hawaii"
          className="h-full w-full scale-105 object-cover object-right lg:object-center"
        />

        {/* Degradado de Transición Horizontal */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #FAF7F2 0%, #FAF7F2 36%, rgba(250,247,242,0.88) 47%, rgba(250,247,242,0.12) 60%, rgba(38,35,34,0.10) 100%)",
          }}
        />

        {/* Resplandor Rosa Suave sobre la parte izquierda */}
        <div
          className="pointer-events-none absolute -left-28 top-20 h-[520px] w-[520px] rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(226,125,144,0.38) 0%, rgba(250,247,242,0) 70%)",
          }}
        />

        {/* Fundido inferior suave */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-cream to-transparent" />
      </div>

      {/* Contenido Central del Hero */}
      <div className="relative z-20 mx-auto my-auto w-full max-w-7xl px-6 py-10 lg:px-12 lg:py-14">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Columna Izquierda */}
          <div className="space-y-6 lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-espresso/10 bg-white/90 px-4 py-1.5 shadow-sm backdrop-blur-md">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-tertiary" />
              <span className="text-xs font-semibold text-on-surface-variant">
                {dict.hero.badge}
              </span>
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-espresso sm:text-5xl lg:text-[56px]">
              <span className="block">{dict.hero.titleLine1}</span>
              <span className="my-1 block font-serif font-normal italic text-rose-brand">
                {dict.hero.titleLine2}
              </span>
              <span className="block">{dict.hero.titleLine3}</span>
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-espresso/80 sm:text-base">
              {dict.hero.description}
            </p>

            {/* Píldoras Encadenadas del Recorrido */}
            <div className="space-y-2.5 pt-1">
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.18em] text-espresso/60">
                {dict.hero.orderLabel}
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <a
                  href="#etapas"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-espresso/15 bg-white px-3 py-1.5 font-semibold text-espresso shadow-sm transition-colors hover:border-primary"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    1
                  </span>
                  <span>{dict.hero.steps.step1}</span>
                </a>
                <span className="font-bold text-espresso/40">→</span>
                <a
                  href="#etapas"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-espresso/15 bg-white px-3 py-1.5 font-semibold text-espresso shadow-sm transition-colors hover:border-primary"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-tertiary text-[10px] font-bold text-white">
                    2
                  </span>
                  <span>{dict.hero.steps.step2}</span>
                </a>
                <span className="font-bold text-espresso/40">→</span>
                <a
                  href="#circulos"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-espresso/15 bg-white px-3 py-1.5 font-semibold text-espresso shadow-sm transition-colors hover:border-primary"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-brand text-[10px] font-bold text-white">
                    3
                  </span>
                  <span>{dict.hero.steps.step3}</span>
                </a>
                <span className="font-bold text-espresso/40">→</span>
                <a
                  href="#circulos"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-espresso/15 bg-white px-3 py-1.5 font-semibold text-espresso shadow-sm transition-colors hover:border-primary"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white">
                    4
                  </span>
                  <span>{dict.hero.steps.step4}</span>
                </a>
              </div>
            </div>

            {/* Estadísticas de Confianza */}
            <div className="flex flex-wrap items-center gap-5 pt-3 text-xs font-semibold text-espresso/75">
              <span className="inline-flex items-center gap-1.5">
                <span className="font-extrabold text-tertiary">✓</span>{" "}
                {dict.hero.trust.stat1}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="font-extrabold text-tertiary">✓</span>{" "}
                {dict.hero.trust.stat2}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="font-extrabold text-tertiary">✓</span>{" "}
                {dict.hero.trust.stat3}
              </span>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta Glassmorphism sobre el Mar */}
          <div className="flex justify-center lg:col-span-6 lg:justify-end">
            <div className="w-full max-w-[560px] space-y-5 rounded-[32px] border border-white/80 bg-white/75 p-6 shadow-[0_24px_60px_rgba(38,35,34,0.14)] backdrop-blur-xl sm:p-8">
              <div className="space-y-1">
                <span className="inline-block rounded-full border border-[#FAD0D9] bg-[#FFE8ED] px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#C4546A]">
                  {dict.hero.glassCard.badge}
                </span>
                <h2 className="font-serif text-2xl font-bold text-espresso sm:text-[26px]">
                  {dict.hero.glassCard.title}
                </h2>
                <p className="text-xs font-medium text-espresso/80 sm:text-sm">
                  {dict.hero.glassCard.subtitle}
                </p>
              </div>

              {/* Las 2 Tarjetas (Soy Paciente | Soy Familiar o Cuidador) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Path 1: Soy Paciente (Armonía Rosa / Coral Vital) */}
                <a
                  href="#etapas"
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#F5C2CC] bg-gradient-to-br from-white via-[#FFF7F9] to-[#FCEBED] p-5 shadow-[0_8px_28px_rgba(226,125,144,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(226,125,144,0.28)]"
                >
                  <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-[#FCD6DE]/60 to-transparent transition-transform group-hover:scale-125" />
                  <div>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFE4E8] to-[#FAD4DC] text-[#C4546A] shadow-inner transition-colors duration-300 group-hover:bg-[#C4546A] group-hover:text-white">
                      <Heart className="h-6 w-6" />
                    </div>
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <span className="rounded-full bg-[#FFE8ED] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#C4546A]">
                        {dict.hero.glassCard.patient.tag}
                      </span>
                    </div>
                    <h3 className="mb-1 font-serif text-xl font-bold text-espresso transition-colors group-hover:text-[#C4546A]">
                      {dict.hero.glassCard.patient.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-espresso/70">
                      {dict.hero.glassCard.patient.desc}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[#F5D5DC] pt-3">
                    <span className="flex items-center gap-1 text-xs font-extrabold text-[#C4546A] transition-transform group-hover:translate-x-1">
                      {dict.hero.glassCard.patient.cta}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                    <span className="rounded-full border border-white bg-white/80 px-2.5 py-0.5 text-[10px] font-bold text-espresso/70 shadow-sm">
                      {dict.hero.glassCard.patient.badge}
                    </span>
                  </div>
                </a>

                {/* Path 2: Soy Familiar o Cuidador (Armonía Salvia / Bosque Sanador) */}
                <a
                  href="#etapas"
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#BDDFCC] bg-gradient-to-br from-white via-[#F5FAF7] to-[#E3F2EB] p-5 shadow-[0_8px_28px_rgba(69,101,88,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(69,101,88,0.28)]"
                >
                  <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-[#D0ECDD]/60 to-transparent transition-transform group-hover:scale-125" />
                  <div>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E3F1E9] to-[#D0ECDD] text-[#2E664F] shadow-inner transition-colors duration-300 group-hover:bg-[#2E664F] group-hover:text-white">
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <span className="rounded-full bg-[#D7EFE2] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#2E664F]">
                        {dict.hero.glassCard.caregiver.tag}
                      </span>
                    </div>
                    <h3 className="mb-1 font-serif text-xl font-bold text-espresso transition-colors group-hover:text-[#2E664F]">
                      {dict.hero.glassCard.caregiver.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-espresso/70">
                      {dict.hero.glassCard.caregiver.desc}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[#CFE7DA] pt-3">
                    <span className="flex items-center gap-1 text-xs font-extrabold text-[#2E664F] transition-transform group-hover:translate-x-1">
                      {dict.hero.glassCard.caregiver.cta}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                    <span className="rounded-full border border-white bg-white/80 px-2.5 py-0.5 text-[10px] font-bold text-espresso/70 shadow-sm">
                      {dict.hero.glassCard.caregiver.badge}
                    </span>
                  </div>
                </a>
              </div>

              {/* Acceso rápido para Sanador / Coach (Omar & Kelsey) */}
              <div className="flex flex-col items-start justify-between gap-2 rounded-2xl border border-espresso/10 bg-white/85 px-4 py-3 text-xs sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 text-espresso/80">
                  <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                  <span className="font-semibold">
                    {dict.hero.glassCard.healerBanner.label}
                  </span>
                </div>
                <a
                  href="#circulos"
                  className="shrink-0 font-extrabold text-primary hover:underline"
                >
                  {dict.hero.glassCard.healerBanner.cta}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

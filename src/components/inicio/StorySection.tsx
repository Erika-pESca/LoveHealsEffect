"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function StorySection() {
  const { locale } = useLanguage();
  const isEs = locale === "es";
  const [active, setActive] = useState(0);
  const INTERVAL = 5000;

  const blocks = isEs
    ? [
        {
          id: "quienes-somos",
          number: "01",
          label: "Quiénes somos",
          title: "Una comunidad que",
          accent: "abraza",
          titleEnd: "cuando más se necesita.",
          text: "Love Heals Effect nació en Hawái de la mano de Omar Melero Barchi y Kelsie para que ningún paciente oncológico ni su familia atraviesen el proceso en soledad. Unimos el cuidado clínico con la sanación espiritual.",
          bullets: ["Nacidos en Honolulu, Hawái", "Sanación integral y humana", "Comunidad cercana y gratuita"],
          image: "/img/quienes-somos.jpg",
          tag: "Love Circles · Hawái",
        },
        {
          id: "que-hacemos",
          number: "02",
          label: "Qué hacemos",
          title: "Acompañamos con",
          accent: "presencia real",
          titleEnd: "y herramientas simples.",
          text: "Círculos de apoyo en vivo, sesiones holísticas y de coaching, música curativa, podcasts y meditaciones guiadas. Todo desde tu celular, en el momento exacto de tu proceso.",
          bullets: ["Círculos de apoyo gratuitos", "Sesiones con sanadores", "Música, podcasts y meditaciones"],
          image: "/img/que-hacemos.jpg",
          tag: "Sesiones 1:1",
        },
        {
          id: "nuestro-objetivo",
          number: "03",
          label: "Nuestro objetivo",
          title: "Que nadie camine",
          accent: "solo",
          titleEnd: "en este camino.",
          text: "Conectamos a cada paciente con su cuidador principal en una célula familiar 1:1, para que ambos reciban apoyo emocional, seguimiento compartido y acompañamiento durante todo el proceso.",
          bullets: ["Célula familiar Paciente ↔ Cuidador", "Seguimiento compartido", "Apoyo para quien cuida también"],
          image: "/img/nuestro-objetivo.jpg",
          tag: "Paciente & Cuidador",
        },
      ]
    : [
        {
          id: "quienes-somos",
          number: "01",
          label: "Who we are",
          title: "A community that",
          accent: "embraces",
          titleEnd: "when it matters most.",
          text: "Love Heals Effect was born in Hawaii with Omar Melero Barchi and Kelsie so no cancer patient or family has to go through the journey alone. We unite clinical care with spiritual healing.",
          bullets: ["Born in Honolulu, Hawaii", "Whole, human healing", "Close and free community"],
          image: "/img/quienes-somos.jpg",
          tag: "Love Circles · Hawaii",
        },
        {
          id: "que-hacemos",
          number: "02",
          label: "What we do",
          title: "We support with",
          accent: "real presence",
          titleEnd: "and simple tools.",
          text: "Live support circles, holistic and coaching sessions, healing music, podcasts and guided meditations. Everything on your phone, right when you need it.",
          bullets: ["Free support circles", "Sessions with healers", "Music, podcasts and meditations"],
          image: "/img/que-hacemos.jpg",
          tag: "1:1 Sessions",
        },
        {
          id: "nuestro-objetivo",
          number: "03",
          label: "Our goal",
          title: "That no one walks",
          accent: "alone",
          titleEnd: "on this path.",
          text: "We connect each patient with their primary caregiver in a 1:1 family cell, so both receive emotional support, shared follow-up and companionship throughout the process.",
          bullets: ["Patient ↔ Caregiver family cell", "Shared follow-up", "Support for the caregiver too"],
          image: "/img/nuestro-objetivo.jpg",
          tag: "Patient & Caregiver",
        },
      ];

  const b = blocks[active];

  // Avanza automáticamente cada 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setActive((prev) => (prev + 1) % blocks.length);
    }, INTERVAL);
    return () => clearTimeout(timer);
  }, [active, blocks.length]);

  return (
    <section
      id="que-brindamos"
      style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
      className="relative w-full overflow-hidden bg-white py-12 sm:py-16"
    >
      {/* Círculos difuminados en los lados en rgb(228 155 123) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-1/4 h-[340px] w-[340px] rounded-full bg-[rgb(228,155,123)]/[0.22] blur-[65px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 bottom-1/4 h-[340px] w-[340px] rounded-full bg-[rgb(228,155,123)]/[0.22] blur-[65px]"
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        {/* Encabezado */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-espresso/10 bg-[#FAF9F6] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#2D2B2A]/70">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E8809A]" />
            {isEs ? "Nuestra esencia" : "Our essence"}
          </span>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#2D2B2A] sm:text-4xl">
            {isEs ? "Cuidado que sana el cuerpo " : "Care that heals the body "}
            <span className="font-light italic text-[#E8809A]">
              {isEs ? "y el corazón." : "and the heart."}
            </span>
          </h2>
        </div>

        {/* Pestañas con mayor presencia ubicadas encima de la tarjeta */}
        <div className="mt-6 flex items-center justify-start sm:justify-center">
          <div className="inline-flex gap-1.5 overflow-x-auto rounded-full border border-espresso/10 bg-[#FAF9F6] p-1.5 shadow-sm">
            {blocks.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(idx)}
                className={`relative shrink-0 overflow-hidden rounded-full px-5 py-2.5 text-xs font-semibold sm:px-6 sm:py-2.5 sm:text-sm transition-all duration-300 ${
                  idx === active
                    ? "bg-[#E8809A] text-white shadow-md shadow-[#E8809A]/35"
                    : "text-[#2D2B2A]/75 hover:bg-[#FCECEE] hover:text-[#E8809A]"
                }`}
              >
                {item.label}
                {idx === active && (
                  <span
                    key={`bar-${active}`}
                    style={{ animation: `storyProgress ${INTERVAL}ms linear forwards` }}
                    className="absolute bottom-0 left-0 h-[3px] w-full origin-left bg-white/90"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenedor de diapositivas con transición suave (cross-fade) */}
        <div className="mt-6 grid grid-cols-1 grid-rows-1 overflow-hidden rounded-[32px] border border-espresso/10 bg-[#FAF9F6] shadow-[0_20px_50px_rgba(38,35,34,0.06)]">
          {blocks.map((slide, idx) => {
            const isActive = idx === active;
            return (
              <article
                key={slide.id}
                id={slide.id}
                aria-hidden={!isActive}
                className={`col-start-1 row-start-1 grid grid-cols-1 items-center gap-6 p-4 md:grid-cols-12 md:gap-10 md:p-6 transition-all duration-700 ease-in-out ${
                  isActive
                    ? "opacity-100 translate-y-0 z-10 pointer-events-auto"
                    : "opacity-0 translate-y-3 z-0 pointer-events-none"
                }`}
              >
                <div className="relative md:col-span-5">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] md:aspect-[4/5]">
                    <img
                      src={slide.image}
                      alt={slide.label}
                      className="h-full w-full object-cover transition-transform duration-1000 ease-out"
                    />
                  </div>
                  <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-[#2D2B2A] shadow-lg">
                    <span className="h-2 w-2 rounded-full bg-[#E8809A]" />
                    {slide.tag}
                  </div>
                </div>

                <div className="px-1 pb-2 md:col-span-7 md:pr-6">
                  <span className="text-5xl font-light italic text-[#E8809A]/70">
                    {slide.number}
                  </span>

                  <h3 className="mt-1 text-2xl font-semibold leading-[1.12] tracking-[-0.03em] text-[#2D2B2A] sm:text-4xl">
                    {slide.title}{" "}
                    <span className="font-light italic text-[#E8809A]">{slide.accent}</span>{" "}
                    {slide.titleEnd}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-[#2D2B2A]/70 sm:text-base">
                    {slide.text}
                  </p>

                  <ul className="mt-4 space-y-2">
                    {slide.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-center gap-3 text-sm font-medium text-[#2D2B2A]"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FCECEE] text-[#E8809A]">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/auth/registro"
                    className="group mt-6 inline-flex items-center gap-3 rounded-full bg-[#E8809A] py-2 pl-6 pr-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(232,128,154,0.28)] transition hover:brightness-105"
                  >
                    <span>{isEs ? "Empieza aquí" : "Start here"}</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2D2B2A] text-white transition-transform group-hover:rotate-12">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

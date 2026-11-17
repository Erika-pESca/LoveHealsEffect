"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Headphones,
  HeartHandshake,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function AboutOfferSection() {
  const { locale } = useLanguage();
  const isEs = locale === "es";

  const offerings = isEs
    ? [
        {
          icon: Video,
          title: "Love Circles gratuitos",
          desc: "Encuentros semanales en vivo por Zoom con Omar & Kelsie para compartir, meditar y sentir respaldo.",
          bg: "bg-[#E5F2F1]",
          iconColor: "text-veranda-blue",
        },
        {
          icon: Sparkles,
          title: "Sanación y Coaching 1:1",
          desc: "Sesiones holísticas online o presenciales y 1 sesión de coaching gratuita al mes para guiarte.",
          bg: "bg-[#FCECEE]",
          iconColor: "text-cupid-pink",
        },
        {
          icon: Headphones,
          title: "Música, Podcasts y Guías",
          desc: "Audios de respiración, música curativa y reflexiones disponibles 24/7 según tu momento del proceso.",
          bg: "bg-[#F4F2E6]",
          iconColor: "text-[#7A8F52]",
        },
        {
          icon: HeartHandshake,
          title: "Célula Familiar 1:1",
          desc: "Vinculamos al paciente con su cuidador principal para que ambos tengan herramientas y paz emocional.",
          bg: "bg-[#F9EAE8]",
          iconColor: "text-[#C47676]",
        },
      ]
    : [
        {
          icon: Video,
          title: "Free Love Circles",
          desc: "Weekly live Zoom gatherings with Omar & Kelsie to share, meditate, and feel supported.",
          bg: "bg-[#E5F2F1]",
          iconColor: "text-veranda-blue",
        },
        {
          icon: Sparkles,
          title: "1:1 Healing & Coaching",
          desc: "Online or in-person holistic sessions plus 1 free monthly coaching session to guide you.",
          bg: "bg-[#FCECEE]",
          iconColor: "text-cupid-pink",
        },
        {
          icon: Headphones,
          title: "Music, Podcasts & Guides",
          desc: "Breathwork audios, healing music, and reflections available 24/7 for each stage.",
          bg: "bg-[#F4F2E6]",
          iconColor: "text-[#7A8F52]",
        },
        {
          icon: HeartHandshake,
          title: "1:1 Family Cell",
          desc: "We connect each patient with their primary caregiver so both receive emotional peace.",
          bg: "bg-[#F9EAE8]",
          iconColor: "text-[#C47676]",
        },
      ];

  return (
    <section id="que-brindamos" className="w-full bg-[#F9F8F3] py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-veranda-blue">
            {isEs ? "Qué brindamos" : "What we offer"}
          </span>
          <h2 className="mt-1 font-serif text-2xl font-bold text-espresso sm:text-3xl">
            {isEs
              ? "Todo lo que recibes al registrarte"
              : "Everything you receive when you register"}
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-espresso/70 sm:text-sm">
            {isEs
              ? "Nuestro piloto V1.0 está diseñado para acompañarte de forma cercana, humana y sencilla desde tu celular."
              : "Our Pilot V1.0 is designed to support you warmly and simply right from your phone."}
          </p>
        </div>

        {/* 4 pilares en Bento Grid pastel */}
        <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {offerings.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`rounded-[24px] p-5 ${item.bg}`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ${item.iconColor}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3.5 text-sm font-bold text-espresso">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-espresso/75">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Invitación directa al registro según tu rol */}
        <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Link
            href="/auth/registro?rol=paciente"
            className="group flex items-center justify-between rounded-[24px] border border-cupid-pink/25 bg-white p-5 shadow-sm transition hover:bg-[#FCECEE]"
          >
            <div className="pr-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cupid-pink">
                {isEs ? "Para ti" : "For you"}
              </span>
              <h3 className="mt-1 text-base font-bold text-espresso">
                {isEs ? "Registrarme como Paciente" : "Register as a Patient"}
              </h3>
              <p className="mt-0.5 text-xs text-espresso/65">
                {isEs
                  ? "Crea tu espacio de sanación e invita a tu cuidador 1:1."
                  : "Create your healing space and invite your 1:1 caregiver."}
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cupid-pink text-white transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          <Link
            href="/auth/registro?rol=cuidador"
            className="group flex items-center justify-between rounded-[24px] border border-veranda-blue/25 bg-white p-5 shadow-sm transition hover:bg-[#E5F2F1]"
          >
            <div className="pr-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-veranda-blue">
                {isEs ? "Célula Familiar" : "Family Cell"}
              </span>
              <h3 className="mt-1 text-base font-bold text-espresso">
                {isEs ? "Registrarme como Cuidador" : "Register as a Caregiver"}
              </h3>
              <p className="mt-0.5 text-xs text-espresso/65">
                {isEs
                  ? "Acompaña a tu ser querido y recibe apoyo para ti también."
                  : "Support your loved one and receive care for yourself too."}
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-veranda-blue text-white transition-transform group-hover:translate-x-0.5">
              <Users className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

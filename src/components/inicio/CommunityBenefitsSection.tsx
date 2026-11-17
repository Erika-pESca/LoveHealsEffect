"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  FileText,
  Headphones,
  Heart,
  Music,
  Pill,
  Play,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function CommunityBenefitsSection() {
  const { locale } = useLanguage();
  const isEs = locale === "es";

  const teamPillars = isEs
    ? [
        {
          title: "Terapia Emocional & Presencia",
          team: "Guiado por Coaches y Terapeutas",
          desc: "Contención humana para procesar el diagnóstico, disipar el miedo y fortalecer el ánimo de la paciente.",
          icon: Sparkles,
          tag: "Soporte Emocional",
          image:
            "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=700&q=80",
        },
        {
          title: "Sonoterapia & Música Curativa",
          team: "Kelsie y Sonoterapeutas Especializados",
          desc: "Cuencos tibetanos, frecuencias sonoras y música meditativa para aliviar el dolor y calmar el sistema nervioso.",
          icon: Music,
          tag: "Frecuencias & Sonido",
          image:
            "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=700&q=80",
        },
        {
          title: "Célula 1:1 & Círculos de Apoyo",
          team: "Omar Melero Barchi & Kelsie",
          desc: "Encuentros semanales en vivo por Zoom y sesiones 1:1 para que el paciente y su cuidador siempre tengan a quién acudir.",
          icon: Users,
          tag: "Acompañamiento Humano",
          image:
            "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=700&q=80",
        },
        {
          title: "Liberación Somática & Nutrición",
          team: "Especialistas en Salud Integrativa",
          desc: "Técnicas de Tapping EFT, respiración profunda y cocina antiinflamatoria adaptada a tratamientos médicos.",
          icon: Heart,
          tag: "Cuerpo & Nutrición",
          image:
            "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=700&q=80",
        },
      ]
    : [
        {
          title: "Emotional Therapy & Presence",
          team: "Guided by Holistic Coaches & Therapists",
          desc: "Warm emotional guidance to process diagnosis, ease anxiety, and nurture inner strength.",
          icon: Sparkles,
          tag: "Emotional Support",
          image:
            "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=700&q=80",
        },
        {
          title: "Sound Healing & Curative Music",
          team: "Kelsie & Sound Therapy Specialists",
          desc: "Tibetan sound bowls, vibrational frequencies, and healing music to soothe pain and nervous tension.",
          icon: Music,
          tag: "Sound & Frequencies",
          image:
            "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=700&q=80",
        },
        {
          title: "1:1 Family Cell & Support Circles",
          team: "Omar Melero Barchi & Kelsie",
          desc: "Weekly live Zoom circles and 1:1 guidance ensuring neither patient nor caregiver ever walks alone.",
          icon: Users,
          tag: "Human Guidance",
          image:
            "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=700&q=80",
        },
        {
          title: "Somatic Release & Nutrition",
          team: "Integrative Health Specialists",
          desc: "EFT tapping, breathwork, and clean anti-inflammatory kitchen practices tailored to medical stages.",
          icon: Heart,
          tag: "Body & Nutrition",
          image:
            "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=700&q=80",
        },
      ];

  const resources = isEs
    ? [
        {
          id: "meditaciones",
          title: "Meditaciones de autosanación para pacientes",
          meta: "8 audios guiados · 10–25 min",
          type: "AUDIO",
          badge: "PARA PACIENTES",
          icon: Headphones,
          image:
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        },
        {
          id: "cuidador",
          title: "Autorregulación del cuidador",
          meta: "6 meditaciones · 8–15 min",
          type: "AUDIO",
          badge: "PARA CUIDADORES",
          icon: Headphones,
          image:
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "respiracion",
          title: "Respiración consciente",
          meta: "Práctica en vídeo · 12 min",
          type: "VÍDEO",
          badge: "VÍDEO",
          icon: Play,
          image:
            "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "tapping",
          title: "Tapping (EFT)",
          meta: "Práctica en vídeo · 9 min",
          type: "VÍDEO",
          badge: "VÍDEO",
          icon: Play,
          image:
            "https://images.unsplash.com/photo-1534885320675-b08ab1322a99?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "cocina",
          title: "Cocina saludable",
          meta: "Serie de vídeos · 4 episodios",
          type: "VÍDEO",
          badge: "VÍDEO",
          icon: Play,
          image:
            "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
        },
      ]
    : [
        {
          id: "meditaciones",
          title: "Self-healing meditations for patients",
          meta: "8 guided audios · 10–25 min",
          type: "AUDIO",
          badge: "FOR PATIENTS",
          icon: Headphones,
          image:
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        },
        {
          id: "cuidador",
          title: "Caregiver self-regulation",
          meta: "6 meditations · 8–15 min",
          type: "AUDIO",
          badge: "FOR CAREGIVERS",
          icon: Headphones,
          image:
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "respiracion",
          title: "Mindful breathing",
          meta: "Video practice · 12 min",
          type: "VIDEO",
          badge: "VIDEO",
          icon: Play,
          image:
            "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "tapping",
          title: "Tapping (EFT)",
          meta: "Video practice · 9 min",
          type: "VIDEO",
          badge: "VIDEO",
          icon: Play,
          image:
            "https://images.unsplash.com/photo-1534885320675-b08ab1322a99?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "cocina",
          title: "Healthy cooking",
          meta: "Video series · 4 episodes",
          type: "VIDEO",
          badge: "VIDEO",
          icon: Play,
          image:
            "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
        },
      ];

  return (
    <>
      {/* SECCIÓN 1: EQUIPO HUMANO Y ACOMPAÑAMIENTO ESPECIALIZADO (Fondo rosado cálido #F3E1DE) */}
      <section
        id="equipo-especializado"
        style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
        className="relative w-full overflow-hidden bg-[#F3E1DE] py-16 sm:py-24"
      >
        {/* Halos cálidos sutiles */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 top-20 h-[380px] w-[380px] rounded-full bg-white/40 blur-[85px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 bottom-20 h-[380px] w-[380px] rounded-full bg-[#E8809A]/15 blur-[85px]"
        />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          {/* Encabezado enfocado en el EQUIPO HUMANO */}
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-espresso/10 bg-white px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#2D2B2A]/70 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E8809A]" />
              {isEs ? "Acompañamiento Especializado" : "Specialized Care Team"}
            </span>

            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#2D2B2A] sm:text-4xl lg:text-[46px]">
              {isEs ? "No estás solo en una pantalla. " : "You're not alone on a screen. "}
              <span className="font-light italic text-[#E8809A]">
                {isEs ? "Tienes a un equipo detrás." : "You have a team beside you."}
              </span>
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-[#2D2B2A]/75 sm:text-base">
              {isEs
                ? "En Love Heals Effect no navegas en una página fría: cuentas con un equipo humano multidisciplinario especializado en oncología integrativa, sonoterapia, coaching emocional y nutrición para acompañarte a ti y a tu cuidador."
                : "At Love Heals Effect you aren't browsing a cold website: you are supported by an integrative multidisciplinary team of sound therapists, emotional coaches, and health guides walking with you and your caregiver."}
            </p>
          </div>

          {/* 4 Tarjetas de Especialistas (Estilo Referencia: foto con bordes redondeados + icono circular flotante 100% visible sin cortes) */}
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {teamPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="group relative flex flex-col justify-between rounded-[28px] border border-espresso/8 bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#E8809A] hover:shadow-xl"
                >
                  <div>
                    {/* Contenedor relativo de la imagen: el icono flota sin ser recortado por overflow-hidden */}
                    <div className="relative">
                      <div className="relative h-44 w-full overflow-hidden rounded-[20px]">
                        <img
                          src={pillar.image}
                          alt={pillar.title}
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                        {/* Tag superior izquierdo en la imagen */}
                        <div className="absolute left-3 top-3">
                          <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-[#2D2B2A] shadow-sm backdrop-blur-sm">
                            {pillar.tag}
                          </span>
                        </div>
                      </div>

                      {/* Icono circular flotante 100% visible: overlap perfecto entre foto y tarjeta */}
                      <div className="absolute -bottom-5 left-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#E8809A] text-white shadow-lg ring-4 ring-white transition-transform group-hover:scale-110">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Contenido de texto con margen superior para no pisar el icono */}
                    <div className="px-2 pt-7 pb-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#E8809A]">
                        {pillar.team}
                      </p>

                      <h3 className="mt-1 text-base font-semibold leading-snug text-[#2D2B2A]">
                        {pillar.title}
                      </h3>

                      <p className="mt-2 text-xs leading-relaxed text-[#2D2B2A]/75">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>

                  {/* Pie de tarjeta con sello de certificación y botón de flecha circular */}
                  <div className="mt-4 flex items-center justify-between border-t border-espresso/10 px-2 pt-3 text-[11px] font-semibold text-[#2D2B2A]/70">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#5C8D67]" />
                      <span>{isEs ? "Certificado" : "Certified"}</span>
                    </div>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FAF9F6] text-[#2D2B2A] transition group-hover:bg-[#E8809A] group-hover:text-white">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: LO QUE VAS A ENCONTRAR AL REGISTRARTE (Fondo blanco con orbes rgb(228 155 123) idéntico a StorySection) */}
      <section
        id="que-encuentras"
        style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
        className="relative w-full overflow-hidden bg-white py-14 sm:py-20"
      >
        {/* Círculos difuminados en los lados en rgb(228 155 123) idénticos a Cuidado que sana el cuerpo y el corazón */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 top-1/4 h-[340px] w-[340px] rounded-full bg-[rgb(228,155,123)]/[0.22] blur-[65px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 bottom-1/4 h-[340px] w-[340px] rounded-full bg-[rgb(228,155,123)]/[0.22] blur-[65px]"
        />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          {/* Encabezado editorial idéntico a la imagen de referencia */}
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-espresso/10 bg-[#FAF9F6] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#2D2B2A]/70 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E8809A]" />
                {isEs ? "Biblioteca Activa" : "Active Library"}
              </span>

              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#2D2B2A] sm:text-4xl lg:text-[44px]">
                {isEs ? (
                  <>
                    Prácticas a las que{" "}
                    <span className="font-light italic text-[#2D2B2A]">
                      puedes volver cuando quieras.
                    </span>
                  </>
                ) : (
                  <>
                    Practices you can{" "}
                    <span className="font-light italic text-[#2D2B2A]">
                      return to whenever you want.
                    </span>
                  </>
                )}
              </h2>
            </div>

            <div className="max-w-md">
              <p className="text-sm leading-relaxed text-[#2D2B2A]/75 sm:text-base">
                {isEs
                  ? "Herramientas creadas por profesionales clínicos radicados en Hawái para hacer más llevaderos los días difíciles durante el tratamiento y el cuidado de personas dependientes."
                  : "Practices created by clinical professionals based in Hawaii to soothe hard days during medical treatment and caregiving."}
              </p>
            </div>
          </div>

          {/* Bento Grid idéntico a la imagen de referencia: borde terracota 5px + badges verdes + botones blancos */}
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-12">
            {/* 1. Meditaciones (Tarjeta alta izquierda) */}
            {resources[0] && (
              <div className="group relative overflow-hidden rounded-[28px] border-[5px] border-[#DF9B80] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl md:col-span-7 md:row-span-2">
                <div className="relative h-80 w-full overflow-hidden sm:h-96 md:h-full md:min-h-[460px]">
                  <img
                    src={resources[0].image}
                    alt={resources[0].title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 via-45% to-transparent" />

                  {/* Badge superior verde redondeado */}
                  <div className="absolute left-4 top-4 z-10">
                    <span className="rounded-full bg-[#5C8D67] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                      {resources[0].badge}
                    </span>
                  </div>

                  {/* Icono blanco circular en esquina superior derecha */}
                  <div className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2D2B2A] shadow-md transition-transform duration-300 group-hover:scale-110">
                    <Headphones className="h-4 w-4" />
                  </div>

                  {/* Título y meta inferior */}
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <h4 className="text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
                      {resources[0].title}
                    </h4>
                    <p className="mt-1.5 text-xs font-medium text-white/85">
                      {resources[0].meta}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Cuidador (Tarjeta superior derecha) */}
            {resources[1] && (
              <div className="group relative overflow-hidden rounded-[28px] border-[5px] border-[#DF9B80] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl md:col-span-5">
                <div className="relative h-56 w-full overflow-hidden sm:h-60 md:h-[220px]">
                  <img
                    src={resources[1].image}
                    alt={resources[1].title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 via-45% to-transparent" />

                  <div className="absolute left-4 top-4 z-10">
                    <span className="rounded-full bg-[#5C8D67] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                      {resources[1].badge}
                    </span>
                  </div>

                  <div className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2D2B2A] shadow-md transition-transform duration-300 group-hover:scale-110">
                    <Headphones className="h-4 w-4" />
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h4 className="text-base font-semibold leading-snug tracking-tight text-white sm:text-lg">
                      {resources[1].title}
                    </h4>
                    <p className="mt-1 text-xs font-medium text-white/85">
                      {resources[1].meta}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Respiración consciente (Tarjeta media derecha) */}
            {resources[2] && (
              <div className="group relative overflow-hidden rounded-[28px] border-[5px] border-[#DF9B80] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl md:col-span-5">
                <div className="relative h-56 w-full overflow-hidden sm:h-60 md:h-[220px]">
                  <img
                    src={resources[2].image}
                    alt={resources[2].title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 via-45% to-transparent" />

                  <div className="absolute left-4 top-4 z-10">
                    <span className="rounded-md bg-[#5C8D67] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                      {resources[2].badge}
                    </span>
                  </div>

                  <div className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2D2B2A] shadow-md transition-transform duration-300 group-hover:scale-110">
                    <Play className="h-4 w-4 ml-0.5" />
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h4 className="text-base font-semibold leading-snug tracking-tight text-white sm:text-lg">
                      {resources[2].title}
                    </h4>
                    <p className="mt-1 text-xs font-medium text-white/85">
                      {resources[2].meta}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Tapping EFT (Fila inferior izquierda) */}
            {resources[3] && (
              <div className="group relative overflow-hidden rounded-[28px] border-[5px] border-[#DF9B80] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl md:col-span-6">
                <div className="relative h-56 w-full overflow-hidden sm:h-60 md:h-[230px]">
                  <img
                    src={resources[3].image}
                    alt={resources[3].title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 via-45% to-transparent" />

                  <div className="absolute left-4 top-4 z-10">
                    <span className="rounded-md bg-[#5C8D67] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                      {resources[3].badge}
                    </span>
                  </div>

                  <div className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2D2B2A] shadow-md transition-transform duration-300 group-hover:scale-110">
                    <Play className="h-4 w-4 ml-0.5" />
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h4 className="text-base font-semibold leading-snug tracking-tight text-white sm:text-lg">
                      {resources[3].title}
                    </h4>
                    <p className="mt-1 text-xs font-medium text-white/85">
                      {resources[3].meta}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Cocina saludable (Fila inferior derecha) */}
            {resources[4] && (
              <div className="group relative overflow-hidden rounded-[28px] border-[5px] border-[#DF9B80] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl md:col-span-6">
                <div className="relative h-56 w-full overflow-hidden sm:h-60 md:h-[230px]">
                  <img
                    src={resources[4].image}
                    alt={resources[4].title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 via-45% to-transparent" />

                  <div className="absolute left-4 top-4 z-10">
                    <span className="rounded-md bg-[#5C8D67] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                      {resources[4].badge}
                    </span>
                  </div>

                  <div className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2D2B2A] shadow-md transition-transform duration-300 group-hover:scale-110">
                    <Play className="h-4 w-4 ml-0.5" />
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h4 className="text-base font-semibold leading-snug tracking-tight text-white sm:text-lg">
                      {resources[4].title}
                    </h4>
                    <p className="mt-1 text-xs font-medium text-white/85">
                      {resources[4].meta}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: BITÁCORA MÉDICA, TRAZABILIDAD & REGISTRO (Fondo rosado #F3E1DE a toda pantalla w-full) */}
      <section
        id="bitacora-trazabilidad"
        style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
        className="relative w-full overflow-hidden bg-[#F3E1DE] py-16 sm:py-24"
      >
        {/* Halos de luz de fondo para dar textura cálida */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-[#E8809A]/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          {/* Parte Superior: Bitácora Médica + Mockup */}
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Columna Izquierda: Mensaje empático y explicación */}
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-espresso/10 bg-white px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#2D2B2A]/75 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E8809A]" />
                {isEs ? "Bitácora Médica & Trazabilidad Compartida" : "Shared Medical Log & Tracking"}
              </span>

              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#2D2B2A] sm:text-4xl lg:text-[42px]">
                {isEs ? (
                  <>
                    Sabemos lo tedioso que es llevar citas, medicamentos y{" "}
                    <span className="font-light italic text-[#E8809A]">
                      repetir tu historia a todo el mundo.
                    </span>
                  </>
                ) : (
                  <>
                    We know how exhausting it is tracking meds, appointments and{" "}
                    <span className="font-light italic text-[#E8809A]">
                      repeating your story to everyone.
                    </span>
                  </>
                )}
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-[#2D2B2A]/80 sm:text-base">
                {isEs
                  ? "Al registrarte en Love Heals Effect, tú y tu cuidador cuentan con una plataforma privada para organizar el día a día: registro de dosis, calendario de consultas y una bitácora unificada que puedes compartir con tus médicos o familiares sin agotarte explicando lo mismo una y otra vez."
                  : "When registering on Love Heals Effect, you and your caregiver get a private space to organize daily treatment: doses, appointment schedules, and a unified log you can share with physicians or family without having to explain the journey repeatedly."}
              </p>

              {/* 3 Pilares del control clínico en tarjetas blancas */}
              <div className="mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/70 bg-white/95 p-4 shadow-sm backdrop-blur-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8809A]/15 text-[#E8809A]">
                    <Pill className="h-5 w-5" />
                  </div>
                  <h4 className="mt-2.5 text-xs font-bold text-[#2D2B2A]">
                    {isEs ? "Control de Medicamentos" : "Medication Tracker"}
                  </h4>
                  <p className="mt-1 text-[11px] leading-snug text-[#2D2B2A]/70">
                    {isEs
                      ? "Dosis, horarios y recordatorios para que nunca se pase una toma."
                      : "Doses, schedules and reminders so no intake is forgotten."}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/70 bg-white/95 p-4 shadow-sm backdrop-blur-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5C8D67]/15 text-[#5C8D67]">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <h4 className="mt-2.5 text-xs font-bold text-[#2D2B2A]">
                    {isEs ? "Citas, Fechas & Quimios" : "Appointments & Dates"}
                  </h4>
                  <p className="mt-1 text-[11px] leading-snug text-[#2D2B2A]/70">
                    {isEs
                      ? "Calendario unificado con consultas, exámenes y notas de preparación."
                      : "Unified calendar with medical consults, labs and prep notes."}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/70 bg-white/95 p-4 shadow-sm backdrop-blur-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DF9B80]/25 text-[#DF9B80]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h4 className="mt-2.5 text-xs font-bold text-[#2D2B2A]">
                    {isEs ? "Trazabilidad Sin Repetir" : "No Repeating Your Story"}
                  </h4>
                  <p className="mt-1 text-[11px] leading-snug text-[#2D2B2A]/70">
                    {isEs
                      ? "Bitácora compartida Paciente ↔ Cuidador para mostrar en 1 clic."
                      : "Shared patient-caregiver log ready to share in 1 click."}
                  </p>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Mockup blanco sobre fondo rosado */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-sm rounded-[28px] border border-espresso/10 bg-white p-5 shadow-2xl">
                {/* Cabecera del mockup */}
                <div className="flex items-center justify-between border-b border-espresso/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E8809A]/15 text-[#E8809A]">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-[11px] font-bold text-[#2D2B2A]">
                        {isEs ? "Bitácora Médica de la Célula" : "Cell's Medical Log"}
                      </p>
                      <p className="text-[9px] text-[#2D2B2A]/60">
                        {isEs ? "Paciente & Cuidador 1:1" : "Patient & Caregiver 1:1"}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#5C8D67]/10 px-2 py-0.5 text-[9px] font-bold text-[#5C8D67]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#5C8D67] animate-pulse" />
                    {isEs ? "Sincronizado" : "Synced"}
                  </span>
                </div>

                {/* Medicamento registrado */}
                <div className="mt-3.5 rounded-2xl border border-espresso/8 bg-[#FAF9F6] p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#E8809A] shadow-xs">
                        <Pill className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#2D2B2A]">
                          {isEs ? "Medicamento de la mañana" : "Morning medication"}
                        </p>
                        <p className="text-[10px] text-[#2D2B2A]/65">
                          {isEs ? "1 comprimido con alimentos" : "1 tablet with food"}
                        </p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#5C8D67]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {isEs ? "Tomado 9:00 AM" : "Taken 9:00 AM"}
                    </span>
                  </div>
                </div>

                {/* Cita médica registrada */}
                <div className="mt-2.5 rounded-2xl border border-espresso/8 bg-[#FAF9F6] p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#5C8D67] shadow-xs">
                        <Calendar className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#2D2B2A]">
                          {isEs ? "Consulta Oncológica · Dr. Kawika" : "Oncology Visit · Dr. Kawika"}
                        </p>
                        <p className="text-[10px] text-[#2D2B2A]/65">
                          {isEs ? "Jueves · 10:30 AM · Hospital O'ahu" : "Thursday · 10:30 AM · O'ahu"}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#DF9B80]/20 px-2 py-0.5 text-[9px] font-bold text-[#DF9B80]">
                      {isEs ? "En 2 días" : "In 2 days"}
                    </span>
                  </div>
                </div>

                {/* Resumen clínico para el médico */}
                <div className="mt-2.5 rounded-2xl border border-dashed border-[#DF9B80]/60 bg-[#FDF8F5] p-3 text-center">
                  <p className="text-[10px] font-bold text-[#2D2B2A]">
                    {isEs
                      ? "📋 Historial y notas listos para llevar al médico"
                      : "📋 Log & notes ready to show your physician"}
                  </p>
                  <p className="mt-0.5 text-[9px] text-[#2D2B2A]/65">
                    {isEs
                      ? "Trazabilidad compartida en 1 clic · Sin repetir tu historia"
                      : "Shared log in 1 click · No repeating your history"}
                  </p>
                </div>

                {/* Pie del mockup */}
                <div className="mt-3.5 pt-1 text-center">
                  <p className="text-[10px] font-semibold text-[#E8809A]">
                    {isEs
                      ? "✓ Acceso completo e inmediato al registrarte"
                      : "✓ Full immediate access upon registration"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Integración del Testimonio Humano y Botón de Registro a toda pantalla */}
          <div className="mt-14 border-t border-[#2D2B2A]/10 pt-10 text-center sm:mt-16 sm:pt-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#E8809A]">
              <Heart className="h-3.5 w-3.5" />
              {isEs ? "Acompañamiento Humano en Hawái" : "Human Care in Hawaii"}
            </span>

            <blockquote className="mx-auto mt-4 max-w-2xl text-xl font-medium leading-relaxed text-[#2D2B2A] sm:text-2xl lg:text-[28px]">
              {isEs ? (
                <>
                  “Saber que detrás de cada meditación y cada círculo hay personas reales
                  cuidando de nosotros{" "}
                  <span className="font-light italic text-[#E8809A]">
                    nos quitó el miedo a caminar solos
                  </span>
                  .”
                </>
              ) : (
                <>
                  “Knowing that behind every meditation and circle there are real caring people{" "}
                  <span className="font-light italic text-[#E8809A]">
                    took away the fear of walking alone
                  </span>
                  .”
                </>
              )}
            </blockquote>

            <p className="mt-3 text-xs font-semibold text-[#2D2B2A]/60">
              {isEs
                ? "Equipo de Terapeutas, Sonoterapeutas y Coaches · Love Heals Effect"
                : "Team of Therapists, Sound Guides & Coaches · Love Heals Effect"}
            </p>

            <div className="mt-7 flex justify-center">
              <Link
                href="/auth/registro"
                className="group inline-flex items-center gap-3 rounded-full bg-[#E8809A] py-3 pl-8 pr-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(232,128,154,0.38)] transition hover:brightness-105"
              >
                <span>{isEs ? "Empieza aquí — Es gratis" : "Start here — It's free"}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2D2B2A] text-white transition-transform group-hover:rotate-12">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

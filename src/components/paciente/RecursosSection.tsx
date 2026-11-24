"use client";

import React, { useMemo } from "react";
import {
  BookOpen,
  Calendar,
  CalendarHeart,
  ChevronRight,
  Clock,
  Crown,
  ExternalLink,
  GraduationCap,
  Heart,
  Lock,
  Music,
  Play,
  Sparkles,
  Users,
  Video,
  Wind,
} from "lucide-react";
import { Card } from "@/components/panel/ui";
import { TYPE_META } from "./types";

export interface RecursosSectionProps {
  resources: any[];
  resourceFilter: string;
  setResourceFilter: (filter: string) => void;
  isPremium: boolean;
  openSheet: (name: string, initial?: Record<string, string>) => void;
  canOpenItem: (item: any) => boolean;
  openResource: (item: any, can: boolean) => void;
  runAction: (action: string, payload?: any, successToast?: string, options?: any) => Promise<any>;
  fmtDate: (d: string) => string;
  t: (es: string, en: string) => string;
  isEs: boolean;
}

export function RecursosSection({
  resources,
  resourceFilter,
  setResourceFilter,
  isPremium,
  openSheet,
  canOpenItem,
  openResource,
  runAction,
  fmtDate,
  t,
  isEs,
}: RecursosSectionProps) {
  // Práctica destacada para el Hero Banner secundario (Movimiento BAM de Kelsie)
  const heroPractice = useMemo(() => {
    return (
      resources.find((r) => r.id === 201 || r.tipo_contenido === "video_bam") ||
      resources[0]
    );
  }, [resources]);

  // Círculo en vivo principal de Love Heals Effect
  const liveCircle = useMemo(() => {
    return resources.find((r) => r.tipo_contenido === "love_circle") || null;
  }, [resources]);

  // Filtros interactivos con la terminología oficial del documento
  const categories = useMemo(() => {
    return [
      { id: "todos", es: "Todos", en: "All", icon: Sparkles },
      { id: "gratis", es: "🌱 Support (Gratis)", en: "🌱 Support (Free)", icon: Heart },
      { id: "love_circle", es: "🌸 Healing Circles", en: "🌸 Healing Circles", icon: Users },
      { id: "video_bam", es: "Movimiento BAM", en: "BAM Movement", icon: Video },
      { id: "meditacion_audio", es: "Meditaciones", en: "Meditations", icon: Wind },
      { id: "guia_autocuidado", es: "Cocina Saludable", en: "Healthy Cooking", icon: BookOpen },
      { id: "tapping_eft", es: "Tapping EFT", en: "EFT Tapping", icon: Sparkles },
      { id: "musicoterapia", es: "Sonoterapia", en: "Sound Therapy", icon: Music },
      { id: "premium", es: "★ Academia ($10)", en: "★ Academy ($10)", icon: Crown },
    ];
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      if (resourceFilter === "todos") return true;
      if (resourceFilter === "gratis") return r.es_gratuito !== false;
      if (resourceFilter === "premium") return r.es_gratuito === false;
      return r.tipo_contenido === resourceFilter;
    });
  }, [resources, resourceFilter]);

  // Fechas programadas del mes para inscripción anticipada (según respuesta #11 de Omar)
  const monthlyCircleDates = [
    {
      dateIso: "2026-11-29T18:00:00-10:00",
      displayDate: isEs ? "Sábado 29 Nov · 6:00 PM HST" : "Sat Nov 29 · 6:00 PM HST",
      title: isEs ? "Respirando Paz y Soltando Tensión" : "Breathing Peace & Releasing Tension",
      host: "Kelsie Reynolds",
      tag: isEs ? "Círculo Pacientes" : "Patient Circle",
      type: "circle",
    },
    {
      dateIso: "2026-12-06T18:00:00-10:00",
      displayDate: isEs ? "Sábado 6 Dic · 6:00 PM HST" : "Sat Dec 6 · 6:00 PM HST",
      title: isEs ? "Pacientes y Cuidadores: Regulando el Sistema Nervioso" : "Patients & Caregivers: Nervous System",
      host: "Omar Melero & Kelsie",
      tag: isEs ? "Círculo Familiar" : "Family Circle",
      type: "family",
    },
    {
      dateIso: "2026-12-13T18:00:00-10:00",
      displayDate: isEs ? "Sábado 13 Dic · 6:00 PM HST" : "Sat Dec 13 · 6:00 PM HST",
      title: isEs ? "Taller Abierto: Nutrición Alcalina y Caldos Desintoxicantes" : "Open Workshop: Alkaline Broths",
      host: "Kelsie Reynolds",
      tag: isEs ? "Open Workshop" : "Open Workshop",
      type: "workshop",
    },
  ];

  return (
    <main className="mt-6 space-y-8 pb-10">
      {/* ===================== ENCABEZADO DE SECCIÓN ===================== */}
      <div className="animate-fade-in">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8809A]/15 px-3 py-1 text-[11px] font-bold text-[#C94A6A]">
          <Heart className="h-3.5 w-3.5" />
          {t("Support · Servicios Gratuitos & Academia", "Support · Free Services & Academy")}
        </div>
        <h2 className="mt-2 font-serif text-3xl font-bold leading-tight text-espresso sm:text-4xl">
          {t("Círculos de Sanación & Recursos Gratuitos", "Healing Circles & Free Resources")}
        </h2>
        <p className="mt-1 text-sm text-espresso/70 max-w-3xl">
          {t(
            "Espacios abiertos de contención comunitaria en Honolulu, Hawái. Conócenos sin costo, inscríbete con anticipación a los Círculos en vivo por Zoom y explora prácticas diarias de autosanación.",
            "Open community support spaces in Honolulu, Hawaii. Meet us at no cost, RSVP in advance for live Zoom Healing Circles, and explore daily self-healing practices."
          )}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* HERO DESTACADO #1: CÍRCULO DE SANACIÓN EN VIVO (OPCIÓN PRINCIPAL)        */}
      {/* ========================================================================= */}
      <section className="animate-fade-in">
        <div className="group relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1C2E2B] via-[#243A36] to-[#36272B] shadow-[0_20px_45px_rgba(28,46,43,0.32)]">
          {/* Fotografía de alta definición del Círculo de Sanación en Honolulu */}
          <div className="absolute inset-0 z-0">
            <img
              src="/img/love-circle.jpg"
              alt="Healing Circle in Honolulu with Kelsie and Omar"
              className="h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#172725] via-[#172725]/85 md:via-[#172725]/60 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col justify-between p-6 sm:p-8 lg:p-10 min-h-[360px] md:min-h-[400px]">
            <div className="max-w-2xl">
              {/* Badges de estado en vivo y gratitud */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#239BA2] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  {t("En Vivo Cada Semana · Zoom", "Live Weekly · Zoom")}
                </span>
                <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white">
                  🌴 {t("Honolulu, Hawái", "Honolulu, Hawaii")}
                </span>
                <span className="rounded-full bg-[#5C8D67] px-2.5 py-1 text-[11px] font-extrabold text-white shadow-sm">
                  ✓ {t("100% Gratuito (Support)", "100% Free (Support)")}
                </span>
              </div>

              {/* Título y Misión (Filling The Gap) */}
              <h3 className="mt-4 font-serif text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                {t(
                  "Círculo de Sanación en Vivo (Healing Circle) con Kelsie y Omar",
                  "Live Healing Circle with Kelsie & Omar in Honolulu"
                )}
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-white/85 sm:text-sm line-clamp-3">
                {t(
                  "Cerrando la brecha (Filling “The Gap”): Nuestro círculo es un refugio amoroso para que nos conozcas, respires con nosotras y te sientas escuchada y contenida entre mujeres y cuidadores. Sin juicios, sin costo.",
                  "Filling “The Gap”: A loving sanctuary to meet us, breathe together, and feel held and heard among women and caregivers. Safe, gentle, 100% free."
                )}
              </p>

              {/* Mini fichas de los facilitadores fundadores */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/90">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E8809A] font-serif text-xs font-bold text-white">
                    K
                  </span>
                  <span>
                    <strong>Kelsie Reynolds</strong> · {t("Sobreviviente & Coach BAM", "Survivor & BAM Coach")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#239BA2] font-serif text-xs font-bold text-white">
                    O
                  </span>
                  <span>
                    <strong>Omar Melero</strong> · {t("Integrative Coach & Familias", "Integrative Coach & Families")}
                  </span>
                </div>
              </div>
            </div>

            {/* Fila de acción con Inscripción Anticipada y Conócenos */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5">
              <div className="flex items-center gap-2 text-xs font-medium text-white/90">
                <CalendarHeart className="h-4 w-4 text-[#E8809A]" />
                <span>
                  {t("Próxima sesión:", "Next session:")}{" "}
                  <strong className="text-white">
                    {liveCircle?.fecha_evento ? fmtDate(liveCircle.fecha_evento) : "Sábado 6:00 PM HST"}
                  </strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => openSheet("meet_founders")}
                  className="rounded-full bg-white/15 backdrop-blur-md px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/25 active:scale-95"
                >
                  🌺 {t("Conocer a Kelsie & Omar", "Meet Kelsie & Omar")}
                </button>
                <button
                  type="button"
                  onClick={() => openSheet("circle_rsvp")}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#239BA2] to-[#1D8389] px-6 py-2.5 text-xs font-bold text-white shadow-lg transition duration-300 hover:brightness-110 active:scale-95"
                >
                  <Sparkles className="h-4 w-4 fill-white" />
                  {t("Inscribirme Gratis con Anticipación (RSVP)", "RSVP for Free in Advance")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CALENDARIO DE EVENTOS Y ACTIVIDADES GRATUITAS DEL MES (Segunda petición)  */}
      {/* ========================================================================= */}
      <section className="space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#239BA2]">
              {t("Inscripción con Anticipación", "Early Registration")}
            </span>
            <h3 className="font-serif text-xl font-bold text-espresso sm:text-2xl">
              {t("Calendario de Actividades Gratuitas del Mes", "Monthly Free Events Calendar")}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => openSheet("circle_rsvp")}
            className="flex items-center gap-1 text-xs font-bold text-[#239BA2] hover:underline"
          >
            {t("Ver todas las fechas", "View all dates")}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {monthlyCircleDates.map((item, idx) => (
            <div
              key={idx}
              className="group flex flex-col justify-between rounded-3xl border border-espresso/8 bg-white p-4 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#CFEDE8] px-2.5 py-0.5 text-[10px] font-bold text-[#1E747A]">
                    <Users className="h-3 w-3" />
                    {item.tag}
                  </span>
                  <span className="rounded-full bg-[#5C8D67]/15 px-2 py-0.5 text-[10px] font-bold text-[#2A5C35]">
                    ✓ {t("Gratis", "Free")}
                  </span>
                </div>

                <h4 className="mt-2.5 font-serif text-base font-bold text-espresso leading-snug line-clamp-2">
                  {item.title}
                </h4>

                <p className="mt-1 text-xs text-espresso/60 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#E8809A]" />
                  <span>{item.displayDate}</span>
                </p>

                <p className="mt-1 text-xs text-espresso/50">
                  {t("Facilita:", "Host:")} <strong className="text-espresso/70">{item.host}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => openSheet("circle_rsvp", { fecha_circle: item.dateIso })}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-[#FAF7F2] py-2 text-xs font-bold text-espresso transition group-hover:bg-[#239BA2] group-hover:text-white"
              >
                <span>{t("Reservar mi lugar gratis", "Reserve free spot")}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== BANNER MEMBRESÍA FAMILIAR ($10 USD) ===================== */}
      {!isPremium && (
        <section>
          <button
            type="button"
            onClick={() => openSheet("membership")}
            className="flex w-full items-center gap-4 rounded-[28px] bg-gradient-to-r from-[#FFF5DA] via-[#FFEADB] to-[#FDE3E8] p-5 text-left shadow-sm transition hover:shadow-md active:scale-[0.98]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#B98A00] shadow-sm">
              <Crown className="h-6 w-6" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-espresso">
                {t("Membresía Familiar The Love Heals Effect", "The Love Heals Effect Family Membership")}
                <span className="rounded-full bg-[#B98A00] px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                  $10 USD / {t("mes", "mo")}
                </span>
              </span>
              <span className="mt-1 block text-xs text-espresso/70 leading-relaxed">
                {t(
                  "Acceso completo a la Academia semanal de 3 niveles, meditaciones celulares avanzadas para paciente + 1 cuidador.",
                  "Full access to the weekly 3-level Academy, cellular meditations for patient + 1 caregiver."
                )}
              </span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-espresso/40" />
          </button>
        </section>
      )}

      {/* ===================== FILTROS INTERACTIVOS DE CATEGORÍA ===================== */}
      <section>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-espresso/50">
            {t("Explorar por categoría", "Browse by category")}
          </span>
          <span className="text-xs font-semibold text-espresso/45">
            {filteredResources.length} {t("disponibles", "available")}
          </span>
        </div>
        <div className="-mx-4 sm:-mx-6 lg:mx-0 mt-2 flex gap-2 overflow-x-auto px-4 sm:px-6 lg:px-0 lg:flex-wrap pb-2 scrollbar-none">
          {categories.map((cat) => {
            const active = resourceFilter === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setResourceFilter(cat.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold transition active:scale-95 ${
                  active
                    ? "bg-[#E8809A] text-white shadow-md shadow-[#E8809A]/30"
                    : "bg-white text-espresso/70 shadow-sm hover:bg-espresso/5"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? "text-white" : "text-espresso/50"}`} />
                {isEs ? cat.es : cat.en}
              </button>
            );
          })}
        </div>
      </section>

      {/* ===================== HERO CARD DE MOVIMIENTO BAM (Práctica del Día) ===================== */}
      {heroPractice && resourceFilter !== "love_circle" && (
        <section className="animate-fade-in">
          <div className="group relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#262322] to-[#3E3836] shadow-[0_14px_34px_rgba(38,35,34,0.18)]">
            <div className="absolute inset-0 z-0">
              <img
                src={heroPractice.imagen_url || "/img/bam-movement.jpg"}
                alt={isEs ? heroPractice.titulo_es : heroPractice.titulo_en}
                className="h-full w-full object-cover opacity-55 transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#262322] via-[#262322]/85 md:via-[#262322]/60 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col justify-between p-6 sm:p-7 min-h-[280px] md:min-h-[320px]">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                    🌿 {t("Práctica del día", "Practice of the day")}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E8809A] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                    <Clock className="h-3 w-3" />
                    {heroPractice.duracion || "15 min"}
                  </span>
                  <span className="rounded-full bg-white/20 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white/90">
                    {heroPractice.nivel || t("Nivel Suave", "Gentle Level")}
                  </span>
                </div>

                <h3 className="mt-3 font-serif text-2xl font-bold leading-snug text-white sm:text-3xl">
                  {isEs ? heroPractice.titulo_es : heroPractice.titulo_en}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-white/80 line-clamp-2 md:text-sm">
                  {isEs ? heroPractice.descripcion_es : heroPractice.descripcion_en}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                    {(heroPractice.instructor || "Kelsie").charAt(0)}
                  </span>
                  <span className="text-xs font-medium text-white/85">
                    {t("Guiado por", "Guided by")}{" "}
                    <strong className="text-white">
                      {heroPractice.instructor || "Kelsie Reynolds"}
                    </strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => openResource(heroPractice, canOpenItem(heroPractice))}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E8809A] to-[#DC5678] px-6 py-2.5 text-xs font-bold text-white shadow-lg transition duration-300 hover:brightness-105 active:scale-95"
                >
                  <Play className="h-4 w-4 fill-white" />
                  {t("Iniciar práctica", "Start practice")}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================== GRID INTERACTIVO DE RECURSOS ===================== */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
        {filteredResources.map((item) => {
          const meta = TYPE_META[item.tipo_contenido] || TYPE_META.guia_autocuidado;
          const can = canOpenItem(item);
          const isFree = item.es_gratuito !== false;
          const photoUrl =
            item.imagen_url ||
            (item.tipo_contenido === "video_bam"
              ? "/img/bam-movement.jpg"
              : item.tipo_contenido === "tapping_eft"
              ? "/img/tapping-eft.jpg"
              : item.tipo_contenido === "guia_autocuidado"
              ? "/img/healthy-cooking.jpg"
              : item.tipo_contenido === "musicoterapia"
              ? "/img/sound-healing.jpg"
              : item.tipo_contenido === "academia_lhe"
              ? "/img/academy-lesson.jpg"
              : item.tipo_contenido === "love_circle"
              ? "/img/love-circle.jpg"
              : "/img/meditation-calm.jpg");

          return (
            <div
              key={item.id}
              className="group flex flex-col justify-between overflow-hidden rounded-[26px] bg-white p-3.5 sm:p-4 shadow-[0_8px_24px_rgba(40,30,35,0.06)] transition duration-300 hover:shadow-[0_14px_36px_rgba(40,30,35,0.12)] hover:-translate-y-0.5"
            >
              <div className="flex gap-4">
                {/* Miniatura Fotográfica Real con Badge y Botón Play */}
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-espresso/5 sm:h-32 sm:w-32">
                  <img
                    src={photoUrl}
                    alt={isEs ? item.titulo_es : item.titulo_en}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Badge de duración flotante */}
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                    {item.duracion || "15 min"}
                  </span>

                  {/* Botón Play central */}
                  <button
                    type="button"
                    onClick={() => {
                      if (item.tipo_contenido === "love_circle") {
                        openSheet("circle_rsvp");
                      } else {
                        openResource(item, can);
                      }
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                    aria-label={can ? t("Reproducir", "Play") : t("Contenido bloqueado", "Locked")}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition duration-300 group-hover:scale-110 ${
                        item.tipo_contenido === "love_circle"
                          ? "bg-[#239BA2] text-white"
                          : can
                          ? "bg-[#E8809A] text-white"
                          : "bg-espresso/80 text-white backdrop-blur-sm"
                      }`}
                    >
                      {item.tipo_contenido === "love_circle" ? (
                        <Users className="h-4 w-4" />
                      ) : can ? (
                        <Play className="h-4 w-4 fill-white" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                </div>

                {/* Contenido textual y metadatos */}
                <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C94A6A]">
                        {isEs ? meta.es : meta.en}
                      </span>
                      {isFree ? (
                        <span className="rounded-full bg-[#5C8D67]/15 px-2 py-0.5 text-[10px] font-bold text-[#2A5C35]">
                          ✓ {t("Gratis", "Free")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF1B8] px-2 py-0.5 text-[10px] font-bold text-[#8A6A00]">
                          <Crown className="h-3 w-3" />
                          {t("Academia · $10", "Academy · $10")}
                        </span>
                      )}
                      {item.nivel && (
                        <span className="rounded-full bg-espresso/5 px-2 py-0.5 text-[10px] font-medium text-espresso/60">
                          {item.nivel}
                        </span>
                      )}
                    </div>

                    <h4
                      onClick={() => {
                        if (item.tipo_contenido === "love_circle") {
                          openSheet("circle_rsvp");
                        } else {
                          openResource(item, can);
                        }
                      }}
                      className="mt-1 cursor-pointer font-serif text-base font-bold leading-snug text-espresso transition hover:text-[#DC5678] line-clamp-2"
                    >
                      {isEs ? item.titulo_es : item.titulo_en || item.titulo_es}
                    </h4>

                    <p className="mt-1 text-xs text-espresso/65 line-clamp-2 leading-relaxed">
                      {isEs ? item.descripcion_es : item.descripcion_en || item.descripcion_es}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-espresso/55">
                    <span className="truncate">
                      {item.instructor ? `Guiado por ${item.instructor}` : "Love Heals Effect"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (item.tipo_contenido === "love_circle") {
                          openSheet("circle_rsvp");
                        } else {
                          openResource(item, can);
                        }
                      }}
                      className="flex items-center gap-1 font-bold text-[#C94A6A] hover:underline"
                    >
                      {item.tipo_contenido === "love_circle"
                        ? t("Inscribirme", "RSVP")
                        : can
                        ? t("Ver", "Open")
                        : t("Desbloquear", "Unlock")}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredResources.length === 0 && (
          <div className="col-span-full">
            <Card className="py-12 text-center text-sm text-espresso/60">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-espresso/5 text-2xl">
                🌿
              </span>
              <p className="mt-3 font-semibold">
                {t("No encontramos recursos en esta categoría.", "No resources found in this category.")}
              </p>
              <button
                type="button"
                onClick={() => setResourceFilter("todos")}
                className="mt-3 text-xs font-bold text-[#C94A6A] underline"
              >
                {t("Ver todos los recursos", "View all resources")}
              </button>
            </Card>
          </div>
        )}
      </section>

      {/* ===================== ACADEMIA LOVE HEALS EFFECT (3 Pilares del curso) ===================== */}
      <section className="mt-10 rounded-[32px] bg-gradient-to-br from-[#FFF8EE] via-[#FDF5F2] to-[#FAF1FF] p-6 shadow-sm border border-espresso/5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#E8809A] text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-serif text-lg font-bold text-espresso">
              {t("The Love Heals Effect Academy", "The Love Heals Effect Academy")}
            </h3>
            <p className="text-xs text-espresso/60">
              {t("Modelo de sanación integral en 3 niveles (Documento Oficial)", "Official 3-level healing model")}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 grid-cols-1 sm:grid-cols-3">
          {[
            {
              title: t("1. Sanación Individual", "1. Individual Healing"),
              sub: t("Lecciones semanales paso a paso", "Step-by-step weekly lessons"),
              desc: t("Movimiento suave, respiración celular y diario guiado para reconectar con tu cuerpo.", "Gentle movement, cellular breathwork, and guided journal."),
              tag: "Weekly Lesson",
              img: "/img/academy-lesson.jpg",
            },
            {
              title: t("2. Práctica entre Pares", "2. Peers Healing"),
              sub: t("Webinars en vivo entre mujeres", "Live webinars between peers"),
              desc: t("Práctica interactiva en vivo con Omar y Kelsie para compartir avances y dudas.", "Interactive live practice with Omar and Kelsie."),
              tag: "Live Webinar",
              img: "/img/bam-movement.jpg",
            },
            {
              title: t("3. Sanación Colectiva", "3. Collective Healing"),
              sub: t("Círculos avanzados de apoyo", "Advanced support circles"),
              desc: t("Contención comunitaria profunda para pacientes y cuidadores en Honolulu.", "Deep community support for patients and caregivers."),
              tag: "Support Group",
              img: "/img/love-circle.jpg",
            },
          ].map((col, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl bg-white p-3.5 shadow-sm border border-espresso/5 flex flex-col justify-between"
            >
              <div className="relative h-28 w-full overflow-hidden rounded-xl bg-espresso/5">
                <img src={col.img} alt={col.title} className="h-full w-full object-cover" />
                <span className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                  {col.tag}
                </span>
              </div>
              <div className="mt-3">
                <h4 className="font-serif text-sm font-bold text-espresso">{col.title}</h4>
                <p className="text-[11px] font-semibold text-[#DC5678]">{col.sub}</p>
                <p className="mt-1 text-xs text-espresso/65 leading-relaxed">{col.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => openSheet("membership")}
                className="mt-3 flex items-center justify-between border-t border-espresso/5 pt-2 text-xs font-bold text-[#C94A6A] hover:underline"
              >
                <span>{t("Ver en la Academia", "View in Academy")}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

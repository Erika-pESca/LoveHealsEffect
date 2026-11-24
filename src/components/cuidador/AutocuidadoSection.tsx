"use client";

import React, { useMemo } from "react";
import {
  BookOpen,
  CalendarHeart,
  ChevronRight,
  Clock,
  Heart,
  Music,
  Play,
  Sparkles,
  Users,
  Video,
  Wind,
} from "lucide-react";
import { Card } from "@/components/panel/ui";
import { TYPE_META } from "@/components/paciente/PacienteDashboard";

interface AutocuidadoSectionProps {
  t: (es: string, en: string) => string;
  isEs: boolean;
  runAction: (action: string, payload?: any, message?: string, options?: any) => Promise<any>;
  resourceFilter: string;
  setResourceFilter: (filter: string) => void;
  filteredResources: any[];
  setPlayerItem: (item: any) => void;
  setSheet: (sheet: string | null) => void;
  fmtDate: (d: string) => string;
}

export function AutocuidadoSection({
  t,
  isEs,
  runAction,
  resourceFilter,
  setResourceFilter,
  filteredResources,
  setPlayerItem,
  setSheet,
  fmtDate,
}: AutocuidadoSectionProps) {
  // Práctica destacada para el cuidador (Autorregulación 8 min)
  const heroCaregiver = useMemo(() => {
    return (
      filteredResources.find((r) => r.id === 303 || r.tipo_contenido === "meditacion_audio") ||
      filteredResources[0]
    );
  }, [filteredResources]);

  const categories = useMemo(() => {
    return [
      { id: "todos", es: "Todo", en: "All", icon: Sparkles },
      { id: "guia_autocuidado", es: "Cocina & Guías", en: "Cooking & Guides", icon: BookOpen },
      { id: "meditacion_audio", es: "Pausas de Calma", en: "Calm Pauses", icon: Wind },
      { id: "workshop", es: "Workshops", en: "Workshops", icon: CalendarHeart },
      { id: "love_circle", es: "Love Circles", en: "Love Circles", icon: Users },
    ];
  }, []);

  return (
    <main className="mt-6 space-y-7 pb-8">
      {/* ===================== ENCABEZADO ===================== */}
      <div className="animate-fade-in">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#239BA2]/15 px-3 py-1 text-[11px] font-bold text-[#239BA2]">
          <Heart className="h-3.5 w-3.5" />
          {t("Espacio de Autocuidado del Cuidador", "Caregiver Self-Care Sanctuary")}
        </div>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.025em] leading-tight text-espresso">
          {t("Para ti, cuidador/a", "For you, caregiver")}
        </h2>
        <p className="mt-1 text-sm text-espresso/65">
          {t(
            "Cuidar a quien amas empieza por cuidarte a ti. Pausas cortas de descanso, nutrición y círculos de apoyo.",
            "Caring for someone you love starts with caring for yourself. Short rest pauses, nutrition, and support circles."
          )}
        </p>
      </div>

      {/* ===================== HERO CARD CUÍDATE (Estilo Image 1 & 2) ===================== */}
      {heroCaregiver && (
        <section className="animate-fade-in">
          <div className="group relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1C4143] to-[#2B6064] shadow-[0_16px_38px_rgba(35,155,162,0.25)]">
            <div className="absolute inset-0 z-0">
              <img
                src={heroCaregiver.imagen_url || "/img/meditation-calm.jpg"}
                alt={isEs ? heroCaregiver.titulo_es : heroCaregiver.titulo_en}
                className="h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C4143] via-[#1C4143]/60 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col justify-between p-6 sm:p-7 min-h-[290px]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                    🌿 {t("Pausa recomendada", "Recommended pause")}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#239BA2] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                    <Clock className="h-3 w-3" />
                    {heroCaregiver.duracion || "8 min"}
                  </span>
                  <span className="rounded-full bg-white/20 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white/90">
                    {heroCaregiver.nivel || t("Calma Rápida", "Quick Calm")}
                  </span>
                </div>

                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.025em] leading-snug text-white sm:text-3xl max-w-[85%]">
                  {isEs ? heroCaregiver.titulo_es : heroCaregiver.titulo_en}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-white/80 line-clamp-2 max-w-[90%]">
                  {isEs ? heroCaregiver.descripcion_es : heroCaregiver.descripcion_en}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-medium text-white/85">
                  {t("Guiado por", "Guided by")}{" "}
                  <strong className="text-white">
                    {heroCaregiver.instructor || "Omar Melero"}
                  </strong>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setPlayerItem(heroCaregiver);
                    setSheet("player");
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4DB6B0] to-[#239BA2] px-6 py-3 text-xs font-bold text-white shadow-lg transition duration-300 hover:brightness-105 active:scale-95"
                >
                  <Play className="h-4 w-4 fill-white" />
                  {t("Iniciar pausa", "Start pause")}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================== LOVE CIRCLE CUIDADORES ===================== */}
      <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#CFEDE8] to-[#E4E0FA] p-5 shadow-sm">
        <div className="absolute -right-4 -top-4 h-36 w-36 overflow-hidden rounded-full opacity-20 pointer-events-none">
          <img src="/img/love-circle.jpg" alt="Love Circle" className="h-full w-full object-cover" />
        </div>
        <span className="inline-block rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-[#239BA2]">
          Love Circle · {t("En vivo · 100% Gratis", "Live · 100% Free")}
        </span>
        <h3 className="mt-2 max-w-[75%] text-xl font-semibold tracking-[-0.025em] text-espresso">
          {t("Círculo de cuidadores con Omar Melero", "Caregivers circle with Omar Melero")}
        </h3>
        <p className="mt-1 text-xs text-espresso/65 max-w-[85%]">
          {t(
            "Desahogo seguro, acompañamiento sin juicios y herramientas prácticas de resiliencia familiar.",
            "Safe sharing, non-judgmental support, and practical family resilience tools."
          )}
        </p>
        <button
          type="button"
          onClick={() =>
            runAction(
              "book_healer_session",
              {
                asistente_rol: "cuidador",
                modalidad: "online",
                fecha_sesion: new Date(Date.now() + 4 * 86400000).toISOString(),
                es_sesion_gratuita_mensual: true,
                enlace_o_lugar: "Love Circle for Caregivers · Zoom con Omar Melero",
              },
              t("¡Tu cupo quedó reservado!", "Your spot is reserved!")
            )
          }
          className="mt-4 rounded-full bg-[#239BA2] px-5 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
        >
          {t("Reservar mi cupo gratuito", "Reserve my free spot")}
        </button>
      </div>

      {/* ===================== FILTROS DE CATEGORÍA ===================== */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-espresso/50">
            {t("Categorías de autocuidado", "Self-care categories")}
          </span>
          <span className="text-xs font-semibold text-espresso/45">
            {filteredResources.length} {t("disponibles", "available")}
          </span>
        </div>
        <div className="-mx-5 mt-2 flex gap-2 overflow-x-auto px-5 pb-2 scrollbar-none">
          {categories.map((f) => {
            const active = resourceFilter === f.id;
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setResourceFilter(f.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold transition active:scale-95 ${
                  active
                    ? "bg-[#239BA2] text-white shadow-md shadow-[#239BA2]/30"
                    : "bg-white text-espresso/70 shadow-sm hover:bg-espresso/5"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? "text-white" : "text-espresso/50"}`} />
                {isEs ? f.es : f.en}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================== GRID DE TARJETAS CON FOTOS REALES ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
        {filteredResources.map((item) => {
          const meta = TYPE_META[item.tipo_contenido] || TYPE_META.guia_autocuidado;
          const photoUrl =
            item.imagen_url ||
            (item.tipo_contenido === "guia_autocuidado"
              ? "/img/healthy-cooking.jpg"
              : item.tipo_contenido === "workshop"
              ? "/img/sound-healing.jpg"
              : item.tipo_contenido === "love_circle"
              ? "/img/love-circle.jpg"
              : "/img/meditation-calm.jpg");

          return (
            <div
              key={item.id}
              className="group overflow-hidden rounded-[26px] bg-white p-3.5 shadow-[0_8px_24px_rgba(35,155,162,0.06)] transition duration-300 hover:shadow-[0_12px_32px_rgba(35,155,162,0.12)]"
            >
              <div className="flex gap-4">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-espresso/5 sm:h-32 sm:w-32">
                  <img
                    src={photoUrl}
                    alt={isEs ? item.titulo_es : item.titulo_en}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                    {item.duracion || "10 min"}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setPlayerItem(item);
                      setSheet("player");
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                    aria-label={t("Reproducir", "Play")}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#239BA2] text-white shadow-lg transition duration-300 group-hover:scale-110">
                      <Play className="h-4 w-4 fill-white" />
                    </span>
                  </button>
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#239BA2]">
                        {isEs ? meta.es : meta.en}
                      </span>
                      {item.es_gratuito !== false && (
                        <span className="rounded-full bg-[#5C8D67]/15 px-2 py-0.5 text-[10px] font-bold text-[#2A5C35]">
                          ✓ {t("Gratis", "Free")}
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
                        setPlayerItem(item);
                        setSheet("player");
                      }}
                      className="mt-1 cursor-pointer text-base font-bold leading-snug text-espresso transition hover:text-[#239BA2] line-clamp-2"
                    >
                      {isEs ? item.titulo_es : item.titulo_en || item.titulo_es}
                    </h4>

                    <p className="mt-1 text-xs text-espresso/65 line-clamp-2 leading-relaxed">
                      {isEs ? item.descripcion_es : item.descripcion_en || item.descripcion_es}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-espresso/55">
                    <span className="truncate">
                      {item.instructor ? `Con ${item.instructor}` : "Love Heals Effect"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPlayerItem(item);
                        setSheet("player");
                      }}
                      className="flex items-center gap-1 font-bold text-[#239BA2] hover:underline"
                    >
                      {t("Iniciar", "Start")}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

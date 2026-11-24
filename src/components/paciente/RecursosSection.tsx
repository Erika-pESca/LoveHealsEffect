"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronRight,
  Crown,
  FileText,
  Headphones,
  HeartHandshake,
  Lock,
  Mic,
  Music,
  Play,
  Search,
  Sparkles,
  Users,
  Utensils,
  Video,
  Wind,
} from "lucide-react";

export interface RecursosSectionProps {
  resources: any[];
  healers?: any[];
  /** Guarda la vista actual: "todos" (inicio), "col:<id>|<sanador>" o "healer:<nombre>" */
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

/* ------------------------------------------------------------------ */
/*  Configuración de colecciones (cada una = una "puerta" con su foto) */
/* ------------------------------------------------------------------ */

type Layout = "tracks" | "videos" | "books" | "docs";

interface Collection {
  id: string;
  types: string[];
  es: string;
  en: string;
  descEs: string;
  descEn: string;
  helpsEs: string;
  helpsEn: string;
  tagsEs: string[];
  tagsEn: string[];
  img: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  layout: Layout;
}

const COLLECTIONS: Collection[] = [
  {
    id: "spotify",
    types: ["spotify"],
    es: "Música en Spotify",
    en: "Music on Spotify",
    descEs: "Playlists curadas por nuestros sanadores",
    descEn: "Playlists curated by our healers",
    helpsEs:
      "Acompañarte durante tus sesiones de quimioterapia o salas de espera, bajar la ansiedad del cuerpo y ayudarte a conciliar un sueño profundo en casa.",
    helpsEn:
      "Support you during chemotherapy or waiting rooms, calm body anxiety, and help you fall into deep, restorative sleep at home.",
    tagsEs: ["Calma en quimio", "Bajar ansiedad", "Dormir mejor", "Ánimo suave"],
    tagsEn: ["Chemo calm", "Lower anxiety", "Better sleep", "Gentle mood"],
    img: "/img/sound-healing.jpg",
    icon: Headphones,
    accent: "#1DB954",
    layout: "tracks",
  },
  {
    id: "meditaciones",
    types: ["meditacion_audio"],
    es: "Meditaciones",
    en: "Meditations",
    descEs: "Audios guiados de autosanación",
    descEn: "Guided self-healing audios",
    helpsEs:
      "Regular las palpitaciones y el miedo antes de exámenes o consultas médicas, reconectar con tu respiración y cultivar calma mental.",
    helpsEn:
      "Regulate racing thoughts and fear before scans or medical visits, reconnect with your breath, and cultivate inner calm.",
    tagsEs: ["Antes de citas médicas", "Calmar el miedo", "Respiración guiada"],
    tagsEn: ["Before appointments", "Calm fear", "Guided breath"],
    img: "/img/meditation-calm.jpg",
    icon: Wind,
    accent: "#7A4FD1",
    layout: "tracks",
  },
  {
    id: "videos",
    types: ["video_bam"],
    es: "Movimiento BAM",
    en: "BAM Movement",
    descEs: "Videos de movimiento consciente",
    descEn: "Mindful movement videos",
    helpsEs:
      "Recuperar movilidad suave en brazos, pecho y hombros tras cirugía o quimio, apoyar el drenaje linfático y soltar la rigidez sin dolor.",
    helpsEn:
      "Gently restore mobility in arms, chest, and shoulders post-surgery or chemo, support lymphatic flow, and release stiffness safely.",
    tagsEs: ["Drenaje linfático", "Movilidad post-cirugía", "Cero impacto"],
    tagsEn: ["Lymphatic flow", "Post-surgery mobility", "Zero impact"],
    img: "/img/bam-movement.jpg",
    icon: Video,
    accent: "#DC5678",
    layout: "videos",
  },
  {
    id: "libros",
    types: ["libro"],
    es: "Libros",
    en: "Books",
    descEs: "Lecturas que recomiendan nuestros sanadores",
    descEn: "Reads our healers recommend",
    helpsEs:
      "Comprender tu proceso con esperanza, aprender hábitos integrativos respaldados por sobrevivientes y sentirte acompañada en cada etapa.",
    helpsEn:
      "Understand your journey with hope, learn integrative habits backed by survivors, and feel accompanied at every stage.",
    tagsEs: ["Esperanza realista", "Hábitos anticáncer", "Historias reales"],
    tagsEn: ["Grounded hope", "Anticancer habits", "Real stories"],
    img: "/img/academy-lesson.jpg",
    icon: BookOpen,
    accent: "#B98A00",
    layout: "books",
  },
  {
    id: "podcast",
    types: ["podcast"],
    es: "Podcast",
    en: "Podcast",
    descEs: "Conversaciones Love Heals",
    descEn: "Love Heals conversations",
    helpsEs:
      "Escuchar conversaciones honestas sobre el diagnóstico, el descanso familiar, los límites sanos y cómo cuidar sin agotarse.",
    helpsEn:
      "Listen to honest conversations about diagnosis, family rest, healthy boundaries, and how to care without burning out.",
    tagsEs: ["Acompañamiento emocional", "Familia y cuidador", "Testimonios"],
    tagsEn: ["Emotional support", "Family & caregiver", "Stories"],
    img: "/img/love-circle.jpg",
    icon: Mic,
    accent: "#C94A6A",
    layout: "tracks",
  },
  {
    id: "musicoterapia",
    types: ["musicoterapia"],
    es: "Musicoterapia",
    en: "Music therapy",
    descEs: "Cuencos y sonidos que relajan",
    descEn: "Bowls and relaxing sounds",
    helpsEs:
      "Descansar el sistema nervioso mediante cuencos de cuarzo, frecuencias armónicas y paisajes sonoros de Hawái cuando no tienes energía para hablar.",
    helpsEn:
      "Rest your nervous system through quartz bowls, harmonic frequencies, and Hawaiian soundscapes when you just need quiet rest.",
    tagsEs: ["Cuencos 432 Hz", "Descanso nervioso", "Relajación profunda"],
    tagsEn: ["432 Hz bowls", "Nervous system rest", "Deep relaxation"],
    img: "/img/sound-healing.jpg",
    icon: Music,
    accent: "#239BA2",
    layout: "tracks",
  },
  {
    id: "tapping",
    types: ["tapping_eft"],
    es: "Tapping y respiración",
    en: "Tapping & breathwork",
    descEs: "Técnicas para calmar las emociones",
    descEn: "Techniques to calm emotions",
    helpsEs:
      "Liberar picos de angustia, incertidumbre o insomnio en pocos minutos estimulando puntos suaves de acupresión con tu propia mano.",
    helpsEn:
      "Release spikes of distress, uncertainty, or insomnia in minutes by gently tapping calming acupressure points.",
    tagsEs: ["Alivio en 10 min", "Manejo del miedo", "Regulación emocional"],
    tagsEn: ["10-min relief", "Fear management", "Emotional regulation"],
    img: "/img/tapping-eft.jpg",
    icon: Sparkles,
    accent: "#7A4FD1",
    layout: "videos",
  },
  {
    id: "cocina",
    types: ["guia_autocuidado"],
    es: "Cocina saludable",
    en: "Healthy cooking",
    descEs: "Recetas y alimentación con amor",
    descEn: "Recipes and loving nutrition",
    helpsEs:
      "Aliviar náuseas y falta de apetito con caldos antiinflamatorios, infusiones digestivas y preparaciones sencillas para ti y tu cuidador.",
    helpsEn:
      "Ease nausea and low appetite with anti-inflammatory broths, digestive teas, and simple recipes for you and your caregiver.",
    tagsEs: ["Aliviar náuseas", "Caldos e infusiones", "Fácil para el cuidador"],
    tagsEn: ["Ease nausea", "Broths & teas", "Easy for caregivers"],
    img: "/img/healthy-cooking.jpg",
    icon: Utensils,
    accent: "#5C8D67",
    layout: "videos",
  },
  {
    id: "guias",
    types: ["guia_pdf"],
    es: "Guías descargables",
    en: "Downloadable guides",
    descEs: "PDFs prácticos para tu proceso",
    descEn: "Practical PDFs for your journey",
    helpsEs:
      "Tener a la mano listas prácticas para tu primera quimio, preguntas para el oncólogo y pasos claros para las primeras semanas en casa.",
    helpsEn:
      "Keep handy checklists for your first chemo, questions for your oncologist, and clear steps for your first weeks at home.",
    tagsEs: ["Listas paso a paso", "Para imprimir o guardar", "Paciente y cuidador"],
    tagsEn: ["Step-by-step lists", "Print or save", "Patient & caregiver"],
    img: "/img/academy-lesson.jpg",
    icon: FileText,
    accent: "#262322",
    layout: "docs",
  },
];

const ACADEMY: Collection = {
  id: "academia",
  types: [],
  es: "The Love Heals Effect Academy",
  en: "The Love Heals Effect Academy",
  descEs: "Lecciones semanales, meditaciones avanzadas y webinars en vivo",
  descEn: "Weekly lessons, advanced meditations and live webinars",
  helpsEs:
    "Profundizar semana a semana en los 3 pilares del curso Love Heals Effect: sanación individual, práctica en vivo entre pares y grupos avanzados.",
  helpsEn:
    "Go deeper week by week across the 3 pillars of The Love Heals Effect course: individual healing, live peer practice, and advanced circles.",
  tagsEs: ["Individual Healing", "Peers Healing", "Collective Healing"],
  tagsEn: ["Individual Healing", "Peers Healing", "Collective Healing"],
  img: "/img/academy-lesson.jpg",
  icon: Crown,
  accent: "#B98A00",
  layout: "videos",
};

export interface HealerSummary {
  id?: number;
  name: string;
  specialtyEs: string;
  specialtyEn: string;
  bioEs: string;
  bioEn: string;
  grad: string;
}

/** Respaldo base cuando aún no hay ficha en BD para un sanador. */
const FALLBACK_HEALERS: Record<string, HealerSummary> = {
  "Kelsie Reynolds": {
    id: 101,
    name: "Kelsie Reynolds",
    specialtyEs: "Sobreviviente · Coach holística de cáncer de mama y Movimiento BAM",
    specialtyEn: "Survivor · Holistic Breast Cancer Coach & BAM Movement",
    bioEs:
      "Cofundadora de Love Heals Effect en Honolulu. Acompaña a mujeres en tratamiento y recuperación a liberar tensión linfática, habitar su cuerpo con calma y sostener la esperanza.",
    bioEn:
      "Co-founder of Love Heals Effect in Honolulu. Helps women in treatment and recovery release lymphatic tension, inhabit their body gently, and hold grounded hope.",
    grad: "from-[#E8809A] to-[#C94A6A]",
  },
  "Omar Melero": {
    id: 102,
    name: "Omar Melero",
    specialtyEs: "Coach integrativo · Regulación del sistema nervioso y apoyo a cuidadores",
    specialtyEn: "Integrative Coach · Nervous System Regulation & Caregiver Support",
    bioEs:
      "Cofundador de Love Heals Effect. Especialista en respiración consciente, descanso profundo, Tapping EFT y resiliencia emocional para pacientes y quienes cuidan en casa.",
    bioEn:
      "Co-founder of Love Heals Effect. Specialist in conscious breathwork, deep rest, EFT Tapping, and emotional resilience for patients and family caregivers.",
    grad: "from-[#239BA2] to-[#166064]",
  },
  "Dra. Maya Lin": {
    name: "Dra. Maya Lin",
    specialtyEs: "Medicina integrativa · Acupuntura oncológica y nutrición antiinflamatoria",
    specialtyEn: "Integrative Medicine · Oncology Acupuncture & Anti-inflammatory Nutrition",
    bioEs:
      "Especialista invitada en Honolulu en alimentación alcalina, alivio natural de náuseas post-quimioterapia y equilibrio digestivo.",
    bioEn:
      "Guest specialist in Honolulu focused on alkaline nutrition, natural post-chemo nausea relief, and digestive balance.",
    grad: "from-[#5C8D67] to-[#239BA2]",
  },
};

/** Próximos Love Circles del mes (inscripción con anticipación). */
const UPCOMING_CIRCLES = [
  { iso: "2026-11-29T18:00:00-10:00", es: "Sáb 29 Nov", en: "Sat Nov 29", topicEs: "Respirar en paz y soltar tensión", topicEn: "Breathe in peace, release tension" },
  { iso: "2026-12-06T18:00:00-10:00", es: "Sáb 6 Dic", en: "Sat Dec 6", topicEs: "Pacientes y cuidadores juntos", topicEn: "Patients and caregivers together" },
  { iso: "2026-12-13T18:00:00-10:00", es: "Sáb 13 Dic", en: "Sat Dec 13", topicEs: "Tapping y cuencos de cuarzo", topicEn: "Tapping and quartz bowls" },
];

const PAGE_SIZE = 8;

/** Normaliza "Kelsie & Omar" → ["Kelsie Reynolds", "Omar Melero"]. */
function healersOf(item: any): string[] {
  const raw = String(item.instructor || "Love Heals Effect");
  return raw
    .split(/&|,| y | and /i)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (/kelsie/i.test(s) ? "Kelsie Reynolds" : /omar/i.test(s) ? "Omar Melero" : s));
}

export function RecursosSection({
  resources,
  healers: healerRows = [],
  resourceFilter,
  setResourceFilter,
  isPremium,
  openSheet,
  canOpenItem,
  openResource,
  t,
  isEs,
}: RecursosSectionProps) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  /* ---------------- Mapa vivo de fichas de sanadores (desde lo que rellena cada sanador en BD) ---------------- */
  const healerDirectory = useMemo(() => {
    const map = new Map<string, HealerSummary>();
    Object.entries(FALLBACK_HEALERS).forEach(([k, v]) => map.set(k, v));

    healerRows.forEach((h: any) => {
      const raw = String(h.especialidad || "").trim();
      if (!raw) return;
      const parts = raw.split("·").map((s) => s.trim());
      const rawName = parts[0] || raw;
      const canonicalName = /kelsie/i.test(rawName)
        ? "Kelsie Reynolds"
        : /omar/i.test(rawName)
          ? "Omar Melero"
          : rawName;
      const specFromRow = parts.slice(1).join(" · ").trim();
      const existing = map.get(canonicalName);

      map.set(canonicalName, {
        id: h.id ?? existing?.id,
        name: canonicalName,
        specialtyEs: specFromRow || existing?.specialtyEs || "Sanador integrativo · Love Heals Effect",
        specialtyEn: specFromRow || existing?.specialtyEn || "Integrative Healer · Love Heals Effect",
        bioEs: h.short_bio_es || existing?.bioEs || "",
        bioEn: h.short_bio_en || h.short_bio_es || existing?.bioEn || "",
        grad: existing?.grad || "from-[#F49678] to-[#D85678]",
      });
    });

    return map;
  }, [healerRows]);

  const getHealerInfo = (name: string): HealerSummary =>
    healerDirectory.get(name) || {
      name,
      specialtyEs: "Especialista en salud holística e integrativa",
      specialtyEn: "Holistic & integrative health specialist",
      bioEs: "Comparte recursos gratuitos en la comunidad Love Heals Effect para acompañar tu bienestar.",
      bioEn: "Shares free resources in the Love Heals Effect community to support your well-being.",
      grad: "from-[#F49678] to-[#D85678]",
    };

  /* ---------------- Vista actual (persistida en el padre) ---------------- */
  const view = useMemo(() => {
    if (resourceFilter.startsWith("col:")) {
      const [id, healer] = resourceFilter.slice(4).split("|");
      return { kind: "collection" as const, id, healer: healer || "" };
    }
    if (resourceFilter.startsWith("healer:")) {
      return { kind: "healer" as const, name: resourceFilter.slice(7) };
    }
    return { kind: "hub" as const };
  }, [resourceFilter]);

  const go = (next: string) => {
    setResourceFilter(next);
    setQuery("");
    setVisible(PAGE_SIZE);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------------- Datos derivados ---------------- */
  const freeLibrary = useMemo(
    () =>
      resources.filter(
        (r) =>
          r.es_gratuito !== false &&
          !["love_circle", "workshop", "academia_lhe"].includes(r.tipo_contenido)
      ),
    [resources]
  );
  const paidItems = useMemo(() => resources.filter((r) => r.es_gratuito === false), [resources]);
  const nextCircle = useMemo(() => resources.find((r) => r.tipo_contenido === "love_circle"), [resources]);

  const itemsOf = (col: Collection) =>
    col.id === "academia" ? paidItems : freeLibrary.filter((r) => col.types.includes(r.tipo_contenido));

  const collectionsWithItems = COLLECTIONS.map((c) => ({ col: c, items: itemsOf(c) })).filter(
    (c) => c.items.length > 0
  );

  const healers = useMemo(() => {
    const map = new Map<string, number>();
    freeLibrary.forEach((r) => healersOf(r).forEach((h) => map.set(h, (map.get(h) || 0) + 1)));
    return Array.from(map.entries())
      .filter(([name]) => name !== "Love Heals Effect")
      .sort((a, b) => b[1] - a[1]);
  }, [freeLibrary]);

  /* ---------------- Abrir un recurso (abre ficha/reproductor con contexto del sanador) ---------------- */
  const open = (item: any) => {
    openResource(item, canOpenItem(item));
  };

  /* ================================================================== */
  /*  VISTA: COLECCIÓN (ej. todo Spotify, todos los libros)              */
  /* ================================================================== */
  if (view.kind === "collection") {
    const col = view.id === "academia" ? ACADEMY : COLLECTIONS.find((c) => c.id === view.id);
    if (!col) {
      go("todos");
      return null;
    }
    const all = itemsOf(col);
    const colHealers = Array.from(new Set(all.flatMap(healersOf))).filter((n) => n !== "Love Heals Effect");
    const q = query.trim().toLowerCase();
    const filtered = all.filter((r) => {
      if (view.healer && !healersOf(r).includes(view.healer)) return false;
      if (!q) return true;
      return `${r.titulo_es} ${r.titulo_en} ${r.descripcion_es || ""} ${r.descripcion_en || ""} ${r.autor || ""} ${r.instructor || ""}`
        .toLowerCase()
        .includes(q);
    });
    const shown = filtered.slice(0, visible);
    const Icon = col.icon;
    const selectedHealerInfo = view.healer ? getHealerInfo(view.healer) : null;

    return (
      <main className="mt-6 space-y-5 pb-10 animate-fade-in">
        <button
          type="button"
          onClick={() => go("todos")}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-espresso/70 shadow-sm transition hover:bg-espresso/5 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("Volver a Recursos", "Back to Resources")}
        </button>

        {/* Portada de la colección */}
        <section className="relative overflow-hidden rounded-[30px] shadow-[0_14px_34px_rgba(38,35,34,0.18)]">
          <img src={col.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/15" />
          <div className="relative flex min-h-[210px] flex-col justify-end p-6 md:min-h-[250px] md:p-8">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-md"
              style={{ backgroundColor: col.accent }}
            >
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white md:text-4xl">{isEs ? col.es : col.en}</h2>
            <p className="mt-1 text-sm text-white/85">
              {isEs ? col.descEs : col.descEn} · {all.length} {t("recursos", "resources")}
            </p>
          </div>
        </section>

        {/* Explicación clara para la paciente: ¿Qué vas a poder manejar / en qué te ayuda? */}
        <section className="rounded-[26px] border border-espresso/5 bg-white/95 p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#C94A6A]">
                <HeartHandshake className="h-3.5 w-3.5" />
                {t("¿En qué te ayuda este espacio?", "How does this space help you?")}
              </span>
              <p className="mt-1 text-sm leading-relaxed text-espresso/80">
                {isEs ? col.helpsEs : col.helpsEn}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(isEs ? col.tagsEs : col.tagsEn).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#FAF7F2] px-3 py-1 text-[11px] font-bold text-espresso/70"
                >
                  ✨ {tag}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-3 border-t border-espresso/5 pt-2.5 text-xs text-espresso/55">
            {t(
              "Cada recurso es subido directamente por nuestros sanadores, quienes te explican qué podrás trabajar con él y desde qué especialidad te acompañan.",
              "Each resource is uploaded directly by our healers, explaining what it helps you manage and the specialty they bring to your care."
            )}
          </p>
        </section>

        {/* Filtros por sanador + búsqueda */}
        {(colHealers.length > 0 || all.length > 6) && (
          <section className="space-y-3">
            {all.length > 6 && (
              <label className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
                <Search className="h-4 w-4 text-espresso/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("Buscar por síntoma, tema o sanador…", "Search by symptom, topic or healer…")}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-espresso/40"
                />
              </label>
            )}
            {colHealers.length > 0 && (
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
                <button
                  type="button"
                  onClick={() => go(`col:${col.id}`)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition active:scale-95 ${!view.healer ? "bg-espresso text-white shadow" : "bg-white text-espresso/65 shadow-sm hover:bg-espresso/5"
                    }`}
                >
                  {t("Todos los sanadores", "All healers")}
                </button>
                {colHealers.map((h) => {
                  const active = view.healer === h;
                  const info = getHealerInfo(h);
                  const shortSpec = (isEs ? info.specialtyEs : info.specialtyEn).split("·").pop()?.trim();
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => go(`col:${col.id}|${h}`)}
                      className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-left text-xs transition active:scale-95 ${active ? "bg-espresso text-white shadow" : "bg-white text-espresso/75 shadow-sm hover:bg-espresso/5"
                        }`}
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${info.grad} text-[11px] font-bold text-white`}
                      >
                        {h.charAt(0)}
                      </span>
                      <span>
                        <strong className="font-bold">{h}</strong>
                        {shortSpec && (
                          <span className={`hidden sm:inline ${active ? "text-white/75" : "text-espresso/50"}`}>
                            {" "}
                            · {shortSpec}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Ficha viva del sanador cuando la usuaria filtra por él/ella */}
            {selectedHealerInfo && (
              <div className="flex flex-col justify-between gap-4 rounded-[26px] bg-gradient-to-r from-[#FFF8F4] via-white to-[#F2FAF9] p-4 shadow-sm border border-espresso/5 sm:flex-row sm:items-center animate-fade-in">
                <div className="flex items-start gap-3.5">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${selectedHealerInfo.grad} text-lg font-bold text-white shadow-sm`}
                  >
                    {selectedHealerInfo.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold tracking-[-0.015em] text-espresso">{selectedHealerInfo.name}</h3>
                      <span className="rounded-full bg-[#E8809A]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#C94A6A]">
                        {isEs ? selectedHealerInfo.specialtyEs : selectedHealerInfo.specialtyEn}
                      </span>
                    </div>
                    {(isEs ? selectedHealerInfo.bioEs : selectedHealerInfo.bioEn) && (
                      <p className="mt-1 text-xs leading-relaxed text-espresso/70">
                        {isEs ? selectedHealerInfo.bioEs : selectedHealerInfo.bioEn}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => go(`healer:${selectedHealerInfo.name}`)}
                    className="rounded-full bg-[#FAF7F2] px-3.5 py-2 text-xs font-bold text-espresso transition hover:bg-espresso/10"
                  >
                    {t("Ver todos sus recursos", "See all their resources")}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openSheet("book", selectedHealerInfo.id ? { healer: String(selectedHealerInfo.id) } : {})
                    }
                    className="rounded-full bg-espresso px-4 py-2 text-xs font-bold text-white transition hover:brightness-110"
                  >
                    {t("Reservar sesión", "Book session")}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Contenido según el tipo de colección */}
        {shown.length === 0 ? (
          <p className="rounded-3xl bg-white p-8 text-center text-sm text-espresso/60 shadow-sm">
            {t("No encontramos recursos con ese filtro. 🌿", "No resources match that filter. 🌿")}
          </p>
        ) : col.layout === "books" ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((b) => {
              const primaryHealer = healersOf(b)[0] || "Kelsie Reynolds";
              return (
                <BookCover
                  key={b.id}
                  item={b}
                  healer={getHealerInfo(primaryHealer)}
                  onOpen={() => open(b)}
                  onSelectHealer={() => go(`healer:${primaryHealer}`)}
                  isEs={isEs}
                  t={t}
                />
              );
            })}
          </section>
        ) : col.layout === "tracks" ? (
          <section className="space-y-3">
            {shown.map((r, i) => {
              const primaryHealer = healersOf(r)[0] || "Love Heals Effect";
              return (
                <TrackRow
                  key={r.id}
                  item={r}
                  index={i + 1}
                  accent={col.accent}
                  locked={!canOpenItem(r)}
                  healer={getHealerInfo(primaryHealer)}
                  onOpen={() => open(r)}
                  onSelectHealer={() => go(`healer:${primaryHealer}`)}
                  isEs={isEs}
                  t={t}
                />
              );
            })}
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((r) => {
              const primaryHealer = healersOf(r)[0] || "Love Heals Effect";
              return (
                <MediaCard
                  key={r.id}
                  item={r}
                  locked={!canOpenItem(r)}
                  healer={getHealerInfo(primaryHealer)}
                  onOpen={() => open(r)}
                  onSelectHealer={() => go(`healer:${primaryHealer}`)}
                  isEs={isEs}
                  t={t}
                  doc={col.layout === "docs"}
                />
              );
            })}
          </section>
        )}

        {filtered.length > visible && (
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="mx-auto block rounded-full bg-white px-6 py-2.5 text-xs font-bold text-espresso shadow-sm transition hover:bg-espresso/5"
          >
            {t("Ver más", "Show more")} ({filtered.length - visible})
          </button>
        )}

        {col.id === "academia" && !isPremium && (
          <button
            type="button"
            onClick={() => openSheet("membership")}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E8B93A] to-[#B98A00] py-3 text-sm font-bold text-white shadow-md"
          >
            <Crown className="h-4 w-4" />
            {t("Desbloquear la Academia · $10 USD/mes", "Unlock the Academy · $10 USD/mo")}
          </button>
        )}
      </main>
    );
  }

  /* ================================================================== */
  /*  VISTA: SANADOR (todo lo que publica un sanador + su especialidad)  */
  /* ================================================================== */
  if (view.kind === "healer") {
    const info = getHealerInfo(view.name);
    const mine = freeLibrary.filter((r) => healersOf(r).includes(view.name));
    const groups = COLLECTIONS.map((c) => ({ col: c, items: mine.filter((r) => c.types.includes(r.tipo_contenido)) })).filter(
      (g) => g.items.length > 0
    );

    return (
      <main className="mt-6 space-y-6 pb-10 animate-fade-in">
        <button
          type="button"
          onClick={() => go("todos")}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-espresso/70 shadow-sm transition hover:bg-espresso/5 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("Volver a Recursos", "Back to Resources")}
        </button>

        <section className="rounded-[30px] bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${info.grad} text-2xl font-bold text-white shadow-md`}
              >
                {view.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#239BA2]">
                  {t("Especialidad del sanador", "Healer's specialty")}
                </span>
                <h2 className="text-2xl font-semibold tracking-[-0.025em] text-espresso">{view.name}</h2>
                <p className="text-xs font-semibold text-[#C94A6A]">
                  {isEs ? info.specialtyEs : info.specialtyEn}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openSheet("book", info.id ? { healer: String(info.id) } : {})}
              className="rounded-full bg-espresso px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110"
            >
              {t("Reservar sesión con ", "Book a session with ")}
              {view.name.split(" ")[0]}
            </button>
          </div>

          {(isEs ? info.bioEs : info.bioEn) && (
            <div className="rounded-2xl bg-[#FAF7F2] p-4">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-espresso/50">
                {t("¿Cómo te puede ayudar en tu proceso?", "How can they support your journey?")}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-espresso/80">
                {isEs ? info.bioEs : info.bioEn}
              </p>
            </div>
          )}
        </section>

        {groups.map(({ col, items }) => (
          <section key={col.id} className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-espresso">{isEs ? col.es : col.en}</h3>
                <p className="text-xs text-espresso/55">{isEs ? col.helpsEs : col.helpsEn}</p>
              </div>
              <button
                type="button"
                onClick={() => go(`col:${col.id}|${view.name}`)}
                className="flex shrink-0 items-center gap-0.5 text-xs font-bold text-[#C94A6A]"
              >
                {t("Ver todo", "See all")} ({items.length})
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:px-0">
              {items.slice(0, 6).map((r) => (
                <MiniTile key={r.id} item={r} img={r.imagen_url || col.img} onOpen={() => open(r)} isEs={isEs} />
              ))}
            </div>
          </section>
        ))}
      </main>
    );
  }

  /* ================================================================== */
  /*  VISTA PRINCIPAL (HUB)                                              */
  /* ================================================================== */
  return (
    <main className="mt-6 space-y-9 pb-10">
      {/* ---------- 1. HEALING & LOVE CIRCLES (compañía + eventos gratuitos) ---------- */}
      <section className="animate-fade-in space-y-3">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#CFEDE8]/70 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#1E747A]">
            <Users className="h-3.5 w-3.5" />
            {t("Healing Circles · Compañía y Eventos Gratuitos", "Healing Circles · Companionship & Free Events")}
          </span>
          <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#2D2B2A] sm:text-4xl">
            {isEs ? "Healing Circles: Un espacio " : "Healing Circles: A space "}
            <span className="font-light italic text-[#E8809A]">
              {isEs ? "donde siempre tendrás compañía." : "where you are never alone."}
            </span>
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-espresso/65">
            {t(
              "Disfruta de nuestros encuentros en vivo, talleres abiertos y eventos 100% gratuitos creados para acompañarte, escucharte y sanar en comunidad junto a Kelsie y Omar.",
              "Enjoy our live gatherings, open workshops, and 100% free community events created to accompany you, listen to you, and heal together with Kelsie and Omar."
            )}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          {/* Tarjeta principal */}
          <div className="group relative overflow-hidden rounded-[30px] shadow-[0_18px_40px_rgba(28,46,43,0.28)] lg:col-span-3">
            <img
              src="/img/love-circle.jpg"
              alt="Love Circle"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#172725] via-[#172725]/70 to-[#172725]/10" />
            <div className="relative flex min-h-[320px] flex-col justify-end p-6 md:p-8">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#239BA2] px-3 py-1 text-[11px] font-bold text-white">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  {t("Zoom o presencial", "Zoom or in person")}
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                  ✓ {t("100% gratis", "100% free")}
                </span>
              </div>
              <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.025em] text-white md:text-3xl">
                Love Circle <span className="font-light italic text-[#FCD5DE]">for Patients</span>
              </h3>
              <p className="mt-1.5 max-w-lg text-sm text-white/85">
                {t(
                  "Un espacio seguro para conocernos, respirar juntas y sentirte acompañada. Facilitado por Kelsie y Omar.",
                  "A safe space to meet us, breathe together and feel supported. Facilitated by Kelsie and Omar."
                )}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => openSheet("circle_rsvp")}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-[#172725] shadow-lg transition hover:brightness-95 active:scale-95"
                >
                  <Calendar className="h-4 w-4" />
                  {t("Inscribirme gratis", "Sign up for free")}
                </button>
                <button
                  type="button"
                  onClick={() => openSheet("meet_founders")}
                  className="rounded-full bg-white/15 px-5 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95"
                >
                  {t("Conocer a Kelsie y Omar", "Meet Kelsie & Omar")}
                </button>
              </div>
            </div>
          </div>

          {/* Próximas fechas + sesión gratuita */}
          <div className="flex flex-col gap-3 lg:col-span-2">
            <div className="rounded-[26px] bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-espresso/50">
                {t("Próximas fechas", "Upcoming dates")}
              </p>
              <div className="mt-2 divide-y divide-espresso/5">
                {UPCOMING_CIRCLES.map((c) => (
                  <button
                    key={c.iso}
                    type="button"
                    onClick={() => openSheet("circle_rsvp", { fecha_circle: c.iso })}
                    className="flex w-full items-center gap-3 py-2.5 text-left transition hover:opacity-80"
                  >
                    <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#CFEDE8] text-[#1E747A]">
                      <span className="text-[10px] font-bold leading-none">{(isEs ? c.es : c.en).split(" ")[0]}</span>
                      <span className="text-sm font-extrabold leading-tight">{(isEs ? c.es : c.en).split(" ")[1]}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-espresso">{isEs ? c.topicEs : c.topicEn}</span>
                      <span className="block text-xs text-espresso/55">6:00 PM HST</span>
                    </span>
                    <span className="rounded-full bg-[#239BA2]/10 px-3 py-1 text-[11px] font-bold text-[#239BA2]">
                      {t("Reservar", "RSVP")}
                    </span>
                  </button>
                ))}
              </div>
              {nextCircle?.fecha_evento && (
                <p className="mt-1 text-[11px] text-espresso/45">
                  {t("Los cupos se confirman por correo.", "Spots are confirmed by email.")}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => openSheet("book", { gratis: "1", modalidad: "online" })}
              className="flex items-center gap-3 rounded-[26px] bg-gradient-to-r from-[#FFF5DA] to-[#FDE3E8] p-4 text-left shadow-sm transition hover:shadow-md active:scale-[0.98]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#C94A6A] shadow-sm">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-espresso">
                  {t("Tu sesión de coaching gratis del mes", "Your free coaching session this month")}
                </span>
                <span className="block text-xs text-espresso/60">{t("1 a 1 con Kelsie u Omar", "1-on-1 with Kelsie or Omar")}</span>
              </span>
              <ChevronRight className="h-5 w-5 text-espresso/40" />
            </button>
          </div>
        </div>
      </section>

      {/* ---------- 2. RECURSOS INSPIRADORES POR COLECCIÓN ---------- */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8809A]/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#C94A6A]">
              <Sparkles className="h-3.5 w-3.5" />
              {t("Support · Recursos de Sanación y Bienestar", "Support · Healing & Wellness Resources")}
            </span>
            <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#2D2B2A] sm:text-3xl">
              {isEs ? "Recursos que abrazan " : "Resources that embrace "}
              <span className="font-light italic text-[#E8809A]">
                {isEs ? "tu sanación cada día." : "your healing every day."}
              </span>
            </h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-espresso/65 sm:text-sm">
              {t(
                "Música, movimiento suave, meditaciones, lecturas y guías preparadas con amor por nuestros sanadores. Elige el espacio que tu cuerpo y tu corazón necesiten hoy.",
                "Music, gentle movement, meditations, reads, and guides lovingly prepared by our healers. Choose the space your body and heart need today."
              )}
            </p>
          </div>
          <span className="hidden shrink-0 text-xs font-semibold text-espresso/45 sm:block">
            {freeLibrary.length} {t("recursos", "resources")}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {collectionsWithItems.map(({ col, items }) => {
            const Icon = col.icon;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => go(`col:${col.id}`)}
                className="group relative aspect-[4/5] overflow-hidden rounded-[26px] text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(38,35,34,0.2)] active:scale-[0.98] sm:aspect-[4/3]"
              >
                <img src={col.img} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <span
                  className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md"
                  style={{ backgroundColor: col.accent }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-extrabold text-espresso">
                  {items.length}
                </span>
                <span className="absolute inset-x-3 bottom-3">
                  <span className="block text-base font-semibold leading-tight tracking-[-0.02em] text-white sm:text-lg">{isEs ? col.es : col.en}</span>
                  <span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-white/80">
                    {isEs ? col.helpsEs : col.helpsEn}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---------- 3. EXPLORAR POR SANADOR ---------- */}
      {healers.length > 0 && (
        <section className="space-y-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#239BA2]">
              {t("Nuestros sanadores", "Our healers")}
            </span>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#2D2B2A] sm:text-3xl">
              {isEs ? "Recursos según " : "Resources by "}
              <span className="font-light italic text-[#239BA2]">
                {isEs ? "cada especialista." : "each specialist."}
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-espresso/60">
              {t(
                "Conoce en qué se especializa cada sanador y explora lo que ha compartido para acompañarte.",
                "See what each healer specializes in and explore what they've shared to support you."
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {healers.map(([name, count]) => {
              const info = getHealerInfo(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => go(`healer:${name}`)}
                  className="flex flex-col justify-between rounded-[26px] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${info.grad} text-lg font-bold text-white shadow-sm`}
                      >
                        {name.charAt(0)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-espresso">{name}</span>
                        <span className="line-clamp-2 block text-[11px] font-semibold text-[#C94A6A]">
                          {isEs ? info.specialtyEs : info.specialtyEn}
                        </span>
                      </div>
                    </div>
                    {(isEs ? info.bioEs : info.bioEn) && (
                      <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-espresso/65">
                        {isEs ? info.bioEs : info.bioEn}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-espresso/5 pt-2.5 text-xs">
                    <span className="font-bold text-[#239BA2]">
                      {count} {t("recursos publicados", "published resources")}
                    </span>
                    <span className="flex items-center gap-0.5 font-bold text-espresso/70">
                      {t("Explorar", "Explore")}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------- 4. ACADEMIA (membresía) ---------- */}
      {paidItems.length > 0 && (
        <section>
          <button
            type="button"
            onClick={() => go("col:academia")}
            className="group relative w-full overflow-hidden rounded-[30px] text-left shadow-sm transition hover:shadow-md"
          >
            <img src={ACADEMY.img} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#3A2A10]/90 via-[#3A2A10]/60 to-transparent" />
            <div className="relative flex min-h-[170px] flex-col justify-center p-6">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#E8B93A] px-3 py-1 text-[11px] font-extrabold text-[#3A2A10]">
                <Crown className="h-3.5 w-3.5" />
                {isPremium ? t("Incluida en tu membresía", "Included in your membership") : t("Membresía $10 USD/mes", "Membership $10 USD/mo")}
              </span>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">
                The Love Heals Effect <span className="font-light italic text-[#FFE7A8]">Academy</span>
              </h3>
              <p className="mt-1 max-w-md text-xs text-white/80">
                {t(
                  "Sanación individual, entre pares y colectiva: lecciones semanales, meditaciones avanzadas y webinars en vivo.",
                  "Individual, peer and collective healing: weekly lessons, advanced meditations and live webinars."
                )}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#FFE7A8]">
                {t("Ver la Academia", "View the Academy")} ({paidItems.length})
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </button>
        </section>
      )}
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Piezas visuales enriquecidas con "Para qué ayuda" + Especialidad   */
/* ------------------------------------------------------------------ */

function TrackRow({
  item,
  index,
  accent,
  locked,
  healer,
  onOpen,
  onSelectHealer,
  isEs,
  t,
}: {
  item: any;
  index: number;
  accent: string;
  locked: boolean;
  healer: HealerSummary;
  onOpen: () => void;
  onSelectHealer: () => void;
  isEs: boolean;
  t: (es: string, en: string) => string;
}) {
  const desc = isEs ? item.descripcion_es : item.descripcion_en || item.descripcion_es;
  const spec = isEs ? healer.specialtyEs : healer.specialtyEn;

  return (
    <div className="group rounded-[24px] bg-white p-4 shadow-sm transition duration-200 hover:shadow-md">
      <div className="flex items-start gap-3.5">
        <span className="mt-3 hidden w-5 text-center text-xs font-bold text-espresso/35 sm:block">{index}</span>

        {/* Portada */}
        <button
          type="button"
          onClick={onOpen}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-espresso/5 shadow-sm sm:h-20 sm:w-20"
          aria-label={isEs ? item.titulo_es : item.titulo_en || item.titulo_es}
        >
          {item.imagen_url && <img src={item.imagen_url} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
          <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition group-hover:opacity-100">
            <Play className="h-5 w-5 fill-white text-white" />
          </span>
        </button>

        {/* Título + Para qué te ayuda (rellenado por el sanador) + Especialidad */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpen}
              className="text-left text-base font-semibold leading-snug tracking-[-0.015em] text-espresso transition hover:text-[#C94A6A] sm:text-lg"
            >
              {isEs ? item.titulo_es : item.titulo_en || item.titulo_es}
            </button>
            {item.nivel && (
              <span className="rounded-full bg-[#FAF7F2] px-2.5 py-0.5 text-[10px] font-bold text-espresso/60">
                {item.nivel}
              </span>
            )}
          </div>

          {desc && (
            <p className="mt-1 text-xs leading-relaxed text-espresso/75 sm:text-[13px]">
              <strong className="font-bold text-[#239BA2]">
                ✨ {t("Te ayuda a:", "Helps you:")}{" "}
              </strong>
              {desc}
            </p>
          )}

          {/* Sanador y en qué se especializa */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSelectHealer}
              className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#FAF7F2] py-1 pl-1.5 pr-3 text-left text-[11px] transition hover:bg-espresso/10"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${healer.grad} text-[10px] font-bold text-white`}
              >
                {healer.name.charAt(0)}
              </span>
              <span className="truncate">
                <strong className="font-bold text-espresso">{healer.name}</strong>
                {spec && <span className="text-espresso/60"> · {spec}</span>}
              </span>
            </button>
          </div>
        </div>

        {/* Duración + Botón Reproducir */}
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={onOpen}
            className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md transition hover:scale-105 active:scale-95"
            style={{ backgroundColor: locked ? "#262322" : accent }}
            aria-label={t("Abrir recurso", "Open resource")}
          >
            {locked ? <Lock className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4 fill-white" />}
          </button>
          <span className="text-[11px] font-semibold text-espresso/45">{item.duracion}</span>
        </div>
      </div>
    </div>
  );
}

function MediaCard({
  item,
  locked,
  healer,
  onOpen,
  onSelectHealer,
  isEs,
  t,
  doc,
}: {
  item: any;
  locked: boolean;
  healer: HealerSummary;
  onOpen: () => void;
  onSelectHealer: () => void;
  isEs: boolean;
  t: (es: string, en: string) => string;
  doc?: boolean;
}) {
  const desc = isEs ? item.descripcion_es : item.descripcion_en || item.descripcion_es;
  const spec = isEs ? healer.specialtyEs : healer.specialtyEn;

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-[24px] bg-white text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(38,35,34,0.12)]">
      <div>
        <button type="button" onClick={onOpen} className="relative block aspect-video w-full overflow-hidden bg-espresso/5">
          {item.imagen_url && (
            <img src={item.imagen_url} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
          <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">
            {item.duracion}
          </span>
          {item.nivel && (
            <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-espresso">
              {item.nivel}
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition group-hover:scale-110 ${locked ? "bg-espresso/80" : "bg-[#E8809A]"}`}>
              {locked ? <Lock className="h-5 w-5" /> : doc ? <FileText className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5 fill-white" />}
            </span>
          </span>
        </button>

        <div className="p-4 pb-2">
          <button
            type="button"
            onClick={onOpen}
            className="line-clamp-2 text-left text-base font-semibold leading-snug tracking-[-0.015em] text-espresso transition hover:text-[#C94A6A]"
          >
            {isEs ? item.titulo_es : item.titulo_en || item.titulo_es}
          </button>
          {desc && (
            <p className="mt-1.5 text-xs leading-relaxed text-espresso/75">
              <strong className="font-bold text-[#239BA2]">✨ {t("Te ayuda a:", "Helps you:")} </strong>
              {desc}
            </p>
          )}
        </div>
      </div>

      {/* Pie con sanador y su especialidad */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center justify-between gap-2 border-t border-espresso/5 pt-3">
          <button
            type="button"
            onClick={onSelectHealer}
            className="flex min-w-0 items-center gap-2 text-left transition hover:opacity-80"
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${healer.grad} text-xs font-bold text-white`}
            >
              {healer.name.charAt(0)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-bold text-espresso">{healer.name}</span>
              <span className="block truncate text-[10px] text-espresso/55">{spec}</span>
            </span>
          </button>
          <button type="button" onClick={onOpen} className="shrink-0 text-xs font-bold text-[#C94A6A] hover:underline">
            {locked ? t("Desbloquear", "Unlock") : doc ? t("Abrir guía", "Open guide") : t("Iniciar", "Start")} →
          </button>
        </div>
      </div>
    </div>
  );
}

function BookCover({
  item,
  healer,
  onOpen,
  onSelectHealer,
  isEs,
  t,
}: {
  item: any;
  healer: HealerSummary;
  onOpen: () => void;
  onSelectHealer: () => void;
  isEs: boolean;
  t: (es: string, en: string) => string;
}) {
  const color = item.color || "#DC5678";
  const desc = isEs ? item.descripcion_es : item.descripcion_en || item.descripcion_es;
  const spec = isEs ? healer.specialtyEs : healer.specialtyEn;

  return (
    <div className="group flex gap-4 rounded-[26px] bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      {/* Portada tipo libro 3D */}
      <button type="button" onClick={onOpen} className="w-24 shrink-0 text-left sm:w-28">
        <span
          className="relative flex aspect-[2/3] w-full flex-col justify-between overflow-hidden rounded-r-xl rounded-l-sm p-2.5 shadow-[5px_7px_16px_rgba(38,35,34,0.22)] transition duration-300 group-hover:rotate-[-1deg]"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}CC 60%, #262322)` }}
        >
          <span className="absolute inset-y-0 left-0 w-1.5 bg-black/20" />
          <span className="pl-1 text-[8px] font-bold uppercase tracking-widest text-white/70">Love Heals</span>
          <span className="pl-1">
            <span className="line-clamp-3 block font-serif text-xs font-bold leading-tight text-white">
              {isEs ? item.titulo_es : item.titulo_en}
            </span>
            <span className="mt-1 block truncate text-[9px] text-white/80">{item.autor}</span>
          </span>
        </span>
      </button>

      {/* Qué aporta el libro + qué sanador lo recomienda */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <button
            type="button"
            onClick={onOpen}
            className="text-left text-base font-semibold leading-snug tracking-[-0.015em] text-espresso transition hover:text-[#C94A6A]"
          >
            {isEs ? item.titulo_es : item.titulo_en}
          </button>
          {item.autor && <p className="text-xs font-semibold text-espresso/55">{item.autor}</p>}
          {desc && (
            <p className="mt-1.5 text-xs leading-relaxed text-espresso/75">
              <strong className="font-bold text-[#239BA2]">✨ {t("Te ayuda a:", "Helps you:")} </strong>
              {desc}
            </p>
          )}
        </div>

        <div className="mt-3 border-t border-espresso/5 pt-2.5">
          <button
            type="button"
            onClick={onSelectHealer}
            className="flex w-full items-center gap-2 text-left transition hover:opacity-80"
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${healer.grad} text-[10px] font-bold text-white`}
            >
              {healer.name.charAt(0)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-bold text-espresso">
                {t("Recomendado por", "Recommended by")} {healer.name}
              </span>
              <span className="block truncate text-[10px] text-espresso/55">{spec}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniTile({ item, img, onOpen, isEs }: { item: any; img: string; onOpen: () => void; isEs: boolean }) {
  const desc = isEs ? item.descripcion_es : item.descripcion_en || item.descripcion_es;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative h-44 w-52 shrink-0 overflow-hidden rounded-[22px] text-left shadow-sm"
    >
      <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
      <span className="absolute inset-x-3 bottom-3">
        <span className="line-clamp-2 block text-sm font-bold leading-tight text-white">{isEs ? item.titulo_es : item.titulo_en || item.titulo_es}</span>
        {desc && <span className="mt-1 line-clamp-2 block text-[11px] leading-snug text-white/80">{desc}</span>}
        <span className="mt-1 block text-[10px] font-bold text-[#CFEDE8]">{item.duracion}</span>
      </span>
    </button>
  );
}

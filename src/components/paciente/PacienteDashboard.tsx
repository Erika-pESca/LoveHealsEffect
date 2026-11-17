"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  BookOpen,
  CalendarHeart,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Crown,
  Droplets,
  ExternalLink,
  FileText,
  Flame,
  Globe,
  HelpCircle,
  KeyRound,
  Lock,
  LogOut,
  Mic,
  MicOff,
  Moon,
  Music,
  Pause,
  Phone,
  Pill,
  Play,
  Plus,
  Send,
  Share2,
  Sparkles,
  Stethoscope,
  Trash2,
  Upload,
  UserCog,
  Users,
  Video,
  Wind,
  X,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Card,
  Field,
  inputCls,
  PrimaryButton,
  SectionTitle,
  Sheet,
  Toast,
} from "@/components/panel/ui";

/* ------------------------------------------------------------------ */
/*  Datos de apoyo (etapas, ánimos, tipos de práctica, bitácora)       */
/* ------------------------------------------------------------------ */

type EtapaKey =
  | "diagnostico"
  | "tratamiento_activo"
  | "cirugia_recuperacion"
  | "post_tratamiento";

export const STAGES: Array<{ id: EtapaKey; es: string; en: string; emoji: string }> = [
  { id: "diagnostico", es: "Diagnóstico", en: "Diagnosis", emoji: "🌱" },
  { id: "tratamiento_activo", es: "Tratamiento", en: "Treatment", emoji: "💪" },
  { id: "cirugia_recuperacion", es: "Recuperación", en: "Recovery", emoji: "🌿" },
  { id: "post_tratamiento", es: "Post-tratamiento", en: "Post-treatment", emoji: "🌺" },
];

const MOODS = [
  { id: "radiante", emoji: "😄", es: "Radiante", en: "Radiant", bg: "bg-[#FFF1B8]", msgEs: "¡Qué hermoso verte así!", msgEn: "How lovely to see you like this!" },
  { id: "tranquila", emoji: "😌", es: "Tranquila", en: "Calm", bg: "bg-[#D7F3EA]", msgEs: "Qué bien que estés en calma.", msgEn: "Great that you feel calm." },
  { id: "cansada", emoji: "😴", es: "Cansada", en: "Tired", bg: "bg-[#E4E0FA]", msgEs: "Descansar también es sanar.", msgEn: "Resting is healing too." },
  { id: "ansiosa", emoji: "😟", es: "Ansiosa", en: "Anxious", bg: "bg-[#FFE0D2]", msgEs: "Respira conmigo.", msgEn: "Breathe with me." },
  { id: "triste", emoji: "😢", es: "Triste", en: "Sad", bg: "bg-[#D9E8FB]", msgEs: "Está bien sentirlo. No estás sola.", msgEn: "It's okay to feel it. You're not alone." },
  { id: "dolor", emoji: "🤕", es: "Con molestias", en: "In discomfort", bg: "bg-[#FAD4DC]", msgEs: "Gracias por contarlo.", msgEn: "Thanks for sharing." },
];

export const TYPE_META: Record<
  string,
  { es: string; en: string; icon: React.ComponentType<{ className?: string }>; grad: string }
> = {
  video_bam: { es: "Movimiento BAM", en: "BAM Movement", icon: Video, grad: "from-[#FCD5DE] to-[#FBE9D6]" },
  meditacion_audio: { es: "Meditación", en: "Meditation", icon: Wind, grad: "from-[#D7F3EA] to-[#E4E0FA]" },
  musicoterapia: { es: "Musicoterapia", en: "Music therapy", icon: Music, grad: "from-[#E4E0FA] to-[#D9E8FB]" },
  guia_autocuidado: { es: "Guía", en: "Guide", icon: BookOpen, grad: "from-[#FFF1B8] to-[#FDE3E8]" },
  love_circle: { es: "Love Circle", en: "Love Circle", icon: Users, grad: "from-[#FDE3E8] to-[#F6E6FA]" },
  workshop: { es: "Workshop", en: "Workshop", icon: CalendarHeart, grad: "from-[#D9E8FB] to-[#D7F3EA]" },
};

export const HABIT_COLORS = [
  "bg-[#D7F3EA]",
  "bg-[#FAD4DC]",
  "bg-[#FFF1B8]",
  "bg-[#D9E8FB]",
  "bg-[#E4E0FA]",
];

const TIMELINE_META: Record<string, { es: string; en: string; emoji: string; bg: string }> = {
  etapa: { es: "Etapa", en: "Stage", emoji: "🌱", bg: "bg-[#D7F3EA]" },
  medicamento: { es: "Medicina", en: "Medication", emoji: "💊", bg: "bg-[#FAD4DC]" },
  cita: { es: "Cita", en: "Visit", emoji: "🩺", bg: "bg-[#D9E8FB]" },
  procedimiento: { es: "Procedimiento", en: "Procedure", emoji: "🏥", bg: "bg-[#E4E0FA]" },
  sintoma: { es: "Síntoma", en: "Symptom", emoji: "🌡️", bg: "bg-[#FFE0D2]" },
  diagnostico: { es: "Diagnóstico", en: "Diagnosis", emoji: "📋", bg: "bg-[#FFF1B8]" },
  documento: { es: "Documento", en: "Document", emoji: "📄", bg: "bg-[#EFEAE2]" },
  sanador: { es: "Sanador", en: "Healer", emoji: "✨", bg: "bg-[#FFE7D6]" },
  nota: { es: "Nota", en: "Note", emoji: "📝", bg: "bg-[#F1ECF5]" },
};

export const todayKey = () => new Date().toLocaleDateString("en-CA");

export const dayKeyOffset = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("en-CA");
};

/* ------------------------------------------------------------------ */
/*  Reproductor de práctica guiada (respiración + onda)                */
/* ------------------------------------------------------------------ */

export function PracticePlayer({ item, isEs }: { item: any; isEs: boolean }) {
  const [playing, setPlaying] = useState(true);
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [playing]);

  const inhale = Math.floor(secs / 4) % 2 === 0;
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const meta = TYPE_META[item.tipo_contenido] || TYPE_META.meditacion_audio;
  const title = isEs ? item.titulo_es : item.titulo_en || item.titulo_es;
  const desc = isEs ? item.descripcion_es : item.descripcion_en || item.descripcion_es;
  const hasLink = typeof item.media_url === "string" && item.media_url.startsWith("http");

  return (
    <div className="-mt-2">
      <div className={`rounded-[28px] bg-gradient-to-br ${meta.grad} p-6 text-center`}>
        <span className="inline-block rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-espresso/70">
          {isEs ? meta.es : meta.en}
        </span>
        <h4 className="mt-2 font-serif text-xl font-bold text-espresso">{title}</h4>

        <div className="relative mx-auto my-6 flex h-44 w-44 items-center justify-center">
          <div
            className="absolute inset-0 animate-breathe rounded-full bg-white/60"
            style={{ animationPlayState: playing ? "running" : "paused" }}
          />
          <div
            className="absolute inset-5 animate-breathe rounded-full bg-white/80"
            style={{ animationPlayState: playing ? "running" : "paused", animationDelay: "0.2s" }}
          />
          <span className="relative z-10 font-serif text-lg font-bold text-espresso">
            {playing ? (inhale ? (isEs ? "Inhala…" : "Breathe in…") : isEs ? "Exhala…" : "Breathe out…") : isEs ? "En pausa" : "Paused"}
          </span>
        </div>

        <div className="mx-auto flex h-10 max-w-[220px] items-center justify-center gap-1">
          {Array.from({ length: 22 }).map((_, i) => (
            <span
              key={i}
              className="h-full w-1 origin-center animate-wave rounded-full bg-espresso/55"
              style={{
                animationDelay: `${(i % 7) * 0.11}s`,
                animationPlayState: playing ? "running" : "paused",
              }}
            />
          ))}
        </div>
        <div className="mt-2 text-xs font-bold text-espresso/60">
          {mm}:{ss}
        </div>

        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="mx-auto mt-3 flex h-14 w-14 items-center justify-center rounded-full bg-espresso text-white shadow-lg transition active:scale-95"
          aria-label={playing ? "Pausar" : "Reproducir"}
        >
          {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </button>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-espresso/75">{desc}</p>

      {hasLink && (
        <a
          href={item.media_url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[#D85678]/40 bg-[#FCECEE] px-6 py-3 text-sm font-bold text-[#C94A6A] transition hover:bg-[#D85678] hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          {isEs ? "Abrir práctica completa" : "Open full practice"}
        </a>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mini calendario                                                    */
/* ------------------------------------------------------------------ */

export function MiniCalendar({
  marks,
  selected,
  onSelect,
  isEs,
}: {
  marks: Record<string, { med: number; ses: number }>;
  selected: string;
  onSelect: (k: string) => void;
  isEs: boolean;
}) {
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const first = new Date(cursor.y, cursor.m, 1);
  const lead = (first.getDay() + 6) % 7; // lunes primero
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = first.toLocaleDateString(isEs ? "es-ES" : "en-US", {
    month: "long",
    year: "numeric",
  });
  const weekdays = isEs
    ? ["L", "M", "X", "J", "V", "S", "D"]
    : ["M", "T", "W", "T", "F", "S", "S"];

  const shift = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF7F2] text-espresso/70"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-serif text-base font-bold capitalize text-espresso">
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={() => shift(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF7F2] text-espresso/70"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {weekdays.map((w, i) => (
          <span key={i} className="pb-1 text-[11px] font-bold text-espresso/45">
            {w}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={i} />;
          const key = `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const mark = marks[key];
          const isSel = key === selected;
          const isToday = key === todayKey();
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(key)}
              className={`mx-auto flex h-10 w-10 flex-col items-center justify-center rounded-full text-sm font-semibold transition ${
                isSel
                  ? "bg-[#D85678] text-white shadow-md"
                  : isToday
                  ? "bg-[#FCECEE] text-[#C94A6A]"
                  : "text-espresso hover:bg-[#FAF7F2]"
              }`}
            >
              <span className="leading-none">{day}</span>
              <span className="mt-0.5 flex h-1.5 gap-0.5">
                {mark?.med ? (
                  <span className={`h-1.5 w-1.5 rounded-full ${isSel ? "bg-white" : "bg-[#239BA2]"}`} />
                ) : null}
                {mark?.ses ? (
                  <span className={`h-1.5 w-1.5 rounded-full ${isSel ? "bg-white/80" : "bg-[#F49678]"}`} />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-4 text-[11px] font-semibold text-espresso/60">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#239BA2]" />
          {isEs ? "Cita médica" : "Medical visit"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#F49678]" />
          {isEs ? "Sesión con sanador" : "Healer session"}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel principal                                                    */
/* ------------------------------------------------------------------ */

const REFRESH_BRIEFING_ON = new Set([
  "add_medication",
  "delete_medication",
  "add_medical_appointment",
  "delete_medical_appointment",
  "book_healer_session",
  "add_bitacora",
]);

function PacienteDashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, setLocale } = useLanguage();
  const isEs = locale === "es";
  const t = (es: string, en: string) => (isEs ? es : en);

  const activeTab = searchParams.get("tab") || "inicio";

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [diary, setDiary] = useState<Record<string, any>>({});

  const [sheet, setSheet] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [playerItem, setPlayerItem] = useState<any>(null);
  const [lockedItem, setLockedItem] = useState<any>(null);

  const [resourceFilter, setResourceFilter] = useState("todos");
  const [saludView, setSaludView] = useState<"linea" | "medicinas" | "medicos" | "ficha" | "documentos">("linea");
  const [timelineFilter, setTimelineFilter] = useState("todo");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [selectedDay, setSelectedDay] = useState(todayKey());

  // IA
  const [briefing, setBriefing] = useState<any>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [reco, setReco] = useState<any>(null);
  const [consult, setConsult] = useState<any>(null);
  const [organizing, setOrganizing] = useState(false);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const fv = (k: string, d = "") => form[k] ?? d;
  const fs =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));
  const openSheet = (name: string, initial: Record<string, string> = {}) => {
    setForm(initial);
    setSheet(name);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/paciente/dashboard");
      const json = await res.json();
      if (json.ok) {
        setData(json);
        setDiary(json.ficha.bienestar_diario || {});
      }
    } catch (err) {
      console.error("Error cargando panel de la paciente:", err);
    } finally {
      setLoading(false);
    }
  };

  /** Llamada a PONO IA (POST). */
  const callAI = async (action: string, payload: Record<string, any> = {}) => {
    try {
      const res = await fetch("/api/paciente/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          payload: { locale, today: todayKey(), ...payload },
        }),
      });
      const json = await res.json();
      if (json.ok) return json;
      showToast(json.error || t("PONO IA no pudo responder", "PONO AI could not respond"));
    } catch (err) {
      console.error("Error PONO IA:", err);
    }
    return null;
  };

  const fetchBriefing = async (lastMood?: string | null) => {
    setBriefingLoading(true);
    const log = diary[todayKey()] || {};
    const res = await callAI("ai_briefing", { lastMood: lastMood ?? log.mood ?? null });
    if (res) setBriefing(res);
    setBriefingLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!loading && data) fetchBriefing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, locale]);

  const runAction = async (
    action: string,
    payload: Record<string, any>,
    message: string,
    options: { refetch?: boolean } = { refetch: true }
  ) => {
    try {
      const res = await fetch("/api/paciente/dashboard", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      const json = await res.json();
      if (json.ok) {
        if (message) showToast(message);
        if (options.refetch !== false) await fetchDashboard();
        if (REFRESH_BRIEFING_ON.has(action)) fetchBriefing();
        return true;
      }
      showToast(json.error || t("No se pudo guardar", "Could not save"));
    } catch (err) {
      console.error("Error ejecutando acción:", err);
    }
    return false;
  };

  /** Actualiza el check-in del día de forma instantánea (optimista). */
  const updateDaily = (patch: { mood?: string; water?: number; habits?: Record<string, boolean> }) => {
    const key = todayKey();
    setDiary((prev) => {
      const cur = prev[key] || {};
      return {
        ...prev,
        [key]: {
          ...cur,
          ...(patch.mood !== undefined ? { mood: patch.mood } : {}),
          ...(patch.water !== undefined ? { water: patch.water } : {}),
          ...(patch.habits ? { habits: { ...(cur.habits || {}), ...patch.habits } } : {}),
        },
      };
    });
    runAction("update_daily", { date: key, ...patch }, "", { refetch: false });
  };

  /** Elige un ánimo y pide a PONO IA recursos acordes. */
  const chooseMood = async (moodId: string, note = "") => {
    if (!note) updateDaily({ mood: moodId });
    setReco({ mood: moodId, loading: true, message: "", picks: [] });
    const res = await callAI("ai_recommend", { mood: moodId, note });
    setReco(res ? { mood: moodId, loading: false, message: res.message, picks: res.picks } : { mood: moodId, loading: false, message: "", picks: [] });
  };

  const openConsult = async (audience: "medico" | "sanador") => {
    setConsult({ loading: true, audience, summary: "", questions: [] });
    setSheet("consult");
    const res = await callAI("ai_consult_summary", { audience });
    setConsult(res ? { loading: false, audience, summary: res.summary, questions: res.questions } : { loading: false, audience, summary: "", questions: [] });
  };

  const organizeWithAI = async () => {
    const text = fv("relato").trim();
    if (text.length < 3) {
      showToast(t("Cuéntame primero qué pasó", "Tell me first what happened"));
      return;
    }
    setOrganizing(true);
    const res = await callAI("ai_structure", { text });
    if (res?.entry) {
      const e = res.entry;
      setForm((p) => ({
        ...p,
        tipo: e.tipo,
        titulo: e.titulo,
        fecha: e.fecha,
        medico: e.medico || "",
        lugar: e.lugar || "",
        detalle: e.detalle,
        etiquetas: (e.etiquetas || []).join(", "),
        origen: "ia",
      }));
      showToast(t("PONO IA organizó tu bitácora ✨", "PONO AI organized your journal ✨"));
    }
    setOrganizing(false);
  };

  const toggleVoice = () => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      showToast(t("Tu navegador no permite dictado; escribe tu relato.", "Your browser doesn't support dictation; type your story."));
      return;
    }
    const rec = new SR();
    rec.lang = isEs ? "es-ES" : "en-US";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onstart = () => setRecording(true);
    rec.onresult = (ev: any) => {
      let txt = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        if (ev.results[i].isFinal) txt += `${ev.results[i][0].transcript} `;
      }
      if (txt.trim()) setForm((p) => ({ ...p, relato: p.relato ? `${p.relato} ${txt.trim()}` : txt.trim() }));
    };
    rec.onerror = () => setRecording(false);
    rec.onend = () => setRecording(false);
    recognitionRef.current = rec;
    rec.start();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/auth/login");
      router.refresh();
    }
  };

  const goToTab = (tabId: string) => {
    router.push(tabId === "inicio" ? "/paciente" : `/paciente?tab=${tabId}`, { scroll: false });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openResource = (item: any, canOpen: boolean) => {
    if (!canOpen) {
      setLockedItem(item);
      setSheet("premium");
      return;
    }
    setPlayerItem(item);
    setSheet("player");
  };

  /* ----------------------- Derivados ----------------------- */

  const ficha = data?.ficha;
  const user = data?.user;
  const caregiver = data?.caregiver;
  const isPremium = user?.nivel_suscripcion === "pagada";

  const todayLog = diary[todayKey()] || {};
  const todayHabits: Record<string, boolean> = todayLog.habits || {};
  const water: number = todayLog.water || 0;
  const currentMood = MOODS.find((m) => m.id === todayLog.mood) || null;

  const medReminders = useMemo(() => {
    if (!ficha) return [];
    return (ficha.medicamentos_y_horarios || []).map((m: any, i: number) => ({
      key: `med-${m.id ?? i}`,
      label: m.nombre,
      sub: `${m.dosis || ""}${m.horario ? ` · ${m.horario}` : ""}`,
    }));
  }, [ficha]);

  const medsDone = medReminders.filter((m: any) => todayHabits[m.key]).length;
  const medsPct = medReminders.length ? Math.round((medsDone / medReminders.length) * 100) : 0;

  const dayHasActivity = (key: string) => {
    const l = diary[key];
    if (!l) return false;
    return Boolean(l.mood) || (l.water || 0) > 0 || Object.values(l.habits || {}).some(Boolean);
  };

  const streak = useMemo(() => {
    let n = 0;
    let offset = dayHasActivity(dayKeyOffset(0)) ? 0 : -1;
    while (dayHasActivity(dayKeyOffset(offset)) && n < 365) {
      n++;
      offset--;
    }
    return n;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diary]);

  const resources: any[] = data?.resources || [];
  const canOpenItem = (r: any) => r.es_gratuito !== false || isPremium;

  /** Línea de tiempo = bitácora guardada + sesiones completadas con sanadores. */
  const timeline = useMemo(() => {
    if (!ficha || !data) return [];
    const fromSessions = (data.healerSessions || [])
      .filter((s: any) => s.estado_cita === "completada" && (s.estado_observado_paciente || s.recomendaciones_dadas))
      .map((s: any) => ({
        id: `ses-${s.id}`,
        fecha: String(s.fecha_sesion).slice(0, 10),
        tipo: "sanador",
        titulo: s.enlace_o_lugar,
        detalle: [s.estado_observado_paciente, s.recomendaciones_dadas].filter(Boolean).join(" · "),
        medico: "",
        lugar: "",
        etiquetas: [],
        origen: "auto",
        readonly: true,
        creado_en: String(s.fecha_sesion),
      }));
    return [...(ficha.bitacora_clinica || []), ...fromSessions].sort(
      (a: any, b: any) =>
        String(b.fecha).localeCompare(String(a.fecha)) ||
        String(b.creado_en || "").localeCompare(String(a.creado_en || ""))
    );
  }, [ficha, data]);

  const doctors = useMemo(() => {
    if (!ficha) return [];
    const map = new Map<string, { name: string; count: number; last: string; rol: string; telefono: string }>();
    timeline.forEach((e: any) => {
      const n = String(e.medico || "").trim();
      if (!n) return;
      const k = n.toLowerCase();
      const cur = map.get(k) || { name: n, count: 0, last: "", rol: "", telefono: "" };
      cur.count++;
      if (String(e.fecha) > cur.last) cur.last = String(e.fecha);
      map.set(k, cur);
    });
    (ficha.contactos_personales || []).forEach((c: any) => {
      if (!/(onc|\bdr|dra\b|doctor|médic|medic|cirujan|clínic|clinic|nutri)/i.test(`${c.rol} ${c.nombre}`)) return;
      const k = String(c.nombre).trim().toLowerCase();
      const cur = map.get(k) || { name: String(c.nombre), count: 0, last: "", rol: "", telefono: "" };
      cur.rol = c.rol;
      cur.telefono = c.telefono;
      map.set(k, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.last.localeCompare(a.last));
  }, [ficha, timeline]);

  const visibleTimeline = timeline.filter((e: any) => {
    if (timelineFilter !== "todo" && e.tipo !== timelineFilter) return false;
    if (doctorFilter && String(e.medico || "").toLowerCase() !== doctorFilter.toLowerCase()) return false;
    return true;
  });

  const { marks, eventsByDay, upcoming } = useMemo(() => {
    const marks: Record<string, { med: number; ses: number }> = {};
    const eventsByDay: Record<string, any[]> = {};
    if (!ficha || !data) return { marks, eventsByDay, upcoming: [] as any[] };
    const push = (key: string, ev: any, kind: "med" | "ses") => {
      marks[key] = marks[key] || { med: 0, ses: 0 };
      marks[key][kind]++;
      (eventsByDay[key] = eventsByDay[key] || []).push(ev);
    };
    (ficha.citas_medicas || []).forEach((c: any, idx: number) =>
      push(String(c.fecha).slice(0, 10), { kind: "med", idx, title: c.titulo, sub: `${c.hora || ""} ${c.lugar || ""}`.trim(), date: String(c.fecha).slice(0, 10) }, "med")
    );
    (data.healerSessions || [])
      .filter((s: any) => s.estado_cita !== "cancelada")
      .forEach((s: any) =>
        push(String(s.fecha_sesion).slice(0, 10), { kind: "ses", title: s.enlace_o_lugar, sub: String(s.modalidad).toUpperCase(), date: String(s.fecha_sesion).slice(0, 10) }, "ses")
      );
    const today = todayKey();
    const upcoming = Object.entries(eventsByDay)
      .filter(([k]) => k >= today)
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([, evs]) => evs);
    return { marks, eventsByDay, upcoming };
  }, [ficha, data]);

  const fmtDate = (d: string) =>
    new Date(`${String(d).slice(0, 10)}T12:00:00`).toLocaleDateString(isEs ? "es-ES" : "en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  if (loading || !data || !ficha) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF8F4] px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-[#F48EA6] to-[#B03052] text-2xl text-white shadow-lg">
            🌺
          </div>
          <p className="font-serif text-lg font-bold text-espresso">
            {t("Preparando tu espacio…", "Preparing your space…")}
          </p>
        </div>
      </div>
    );
  }

  const firstName = String(user.nombre || "").split(" ")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t("Buenos días", "Good morning") : hour < 19 ? t("Buenas tardes", "Good afternoon") : t("Buenas noches", "Good evening");
  const stage = STAGES.find((s) => s.id === ficha.etapa_actual) || STAGES[0];

  const filteredResources = resources.filter((r) => {
    if (resourceFilter === "todos") return true;
    if (resourceFilter === "gratis") return r.es_gratuito !== false;
    if (resourceFilter === "premium") return r.es_gratuito === false;
    return r.tipo_contenido === resourceFilter;
  });

  const healers: any[] = data.healers || [];
  const recoItems = (reco?.picks || [])
    .map((p: any) => ({ ...p, item: resources.find((r) => r.id === p.id) }))
    .filter((p: any) => p.item);

  const otherReminders = (briefing?.reminders || []).filter((r: any) => r.kind !== "med");
  const reminderIcon: Record<string, React.ComponentType<{ className?: string }>> = {
    cita: Stethoscope,
    sesion: CalendarHeart,
    practica: Wind,
    bitacora: BookOpen,
  };

  const onReminderClick = (r: any) => {
    if (r.kind === "practica") {
      const item = resources.find((x) => x.id === r.resourceId);
      if (item) openResource(item, canOpenItem(item));
    } else if (r.kind === "cita" || r.kind === "sesion") goToTab("alertas");
    else if (r.kind === "bitacora") openSheet("bitacora", { tipo: "nota", fecha: todayKey() });
  };

  /* ----------------------- Render ----------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF1EA] via-[#FBF6FF] to-[#EAF6F4] pb-44">
      <Toast message={toast} />

      <div className="mx-auto max-w-2xl px-5">
        {/* ENCABEZADO */}
        <header className="flex items-center justify-between pt-7">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => goToTab("perfil")}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#F48EA6] to-[#B03052] font-serif text-lg font-bold text-white shadow-md"
              aria-label={t("Mi perfil", "My profile")}
            >
              {firstName.charAt(0)}
            </button>
            <div>
              <p className="text-xs font-medium text-espresso/55">{greeting}</p>
              <h1 className="font-serif text-2xl font-bold leading-tight text-espresso">
                Aloha, {firstName} 🌺
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-full bg-white p-0.5 text-[10px] font-bold shadow-sm">
              {(["en", "es"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l)}
                  className={`rounded-full px-2.5 py-1.5 transition ${locale === l ? "bg-espresso text-white" : "text-espresso/55"}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => goToTab("alertas")}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-espresso/70 shadow-sm"
              aria-label={t("Recordatorios", "Reminders")}
            >
              <Bell className="h-4 w-4" />
              {upcoming.length > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#D85678] ring-2 ring-white" />}
            </button>
          </div>
        </header>

        {/* ===================== RESUMEN (INICIO) ===================== */}
        {activeTab === "inicio" && (
          <main className="mt-6 space-y-7">
            {/* PONO IA: recordatorios del día */}
            <section className="animate-fade-in">
              <div className="rounded-[32px] bg-gradient-to-br from-[#F6E6FA] via-white to-[#DDF1EE] p-5 shadow-[0_14px_34px_rgba(122,79,209,0.12)]">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#7A4FD1] text-white">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7A4FD1]">
                    {t("PONO IA · Tu día", "PONO AI · Your day")}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-espresso/85">
                  {briefingLoading && !briefing
                    ? t("PONO está preparando tu día…", "PONO is preparing your day…")
                    : briefing?.message || t("Aquí tienes lo importante de hoy.", "Here's what matters today.")}
                </p>

                {/* Alertas inteligentes */}
                {(briefing?.insights || []).map((ins: any) => (
                  <div key={ins.id} className="mt-3 flex items-start gap-3 rounded-2xl bg-[#FFF6D6] p-3.5">
                    <span className="mt-0.5 text-lg">💡</span>
                    <div className="flex-1">
                      <p className="text-xs leading-relaxed text-espresso/85">{ins.text}</p>
                      {ins.action && (
                        <button
                          type="button"
                          onClick={() =>
                            ins.action === "consult" ? openConsult("medico") : openSheet("bitacora", { tipo: "nota", fecha: todayKey() })
                          }
                          className="mt-1.5 text-xs font-bold text-[#7A4FD1] underline"
                        >
                          {ins.action === "consult" ? t("Ver mi resumen para la cita", "See my appointment summary") : t("Contarle a PONO cómo estoy", "Tell PONO how I am")}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Medicinas de hoy */}
                {medReminders.length > 0 && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs font-bold text-espresso/70">
                      <span>💊 {t("Medicinas de hoy", "Today's medications")}</span>
                      <span className="text-[#7A4FD1]">
                        {medsDone}/{medReminders.length}
                      </span>
                    </div>
                    <div className="mb-3 h-2 overflow-hidden rounded-full bg-[#EAE2F5]">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#F48EA6] to-[#7A4FD1] transition-all duration-500" style={{ width: `${medsPct}%` }} />
                    </div>
                    <div className="space-y-2">
                      {medReminders.map((m: any, i: number) => {
                        const done = Boolean(todayHabits[m.key]);
                        return (
                          <button
                            key={m.key}
                            type="button"
                            onClick={() => updateDaily({ habits: { [m.key]: !done } })}
                            className={`flex w-full items-center gap-3 rounded-2xl ${HABIT_COLORS[i % HABIT_COLORS.length]} px-4 py-3 text-left transition active:scale-[0.98] ${done ? "opacity-55" : ""}`}
                          >
                            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${done ? "border-[#7A4FD1] bg-[#7A4FD1] text-white" : "border-espresso/25 bg-white/70"}`}>
                              {done && <Check className="h-4 w-4" />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className={`block truncate text-sm font-bold text-espresso ${done ? "line-through" : ""}`}>{m.label}</span>
                              <span className="block truncate text-xs text-espresso/60">{m.sub}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Citas, sesiones y práctica sugerida */}
                {otherReminders.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {otherReminders.map((r: any) => {
                      const Icon = reminderIcon[r.kind] || Bell;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => onReminderClick(r)}
                          className="flex w-full items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 text-left shadow-sm transition active:scale-[0.98]"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1ECF5] text-[#7A4FD1]">
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-espresso">{r.title}</span>
                            <span className="block truncate text-xs text-espresso/60">{r.sub}</span>
                          </span>
                          <ChevronRight className="h-4 w-4 text-espresso/30" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Ánimo + recomendación de PONO */}
            <section>
              <SectionTitle title={t("¿Cómo te sientes hoy?", "How are you feeling today?")} />
              <div className="grid grid-cols-3 gap-3">
                {MOODS.map((m) => {
                  const active = currentMood?.id === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => chooseMood(m.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-3xl ${m.bg} px-2 py-4 transition active:scale-95 ${active ? "scale-[1.04] shadow-md ring-2 ring-[#D85678]" : "opacity-90 hover:opacity-100"}`}
                    >
                      <span className={`text-3xl ${active ? "animate-pop" : ""}`}>{m.emoji}</span>
                      <span className="text-[11px] font-bold text-espresso/80">{isEs ? m.es : m.en}</span>
                    </button>
                  );
                })}
              </div>

              {reco && (
                <div className="mt-3 animate-fade-in space-y-3 rounded-3xl bg-white/90 p-4 shadow-sm">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#7A4FD1] text-white">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <p className="text-sm leading-relaxed text-espresso/85">
                      {reco.loading ? t("PONO está buscando lo mejor para ti…", "PONO is finding the best for you…") : reco.message}
                    </p>
                  </div>

                  {recoItems.map((p: any) => {
                    const meta = TYPE_META[p.item.tipo_contenido] || TYPE_META.guia_autocuidado;
                    const Icon = meta.icon;
                    const can = canOpenItem(p.item);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => openResource(p.item, can)}
                        className="flex w-full items-center gap-3 rounded-2xl bg-[#FAF7F2] p-3 text-left transition active:scale-[0.98]"
                      >
                        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta.grad} text-espresso/70`}>
                          <Icon className="h-6 w-6" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-espresso">{isEs ? p.item.titulo_es : p.item.titulo_en || p.item.titulo_es}</span>
                          <span className="block text-xs leading-snug text-espresso/65">{p.reason}</span>
                        </span>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7A4FD1] text-white">
                          {can ? <Play className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </span>
                      </button>
                    );
                  })}

                  {!reco.loading && (
                    <form
                      className="flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (fv("note").trim()) {
                          chooseMood(reco.mood, fv("note"));
                          setForm((p) => ({ ...p, note: "" }));
                        }
                      }}
                    >
                      <input className={inputCls} placeholder={t("¿Quieres contarme más? (ej. no pude dormir)", "Want to tell me more? (e.g. couldn't sleep)")} value={fv("note")} onChange={fs("note")} />
                      <button type="submit" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#7A4FD1] text-white" aria-label={t("Enviar", "Send")}>
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  )}
                </div>
              )}
            </section>

            {/* Mi camino de un vistazo */}
            <section>
              <SectionTitle title={t("Mi camino de un vistazo", "My journey at a glance")} action={t("Ver todo", "See all")} onAction={() => goToTab("salud")} />
              <Card>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E4E0FA] px-3 py-1 text-xs font-bold text-[#7A4FD1]">
                    {stage.emoji} {isEs ? stage.es : stage.en}
                  </span>
                  <span className="text-xs text-espresso/55">
                    {timeline.length} {t("registros", "entries")}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {timeline.length === 0 && <p className="text-sm text-espresso/60">{t("Aún no hay registros. Cuéntale a PONO cómo vas y él lo organiza.", "No entries yet. Tell PONO how you're doing and he organizes it.")}</p>}
                  {timeline.slice(0, 3).map((e: any) => {
                    const meta = TIMELINE_META[e.tipo] || TIMELINE_META.nota;
                    return (
                      <div key={e.id} className="flex items-center gap-3 rounded-2xl bg-[#FAF7F2] px-3 py-2.5">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.bg} text-base`}>{meta.emoji}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-espresso">{e.titulo}</span>
                          <span className="block text-[11px] text-espresso/55">{fmtDate(e.fecha)}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <button type="button" onClick={() => openSheet("bitacora", { tipo: "nota", fecha: todayKey() })} className="rounded-full bg-[#FCECEE] py-2.5 text-xs font-bold text-[#C94A6A] transition active:scale-95">
                    + {t("Agregar a mi bitácora", "Add to my journal")}
                  </button>
                  <button type="button" onClick={() => openConsult("medico")} className="rounded-full bg-[#7A4FD1] py-2.5 text-xs font-bold text-white transition active:scale-95">
                    ✨ {t("Preparar mi cita", "Prepare my visit")}
                  </button>
                </div>
              </Card>
            </section>

            {/* Próxima cita + cuidador */}
            <section className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => goToTab("alertas")} className="text-left">
                <Card className="h-full">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#239BA2]">{t("Próxima cita", "Next visit")}</span>
                  {upcoming[0] ? (
                    <>
                      <p className="mt-1 text-sm font-bold text-espresso">{upcoming[0].title}</p>
                      <p className="text-xs text-espresso/60">{fmtDate(upcoming[0].date)}</p>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-espresso/60">{t("Sin citas próximas. ¡Agrega una!", "No upcoming visits. Add one!")}</p>
                  )}
                </Card>
              </button>
              <button type="button" onClick={() => openSheet("caregiver", { correo: ficha.correo_invitacion_cuidador || "" })} className="text-left">
                <Card className="h-full">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C94A6A]">{t("Mi cuidador", "My caregiver")}</span>
                  {caregiver.linked ? (
                    <>
                      <p className="mt-1 text-sm font-bold text-espresso">{caregiver.nombre}</p>
                      <p className="text-xs text-[#2A5C35]">✓ {t("Sincronizados 1 a 1", "Synced 1-to-1")}</p>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-espresso/60">{t("Invita a quien te acompaña", "Invite who supports you")}</p>
                  )}
                </Card>
              </button>
            </section>

            {/* Agua + racha */}
            <section className="space-y-3">
              <Card>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D9E8FB] text-[#3D7BD6]">
                    <Droplets className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-espresso">{t("Hidratación", "Hydration")}</h3>
                    <p className="text-xs text-espresso/55">{water}/8 {t("vasos", "glasses")}</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-between gap-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => updateDaily({ water: water === i + 1 ? i : i + 1 })}
                      className={`flex h-10 flex-1 items-center justify-center rounded-xl transition active:scale-90 ${i < water ? "bg-[#9CC3F4] text-white" : "bg-[#EEF3FA] text-[#9CB3D6]"}`}
                      aria-label={`${i + 1}`}
                    >
                      <Droplets className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFE7D6] text-[#F2711C]">
                    <Flame className="h-6 w-6" />
                  </span>
                  <div>
                    <div className="font-serif text-2xl font-bold text-espresso">
                      {streak} {streak === 1 ? t("día", "day") : t("días", "days")}
                    </div>
                    <p className="text-xs text-espresso/60">
                      {streak > 0 ? t("¡Cuidarte cada día suma! Sigue así.", "Caring for yourself adds up! Keep going.") : t("Marca tu ánimo o una medicina para empezar tu racha.", "Log your mood or a medication to start your streak.")}
                    </p>
                  </div>
                </div>
              </Card>
            </section>
          </main>
        )}

        {/* ===================== RECURSOS ===================== */}
        {activeTab === "practicas" && (
          <main className="mt-6 space-y-6">
            <div className="animate-fade-in">
              <h2 className="font-serif text-3xl font-bold leading-tight text-espresso">{t("Recursos", "Resources")}</h2>
              <p className="mt-1 text-sm text-espresso/60">
                {t("Gratuitos y premium: movimiento, calma, guías y comunidad.", "Free and premium: movement, calm, guides and community.")}
              </p>
            </div>

            {!isPremium && (
              <button type="button" onClick={() => openSheet("membership")} className="flex w-full items-center gap-3 rounded-3xl bg-gradient-to-r from-[#FFF1B8] to-[#FDE3E8] p-4 text-left shadow-sm transition active:scale-[0.98]">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-[#B98A00]"><Crown className="h-5 w-5" /></span>
                <span className="flex-1">
                  <span className="block text-sm font-bold text-espresso">{t("Desbloquea todo con la membresía", "Unlock everything with membership")}</span>
                  <span className="block text-xs text-espresso/65">{t("$10 USD/mes por familia (paciente + cuidador)", "$10 USD/month per family (patient + caregiver)")}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-espresso/40" />
              </button>
            )}

            <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#FDE3E8] to-[#E4E0FA] p-5">
              <span className="absolute -right-2 top-2 text-6xl opacity-90">🌺</span>
              <span className="inline-block rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-[#C94A6A]">Love Circle · {t("gratis", "free")}</span>
              <h3 className="mt-2 max-w-[75%] font-serif text-xl font-bold text-espresso">{t("Círculo de sanación con Kelsie y Omar", "Healing circle with Kelsie and Omar")}</h3>
              <button
                type="button"
                onClick={() =>
                  runAction(
                    "book_healer_session",
                    {
                      modalidad: "online",
                      fecha_sesion: new Date(Date.now() + 3 * 86400000).toISOString(),
                      es_sesion_gratuita_mensual: true,
                      enlace_o_lugar: "Love Circle for Patients · Zoom con Kelsie Reynolds",
                    },
                    t("¡Tu cupo quedó reservado!", "Your spot is reserved!")
                  )
                }
                className="mt-4 rounded-full bg-[#7A4FD1] px-5 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
              >
                {t("Reservar mi cupo", "Reserve my spot")}
              </button>
            </div>

            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
              {[
                { id: "todos", es: "Todo", en: "All" },
                { id: "gratis", es: "Gratis", en: "Free" },
                { id: "premium", es: "★ Premium", en: "★ Premium" },
                { id: "video_bam", es: "Movimiento", en: "Movement" },
                { id: "meditacion_audio", es: "Meditación", en: "Meditation" },
                { id: "musicoterapia", es: "Música", en: "Music" },
                { id: "guia_autocuidado", es: "Guías", en: "Guides" },
              ].map((f) => (
                <button key={f.id} type="button" onClick={() => setResourceFilter(f.id)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${resourceFilter === f.id ? "bg-[#7A4FD1] text-white shadow-md" : "bg-white text-espresso/65 shadow-sm"}`}>
                  {isEs ? f.es : f.en}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredResources.map((item) => {
                const meta = TYPE_META[item.tipo_contenido] || TYPE_META.guia_autocuidado;
                const Icon = meta.icon;
                const can = canOpenItem(item);
                const premium = item.es_gratuito === false;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openResource(item, can)}
                    className="flex w-full items-center gap-4 rounded-[26px] bg-white p-3.5 text-left shadow-[0_8px_22px_rgba(80,60,90,0.07)] transition active:scale-[0.98]"
                  >
                    <span className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.grad} text-espresso/70`}>
                      <Icon className="h-8 w-8" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#7A4FD1]">
                        {isEs ? meta.es : meta.en}
                        {premium ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF1B8] px-2 py-0.5 text-[10px] text-[#8A6A00]"><Crown className="h-3 w-3" />${item.costo_usd}</span>
                        ) : (
                          <span className="rounded-full bg-[#5C8D67]/15 px-2 py-0.5 text-[10px] text-[#2A5C35]">{t("Gratis", "Free")}</span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-sm font-bold leading-snug text-espresso line-clamp-2">{isEs ? item.titulo_es : item.titulo_en || item.titulo_es}</span>
                      {item.fecha_evento && <span className="mt-0.5 block text-xs text-espresso/55">{fmtDate(item.fecha_evento)}</span>}
                    </span>
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-md ${can ? "bg-[#7A4FD1]" : "bg-espresso/70"}`}>
                      {can ? <Play className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                    </span>
                  </button>
                );
              })}
              {filteredResources.length === 0 && <Card className="text-center text-sm text-espresso/60">{t("No hay recursos en esta categoría todavía.", "No resources in this category yet.")}</Card>}
            </div>
          </main>
        )}

        {/* ===================== MI CAMINO ===================== */}
        {activeTab === "salud" && (
          <main className="mt-6 space-y-6">
            <div className="animate-fade-in">
              <h2 className="font-serif text-3xl font-bold leading-tight text-espresso">{t("Mi camino", "My journey")}</h2>
              <p className="mt-1 text-sm text-espresso/60">
                {t("Todo tu proceso en un solo lugar, para que nunca se te olvide nada.", "Your whole process in one place, so you never forget anything.")}
              </p>
            </div>

            {/* Etapa */}
            <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1">
              {STAGES.map((s) => {
                const active = s.id === ficha.etapa_actual;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => runAction("update_stage", { etapa_actual: s.id }, t(`Etapa: ${s.es}`, `Stage: ${s.en}`))}
                    className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition active:scale-95 ${active ? "bg-espresso text-white shadow-md" : "bg-white text-espresso/70 shadow-sm"}`}
                  >
                    <span>{s.emoji}</span>
                    {isEs ? s.es : s.en}
                  </button>
                );
              })}
            </div>

            {/* Preparar cita con IA */}
            <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#E4E0FA] via-[#F6E6FA] to-[#DDF1EE] p-5 shadow-sm">
              <span className="absolute -right-1 top-2 text-6xl opacity-90">📋</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-[#7A4FD1]"><Sparkles className="h-3 w-3" />PONO IA</span>
              <h3 className="mt-2 max-w-[72%] font-serif text-xl font-bold leading-tight text-espresso">{t("Prepara tu próxima cita sin olvidar nada", "Prepare your next visit without forgetting anything")}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => openConsult("medico")} className="rounded-full bg-[#7A4FD1] px-4 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95">🩺 {t("Para mi médico", "For my doctor")}</button>
                <button type="button" onClick={() => openConsult("sanador")} className="rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#7A4FD1] shadow-sm transition active:scale-95">✨ {t("Para mi sanador", "For my healer")}</button>
              </div>
            </div>

            {/* Secciones */}
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
              {([
                ["linea", t("Bitácora", "Journal")],
                ["medicinas", t("Medicinas", "Meds")],
                ["medicos", t("Médicos", "Doctors")],
                ["ficha", t("Mi ficha", "My chart")],
                ["documentos", t("Documentos", "Documents")],
              ] as const).map(([id, label]) => (
                <button key={id} type="button" onClick={() => setSaludView(id)} className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold transition ${saludView === id ? "bg-espresso text-white shadow" : "bg-white text-espresso/60 shadow-sm"}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* --- Bitácora / línea de tiempo --- */}
            {saludView === "linea" && (
              <div className="space-y-4">
                <PrimaryButton onClick={() => openSheet("bitacora", { tipo: "nota", fecha: todayKey() })}>
                  <Plus className="h-5 w-5" />
                  {t("Agregar a mi bitácora", "Add to my journal")}
                </PrimaryButton>

                <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
                  {[
                    ["todo", t("Todo", "All")],
                    ["sintoma", t("Síntomas", "Symptoms")],
                    ["cita", t("Citas", "Visits")],
                    ["procedimiento", t("Procedimientos", "Procedures")],
                    ["medicamento", t("Medicinas", "Medications")],
                    ["sanador", t("Sanadores", "Healers")],
                    ["nota", t("Notas", "Notes")],
                  ].map(([id, label]) => (
                    <button key={id} type="button" onClick={() => setTimelineFilter(id)} className={`shrink-0 rounded-full px-3.5 py-2 text-[11px] font-bold transition ${timelineFilter === id ? "bg-[#7A4FD1] text-white" : "bg-white text-espresso/60 shadow-sm"}`}>
                      {label}
                    </button>
                  ))}
                </div>

                {doctorFilter && (
                  <button type="button" onClick={() => setDoctorFilter("")} className="inline-flex items-center gap-1.5 rounded-full bg-[#D9E8FB] px-3.5 py-1.5 text-xs font-bold text-[#3D7BD6]">
                    🩺 {doctorFilter} <X className="h-3 w-3" />
                  </button>
                )}

                <div className="relative space-y-3 pl-1">
                  {visibleTimeline.length === 0 && <Card className="text-center text-sm text-espresso/60">{t("Aún no hay registros aquí.", "No entries here yet.")}</Card>}
                  {visibleTimeline.map((e: any) => {
                    const meta = TIMELINE_META[e.tipo] || TIMELINE_META.nota;
                    return (
                      <div key={e.id} className="flex gap-3">
                        <span className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${meta.bg} text-lg`}>{meta.emoji}</span>
                        <div className="min-w-0 flex-1 rounded-3xl bg-white p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-espresso/50">{fmtDate(e.fecha)} · {isEs ? meta.es : meta.en}</p>
                              <p className="mt-0.5 text-sm font-bold leading-snug text-espresso">{e.titulo}</p>
                            </div>
                            {!e.readonly && (
                              <button type="button" onClick={() => runAction("delete_bitacora", { id: e.id }, t("Entrada eliminada", "Entry removed"))} className="text-espresso/30 transition hover:text-[#C94A6A]" aria-label={t("Eliminar", "Delete")}>
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          {e.detalle && <p className="mt-1.5 text-xs leading-relaxed text-espresso/70">{e.detalle}</p>}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {e.medico && <span className="rounded-full bg-[#D9E8FB] px-2.5 py-0.5 text-[10px] font-bold text-[#3D7BD6]">🩺 {e.medico}</span>}
                            {e.lugar && <span className="rounded-full bg-[#EFEAE2] px-2.5 py-0.5 text-[10px] font-bold text-espresso/70">📍 {e.lugar}</span>}
                            {(e.etiquetas || []).map((tag: string) => (
                              <span key={tag} className="rounded-full bg-[#FFE0D2] px-2.5 py-0.5 text-[10px] font-bold text-espresso/70">{tag}</span>
                            ))}
                            <span className="rounded-full bg-[#F1ECF5] px-2.5 py-0.5 text-[10px] font-bold text-[#7A4FD1]">
                              {e.origen === "ia" ? `✨ ${t("Organizado por PONO", "Organized by PONO")}` : e.origen === "auto" ? t("Automático", "Automatic") : t("Escrito por ti", "Written by you")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --- Medicinas --- */}
            {saludView === "medicinas" && (
              <div className="space-y-6">
                <div>
                  <SectionTitle title={t("Medicamentos", "Medications")} />
                  <div className="space-y-2.5">
                    {ficha.medicamentos_y_horarios.length === 0 && <Card className="text-center text-sm text-espresso/60">{t("Aún no has agregado medicinas.", "No medications yet.")}</Card>}
                    {ficha.medicamentos_y_horarios.map((m: any, idx: number) => {
                      const key = `med-${m.id ?? idx}`;
                      const taken = Boolean(todayHabits[key]);
                      return (
                        <div key={key} className={`flex items-center gap-3 rounded-3xl ${HABIT_COLORS[(idx + 1) % HABIT_COLORS.length]} px-4 py-3.5`}>
                          <button type="button" onClick={() => updateDaily({ habits: { [key]: !taken } })} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition ${taken ? "border-[#7A4FD1] bg-[#7A4FD1] text-white" : "border-espresso/25 bg-white/70"}`} aria-label={t("Marcar como tomada", "Mark as taken")}>
                            {taken && <Check className="h-4 w-4" />}
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className={`truncate text-sm font-bold text-espresso ${taken ? "line-through opacity-60" : ""}`}>{m.nombre}</p>
                            <p className="truncate text-xs text-espresso/65">{m.dosis} · {m.horario}{m.indicaciones ? ` · ${m.indicaciones}` : ""}</p>
                          </div>
                          <button type="button" onClick={() => runAction("delete_medication", { index: idx }, t("Medicamento eliminado", "Removed"))} className="text-espresso/35 transition hover:text-[#C94A6A]" aria-label={t("Eliminar", "Delete")}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <SectionTitle title={t("Suplementos y vitaminas", "Supplements & vitamins")} />
                  <div className="space-y-2.5">
                    {ficha.suplementos.length === 0 && <Card className="text-center text-sm text-espresso/60">{t("Sin suplementos registrados.", "No supplements yet.")}</Card>}
                    {ficha.suplementos.map((s: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 rounded-3xl bg-white px-4 py-3.5 shadow-sm">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D7F3EA] text-[#239BA2]"><Sparkles className="h-5 w-5" /></span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-espresso">{s.nombre}</p>
                          <p className="truncate text-xs text-espresso/60">{s.dosis} · {s.horario}</p>
                        </div>
                        <button type="button" onClick={() => runAction("delete_supplement", { index: idx }, t("Suplemento eliminado", "Removed"))} className="text-espresso/35 transition hover:text-[#C94A6A]" aria-label={t("Eliminar", "Delete")}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <PrimaryButton onClick={() => openSheet("add-med", { kind: "med" })}>
                  <Plus className="h-5 w-5" />
                  {t("Agregar medicina o suplemento", "Add medication or supplement")}
                </PrimaryButton>
                <p className="px-2 text-center text-xs text-espresso/50">{t("Cada cambio queda registrado solo en tu bitácora.", "Every change is automatically logged in your journal.")}</p>
              </div>
            )}

            {/* --- Médicos --- */}
            {saludView === "medicos" && (
              <div className="space-y-3">
                {doctors.length === 0 && <Card className="text-center text-sm text-espresso/60">{t("Aquí verás los médicos con los que has pasado. Se llena solo cuando los mencionas en tu bitácora.", "You'll see the doctors you've visited here. It fills in as you mention them in your journal.")}</Card>}
                {doctors.map((d) => (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => {
                      setDoctorFilter(d.name);
                      setTimelineFilter("todo");
                      setSaludView("linea");
                    }}
                    className="flex w-full items-center gap-3 rounded-3xl bg-white p-4 text-left shadow-sm transition active:scale-[0.98]"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D9E8FB] font-serif text-lg font-bold text-[#3D7BD6]">{d.name.replace(/^(dr\.?|dra\.?)\s*/i, "").charAt(0).toUpperCase()}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-espresso">{d.name}</span>
                      <span className="block truncate text-xs text-espresso/60">
                        {d.rol || t("Médico", "Doctor")} · {d.count} {t("registros", "entries")}{d.last ? ` · ${t("última", "last")} ${fmtDate(d.last)}` : ""}
                      </span>
                      {d.telefono && <span className="block text-xs font-semibold text-[#239BA2]">{d.telefono}</span>}
                    </span>
                    <ChevronRight className="h-4 w-4 text-espresso/30" />
                  </button>
                ))}
                <PrimaryButton onClick={() => openSheet("contacts", { rol: "Oncólogo" })}>
                  <Plus className="h-5 w-5" />
                  {t("Agregar médico", "Add doctor")}
                </PrimaryButton>
              </div>
            )}

            {/* --- Ficha --- */}
            {saludView === "ficha" && (
              <div className="space-y-3">
                {[
                  { label: t("Mi historia", "My story"), value: ficha.historia_medica, bg: "bg-[#FAD4DC]", emoji: "📖" },
                  { label: t("Alergias", "Allergies"), value: ficha.alergias, bg: "bg-[#FFF1B8]", emoji: "⚠️" },
                  { label: t("Alimentación e hidratación", "Nutrition & hydration"), value: ficha.datos_nutricionales, bg: "bg-[#D7F3EA]", emoji: "🥗" },
                ].map((c) => (
                  <div key={c.label} className={`rounded-3xl ${c.bg} p-5`}>
                    <p className="text-xs font-bold text-espresso/65">{c.emoji} {c.label}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-espresso">{c.value || t("Aún sin completar. Toca editar para contarnos.", "Not filled in yet. Tap edit to tell us.")}</p>
                  </div>
                ))}
                <PrimaryButton onClick={() => openSheet("edit-ficha", { historia: ficha.historia_medica || "", alergias: ficha.alergias || "", nutricion: ficha.datos_nutricionales || "" })}>
                  {t("Editar mi ficha", "Edit my chart")}
                </PrimaryButton>
              </div>
            )}

            {/* --- Documentos --- */}
            {saludView === "documentos" && (
              <div className="space-y-3">
                {ficha.documentos_oncologo.length === 0 && <Card className="text-center text-sm text-espresso/60">{t("Sube recetas, laboratorios o notas de tu oncólogo.", "Upload prescriptions, labs or notes from your oncologist.")}</Card>}
                {ficha.documentos_oncologo.map((d: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 rounded-3xl bg-white p-4 shadow-sm">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FAD4DC] text-[#C94A6A]"><FileText className="h-5 w-5" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-espresso">{d.titulo}</p>
                      <p className="text-xs text-espresso/55">{d.tipo} · {d.fecha}</p>
                      {d.notas && <p className="mt-1 text-xs text-espresso/75">{d.notas}</p>}
                    </div>
                    <button type="button" onClick={() => runAction("delete_document", { index: idx }, t("Documento eliminado", "Removed"))} className="text-espresso/35 transition hover:text-[#C94A6A]" aria-label={t("Eliminar", "Delete")}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <PrimaryButton onClick={() => openSheet("add-doc", { tipo: "Receta / Indicaciones del Oncólogo" })}>
                  <Upload className="h-5 w-5" />
                  {t("Subir documento", "Upload document")}
                </PrimaryButton>
              </div>
            )}
          </main>
        )}

        {/* ===================== RECORDATORIOS ===================== */}
        {activeTab === "alertas" && (
          <main className="mt-6 space-y-6">
            <div className="animate-fade-in">
              <h2 className="font-serif text-3xl font-bold leading-tight text-espresso">{t("Recordatorios", "Reminders")}</h2>
              <p className="mt-1 text-sm text-espresso/60">{t("Citas, medicinas, prácticas y sesiones. PONO te los recuerda; compartido con tu cuidador.", "Visits, medications, practices and sessions. PONO reminds you; shared with your caregiver.")}</p>
            </div>

            <Card>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7A4FD1] text-white"><Sparkles className="h-4 w-4" /></span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7A4FD1]">{t("PONO te recuerda", "PONO reminds you")}</span>
              </div>
              <div className="mt-3 space-y-2">
                {medReminders.map((m: any) => {
                  const done = Boolean(todayHabits[m.key]);
                  return (
                    <button key={m.key} type="button" onClick={() => updateDaily({ habits: { [m.key]: !done } })} className={`flex w-full items-center gap-3 rounded-2xl bg-[#FAF7F2] px-3.5 py-2.5 text-left ${done ? "opacity-55" : ""}`}>
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${done ? "border-[#7A4FD1] bg-[#7A4FD1] text-white" : "border-espresso/25 bg-white"}`}>{done && <Check className="h-3.5 w-3.5" />}</span>
                      <Pill className="h-4 w-4 text-[#C94A6A]" />
                      <span className="min-w-0 flex-1 truncate text-sm font-bold text-espresso">{m.label}</span>
                      <span className="text-xs text-espresso/55">{m.sub.split("·").pop()?.trim()}</span>
                    </button>
                  );
                })}
                {otherReminders.map((r: any) => {
                  const Icon = reminderIcon[r.kind] || Bell;
                  return (
                    <button key={r.id} type="button" onClick={() => onReminderClick(r)} className="flex w-full items-center gap-3 rounded-2xl bg-[#FAF7F2] px-3.5 py-2.5 text-left">
                      <Icon className="h-4 w-4 text-[#7A4FD1]" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-espresso">{r.title}</span>
                        <span className="block truncate text-xs text-espresso/55">{r.sub}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-espresso/30" />
                    </button>
                  );
                })}
                {medReminders.length === 0 && otherReminders.length === 0 && <p className="text-sm text-espresso/60">{t("Nada pendiente por ahora. 🌿", "Nothing pending right now. 🌿")}</p>}
              </div>
            </Card>

            <Card>
              <MiniCalendar marks={marks} selected={selectedDay} onSelect={setSelectedDay} isEs={isEs} />
            </Card>

            <div>
              <SectionTitle title={fmtDate(selectedDay)} />
              <div className="space-y-2.5">
                {(eventsByDay[selectedDay] || []).length === 0 && <Card className="text-center text-sm text-espresso/60">{t("Nada programado este día. 🌿", "Nothing scheduled. 🌿")}</Card>}
                {(eventsByDay[selectedDay] || []).map((ev: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 rounded-3xl bg-white px-4 py-3.5 shadow-sm">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${ev.kind === "med" ? "bg-[#D7F3EA] text-[#239BA2]" : "bg-[#FFE7D6] text-[#F2711C]"}`}>
                      {ev.kind === "med" ? <Stethoscope className="h-5 w-5" /> : <CalendarHeart className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-espresso">{ev.title}</p>
                      <p className="truncate text-xs text-espresso/60">{ev.sub}</p>
                    </div>
                    {ev.kind === "med" && (
                      <button type="button" onClick={() => runAction("delete_medical_appointment", { index: ev.idx }, t("Cita eliminada", "Removed"))} className="text-espresso/35 transition hover:text-[#C94A6A]" aria-label={t("Eliminar", "Delete")}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <PrimaryButton color="from-[#4DB6B0] to-[#239BA2]" onClick={() => openSheet("add-cita", { fecha: selectedDay, hora: "09:30 AM" })}>
                <Stethoscope className="h-5 w-5" />
                {t("Nueva cita médica", "New medical visit")}
              </PrimaryButton>
              <PrimaryButton onClick={() => openSheet("book", { healer: String(healers[0]?.id ?? ""), modalidad: "online", fecha: selectedDay, gratis: "1" })}>
                <CalendarHeart className="h-5 w-5" />
                {t("Reservar con un sanador", "Book with a healer")}
              </PrimaryButton>
            </div>
          </main>
        )}

        {/* ===================== PERFIL ===================== */}
        {activeTab === "perfil" && (
          <main className="mt-6 space-y-6">
            <div className="animate-fade-in text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#F48EA6] to-[#B03052] font-serif text-4xl font-bold text-white shadow-lg">{firstName.charAt(0)}</div>
              <h2 className="mt-3 font-serif text-2xl font-bold text-espresso">{user.nombre}</h2>
              <p className="text-xs text-espresso/55">{user.correo}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full bg-[#E4E0FA] px-3 py-1 text-[11px] font-bold text-[#7A4FD1]">{stage.emoji} {isEs ? stage.es : stage.en} · {ficha.nombre_familia}</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ${isPremium ? "bg-[#FFF1B8] text-[#8A6A00]" : "bg-espresso/5 text-espresso/60"}`}>
                  {isPremium && <Crown className="h-3 w-3" />}
                  {isPremium ? "Premium" : t("Plan gratuito", "Free plan")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { v: streak, l: t("Días de racha", "Day streak") },
                { v: timeline.length, l: t("En mi bitácora", "In my journal") },
                { v: upcoming.length, l: t("Próximas citas", "Upcoming") },
              ].map((s) => (
                <div key={s.l} className="rounded-3xl bg-white py-4 text-center shadow-sm">
                  <div className="font-serif text-2xl font-bold text-espresso">{s.v}</div>
                  <div className="text-[11px] font-semibold text-espresso/55">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-[28px] bg-white shadow-sm">
              {[
                { icon: UserCog, label: t("Mis datos", "My details"), hint: user.nombre, action: () => openSheet("profile", { nombre: user.nombre || "", telefono: user.telefono || "", idioma: user.idioma_preferido || locale }) },
                { icon: KeyRound, label: t("Cambiar contraseña", "Change password"), hint: "", action: () => openSheet("password") },
                { icon: Users, label: t("Mi cuidador", "My caregiver"), hint: caregiver.linked ? caregiver.nombre : t("Invitar", "Invite"), action: () => openSheet("caregiver", { correo: ficha.correo_invitacion_cuidador || "" }) },
                { icon: Crown, label: t("Membresía", "Membership"), hint: isPremium ? "Premium" : t("Gratuita", "Free"), action: () => openSheet("membership") },
                { icon: Phone, label: t("Mis contactos", "My contacts"), hint: `${ficha.contactos_personales.length}`, action: () => openSheet("contacts", { rol: "Oncólogo / Clínica" }) },
                { icon: Globe, label: t("Idioma", "Language"), hint: isEs ? "Español" : "English", action: () => setLocale(isEs ? "en" : "es") },
                { icon: HelpCircle, label: t("Ayuda y comentarios", "Help & feedback"), hint: data.tickets.length ? `${data.tickets.length}` : "", action: () => openSheet("help", { tipo: "feedback" }) },
              ].map((row, i) => (
                <button key={row.label} type="button" onClick={row.action} className={`flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-[#FAF7F2] ${i > 0 ? "border-t border-espresso/5" : ""}`}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F4EEFA] text-[#7A4FD1]"><row.icon className="h-5 w-5" /></span>
                  <span className="flex-1 text-sm font-bold text-espresso">{row.label}</span>
                  <span className="max-w-[110px] truncate text-xs text-espresso/50">{row.hint}</span>
                  <ChevronRight className="h-4 w-4 text-espresso/30" />
                </button>
              ))}
              <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 border-t border-espresso/5 px-5 py-4 text-left text-[#C94A6A] transition hover:bg-[#FCECEE]">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FCECEE]"><LogOut className="h-5 w-5" /></span>
                <span className="flex-1 text-sm font-bold">{t("Cerrar sesión", "Log out")}</span>
              </button>
            </div>
          </main>
        )}
      </div>

      {/* ===================== HOJAS ===================== */}

      <Sheet open={sheet === "player"} onClose={() => { setSheet(null); setPlayerItem(null); }}>
        {playerItem && <PracticePlayer key={playerItem.id} item={playerItem} isEs={isEs} />}
      </Sheet>

      {/* Contenido premium bloqueado */}
      <Sheet open={sheet === "premium" && !!lockedItem} onClose={() => setSheet(null)} title={t("Contenido Premium", "Premium content")}>
        {lockedItem && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF1B8] text-[#B98A00]"><Crown className="h-9 w-9" /></div>
            <h4 className="font-serif text-lg font-bold text-espresso">{isEs ? lockedItem.titulo_es : lockedItem.titulo_en || lockedItem.titulo_es}</h4>
            <p className="text-sm leading-relaxed text-espresso/70">{isEs ? lockedItem.descripcion_es : lockedItem.descripcion_en || lockedItem.descripcion_es}</p>
            <p className="rounded-2xl bg-[#FAF7F2] p-3 text-xs text-espresso/70">{t("Incluido en la membresía familiar de $10 USD/mes (paciente + cuidador).", "Included in the $10 USD/month family membership (patient + caregiver).")}</p>
            <PrimaryButton onClick={async () => { const ok = await runAction("create_ticket", { tipo: "soporte", asunto: "Activar membresía premium", descripcion: `Quiero acceder a: ${lockedItem.titulo_es}` }, t("¡Listo! El equipo te contactará para activar tu membresía.", "Done! The team will contact you to activate your membership.")); if (ok) setSheet(null); }}>
              <Crown className="h-4 w-4" />
              {t("Quiero activar mi membresía", "I want to activate my membership")}
            </PrimaryButton>
          </div>
        )}
      </Sheet>

      <Sheet open={sheet === "membership"} onClose={() => setSheet(null)} title={t("Membresía", "Membership")}>
        <div className="space-y-4">
          <div className={`rounded-3xl p-5 ${isPremium ? "bg-[#FFF1B8]" : "bg-[#FAF7F2]"}`}>
            <p className="flex items-center gap-2 text-sm font-bold text-espresso">{isPremium && <Crown className="h-4 w-4 text-[#B98A00]" />}{isPremium ? t("Tienes Premium ✨", "You have Premium ✨") : t("Estás en el plan gratuito", "You're on the free plan")}</p>
            <ul className="mt-3 space-y-1.5 text-xs text-espresso/75">
              <li>✓ {t("Recursos gratuitos, Love Circles y tu sesión mensual de coaching", "Free resources, Love Circles and your monthly coaching session")}</li>
              <li>{isPremium ? "✓" : "★"} {t("Meditaciones y series avanzadas, seminarios con invitados", "Advanced meditations and series, seminars with guests")}</li>
              <li>{isPremium ? "✓" : "★"} {t("Paciente + cuidador por $10 USD/mes", "Patient + caregiver for $10 USD/month")}</li>
            </ul>
          </div>
          {!isPremium && (
            <PrimaryButton onClick={async () => { const ok = await runAction("create_ticket", { tipo: "soporte", asunto: "Activar membresía premium", descripcion: "Quiero activar la membresía familiar de $10 USD/mes." }, t("¡Listo! El equipo te contactará.", "Done! The team will contact you.")); if (ok) setSheet(null); }}>
              <Crown className="h-4 w-4" />
              {t("Quiero activar mi membresía", "I want to activate my membership")}
            </PrimaryButton>
          )}
        </div>
      </Sheet>

      {/* Resumen para la cita (IA) */}
      <Sheet open={sheet === "consult"} onClose={() => setSheet(null)} title={t("Resumen para mi cita", "Summary for my visit")}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-1.5 rounded-full bg-[#FAF7F2] p-1.5">
            {([["medico", `🩺 ${t("Médico", "Doctor")}`], ["sanador", `✨ ${t("Sanador", "Healer")}`]] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => openConsult(id)} className={`rounded-full py-2 text-xs font-bold ${consult?.audience === id ? "bg-espresso text-white" : "text-espresso/60"}`}>
                {label}
              </button>
            ))}
          </div>

          {consult?.loading ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-[#7A4FD1] text-white"><Sparkles className="h-6 w-6" /></div>
              <p className="text-sm font-semibold text-espresso/70">{t("PONO está armando tu resumen…", "PONO is putting your summary together…")}</p>
            </div>
          ) : (
            <>
              <pre className="whitespace-pre-wrap rounded-3xl bg-[#F4F8F8] p-4 font-sans text-xs leading-relaxed text-espresso">{consult?.summary || t("No se pudo generar el resumen.", "The summary could not be generated.")}</pre>
              {consult?.questions?.length > 0 && (
                <div className="rounded-3xl bg-[#FFF6D6] p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#8A6A00]">{t("Preguntas que podrías hacer", "Questions you could ask")}</p>
                  <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-espresso/85">
                    {consult.questions.map((q: string, i: number) => (<li key={i}>• {q}</li>))}
                  </ul>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const text = `${consult?.summary || ""}\n\n${t("Preguntas", "Questions")}:\n${(consult?.questions || []).map((q: string) => `• ${q}`).join("\n")}`;
                    navigator.clipboard?.writeText(text);
                    showToast(t("Resumen copiado", "Summary copied"));
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border border-espresso/15 py-3 text-sm font-bold text-espresso/75"
                >
                  <Copy className="h-4 w-4" />{t("Copiar", "Copy")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const text = consult?.summary || "";
                    if (navigator.share) navigator.share({ title: "Love Heals Effect", text }).catch(() => {});
                    else { navigator.clipboard?.writeText(text); showToast(t("Resumen copiado", "Summary copied")); }
                  }}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#7A4FD1] py-3 text-sm font-bold text-white"
                >
                  <Share2 className="h-4 w-4" />{t("Compartir", "Share")}
                </button>
              </div>
              <p className="text-center text-[11px] text-espresso/50">{t("Generado por PONO IA con lo que has registrado. No sustituye la atención médica.", "Generated by PONO AI from what you've recorded. It does not replace medical care.")}</p>
            </>
          )}
        </div>
      </Sheet>

      {/* Bitácora asistida por IA */}
      <Sheet open={sheet === "bitacora"} onClose={() => { recognitionRef.current?.stop(); setRecording(false); setSheet(null); }} title={t("Agregar a mi bitácora", "Add to my journal")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await runAction(
              "add_bitacora",
              {
                tipo: fv("tipo", "nota"),
                titulo: fv("titulo") || fv("relato").slice(0, 60),
                detalle: fv("detalle") || fv("relato"),
                fecha: fv("fecha", todayKey()),
                medico: fv("medico"),
                lugar: fv("lugar"),
                etiquetas: fv("etiquetas").split(",").map((x) => x.trim()).filter(Boolean),
                origen: fv("origen") === "ia" ? "ia" : "manual",
              },
              t("Guardado en tu bitácora", "Saved to your journal")
            );
            if (ok) setSheet(null);
          }}
        >
          <div className="rounded-3xl bg-gradient-to-br from-[#F6E6FA] to-[#DDF1EE] p-4">
            <p className="flex items-center gap-1.5 text-xs font-bold text-[#7A4FD1]"><Sparkles className="h-3.5 w-3.5" />{t("Cuéntame qué pasó con tus palabras", "Tell me what happened in your own words")}</p>
            <textarea rows={3} className={`${inputCls} mt-2`} value={fv("relato")} onChange={fs("relato")} placeholder={t("Ej. Ayer fui con la Dra. López, me dijo que siga con tamoxifeno y tuve náuseas toda la tarde…", "E.g. Yesterday I saw Dr. Lee, she said to continue tamoxifen and I had nausea all afternoon…")} />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" onClick={toggleVoice} className={`flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold transition ${recording ? "animate-pulse bg-[#C94A6A] text-white" : "bg-white text-[#C94A6A]"}`}>
                {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {recording ? t("Detener", "Stop") : t("Dictar", "Dictate")}
              </button>
              <button type="button" disabled={organizing} onClick={organizeWithAI} className="flex items-center justify-center gap-2 rounded-full bg-[#7A4FD1] py-2.5 text-xs font-bold text-white disabled:opacity-60">
                <Sparkles className={`h-4 w-4 ${organizing ? "animate-spin" : ""}`} />
                {organizing ? t("Organizando…", "Organizing…") : t("Organizar con PONO", "Organize with PONO")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("Tipo", "Type")}>
              <select className={inputCls} value={fv("tipo", "nota")} onChange={fs("tipo")}>
                {Object.entries(TIMELINE_META).filter(([k]) => k !== "etapa").map(([k, m]) => (
                  <option key={k} value={k}>{m.emoji} {isEs ? m.es : m.en}</option>
                ))}
              </select>
            </Field>
            <Field label={t("Fecha", "Date")}>
              <input type="date" className={inputCls} value={fv("fecha", todayKey())} onChange={fs("fecha")} />
            </Field>
          </div>
          <Field label={t("Título", "Title")}>
            <input className={inputCls} value={fv("titulo")} onChange={fs("titulo")} placeholder={t("Se llena solo con PONO", "PONO fills it in")} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("Médico", "Doctor")}>
              <input className={inputCls} value={fv("medico")} onChange={fs("medico")} placeholder="Dra. López" />
            </Field>
            <Field label={t("Lugar", "Place")}>
              <input className={inputCls} value={fv("lugar")} onChange={fs("lugar")} />
            </Field>
          </div>
          <Field label={t("Detalle", "Details")}>
            <textarea rows={2} className={inputCls} value={fv("detalle")} onChange={fs("detalle")} />
          </Field>
          <Field label={t("Etiquetas (separadas por coma)", "Tags (comma separated)")}>
            <input className={inputCls} value={fv("etiquetas")} onChange={fs("etiquetas")} placeholder="náuseas, tamoxifeno" />
          </Field>
          <PrimaryButton type="submit">{t("Guardar en mi bitácora", "Save to my journal")}</PrimaryButton>
        </form>
      </Sheet>

      <Sheet open={sheet === "add-med"} onClose={() => setSheet(null)} title={t("Agregar", "Add")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const isMed = fv("kind", "med") === "med";
            const ok = await runAction(
              isMed ? "add_medication" : "add_supplement",
              { nombre: fv("nombre"), dosis: fv("dosis") || "1 dosis", horario: fv("horario") || "08:00 AM", indicaciones: fv("indicaciones") },
              isMed ? t("Medicina agregada", "Medication added") : t("Suplemento agregado", "Supplement added")
            );
            if (ok) setSheet(null);
          }}
        >
          <div className="grid grid-cols-2 gap-1.5 rounded-full bg-[#FAF7F2] p-1.5">
            {([["med", t("Medicina", "Medication")], ["sup", t("Suplemento", "Supplement")]] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setForm((p) => ({ ...p, kind: id }))} className={`rounded-full py-2 text-xs font-bold ${fv("kind", "med") === id ? "bg-espresso text-white" : "text-espresso/60"}`}>{label}</button>
            ))}
          </div>
          <Field label={t("Nombre", "Name")}>
            <input required className={inputCls} value={fv("nombre")} onChange={fs("nombre")} placeholder={t("Ej. Tamoxifeno", "E.g. Tamoxifen")} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("Dosis", "Dose")}><input className={inputCls} value={fv("dosis")} onChange={fs("dosis")} placeholder="20 mg" /></Field>
            <Field label={t("Hora", "Time")}><input className={inputCls} value={fv("horario")} onChange={fs("horario")} placeholder="8:00 AM" /></Field>
          </div>
          {fv("kind", "med") === "med" && (
            <Field label={t("Indicaciones (opcional)", "Instructions (optional)")}>
              <input className={inputCls} value={fv("indicaciones")} onChange={fs("indicaciones")} placeholder={t("Tomar con alimentos", "Take with food")} />
            </Field>
          )}
          <PrimaryButton type="submit">{t("Guardar", "Save")}</PrimaryButton>
        </form>
      </Sheet>

      <Sheet open={sheet === "edit-ficha"} onClose={() => setSheet(null)} title={t("Mi ficha de salud", "My health chart")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await runAction("update_medical_info", { historia_medica: fv("historia"), alergias: fv("alergias"), datos_nutricionales: fv("nutricion") }, t("Ficha actualizada", "Chart updated"));
            if (ok) setSheet(null);
          }}
        >
          <Field label={t("Mi historia y cómo me he sentido", "My story and how I've felt")}><textarea rows={4} className={inputCls} value={fv("historia")} onChange={fs("historia")} /></Field>
          <Field label={t("Alergias", "Allergies")}><input className={inputCls} value={fv("alergias")} onChange={fs("alergias")} /></Field>
          <Field label={t("Alimentación e hidratación", "Nutrition & hydration")}><input className={inputCls} value={fv("nutricion")} onChange={fs("nutricion")} /></Field>
          <PrimaryButton type="submit">{t("Guardar cambios", "Save changes")}</PrimaryButton>
        </form>
      </Sheet>

      <Sheet open={sheet === "add-doc"} onClose={() => setSheet(null)} title={t("Subir documento", "Upload document")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await runAction("add_document", { titulo: fv("titulo"), tipo: fv("tipo"), notas: fv("notas"), archivoNombre: fv("archivo") || "documento.pdf" }, t("Documento guardado", "Document saved"));
            if (ok) setSheet(null);
          }}
        >
          <Field label={t("Título", "Title")}><input required className={inputCls} value={fv("titulo")} onChange={fs("titulo")} placeholder={t("Ej. Hemograma pre-quimio", "E.g. Pre-chemo blood count")} /></Field>
          <Field label={t("Tipo", "Type")}>
            <select className={inputCls} value={fv("tipo")} onChange={fs("tipo")}>
              <option value="Receta / Indicaciones del Oncólogo">{t("Receta / indicaciones", "Prescription / notes")}</option>
              <option value="Resultado de Laboratorio">{t("Laboratorio", "Lab result")}</option>
              <option value="Estudio de Imagen / Patología">{t("Imagen / patología", "Imaging / pathology")}</option>
            </select>
          </Field>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#D85678]/40 bg-[#FCECEE]/50 px-4 py-5 text-sm font-bold text-[#C94A6A]">
            <Upload className="h-5 w-5" />
            <span className="truncate">{fv("archivo") || t("Elegir PDF, Word o foto", "Choose PDF, Word or photo")}</span>
            <input type="file" accept=".pdf,.doc,.docx,image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setForm((p) => ({ ...p, archivo: file.name })); }} />
          </label>
          <Field label={t("Lo más importante que dijo el médico", "Key points from the doctor")}><textarea rows={3} className={inputCls} value={fv("notas")} onChange={fs("notas")} /></Field>
          <PrimaryButton type="submit">{t("Guardar documento", "Save document")}</PrimaryButton>
        </form>
      </Sheet>

      <Sheet open={sheet === "add-cita"} onClose={() => setSheet(null)} title={t("Nueva cita médica", "New medical visit")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await runAction("add_medical_appointment", { titulo: fv("titulo"), fecha: fv("fecha"), hora: fv("hora"), lugar: fv("lugar") || "Centro Oncológico" }, t("Cita agregada al calendario", "Visit added to calendar"));
            if (ok) setSheet(null);
          }}
        >
          <Field label={t("Motivo", "Reason")}><input required className={inputCls} value={fv("titulo")} onChange={fs("titulo")} placeholder={t("Control con oncología", "Oncology check-up")} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("Fecha", "Date")}><input required type="date" className={inputCls} value={fv("fecha")} onChange={fs("fecha")} /></Field>
            <Field label={t("Hora", "Time")}><input className={inputCls} value={fv("hora")} onChange={fs("hora")} /></Field>
          </div>
          <Field label={t("Lugar", "Place")}><input className={inputCls} value={fv("lugar")} onChange={fs("lugar")} placeholder="Queen's Medical Center" /></Field>
          <PrimaryButton type="submit" color="from-[#4DB6B0] to-[#239BA2]">{t("Agregar cita", "Add visit")}</PrimaryButton>
        </form>
      </Sheet>

      <Sheet open={sheet === "book"} onClose={() => setSheet(null)} title={t("Reservar con un sanador", "Book with a healer")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const h = healers.find((x) => String(x.id) === fv("healer"));
            const name = String(h?.especialidad || "Sanador").split("·")[0].trim();
            const modal = fv("modalidad", "online");
            const ok = await runAction(
              "book_healer_session",
              {
                sanador_usuario_id: h?.sanador_usuario_id || 3,
                modalidad: modal,
                fecha_sesion: new Date(`${fv("fecha")}T10:00:00`).toISOString(),
                es_sesion_gratuita_mensual: fv("gratis") === "1",
                enlace_o_lugar: `${name} (${modal === "online" ? t("Videollamada", "Video call") : t("Presencial", "In person")})`,
              },
              t("¡Sesión reservada!", "Session booked!")
            );
            if (ok) setSheet(null);
          }}
        >
          <div className="space-y-2.5">
            {healers.map((h) => {
              const active = String(h.id) === fv("healer");
              const name = String(h.especialidad).split("·")[0].trim();
              return (
                <button key={h.id} type="button" onClick={() => setForm((p) => ({ ...p, healer: String(h.id) }))} className={`flex w-full items-center gap-3 rounded-3xl border-2 p-3.5 text-left transition ${active ? "border-[#D85678] bg-[#FCECEE]/60" : "border-transparent bg-[#FAF7F2]"}`}>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F49678] to-[#D85678] font-serif text-lg font-bold text-white">{name.charAt(0)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-espresso">{name}</span>
                    <span className="block truncate text-xs text-espresso/60">{isEs ? h.short_bio_es : h.short_bio_en || h.short_bio_es}</span>
                  </span>
                  <span className="text-xs font-bold text-[#C94A6A]">${h.tarifa_hora_usd}</span>
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-1.5 rounded-full bg-[#FAF7F2] p-1.5">
            {([["online", "Online"], ["presencial", t("En persona", "In person")]] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setForm((p) => ({ ...p, modalidad: id }))} className={`rounded-full py-2 text-xs font-bold ${fv("modalidad", "online") === id ? "bg-espresso text-white" : "text-espresso/60"}`}>{label}</button>
            ))}
          </div>
          <Field label={t("Fecha", "Date")}><input required type="date" className={inputCls} value={fv("fecha")} onChange={fs("fecha")} /></Field>
          <label className="flex items-center gap-3 rounded-2xl bg-[#E7F2F1] px-4 py-3 text-sm font-semibold text-espresso">
            <input type="checkbox" checked={fv("gratis") === "1"} onChange={(e) => setForm((p) => ({ ...p, gratis: e.target.checked ? "1" : "0" }))} className="h-5 w-5 accent-[#D85678]" />
            {t("Usar mi sesión gratuita del mes", "Use my free session this month")}
          </label>
          <PrimaryButton type="submit">{t("Confirmar reserva", "Confirm booking")}</PrimaryButton>
        </form>
      </Sheet>

      {/* Mis datos */}
      <Sheet open={sheet === "profile"} onClose={() => setSheet(null)} title={t("Mis datos", "My details")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await runAction("update_profile", { nombre: fv("nombre"), telefono: fv("telefono"), idioma: fv("idioma") }, t("Datos actualizados", "Details updated"));
            if (ok) {
              if (fv("idioma") === "es" || fv("idioma") === "en") setLocale(fv("idioma") as "es" | "en");
              setSheet(null);
            }
          }}
        >
          <Field label={t("Nombre", "Name")}><input required className={inputCls} value={fv("nombre")} onChange={fs("nombre")} /></Field>
          <Field label={t("Teléfono", "Phone")}><input className={inputCls} value={fv("telefono")} onChange={fs("telefono")} /></Field>
          <div className="grid grid-cols-2 gap-1.5 rounded-full bg-[#FAF7F2] p-1.5">
            {([["es", "Español"], ["en", "English"]] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setForm((p) => ({ ...p, idioma: id }))} className={`rounded-full py-2 text-xs font-bold ${fv("idioma") === id ? "bg-espresso text-white" : "text-espresso/60"}`}>{label}</button>
            ))}
          </div>
          <p className="text-xs text-espresso/55">{t("Correo", "Email")}: {user.correo}</p>
          <PrimaryButton type="submit">{t("Guardar", "Save")}</PrimaryButton>
        </form>
      </Sheet>

      {/* Cambiar contraseña */}
      <Sheet open={sheet === "password"} onClose={() => setSheet(null)} title={t("Cambiar contraseña", "Change password")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (fv("nueva") !== fv("repetir")) {
              showToast(t("Las contraseñas nuevas no coinciden", "The new passwords don't match"));
              return;
            }
            const ok = await runAction("change_password", { actual: fv("actual"), nueva: fv("nueva") }, t("Contraseña actualizada", "Password updated"));
            if (ok) setSheet(null);
          }}
        >
          <Field label={t("Contraseña actual", "Current password")}><input required type="password" className={inputCls} value={fv("actual")} onChange={fs("actual")} /></Field>
          <Field label={t("Nueva contraseña", "New password")}><input required type="password" className={inputCls} value={fv("nueva")} onChange={fs("nueva")} /></Field>
          <Field label={t("Repite la nueva contraseña", "Repeat new password")}><input required type="password" className={inputCls} value={fv("repetir")} onChange={fs("repetir")} /></Field>
          <p className="text-xs text-espresso/55">{t("Debe incluir al menos una mayúscula y un número.", "It must include at least one capital letter and one number.")}</p>
          <PrimaryButton type="submit"><KeyRound className="h-4 w-4" />{t("Actualizar contraseña", "Update password")}</PrimaryButton>
        </form>
      </Sheet>

      {/* Cuidador: ver, cambiar o invitar */}
      <Sheet open={sheet === "caregiver"} onClose={() => setSheet(null)} title={t("Mi cuidador", "My caregiver")}>
        {caregiver.linked ? (
          <div className="space-y-4">
            <div className="rounded-3xl bg-[#E7F2F1] p-5 text-sm text-espresso">
              <p className="font-bold">✓ {t("Vinculados 1 a 1 con", "Linked 1-to-1 with")} {caregiver.nombre}</p>
              <p className="mt-1 text-xs text-espresso/65">{caregiver.correo} · {caregiver.relacion}</p>
              <p className="mt-3 text-xs text-espresso/65">{t("Comparten tu calendario, medicinas y documentos.", "You share calendar, medications and documents.")}</p>
            </div>
            {fv("confirm") === "1" ? (
              <div className="rounded-3xl bg-[#FCECEE] p-4">
                <p className="text-sm font-bold text-[#9E2A47]">{t("¿Seguro que quieres cambiar de cuidador?", "Are you sure you want to change caregiver?")}</p>
                <p className="mt-1 text-xs text-espresso/70">{t("Se desvinculará a tu cuidador actual; podrás invitar a otra persona enseguida.", "Your current caregiver will be unlinked; you can invite someone else right away.")}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setForm((p) => ({ ...p, confirm: "0" }))} className="rounded-full border border-espresso/15 py-2.5 text-xs font-bold text-espresso/70">{t("Cancelar", "Cancel")}</button>
                  <button type="button" onClick={() => runAction("unlink_caregiver", {}, t("Cuidador desvinculado", "Caregiver unlinked"))} className="rounded-full bg-[#C94A6A] py-2.5 text-xs font-bold text-white">{t("Sí, cambiar", "Yes, change")}</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setForm((p) => ({ ...p, confirm: "1" }))} className="w-full rounded-full border border-[#C94A6A]/40 py-3 text-sm font-bold text-[#C94A6A]">{t("Cambiar de cuidador", "Change caregiver")}</button>
            )}
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await runAction("invite_caregiver", { correo: fv("correo"), nombre: fv("nombre") }, t("Invitación enviada", "Invitation sent"));
              if (ok) setSheet(null);
            }}
          >
            <p className="text-sm text-espresso/70">{t("Tu cuidador tendrá su propio acceso y verá lo mismo que tú.", "Your caregiver gets their own login and sees what you see.")}</p>
            <Field label={t("Nombre", "Name")}><input className={inputCls} value={fv("nombre")} onChange={fs("nombre")} /></Field>
            <Field label={t("Correo", "Email")}><input required type="email" className={inputCls} value={fv("correo")} onChange={fs("correo")} /></Field>
            <PrimaryButton type="submit"><Send className="h-4 w-4" />{t("Enviar invitación", "Send invitation")}</PrimaryButton>
          </form>
        )}
      </Sheet>

      <Sheet open={sheet === "contacts"} onClose={() => setSheet(null)} title={t("Mis contactos y médicos", "My contacts & doctors")}>
        <div className="space-y-2.5">
          {ficha.contactos_personales.map((c: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 rounded-2xl bg-[#FAF7F2] px-4 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D7F3EA] text-[#239BA2]"><Phone className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-espresso">{c.nombre}</p>
                <p className="truncate text-xs text-espresso/60">{c.rol} · {c.telefono}</p>
              </div>
              <button type="button" onClick={() => runAction("delete_contact", { index: idx }, t("Contacto eliminado", "Removed"))} className="text-espresso/35 hover:text-[#C94A6A]" aria-label={t("Eliminar", "Delete")}><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await runAction("add_contact", { nombre: fv("nombre"), rol: fv("rol"), telefono: fv("telefono") }, t("Contacto guardado", "Contact saved"));
            if (ok) setForm({ rol: "Oncólogo / Clínica" });
          }}
        >
          <input required className={inputCls} placeholder={t("Nombre (ej. Dra. Lee)", "Name")} value={fv("nombre")} onChange={fs("nombre")} />
          <div className="grid grid-cols-2 gap-3">
            <input className={inputCls} placeholder={t("Rol (ej. Oncólogo)", "Role")} value={fv("rol")} onChange={fs("rol")} />
            <input className={inputCls} placeholder={t("Teléfono", "Phone")} value={fv("telefono")} onChange={fs("telefono")} />
          </div>
          <PrimaryButton type="submit"><Plus className="h-4 w-4" />{t("Agregar", "Add")}</PrimaryButton>
        </form>
      </Sheet>

      <Sheet open={sheet === "help"} onClose={() => setSheet(null)} title={t("Ayuda y comentarios", "Help & feedback")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await runAction("create_ticket", { tipo: fv("tipo", "feedback"), asunto: fv("asunto"), descripcion: fv("descripcion") }, t("¡Gracias! Lo recibió el equipo.", "Thank you! The team received it."));
            if (ok) setSheet(null);
          }}
        >
          <p className="text-sm text-espresso/70">{t("Cuéntanos qué mejorar o si necesitas ayuda. Llega directo a Omar, Kelsie y Erika.", "Tell us what to improve or if you need help. It goes straight to Omar, Kelsie and Erika.")}</p>
          <div className="grid grid-cols-3 gap-1.5 rounded-full bg-[#FAF7F2] p-1.5">
            {([["feedback", t("Idea", "Idea")], ["soporte", t("Ayuda", "Help")], ["bug", t("Problema", "Problem")]] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setForm((p) => ({ ...p, tipo: id }))} className={`rounded-full py-2 text-xs font-bold ${fv("tipo", "feedback") === id ? "bg-espresso text-white" : "text-espresso/60"}`}>{label}</button>
            ))}
          </div>
          <input required className={inputCls} placeholder={t("Asunto", "Subject")} value={fv("asunto")} onChange={fs("asunto")} />
          <textarea required rows={3} className={inputCls} placeholder={t("Cuéntanos más…", "Tell us more…")} value={fv("descripcion")} onChange={fs("descripcion")} />
          <PrimaryButton type="submit"><Send className="h-4 w-4" />{t("Enviar", "Send")}</PrimaryButton>
        </form>
        {data.tickets.length > 0 && (
          <div className="mt-5 space-y-2">
            {data.tickets.map((tk: any) => (
              <div key={tk.id} className="flex items-center justify-between rounded-2xl bg-[#FAF7F2] px-4 py-2.5 text-xs">
                <span className="truncate font-semibold text-espresso">{tk.asunto}</span>
                <span className="rounded-full bg-white px-2.5 py-0.5 font-bold text-[#239BA2]">{tk.estado}</span>
              </div>
            ))}
          </div>
        )}
      </Sheet>
    </div>
  );
}

export function PacienteDashboard() {
  return (
    <Suspense fallback={null}>
      <PacienteDashboardInner />
    </Suspense>
  );
}

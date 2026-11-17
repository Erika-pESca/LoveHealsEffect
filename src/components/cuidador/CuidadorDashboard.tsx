"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  CalendarHeart,
  Check,
  ChevronRight,
  Copy,
  Dumbbell,
  FileText,
  Flame,
  Globe,
  HelpCircle,
  Heart,
  KeyRound,
  LogOut,
  Mic,
  MicOff,
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
  Wind,
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
import {
  dayKeyOffset,
  HABIT_COLORS,
  MiniCalendar,
  PracticePlayer,
  STAGES,
  todayKey,
  TYPE_META,
} from "@/components/paciente/PacienteDashboard";

const TEAL = "from-[#4DB6B0] to-[#239BA2]";

const CMOODS = [
  { id: "energia", emoji: "😊", es: "Con energía", en: "Energized", bg: "bg-[#FFF1B8]", type: "guia_autocuidado", msgEs: "¡Qué bueno! Aprovecha para adelantar algo de autocuidado.", msgEn: "Great! Use it to get ahead on some self-care." },
  { id: "tranquilo", emoji: "😌", es: "Tranquilo/a", en: "Calm", bg: "bg-[#D7F3EA]", type: "guia_autocuidado", msgEs: "Qué bien. Esa calma también la siente tu paciente.", msgEn: "Wonderful. Your patient feels that calm too." },
  { id: "agotado", emoji: "🥱", es: "Agotado/a", en: "Exhausted", bg: "bg-[#E4E0FA]", type: "meditacion_audio", msgEs: "Cuidar cansa. Regálate 8 minutos de pausa: no puedes dar desde el vacío.", msgEn: "Caring is tiring. Give yourself an 8-minute pause: you can't pour from an empty cup." },
  { id: "estresado", emoji: "😣", es: "Estresado/a", en: "Stressed", bg: "bg-[#FFE0D2]", type: "meditacion_audio", msgEs: "Respira un momento. Una pausa corta baja la tensión.", msgEn: "Take a breath. A short pause lowers tension." },
  { id: "abrumado", emoji: "😰", es: "Abrumado/a", en: "Overwhelmed", bg: "bg-[#D9E8FB]", type: "love_circle", msgEs: "No tienes que poder con todo solo/a. Tu Love Circle de cuidadores te espera.", msgEn: "You don't have to carry it all alone. Your caregivers' Love Circle awaits." },
  { id: "agradecido", emoji: "🥰", es: "Agradecido/a", en: "Grateful", bg: "bg-[#FAD4DC]", type: "workshop", msgEs: "Qué hermoso sentir eso. Compártelo con tu paciente hoy.", msgEn: "Beautiful to feel that. Share it with your patient today." },
];

function CuidadorDashboardInner() {
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
  const [resourceFilter, setResourceFilter] = useState("todos");
  const [saludView, setSaludView] = useState<
    "bitacora" | "medicinas" | "ficha" | "documentos"
  >("bitacora");
  const [selectedDay, setSelectedDay] = useState(todayKey());
  const [consult, setConsult] = useState<any>(null);
  const [organizing, setOrganizing] = useState(false);
  const [recording, setRecording] = useState(false);

  const callAI = async (action: string, payload: Record<string, any> = {}) => {
    try {
      const res = await fetch("/api/cuidador/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          payload: { locale, today: todayKey(), ...payload },
        }),
      });
      const json = await res.json();
      if (json.ok) return json;
    } catch (err) {
      console.error("Error PONO IA cuidador:", err);
    }
    return null;
  };

  const openConsult = async (audience: "medico" | "sanador") => {
    setConsult({ loading: true, audience, summary: "", questions: [] });
    setSheet("consult");
    const res = await callAI("ai_consult_summary", { audience });
    setConsult(
      res
        ? {
            loading: false,
            audience,
            summary: res.summary,
            questions: res.questions,
          }
        : { loading: false, audience, summary: "", questions: [] }
    );
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
      showToast(
        t("PONO IA organizó la bitácora ✨", "PONO AI organized the journal ✨")
      );
    }
    setOrganizing(false);
  };

  const toggleVoice = () => {
    if (recording) {
      setRecording(false);
      return;
    }
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.lang = isEs ? "es-ES" : "en-US";
      rec.onstart = () => setRecording(true);
      rec.onresult = (ev: any) => {
        const txt = ev.results?.[0]?.[0]?.transcript || "";
        if (txt) {
          setForm((p) => ({
            ...p,
            relato: p.relato ? `${p.relato} ${txt}` : txt,
          }));
        }
      };
      rec.onerror = () => setRecording(false);
      rec.onend = () => setRecording(false);
      rec.start();
    } else {
      showToast(
        t("Escribe el relato arriba para que PONO lo organice", "Type your note above so PONO can organize it")
      );
    }
  };

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
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/cuidador/dashboard");
      const json = await res.json();
      if (json.ok) {
        setData(json);
        setDiary(json.fichaCuidador?.bienestar_diario || {});
      }
    } catch (err) {
      console.error("Error cargando panel del cuidador:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const runAction = async (
    action: string,
    payload: Record<string, any>,
    message: string,
    options: { refetch?: boolean } = { refetch: true }
  ) => {
    try {
      const res = await fetch("/api/cuidador/dashboard", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      const json = await res.json();
      if (json.ok) {
        if (message) showToast(message);
        if (options.refetch !== false) await fetchDashboard();
        return true;
      }
      showToast(json.error || t("No se pudo guardar", "Could not save"));
    } catch (err) {
      console.error("Error ejecutando acción:", err);
    }
    return false;
  };

  const updateDaily = (patch: { mood?: string; habits?: Record<string, boolean> }) => {
    const key = todayKey();
    setDiary((prev) => {
      const cur = prev[key] || {};
      return {
        ...prev,
        [key]: {
          ...cur,
          ...(patch.mood !== undefined ? { mood: patch.mood } : {}),
          ...(patch.habits ? { habits: { ...(cur.habits || {}), ...patch.habits } } : {}),
        },
      };
    });
    runAction("update_daily", { date: key, ...patch }, "", { refetch: false });
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
    router.push(tabId === "inicio" ? "/cuidador" : `/cuidador?tab=${tabId}`, { scroll: false });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ----------------------- Derivados ----------------------- */
  const user = data?.user;
  const fp = data?.fichaPaciente;
  const fc = data?.fichaCuidador;
  const patientInfo = data?.patientInfo;

  const todayLog = diary[todayKey()] || {};
  const todayHabits: Record<string, boolean> = todayLog.habits || {};
  const currentMood = CMOODS.find((m) => m.id === todayLog.mood) || null;

  const habits = useMemo(() => {
    if (!fp) return [];
    const meds = (fp.medicamentos_y_horarios || []).map((m: any, i: number) => ({
      key: `med-${m.id ?? i}`,
      label: t(`Dar ${m.nombre}`, `Give ${m.nombre}`),
      sub: `${m.dosis || ""}${m.horario ? ` · ${m.horario}` : ""}`,
      icon: Pill,
    }));
    return [
      ...meds,
      { key: "pause", label: t("Mi pausa de 8 minutos", "My 8-minute pause"), sub: t("Respiración o meditación", "Breathing or meditation"), icon: Wind },
      { key: "outside", label: t("Aire libre o caminata", "Fresh air or a walk"), sub: t("Moverme un poco por mí", "Moving a little for me"), icon: Sparkles },
      { key: "help", label: t("Pedir o aceptar ayuda", "Ask for or accept help"), sub: t("No tengo que poder con todo", "I don't have to do it all"), icon: Heart },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fp, isEs]);

  const doneCount = habits.filter((h: any) => todayHabits[h.key]).length;
  const progressPct = habits.length ? Math.round((doneCount / habits.length) * 100) : 0;

  const dayHasActivity = (key: string) => {
    const l = diary[key];
    if (!l) return false;
    return Boolean(l.mood) || Object.values(l.habits || {}).some(Boolean);
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

  const weekDays = useMemo(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const letters = isEs ? ["L", "M", "X", "J", "V", "S", "D"] : ["M", "T", "W", "T", "F", "S", "S"];
    return letters.map((l, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = d.toLocaleDateString("en-CA");
      return { letter: l, key, done: dayHasActivity(key), isToday: key === todayKey() };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diary, isEs]);

  const resources: any[] = data?.resources || [];
  const suggested =
    resources.find((r) => r.tipo_contenido === (currentMood?.type || "meditacion_audio")) || resources[0] || null;

  const { marks, eventsByDay, upcoming } = useMemo(() => {
    const marks: Record<string, { med: number; ses: number }> = {};
    const eventsByDay: Record<string, any[]> = {};
    if (!fp || !data) return { marks, eventsByDay, upcoming: [] as any[] };
    const push = (key: string, ev: any, kind: "med" | "ses") => {
      marks[key] = marks[key] || { med: 0, ses: 0 };
      marks[key][kind]++;
      (eventsByDay[key] = eventsByDay[key] || []).push(ev);
    };
    (fp.citas_medicas || []).forEach((c: any, idx: number) =>
      push(String(c.fecha).slice(0, 10), { kind: "med", idx, title: c.titulo, sub: `${c.hora || ""} ${c.lugar || ""}`.trim(), date: String(c.fecha).slice(0, 10) }, "med")
    );
    (data.healerSessions || []).forEach((s: any) =>
      push(String(s.fecha_sesion).slice(0, 10), { kind: "ses", title: s.enlace_o_lugar, sub: String(s.modalidad).toUpperCase(), date: String(s.fecha_sesion).slice(0, 10) }, "ses")
    );
    const today = todayKey();
    const upcoming = Object.entries(eventsByDay)
      .filter(([k]) => k >= today)
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([, evs]) => evs);
    return { marks, eventsByDay, upcoming };
  }, [fp, data]);

  const fmtDate = (d: string) =>
    new Date(`${d.slice(0, 10)}T12:00:00`).toLocaleDateString(isEs ? "es-ES" : "en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  if (loading || !data || !fp) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2FAF8] px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-[#6BB1AD] to-[#239BA2] text-2xl text-white shadow-lg">
            🤝
          </div>
          <p className="font-serif text-lg font-bold text-espresso">
            {t("Preparando tu espacio…", "Preparing your space…")}
          </p>
        </div>
      </div>
    );
  }

  const firstName = String(user.nombre || "").split(" ")[0];
  const patientFirst = String(patientInfo.nombre || "").split(" ")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t("Buenos días", "Good morning") : hour < 19 ? t("Buenas tardes", "Good afternoon") : t("Buenas noches", "Good evening");
  const stage = STAGES.find((s) => s.id === fp.etapa_actual) || STAGES[0];
  const healers: any[] = data.healers || [];
  const filteredResources =
    resourceFilter === "todos" ? resources : resources.filter((r) => r.tipo_contenido === resourceFilter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E4F4F1] via-[#F8FBFA] to-[#FFF4EE] pb-44">
      <Toast message={toast} />

      <div className="mx-auto max-w-2xl px-5">
        {/* ENCABEZADO */}
        <header className="flex items-center justify-between pt-7">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => goToTab("perfil")}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#6BB1AD] to-[#239BA2] font-serif text-lg font-bold text-white shadow-md"
              aria-label={t("Mi perfil", "My profile")}
            >
              {firstName.charAt(0)}
            </button>
            <div>
              <p className="text-xs font-medium text-espresso/55">{greeting}</p>
              <h1 className="font-serif text-2xl font-bold leading-tight text-espresso">Aloha, {firstName} 🌿</h1>
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
              aria-label={t("Agenda", "Schedule")}
            >
              <Bell className="h-4 w-4" />
              {upcoming.length > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#239BA2] ring-2 ring-white" />}
            </button>
          </div>
        </header>

        {/* ===================== INICIO ===================== */}
        {activeTab === "inicio" && (
          <main className="mt-6 space-y-7">
            {/* Tarjeta de la célula */}
            <section className="animate-fade-in">
              <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#CFEDE8] via-[#E8F6F3] to-[#FDE3E8] p-6 shadow-[0_14px_34px_rgba(35,155,162,0.15)]">
                <span className="absolute -right-1 top-3 select-none text-7xl opacity-90">🤝</span>
                <span className="inline-block rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-[#239BA2]">
                  {t("Célula familiar 1 a 1", "1-to-1 family cell")}
                </span>
                <h2 className="mt-3 max-w-[72%] font-serif text-2xl font-bold leading-tight text-espresso">
                  {t(`Acompañando a ${patientFirst}`, `Supporting ${patientFirst}`)}
                </h2>
                <p className="mt-1 text-xs font-semibold text-espresso/60">
                  {stage.emoji} {isEs ? stage.es : stage.en} · {fc?.relacion_familiar || t("Cuidador", "Caregiver")}
                </p>
                <button
                  type="button"
                  onClick={() => goToTab("salud-paciente")}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#239BA2] px-6 py-3 text-sm font-bold text-white shadow-lg transition active:scale-95"
                >
                  <Heart className="h-4 w-4" />
                  {t(`Ver ficha de ${patientFirst}`, `View ${patientFirst}'s chart`)}
                </button>
              </div>
            </section>

            {/* Etapa de la paciente */}
            <section>
              <SectionTitle title={t(`Etapa de ${patientFirst}`, `${patientFirst}'s stage`)} />
              <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1">
                {STAGES.map((s) => {
                  const active = s.id === fp.etapa_actual;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => runAction("update_patient_stage", { etapa_actual: s.id }, t(`Etapa: ${s.es}`, `Stage: ${s.en}`))}
                      className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition active:scale-95 ${
                        active ? "bg-espresso text-white shadow-md" : "bg-white text-espresso/70 shadow-sm"
                      }`}
                    >
                      <span>{s.emoji}</span>
                      {isEs ? s.es : s.en}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Ánimo del cuidador */}
            <section>
              <SectionTitle title={t("Y tú, ¿cómo estás hoy?", "And you, how are you today?")} />
              <div className="grid grid-cols-3 gap-3">
                {CMOODS.map((m) => {
                  const active = currentMood?.id === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => updateDaily({ mood: m.id })}
                      className={`flex flex-col items-center gap-1.5 rounded-3xl ${m.bg} px-2 py-4 transition active:scale-95 ${
                        active ? "scale-[1.04] shadow-md ring-2 ring-[#239BA2]" : "opacity-90 hover:opacity-100"
                      }`}
                    >
                      <span className={`text-3xl ${active ? "animate-pop" : ""}`}>{m.emoji}</span>
                      <span className="text-[11px] font-bold text-espresso/80">{isEs ? m.es : m.en}</span>
                    </button>
                  );
                })}
              </div>
              {currentMood && (
                <div className="mt-3 animate-fade-in rounded-2xl bg-white/80 px-4 py-3 text-sm leading-relaxed text-espresso/80 shadow-sm">
                  {isEs ? currentMood.msgEs : currentMood.msgEn}
                  {suggested && (
                    <button
                      type="button"
                      onClick={() => {
                        setPlayerItem(suggested);
                        setSheet("player");
                      }}
                      className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#239BA2]"
                    >
                      <Play className="h-3.5 w-3.5" />
                      {isEs ? suggested.titulo_es : suggested.titulo_en || suggested.titulo_es}
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* Tareas del día */}
            <section>
              <SectionTitle
                title={t("Mi día de cuidado", "My caregiving day")}
                action={t("Ver medicinas", "View meds")}
                onAction={() => goToTab("salud-paciente")}
              />
              <Card className="mb-3 !p-4">
                <div className="flex items-center justify-between text-xs font-bold text-espresso/70">
                  <span>
                    {doneCount}/{habits.length} {t("completadas", "done")}
                  </span>
                  <span className="text-[#239BA2]">{progressPct}%</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#E3F1EF]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#6BB1AD] to-[#239BA2] transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
              </Card>
              <div className="space-y-2.5">
                {habits.map((h: any, i: number) => {
                  const done = Boolean(todayHabits[h.key]);
                  const Icon = h.icon;
                  return (
                    <button
                      key={h.key}
                      type="button"
                      onClick={() => updateDaily({ habits: { [h.key]: !done } })}
                      className={`flex w-full items-center gap-3 rounded-3xl ${HABIT_COLORS[i % HABIT_COLORS.length]} px-4 py-3.5 text-left transition active:scale-[0.98] ${done ? "opacity-60" : ""}`}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-espresso/70">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-sm font-bold text-espresso ${done ? "line-through" : ""}`}>{h.label}</span>
                        <span className="block truncate text-xs text-espresso/60">{h.sub}</span>
                      </span>
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${done ? "border-[#239BA2] bg-[#239BA2] text-white" : "border-espresso/25 bg-white/70"}`}>
                        {done && <Check className="h-4 w-4" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Racha */}
            <section>
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
                      {streak > 0 ? t("Cuidarte también es cuidar. ¡Sigue así!", "Caring for yourself is caring too. Keep going!") : t("Marca cómo estás o una tarea para empezar tu racha.", "Log how you feel or a task to start your streak.")}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  {weekDays.map((d) => (
                    <div key={d.key} className="flex flex-col items-center gap-1.5">
                      <span className="text-[11px] font-bold text-espresso/45">{d.letter}</span>
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs ${d.done ? "bg-[#239BA2] text-white" : d.isToday ? "border-2 border-dashed border-[#239BA2] text-[#239BA2]" : "bg-[#E3F1EF] text-transparent"}`}>
                        {d.done ? <Check className="h-4 w-4" /> : "·"}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            {/* Acceso rápido */}
            <section>
              <SectionTitle title={t("Acceso rápido", "Quick access")} />
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: t("Medicinas", "Meds"), icon: Pill, bg: "bg-[#FAD4DC]", fg: "text-[#C94A6A]", go: () => goToTab("salud-paciente") },
                  { label: t("Agenda", "Agenda"), icon: Stethoscope, bg: "bg-[#D7F3EA]", fg: "text-[#239BA2]", go: () => goToTab("alertas") },
                  { label: t("Autocuidado", "Self-care"), icon: Dumbbell, bg: "bg-[#E4E0FA]", fg: "text-[#7A4FD1]", go: () => goToTab("autocuidado") },
                  { label: t("Círculo", "Circle"), icon: Users, bg: "bg-[#FFF1B8]", fg: "text-[#B98A00]", go: () => goToTab("autocuidado") },
                ].map((q) => (
                  <button key={q.label} type="button" onClick={q.go} className="flex flex-col items-center gap-2 rounded-3xl bg-white py-4 shadow-sm transition active:scale-95">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${q.bg} ${q.fg}`}>
                      <q.icon className="h-5 w-5" />
                    </span>
                    <span className="text-[11px] font-bold text-espresso/75">{q.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Próxima cita */}
            <section>
              <button type="button" onClick={() => goToTab("alertas")} className="block w-full text-left">
                <Card>
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
            </section>
          </main>
        )}

        {/* ===================== AUTOCUIDADO ===================== */}
        {activeTab === "autocuidado" && (
          <main className="mt-6 space-y-6">
            <div className="animate-fade-in">
              <h2 className="font-serif text-3xl font-bold leading-tight text-espresso">{t("Para ti, cuidador/a", "For you, caregiver")}</h2>
              <p className="mt-1 text-sm text-espresso/60">{t("Cuidar a quien amas empieza por cuidarte.", "Caring for a loved one starts with caring for yourself.")}</p>
            </div>

            <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#CFEDE8] to-[#E4E0FA] p-5">
              <span className="absolute -right-2 top-2 text-6xl opacity-90">🌿</span>
              <span className="inline-block rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-[#239BA2]">Love Circle · {t("gratis", "free")}</span>
              <h3 className="mt-2 max-w-[75%] font-serif text-xl font-bold text-espresso">{t("Círculo de cuidadores con Omar", "Caregivers circle with Omar")}</h3>
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
                {t("Reservar mi cupo", "Reserve my spot")}
              </button>
            </div>

            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
              {[
                { id: "todos", es: "Todo", en: "All" },
                { id: "guia_autocuidado", es: "Guías y cocina", en: "Guides & cooking" },
                { id: "meditacion_audio", es: "Pausas y descanso", en: "Pauses & rest" },
                { id: "workshop", es: "Workshops", en: "Workshops" },
                { id: "love_circle", es: "Círculos", en: "Circles" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setResourceFilter(f.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${resourceFilter === f.id ? "bg-[#239BA2] text-white shadow-md" : "bg-white text-espresso/65 shadow-sm"}`}
                >
                  {isEs ? f.es : f.en}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredResources.map((item) => {
                const meta = TYPE_META[item.tipo_contenido] || TYPE_META.guia_autocuidado;
                const Icon = meta.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setPlayerItem(item);
                      setSheet("player");
                    }}
                    className="flex w-full items-center gap-4 rounded-[26px] bg-white p-3.5 text-left shadow-[0_8px_22px_rgba(35,155,162,0.08)] transition active:scale-[0.98]"
                  >
                    <span className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.grad} text-espresso/70`}>
                      <Icon className="h-8 w-8" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#239BA2]">
                        {isEs ? meta.es : meta.en}
                        {!item.es_gratuito && ` · $${item.costo_usd}`}
                      </span>
                      <span className="mt-0.5 block text-sm font-bold leading-snug text-espresso line-clamp-2">{isEs ? item.titulo_es : item.titulo_en || item.titulo_es}</span>
                      {item.fecha_evento && <span className="mt-0.5 block text-xs text-espresso/55">{fmtDate(item.fecha_evento)}</span>}
                    </span>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#239BA2] text-white shadow-md">
                      <Play className="h-5 w-5" />
                    </span>
                  </button>
                );
              })}
            </div>
          </main>
        )}

        {/* ===================== FICHA DE LA PACIENTE ===================== */}
        {activeTab === "salud-paciente" && (
          <main className="mt-6 space-y-6">
            <div className="animate-fade-in">
              <h2 className="font-serif text-3xl font-bold leading-tight text-espresso">{t(`Salud de ${patientFirst}`, `${patientFirst}'s health`)}</h2>
              <p className="mt-1 text-sm text-espresso/60">{t("Lo que actualices aquí lo ve ella al instante.", "What you update here, she sees instantly.")}</p>
            </div>

            {/* Preparar cita con PONO IA (para cuando el cuidador acompaña al médico o sanador) */}
            <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#CFEDE8] via-[#E8F6F3] to-[#E4E0FA] p-5 shadow-sm">
              <span className="absolute -right-1 top-2 text-6xl opacity-90">📋</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-[#239BA2]">
                <Sparkles className="h-3 w-3" />
                PONO IA · {t("Certeza en la consulta", "Certainty at the visit")}
              </span>
              <h3 className="mt-2 max-w-[74%] font-serif text-xl font-bold leading-tight text-espresso">
                {t(
                  `Resumen listo de ${patientFirst} para mostrar al médico o sanador`,
                  `Ready summary of ${patientFirst} to show the doctor or healer`
                )}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openConsult("medico")}
                  className="rounded-full bg-[#239BA2] px-4 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
                >
                  🩺 {t("Resumen para el médico", "Summary for doctor")}
                </button>
                <button
                  type="button"
                  onClick={() => openConsult("sanador")}
                  className="rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#239BA2] shadow-sm transition active:scale-95"
                >
                  ✨ {t("Resumen para el sanador", "Summary for healer")}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 rounded-full bg-white p-1.5 shadow-sm">
              {([
                ["bitacora", t("Bitácora", "Journal")],
                ["medicinas", t("Medicinas", "Meds")],
                ["ficha", t("Ficha", "Chart")],
                ["documentos", t("Docs", "Docs")],
              ] as const).map(([id, label]) => (
                <button key={id} type="button" onClick={() => setSaludView(id)} className={`rounded-full py-2.5 text-xs font-bold transition ${saludView === id ? "bg-espresso text-white shadow" : "text-espresso/60"}`}>
                  {label}
                </button>
              ))}
            </div>

            {saludView === "bitacora" && (
              <div className="space-y-3">
                <PrimaryButton
                  color={TEAL}
                  onClick={() => openSheet("bitacora", { tipo: "nota", fecha: todayKey() })}
                >
                  <Plus className="h-5 w-5" />
                  {t("Registrar evolución o cita con PONO IA", "Log progress or visit with PONO AI")}
                </PrimaryButton>
                {(fp.bitacora_clinica || []).length === 0 && (
                  <Card className="text-center text-sm text-espresso/60">
                    {t(
                      "Registra aquí síntomas, consultas médicas o cambios de medicación para que nunca se olvide nada.",
                      "Log symptoms, doctor visits or medication changes here so nothing is ever forgotten."
                    )}
                  </Card>
                )}
                {(fp.bitacora_clinica || []).map((e: any) => (
                  <div
                    key={e.id}
                    className="flex items-start justify-between gap-3 rounded-3xl bg-white p-4 shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold text-[#239BA2]">
                        {fmtDate(e.fecha)} · {String(e.tipo || "nota").toUpperCase()}
                      </span>
                      <p className="mt-0.5 text-sm font-bold text-espresso">{e.titulo}</p>
                      {e.detalle && (
                        <p className="mt-1 text-xs leading-relaxed text-espresso/70">
                          {e.detalle}
                        </p>
                      )}
                      {e.medico && (
                        <span className="mt-1.5 inline-block rounded-full bg-[#D9E8FB] px-2.5 py-0.5 text-[10px] font-bold text-[#3D7BD6]">
                          🩺 {e.medico}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        runAction(
                          "delete_bitacora",
                          { id: e.id },
                          t("Entrada eliminada", "Entry removed")
                        )
                      }
                      className="text-espresso/30 hover:text-[#C94A6A]"
                      aria-label={t("Eliminar", "Delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {saludView === "medicinas" && (
              <div className="space-y-6">
                <div>
                  <SectionTitle title={t("Medicamentos", "Medications")} />
                  <div className="space-y-2.5">
                    {fp.medicamentos_y_horarios.length === 0 && <Card className="text-center text-sm text-espresso/60">{t("Aún no hay medicinas registradas.", "No medications yet.")}</Card>}
                    {fp.medicamentos_y_horarios.map((m: any, idx: number) => {
                      const key = `med-${m.id ?? idx}`;
                      const given = Boolean(todayHabits[key]);
                      return (
                        <div key={key} className={`flex items-center gap-3 rounded-3xl ${HABIT_COLORS[(idx + 1) % HABIT_COLORS.length]} px-4 py-3.5`}>
                          <button
                            type="button"
                            onClick={() => updateDaily({ habits: { [key]: !given } })}
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition ${given ? "border-[#239BA2] bg-[#239BA2] text-white" : "border-espresso/25 bg-white/70"}`}
                            aria-label={t("Marcar como dada", "Mark as given")}
                          >
                            {given && <Check className="h-4 w-4" />}
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className={`truncate text-sm font-bold text-espresso ${given ? "line-through opacity-60" : ""}`}>{m.nombre}</p>
                            <p className="truncate text-xs text-espresso/65">
                              {m.dosis} · {m.horario}
                              {m.indicaciones ? ` · ${m.indicaciones}` : ""}
                            </p>
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
                  <SectionTitle title={t("Suplementos", "Supplements")} />
                  <div className="space-y-2.5">
                    {fp.suplementos.length === 0 && <Card className="text-center text-sm text-espresso/60">{t("Sin suplementos registrados.", "No supplements yet.")}</Card>}
                    {fp.suplementos.map((s: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 rounded-3xl bg-white px-4 py-3.5 shadow-sm">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D7F3EA] text-[#239BA2]">
                          <Sparkles className="h-5 w-5" />
                        </span>
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
                <PrimaryButton color={TEAL} onClick={() => openSheet("add-med", { kind: "med" })}>
                  <Plus className="h-5 w-5" />
                  {t("Agregar medicina o suplemento", "Add medication or supplement")}
                </PrimaryButton>
              </div>
            )}

            {saludView === "ficha" && (
              <div className="space-y-3">
                {[
                  { label: t("Historia y evolución", "History & progress"), value: fp.historia_medica, bg: "bg-[#FAD4DC]", emoji: "📖" },
                  { label: t("Alergias", "Allergies"), value: fp.alergias, bg: "bg-[#FFF1B8]", emoji: "⚠️" },
                  { label: t("Alimentación e hidratación", "Nutrition & hydration"), value: fp.datos_nutricionales, bg: "bg-[#D7F3EA]", emoji: "🥗" },
                ].map((c) => (
                  <div key={c.label} className={`rounded-3xl ${c.bg} p-5`}>
                    <p className="text-xs font-bold text-espresso/65">{c.emoji} {c.label}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-espresso">{c.value || t("Aún sin completar.", "Not filled in yet.")}</p>
                  </div>
                ))}
                <PrimaryButton color={TEAL} onClick={() => openSheet("edit-ficha", { historia: fp.historia_medica || "", alergias: fp.alergias || "", nutricion: fp.datos_nutricionales || "" })}>
                  {t("Editar ficha", "Edit chart")}
                </PrimaryButton>
              </div>
            )}

            {saludView === "documentos" && (
              <div className="space-y-3">
                {fp.documentos_oncologo.length === 0 && <Card className="text-center text-sm text-espresso/60">{t("Sube recetas o notas del oncólogo.", "Upload prescriptions or oncologist notes.")}</Card>}
                {fp.documentos_oncologo.map((d: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 rounded-3xl bg-white p-4 shadow-sm">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FAD4DC] text-[#C94A6A]">
                      <FileText className="h-5 w-5" />
                    </span>
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
                <PrimaryButton color={TEAL} onClick={() => openSheet("add-doc", { tipo: "Receta / Indicaciones del Oncólogo" })}>
                  <Upload className="h-5 w-5" />
                  {t("Subir documento", "Upload document")}
                </PrimaryButton>
              </div>
            )}
          </main>
        )}

        {/* ===================== AGENDA ===================== */}
        {activeTab === "alertas" && (
          <main className="mt-6 space-y-6">
            <div className="animate-fade-in">
              <h2 className="font-serif text-3xl font-bold leading-tight text-espresso">{t("Agenda familiar", "Family schedule")}</h2>
              <p className="mt-1 text-sm text-espresso/60">{t(`Citas de ${patientFirst} y sesiones con sanadores.`, `${patientFirst}'s visits and healer sessions.`)}</p>
            </div>

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
              <PrimaryButton color={TEAL} onClick={() => openSheet("add-cita", { fecha: selectedDay, hora: "09:30 AM" })}>
                <Stethoscope className="h-5 w-5" />
                {t("Nueva cita médica", "New medical visit")}
              </PrimaryButton>
              <PrimaryButton onClick={() => openSheet("book", { healer: String(healers[0]?.id ?? ""), para: "cuidador", modalidad: "online", fecha: selectedDay, gratis: "1" })}>
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
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#6BB1AD] to-[#239BA2] font-serif text-4xl font-bold text-white shadow-lg">{firstName.charAt(0)}</div>
              <h2 className="mt-3 font-serif text-2xl font-bold text-espresso">{user.nombre}</h2>
              <p className="text-xs text-espresso/55">{user.correo}</p>
              <span className="mt-2 inline-block rounded-full bg-[#D7F3EA] px-3 py-1 text-[11px] font-bold text-[#239BA2]">
                {fc?.relacion_familiar || t("Cuidador", "Caregiver")} · {fp.nombre_familia}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { v: streak, l: t("Días de racha", "Day streak") },
                { v: `${doneCount}/${habits.length}`, l: t("Tareas hoy", "Tasks today") },
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
                {
                  icon: UserCog,
                  label: t("Mi ficha de cuidador", "My caregiver profile"),
                  hint: fc?.nivel_experiencia || "",
                  action: () =>
                    openSheet("profile", {
                      relacion: fc?.relacion_familiar || "",
                      nivel: fc?.nivel_experiencia || "Inicial",
                      horarios: fc?.horarios_disponibles || "",
                      areas: fc?.areas_de_interes || "",
                      habitos: fc?.habitos_autocuidado || "",
                    }),
                },
                {
                  icon: Users,
                  label: t("Vínculo con mi paciente", "Link with my patient"),
                  hint: patientInfo.linked ? "✓" : t("Pendiente", "Pending"),
                  action: () => openSheet("patient", { nombre: fp.nombre_paciente || "", correo: fp.correo_invitacion_paciente || "", etapa: fp.etapa_actual }),
                },
                { icon: Phone, label: t("Contactos", "Contacts"), hint: `${fp.contactos_personales.length}`, action: () => openSheet("contacts", { rol: "Oncólogo / Emergencia" }) },
                { icon: Globe, label: t("Idioma", "Language"), hint: isEs ? "Español" : "English", action: () => setLocale(isEs ? "en" : "es") },
                { icon: HelpCircle, label: t("Ayuda y comentarios", "Help & feedback"), hint: data.tickets.length ? `${data.tickets.length}` : "", action: () => openSheet("help", { tipo: "feedback" }) },
              ].map((row, i) => (
                <button key={row.label} type="button" onClick={row.action} className={`flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-[#F2FAF8] ${i > 0 ? "border-t border-espresso/5" : ""}`}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E3F1EF] text-[#239BA2]">
                    <row.icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1 text-sm font-bold text-espresso">{row.label}</span>
                  <span className="text-xs text-espresso/50">{row.hint}</span>
                  <ChevronRight className="h-4 w-4 text-espresso/30" />
                </button>
              ))}
              <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 border-t border-espresso/5 px-5 py-4 text-left text-[#C94A6A] transition hover:bg-[#FCECEE]">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FCECEE]">
                  <LogOut className="h-5 w-5" />
                </span>
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
          <div className="grid grid-cols-2 gap-1.5 rounded-full bg-[#F2FAF8] p-1.5">
            {([["med", t("Medicina", "Medication")], ["sup", t("Suplemento", "Supplement")]] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setForm((p) => ({ ...p, kind: id }))} className={`rounded-full py-2 text-xs font-bold ${fv("kind", "med") === id ? "bg-espresso text-white" : "text-espresso/60"}`}>
                {label}
              </button>
            ))}
          </div>
          <Field label={t("Nombre", "Name")}>
            <input required className={inputCls} value={fv("nombre")} onChange={fs("nombre")} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("Dosis", "Dose")}>
              <input className={inputCls} value={fv("dosis")} onChange={fs("dosis")} placeholder="20 mg" />
            </Field>
            <Field label={t("Hora", "Time")}>
              <input className={inputCls} value={fv("horario")} onChange={fs("horario")} placeholder="8:00 AM" />
            </Field>
          </div>
          {fv("kind", "med") === "med" && (
            <Field label={t("Indicaciones (opcional)", "Instructions (optional)")}>
              <input className={inputCls} value={fv("indicaciones")} onChange={fs("indicaciones")} />
            </Field>
          )}
          <PrimaryButton type="submit" color={TEAL}>{t("Guardar", "Save")}</PrimaryButton>
        </form>
      </Sheet>

      <Sheet open={sheet === "edit-ficha"} onClose={() => setSheet(null)} title={t("Ficha de salud", "Health chart")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await runAction("update_patient_medical_info", { historia_medica: fv("historia"), alergias: fv("alergias"), datos_nutricionales: fv("nutricion") }, t("Ficha actualizada", "Chart updated"));
            if (ok) setSheet(null);
          }}
        >
          <Field label={t("Historia y síntomas observados en casa", "History and symptoms observed at home")}>
            <textarea rows={4} className={inputCls} value={fv("historia")} onChange={fs("historia")} />
          </Field>
          <Field label={t("Alergias", "Allergies")}>
            <input className={inputCls} value={fv("alergias")} onChange={fs("alergias")} />
          </Field>
          <Field label={t("Alimentación e hidratación", "Nutrition & hydration")}>
            <input className={inputCls} value={fv("nutricion")} onChange={fs("nutricion")} />
          </Field>
          <PrimaryButton type="submit" color={TEAL}>{t("Guardar cambios", "Save changes")}</PrimaryButton>
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
          <Field label={t("Título", "Title")}>
            <input required className={inputCls} value={fv("titulo")} onChange={fs("titulo")} />
          </Field>
          <Field label={t("Tipo", "Type")}>
            <select className={inputCls} value={fv("tipo")} onChange={fs("tipo")}>
              <option value="Receta / Indicaciones del Oncólogo">{t("Receta / indicaciones", "Prescription / notes")}</option>
              <option value="Resultado de Laboratorio">{t("Laboratorio", "Lab result")}</option>
              <option value="Estudio de Imagen / Patología">{t("Imagen / patología", "Imaging / pathology")}</option>
            </select>
          </Field>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#239BA2]/40 bg-[#E3F1EF]/60 px-4 py-5 text-sm font-bold text-[#239BA2]">
            <Upload className="h-5 w-5" />
            <span className="truncate">{fv("archivo") || t("Elegir PDF, Word o foto", "Choose PDF, Word or photo")}</span>
            <input type="file" accept=".pdf,.doc,.docx,image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setForm((p) => ({ ...p, archivo: file.name })); }} />
          </label>
          <Field label={t("Lo más importante que dijo el médico", "Key points from the doctor")}>
            <textarea rows={3} className={inputCls} value={fv("notas")} onChange={fs("notas")} />
          </Field>
          <PrimaryButton type="submit" color={TEAL}>{t("Guardar documento", "Save document")}</PrimaryButton>
        </form>
      </Sheet>

      <Sheet open={sheet === "add-cita"} onClose={() => setSheet(null)} title={t("Nueva cita médica", "New medical visit")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await runAction("add_medical_appointment", { titulo: fv("titulo"), fecha: fv("fecha"), hora: fv("hora"), lugar: fv("lugar") || "Clínica Oncológica" }, t("Cita agregada", "Visit added"));
            if (ok) setSheet(null);
          }}
        >
          <Field label={t("Motivo", "Reason")}>
            <input required className={inputCls} value={fv("titulo")} onChange={fs("titulo")} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("Fecha", "Date")}>
              <input required type="date" className={inputCls} value={fv("fecha")} onChange={fs("fecha")} />
            </Field>
            <Field label={t("Hora", "Time")}>
              <input className={inputCls} value={fv("hora")} onChange={fs("hora")} />
            </Field>
          </div>
          <Field label={t("Lugar", "Place")}>
            <input className={inputCls} value={fv("lugar")} onChange={fs("lugar")} />
          </Field>
          <PrimaryButton type="submit" color={TEAL}>{t("Agregar cita", "Add visit")}</PrimaryButton>
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
                asistente_rol: fv("para", "cuidador"),
                modalidad: modal,
                fecha_sesion: new Date(`${fv("fecha")}T10:00:00`).toISOString(),
                es_sesion_gratuita_mensual: fv("gratis") === "1",
                enlace_o_lugar: `${name} · ${modal === "online" ? t("Videollamada", "Video call") : t("Presencial", "In person")}`,
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
                <button key={h.id} type="button" onClick={() => setForm((p) => ({ ...p, healer: String(h.id) }))} className={`flex w-full items-center gap-3 rounded-3xl border-2 p-3.5 text-left transition ${active ? "border-[#239BA2] bg-[#E3F1EF]/70" : "border-transparent bg-[#F2FAF8]"}`}>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6BB1AD] to-[#239BA2] font-serif text-lg font-bold text-white">{name.charAt(0)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-espresso">{name}</span>
                    <span className="block truncate text-xs text-espresso/60">{isEs ? h.short_bio_es : h.short_bio_en || h.short_bio_es}</span>
                  </span>
                  <span className="text-xs font-bold text-[#239BA2]">${h.tarifa_hora_usd}</span>
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-3 gap-1.5 rounded-full bg-[#F2FAF8] p-1.5">
            {([["cuidador", t("Para mí", "For me")], ["paciente", patientFirst], ["ambos", t("Ambos", "Both")]] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setForm((p) => ({ ...p, para: id }))} className={`truncate rounded-full py-2 text-xs font-bold ${fv("para", "cuidador") === id ? "bg-espresso text-white" : "text-espresso/60"}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1.5 rounded-full bg-[#F2FAF8] p-1.5">
            {([["online", "Online"], ["presencial", t("En persona", "In person")]] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setForm((p) => ({ ...p, modalidad: id }))} className={`rounded-full py-2 text-xs font-bold ${fv("modalidad", "online") === id ? "bg-espresso text-white" : "text-espresso/60"}`}>
                {label}
              </button>
            ))}
          </div>
          <Field label={t("Fecha", "Date")}>
            <input required type="date" className={inputCls} value={fv("fecha")} onChange={fs("fecha")} />
          </Field>
          <label className="flex items-center gap-3 rounded-2xl bg-[#E3F1EF] px-4 py-3 text-sm font-semibold text-espresso">
            <input type="checkbox" checked={fv("gratis") === "1"} onChange={(e) => setForm((p) => ({ ...p, gratis: e.target.checked ? "1" : "0" }))} className="h-5 w-5 accent-[#239BA2]" />
            {t("Usar la sesión gratuita del mes", "Use this month's free session")}
          </label>
          <PrimaryButton type="submit" color={TEAL}>{t("Confirmar reserva", "Confirm booking")}</PrimaryButton>
        </form>
      </Sheet>

      <Sheet open={sheet === "profile"} onClose={() => setSheet(null)} title={t("Mi ficha de cuidador", "My caregiver profile")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await runAction(
              "update_caregiver_profile",
              { relacion_familiar: fv("relacion"), nivel_experiencia: fv("nivel"), horarios_disponibles: fv("horarios"), areas_de_interes: fv("areas"), habitos_autocuidado: fv("habitos") },
              t("Ficha actualizada", "Profile updated")
            );
            if (ok) setSheet(null);
          }}
        >
          <Field label={t("Relación con la paciente", "Relationship with patient")}>
            <input className={inputCls} value={fv("relacion")} onChange={fs("relacion")} placeholder={t("Esposo, hija, amiga…", "Partner, daughter, friend…")} />
          </Field>
          <Field label={t("Experiencia como cuidador/a", "Caregiving experience")}>
            <select className={inputCls} value={fv("nivel")} onChange={fs("nivel")}>
              <option value="Inicial">{t("Inicial (primera vez)", "Beginner (first time)")}</option>
              <option value="Intermedio">{t("Intermedio", "Intermediate")}</option>
              <option value="Experimentado">{t("Experimentado", "Experienced")}</option>
            </select>
          </Field>
          <Field label={t("Horarios disponibles", "Available hours")}>
            <input className={inputCls} value={fv("horarios")} onChange={fs("horarios")} />
          </Field>
          <Field label={t("Áreas donde necesito apoyo", "Areas where I need support")}>
            <input className={inputCls} value={fv("areas")} onChange={fs("areas")} />
          </Field>
          <Field label={t("Mis hábitos de autocuidado", "My self-care habits")}>
            <textarea rows={2} className={inputCls} value={fv("habitos")} onChange={fs("habitos")} />
          </Field>
          <PrimaryButton type="submit" color={TEAL}>{t("Guardar", "Save")}</PrimaryButton>
        </form>
      </Sheet>

      <Sheet open={sheet === "patient"} onClose={() => setSheet(null)} title={t("Vínculo con mi paciente", "Link with my patient")}>
        {patientInfo.linked && (
          <div className="mb-4 rounded-3xl bg-[#E3F1EF] p-4 text-sm text-espresso">
            <p className="font-bold">✓ {t("Vinculados 1 a 1 con", "Linked 1-to-1 with")} {patientInfo.nombre}</p>
            <p className="mt-1 text-xs text-espresso/65">{patientInfo.correo}</p>
          </div>
        )}
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await runAction("invite_patient", { nombre: fv("nombre"), correo: fv("correo"), etapa_actual: fv("etapa") }, t("Datos guardados e invitación enviada", "Details saved and invitation sent"));
            if (ok) setSheet(null);
          }}
        >
          <p className="text-sm text-espresso/70">{t("Si tu paciente está sin energía, deja listos sus datos y envíale el enlace para activar su cuenta.", "If your patient is low on energy, set up her details and send her the link to activate her account.")}</p>
          <Field label={t("Nombre de la paciente", "Patient name")}>
            <input required className={inputCls} value={fv("nombre")} onChange={fs("nombre")} />
          </Field>
          <Field label={t("Correo de la paciente", "Patient email")}>
            <input required type="email" className={inputCls} value={fv("correo")} onChange={fs("correo")} />
          </Field>
          <Field label={t("Etapa", "Stage")}>
            <select className={inputCls} value={fv("etapa")} onChange={fs("etapa")}>
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>{isEs ? s.es : s.en}</option>
              ))}
            </select>
          </Field>
          <PrimaryButton type="submit" color={TEAL}>
            <Send className="h-4 w-4" />
            {t("Guardar y enviar invitación", "Save & send invitation")}
          </PrimaryButton>
        </form>
      </Sheet>

      <Sheet open={sheet === "contacts"} onClose={() => setSheet(null)} title={t("Contactos", "Contacts")}>
        <div className="space-y-2.5">
          {fp.contactos_personales.map((c: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 rounded-2xl bg-[#F2FAF8] px-4 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D7F3EA] text-[#239BA2]"><Phone className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-espresso">{c.nombre}</p>
                <p className="truncate text-xs text-espresso/60">{c.rol} · {c.telefono}</p>
              </div>
              <button type="button" onClick={() => runAction("delete_contact", { index: idx }, t("Contacto eliminado", "Removed"))} className="text-espresso/35 hover:text-[#C94A6A]" aria-label={t("Eliminar", "Delete")}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await runAction("add_contact", { nombre: fv("nombre"), rol: fv("rol"), telefono: fv("telefono") }, t("Contacto guardado", "Contact saved"));
            if (ok) setForm({ rol: "Oncólogo / Emergencia" });
          }}
        >
          <input required className={inputCls} placeholder={t("Nombre", "Name")} value={fv("nombre")} onChange={fs("nombre")} />
          <div className="grid grid-cols-2 gap-3">
            <input className={inputCls} placeholder={t("Rol", "Role")} value={fv("rol")} onChange={fs("rol")} />
            <input className={inputCls} placeholder={t("Teléfono", "Phone")} value={fv("telefono")} onChange={fs("telefono")} />
          </div>
          <PrimaryButton type="submit" color={TEAL}>
            <Plus className="h-4 w-4" />
            {t("Agregar contacto", "Add contact")}
          </PrimaryButton>
        </form>
      </Sheet>

      <Sheet open={sheet === "consult"} onClose={() => setSheet(null)} title={t("Resumen para la cita", "Summary for the visit")}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-1.5 rounded-full bg-[#F2FAF8] p-1.5">
            {([["medico", `🩺 ${t("Médico", "Doctor")}`], ["sanador", `✨ ${t("Sanador", "Healer")}`]] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => openConsult(id)} className={`rounded-full py-2 text-xs font-bold ${consult?.audience === id ? "bg-espresso text-white" : "text-espresso/60"}`}>
                {label}
              </button>
            ))}
          </div>
          {consult?.loading ? (
            <div className="py-8 text-center text-sm font-semibold text-espresso/70">
              {t("PONO IA está preparando el resumen…", "PONO AI is preparing the summary…")}
            </div>
          ) : (
            <>
              <pre className="whitespace-pre-wrap rounded-3xl bg-[#F2FAF8] p-4 font-sans text-xs leading-relaxed text-espresso">
                {consult?.summary}
              </pre>
              {consult?.questions?.length > 0 && (
                <div className="rounded-3xl bg-[#FFF6D6] p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#8A6A00]">
                    {t("Preguntas sugeridas para el médico / sanador", "Suggested questions")}
                  </p>
                  <ul className="mt-2 space-y-1.5 text-xs text-espresso/85">
                    {consult.questions.map((q: string, i: number) => (
                      <li key={i}>• {q}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(consult?.summary || "");
                    showToast(t("Resumen copiado", "Summary copied"));
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border border-espresso/15 py-3 text-sm font-bold text-espresso/75"
                >
                  <Copy className="h-4 w-4" />
                  {t("Copiar", "Copy")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share)
                      navigator.share({ title: "Love Heals Effect", text: consult?.summary || "" }).catch(() => {});
                    else {
                      navigator.clipboard?.writeText(consult?.summary || "");
                      showToast(t("Resumen copiado", "Summary copied"));
                    }
                  }}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#239BA2] py-3 text-sm font-bold text-white"
                >
                  <Share2 className="h-4 w-4" />
                  {t("Compartir", "Share")}
                </button>
              </div>
            </>
          )}
        </div>
      </Sheet>

      <Sheet open={sheet === "bitacora"} onClose={() => setSheet(null)} title={t("Agregar a la bitácora", "Add to journal")}>
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
                etiquetas: fv("etiquetas")
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),
                origen: fv("origen") === "ia" ? "ia" : "cuidador",
              },
              t("Guardado en la bitácora de la paciente", "Saved to patient's journal")
            );
            if (ok) setSheet(null);
          }}
        >
          <div className="rounded-3xl bg-[#E3F1EF] p-4">
            <p className="flex items-center gap-1.5 text-xs font-bold text-[#239BA2]">
              <Sparkles className="h-3.5 w-3.5" />
              {t("Cuenta con tus palabras qué pasó y PONO lo organiza", "Describe what happened in your own words and PONO organizes it")}
            </p>
            <textarea
              rows={3}
              className={`${inputCls} mt-2`}
              value={fv("relato")}
              onChange={fs("relato")}
              placeholder={t("Ej. Hoy fuimos con el Dr. Lee, ajustó la dosis y por la tarde tuvo cansancio…", "E.g. Today we saw Dr. Lee, he adjusted the dose and she felt tired in the afternoon…")}
            />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={toggleVoice}
                className={`flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold ${recording ? "animate-pulse bg-[#C94A6A] text-white" : "bg-white text-[#239BA2]"}`}
              >
                {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {recording ? t("Detener", "Stop") : t("Dictar", "Dictate")}
              </button>
              <button
                type="button"
                disabled={organizing}
                onClick={organizeWithAI}
                className="flex items-center justify-center gap-2 rounded-full bg-[#239BA2] py-2.5 text-xs font-bold text-white disabled:opacity-60"
              >
                <Sparkles className={`h-4 w-4 ${organizing ? "animate-spin" : ""}`} />
                {organizing ? t("Organizando…", "Organizing…") : t("Organizar con PONO", "Organize with PONO")}
              </button>
            </div>
          </div>
          <Field label={t("Título", "Title")}>
            <input className={inputCls} value={fv("titulo")} onChange={fs("titulo")} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("Médico", "Doctor")}>
              <input className={inputCls} value={fv("medico")} onChange={fs("medico")} />
            </Field>
            <Field label={t("Fecha", "Date")}>
              <input type="date" className={inputCls} value={fv("fecha", todayKey())} onChange={fs("fecha")} />
            </Field>
          </div>
          <Field label={t("Detalle", "Details")}>
            <textarea rows={2} className={inputCls} value={fv("detalle")} onChange={fs("detalle")} />
          </Field>
          <PrimaryButton type="submit" color={TEAL}>{t("Guardar en bitácora", "Save to journal")}</PrimaryButton>
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
          <div className="grid grid-cols-3 gap-1.5 rounded-full bg-[#F2FAF8] p-1.5">
            {([["feedback", t("Idea", "Idea")], ["soporte", t("Ayuda", "Help")], ["bug", t("Problema", "Problem")]] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setForm((p) => ({ ...p, tipo: id }))} className={`rounded-full py-2 text-xs font-bold ${fv("tipo", "feedback") === id ? "bg-espresso text-white" : "text-espresso/60"}`}>
                {label}
              </button>
            ))}
          </div>
          <input required className={inputCls} placeholder={t("Asunto", "Subject")} value={fv("asunto")} onChange={fs("asunto")} />
          <textarea required rows={3} className={inputCls} placeholder={t("Cuéntanos más…", "Tell us more…")} value={fv("descripcion")} onChange={fs("descripcion")} />
          <PrimaryButton type="submit" color={TEAL}>
            <Send className="h-4 w-4" />
            {t("Enviar", "Send")}
          </PrimaryButton>
        </form>
      </Sheet>
    </div>
  );
}

export function CuidadorDashboard() {
  return (
    <Suspense fallback={null}>
      <CuidadorDashboardInner />
    </Suspense>
  );
}

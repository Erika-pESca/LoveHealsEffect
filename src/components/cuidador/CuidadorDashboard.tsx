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

import { TEAL, CMOODS } from "./types";
import { InicioSection } from "./InicioSection";
import { AutocuidadoSection } from "./AutocuidadoSection";
import { FichaPacienteSection } from "./FichaPacienteSection";
import { AgendaSection } from "./AgendaSection";
import { PerfilSection } from "./PerfilSection";

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
    payload: Record<string, any> = {}, message: string = "",
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
          <InicioSection
            t={t}
            isEs={isEs}
            patientFirst={patientFirst}
            stage={stage}
            fc={fc}
            fp={fp}
            goToTab={goToTab}
            runAction={runAction}
            currentMood={currentMood}
            updateDaily={updateDaily}
            suggested={suggested}
            setPlayerItem={setPlayerItem}
            setSheet={setSheet}
            doneCount={doneCount}
            habits={habits}
            progressPct={progressPct}
            todayHabits={todayHabits}
            streak={streak}
            weekDays={weekDays}
            upcoming={upcoming}
            fmtDate={fmtDate}
          />
        )}

        {/* ===================== AUTOCUIDADO ===================== */}
        {activeTab === "autocuidado" && (
          <AutocuidadoSection
            t={t}
            isEs={isEs}
            runAction={runAction}
            resourceFilter={resourceFilter}
            setResourceFilter={setResourceFilter}
            filteredResources={filteredResources}
            setPlayerItem={setPlayerItem}
            setSheet={setSheet}
            fmtDate={fmtDate}
          />
        )}

        {/* ===================== FICHA DE LA PACIENTE ===================== */}
        {activeTab === "salud-paciente" && (
          <FichaPacienteSection
            t={t}
            patientFirst={patientFirst}
            openConsult={openConsult}
            saludView={saludView}
            setSaludView={setSaludView}
            openSheet={openSheet}
            fp={fp}
            fmtDate={fmtDate}
            runAction={runAction}
            todayHabits={todayHabits}
            updateDaily={updateDaily}
          />
        )}

        {/* ===================== AGENDA ===================== */}
        {activeTab === "alertas" && (
          <AgendaSection
            t={t}
            isEs={isEs}
            patientFirst={patientFirst}
            marks={marks}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            fmtDate={fmtDate}
            eventsByDay={eventsByDay}
            runAction={runAction}
            openSheet={openSheet}
            healers={healers}
          />
        )}

        {/* ===================== PERFIL ===================== */}
        {activeTab === "perfil" && (
          <PerfilSection
            t={t}
            isEs={isEs}
            setLocale={setLocale}
            firstName={firstName}
            user={user}
            fc={fc}
            fp={fp}
            streak={streak}
            doneCount={doneCount}
            habits={habits}
            upcoming={upcoming}
            openSheet={openSheet}
            patientInfo={patientInfo}
            data={data}
            handleLogout={handleLogout}
          />
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

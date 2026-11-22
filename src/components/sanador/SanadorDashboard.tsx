"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  CalendarHeart,
  Check,
  ChevronRight,
  Globe,
  HelpCircle,
  LogOut,
  Mic,
  MicOff,
  Music,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Upload,
  UserCog,
  Users,
  Video,
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
import { STAGES, todayKey, TYPE_META } from "@/components/paciente/PacienteDashboard";

import { CORAL } from "./types";
import { InicioSection } from "./InicioSection";
import { PacientesSection } from "./PacientesSection";
import { ContenidosSection } from "./ContenidosSection";
import { AgendaSection } from "./AgendaSection";
import { PerfilSection } from "./PerfilSection";

function SanadorDashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, setLocale } = useLanguage();
  const isEs = locale === "es";
  const t = (es: string, en: string) => (isEs ? es : en);

  const activeTab = searchParams.get("tab") || "inicio";

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [sheet, setSheet] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [patientId, setPatientId] = useState<number | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [recording, setRecording] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<"programada" | "completada" | "todas">("programada");

  const fv = (k: string, d = "") => form[k] ?? d;
  const fs =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));
  const openSheet = (name: string, initial: Record<string, string> = {}) => {
    setForm(initial);
    setErrorMsg(null);
    setSheet(name);
  };
  const showToast = (msg: string) => {
    setToast(msg);
    setErrorMsg(null);
    setTimeout(() => setToast(null), 3200);
  };

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/sanador/dashboard");
      const json = await res.json();
      if (json.ok) setData(json);
    } catch (err) {
      console.error("Error cargando portal sanador:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const runAction = async (action: string, payload: Record<string, any>, message: string) => {
    try {
      setErrorMsg(null);
      const res = await fetch("/api/sanador/dashboard", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setErrorMsg(json.error || t("No se pudo completar la acción", "Could not complete the action"));
        return false;
      }
      if (message) showToast(message);
      await fetchDashboard();
      return true;
    } catch (err) {
      console.error("Error en acción sanador:", err);
      return false;
    }
  };

  /** Dictado de voz a texto (Web Speech API; simulación si el navegador no la soporta). */
  const toggleVoice = () => {
    if (recording) {
      setRecording(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const append = (txt: string) =>
      setForm((p) => ({ ...p, transcripcion: p.transcripcion ? `${p.transcripcion} ${txt}` : txt }));

    if (SR) {
      const rec = new SR();
      rec.lang = isEs ? "es-ES" : "en-US";
      rec.continuous = false;
      rec.interimResults = false;
      rec.onstart = () => setRecording(true);
      rec.onresult = (ev: any) => {
        const txt = ev.results?.[0]?.[0]?.transcript || "";
        if (txt) append(txt);
      };
      rec.onerror = () => setRecording(false);
      rec.onend = () => setRecording(false);
      rec.start();
    } else {
      setRecording(true);
      setTimeout(() => {
        setRecording(false);
        append(
          isEs
            ? "[Transcripción de voz] Paciente receptiva durante la respiración y el movimiento BAM. Se recomienda hidratación alcalina y cuencos antes de dormir."
            : "[Voice transcript] Patient receptive during breathwork and BAM movement. Alkaline hydration and sound bowls before sleep recommended."
        );
      }, 1500);
    }
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
    router.push(tabId === "inicio" ? "/sanador" : `/sanador?tab=${tabId}`, { scroll: false });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ----------------------- Derivados ----------------------- */
  const fichas: any[] = data?.fichas || [];
  const sessions: any[] = data?.sessions || [];
  const published: any[] = data?.publishedItems || [];
  const profiles: any[] = data?.healerProfiles || [];

  const patientOf = (fichaId: number) => fichas.find((f) => f.id === fichaId);

  const programmed = useMemo(
    () =>
      sessions
        .filter((s) => s.estado_cita === "programada")
        .sort((a, b) => String(a.fecha_sesion).localeCompare(String(b.fecha_sesion))),
    [sessions]
  );
  const todayCount = programmed.filter((s) => String(s.fecha_sesion).slice(0, 10) === todayKey()).length;

  const paidCount = sessions.filter((s) => !s.es_sesion_gratuita_mensual && s.estado_cita !== "cancelada").length;
  const gross = paidCount * 85;
  const fee = Math.round(gross * 0.15 * 100) / 100;

  const fmtDate = (d: string) =>
    new Date(`${String(d).slice(0, 10)}T12:00:00`).toLocaleDateString(isEs ? "es-ES" : "en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF5F0] px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-[#F7A27F] to-[#D85678] text-2xl text-white shadow-lg">✨</div>
          <p className="font-serif text-lg font-bold text-espresso">{t("Preparando tu portal…", "Preparing your portal…")}</p>
        </div>
      </div>
    );
  }

  const activePatient = patientId ? patientOf(patientId) : null;
  const visibleSessions = sessions
    .filter((s) => bookingFilter === "todas" || s.estado_cita === bookingFilter)
    .sort((a, b) => String(a.fecha_sesion).localeCompare(String(b.fecha_sesion)));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("Buenos días", "Good morning") : hour < 19 ? t("Buenas tardes", "Good afternoon") : t("Buenas noches", "Good evening");

  const openLog = (fichaId?: number, sessionId?: number) =>
    openSheet("log", {
      ficha: String(fichaId ?? fichas[0]?.id ?? 1),
      sesion: sessionId ? String(sessionId) : "",
      modalidad: "online",
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFEDE4] via-[#FFF9F5] to-[#EAF6F4] pb-44">
      <Toast message={toast} />
      {errorMsg && (
        <div className="fixed left-1/2 top-5 z-[70] flex max-w-[92vw] -translate-x-1/2 animate-fade-in items-center gap-2 rounded-2xl border border-[#C94A6A]/30 bg-white px-4 py-3 text-xs font-bold text-[#9E2A47] shadow-[0_12px_30px_rgba(38,35,34,0.16)]">
          <span className="flex-1">{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} aria-label="Cerrar">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mx-auto max-w-2xl px-5">
        {/* ENCABEZADO */}
        <header className="flex items-center justify-between pt-7">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => goToTab("perfil")}
              className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${CORAL} text-white shadow-md`}
              aria-label={t("Mi perfil", "My profile")}
            >
              <Sparkles className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-medium text-espresso/55">{greeting}</p>
              <h1 className="font-serif text-2xl font-bold leading-tight text-espresso">Aloha, Omar &amp; Kelsie ✨</h1>
            </div>
          </div>
          <div className="inline-flex items-center rounded-full bg-white p-0.5 text-[10px] font-bold shadow-sm">
            {(["en", "es"] as const).map((l) => (
              <button key={l} type="button" onClick={() => setLocale(l)} className={`rounded-full px-2.5 py-1.5 transition ${locale === l ? "bg-espresso text-white" : "text-espresso/55"}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {/* ===================== INICIO ===================== */}
        {activeTab === "inicio" && (
          <InicioSection
            t={t}
            isEs={isEs}
            todayCount={todayCount}
            programmed={programmed}
            openLog={openLog}
            fichas={fichas}
            published={published}
            goToTab={goToTab}
            patientOf={patientOf}
            setPatientId={setPatientId}
            openSheet={openSheet}
            fmtDate={fmtDate}
          />
        )}

        {/* ===================== PACIENTES ===================== */}
        {activeTab === "pacientes" && (
          <PacientesSection
            t={t}
            isEs={isEs}
            fichas={fichas}
            setPatientId={setPatientId}
            openSheet={openSheet}
          />
        )}

        {/* ===================== CONTENIDOS ===================== */}
        {activeTab === "contenidos" && (
          <ContenidosSection
            t={t}
            isEs={isEs}
            openSheet={openSheet}
            published={published}
            runAction={runAction}
          />
        )}

        {/* ===================== RESERVAS ===================== */}
        {activeTab === "alertas" && (
          <AgendaSection
            t={t}
            isEs={isEs}
            sessions={sessions}
            gross={gross}
            fee={fee}
            bookingFilter={bookingFilter}
            setBookingFilter={setBookingFilter}
            visibleSessions={visibleSessions}
            patientOf={patientOf}
            fmtDate={fmtDate}
            openLog={openLog}
            runAction={runAction}
          />
        )}

        {/* ===================== PERFIL ===================== */}
        {activeTab === "perfil" && (
          <PerfilSection
            t={t}
            isEs={isEs}
            data={data}
            profiles={profiles}
            openSheet={openSheet}
            setLocale={setLocale}
            handleLogout={handleLogout}
          />
        )}
      </div>

      {/* ===================== HOJAS ===================== */}

      {/* Ficha del paciente + PONO IA */}
      <Sheet open={sheet === "patient" && !!activePatient} onClose={() => setSheet(null)}>
        {activePatient && (
          <div className="-mt-2 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#F48EA6] to-[#B03052] font-serif text-xl font-bold text-white">
                {(activePatient.nombre_paciente || "P").charAt(0)}
              </span>
              <div>
                <h3 className="font-serif text-xl font-bold text-espresso">{activePatient.nombre_paciente}</h3>
                <p className="text-xs text-espresso/60">
                  {(STAGES.find((s) => s.id === activePatient.etapa_actual) || STAGES[0])[isEs ? "es" : "en"]} ·{" "}
                  {activePatient.caregiverName || t("sin cuidador", "no caregiver")}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-[#239BA2]/25 bg-gradient-to-br from-[#E7F2F1] to-white p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#239BA2]">
                  <Sparkles className="h-3.5 w-3.5" />
                  PONO IA · {t("resumen pre-sesión", "pre-session summary")}
                </span>
                <button
                  type="button"
                  disabled={regenerating}
                  onClick={async () => {
                    setRegenerating(true);
                    await runAction("regenerate_pono_summary", { ficha_paciente_id: activePatient.id }, t("Resumen actualizado", "Summary updated"));
                    setRegenerating(false);
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-[#239BA2] px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-60"
                >
                  <RefreshCw className={`h-3 w-3 ${regenerating ? "animate-spin" : ""}`} />
                  {t("Regenerar", "Regenerate")}
                </button>
              </div>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-xs leading-relaxed text-espresso">{activePatient.resumen_ia_pono}</pre>
            </div>

            {(activePatient.medicamentos_y_horarios.length > 0 || activePatient.suplementos.length > 0) && (
              <div>
                <p className="mb-2 text-xs font-bold text-espresso/60">{t("Medicinas y suplementos", "Medications & supplements")}</p>
                <div className="flex flex-wrap gap-2">
                  {activePatient.medicamentos_y_horarios.map((m: any, i: number) => (
                    <span key={`m${i}`} className="rounded-full bg-[#FAD4DC] px-3 py-1.5 text-xs font-bold text-espresso">💊 {m.nombre} · {m.horario}</span>
                  ))}
                  {activePatient.suplementos.map((s: any, i: number) => (
                    <span key={`s${i}`} className="rounded-full bg-[#D7F3EA] px-3 py-1.5 text-xs font-bold text-espresso">🌿 {s.nombre}</span>
                  ))}
                </div>
              </div>
            )}

            {activePatient.documentos_oncologo.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold text-espresso/60">{t("Documentos del oncólogo", "Oncologist documents")}</p>
                <div className="space-y-2">
                  {activePatient.documentos_oncologo.map((d: any, i: number) => (
                    <div key={i} className="rounded-2xl bg-[#FAF7F2] px-4 py-2.5 text-xs">
                      <p className="font-bold text-espresso">📄 {d.titulo}</p>
                      {d.notas && <p className="text-espresso/65">{d.notas}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs font-bold text-espresso/60">{t("Historial de sesiones", "Session history")}</p>
              <div className="space-y-2">
                {(activePatient.sessions || []).length === 0 && <p className="text-xs text-espresso/55">{t("Primera sesión con ella.", "First session with her.")}</p>}
                {(activePatient.sessions || []).map((s: any) => (
                  <div key={s.id} className="rounded-2xl bg-[#FAF7F2] px-4 py-2.5 text-xs">
                    <div className="flex justify-between font-bold text-espresso">
                      <span className="truncate">{s.enlace_o_lugar}</span>
                      <span className="text-[#239BA2]">{String(s.fecha_sesion).slice(0, 10)}</span>
                    </div>
                    {s.estado_observado_paciente && <p className="mt-1 text-espresso/70"><strong>{t("Estado", "State")}:</strong> {s.estado_observado_paciente}</p>}
                    {s.recomendaciones_dadas && <p className="text-espresso/70"><strong>{t("Recomendó", "Advised")}:</strong> {s.recomendaciones_dadas}</p>}
                  </div>
                ))}
              </div>
            </div>

            <PrimaryButton color={CORAL} onClick={() => openLog(activePatient.id)}>
              <Mic className="h-4 w-4" />
              {t("Registrar bitácora de esta paciente", "Log a session for this patient")}
            </PrimaryButton>
          </div>
        )}
      </Sheet>

      {/* Bitácora post-sesión */}
      <Sheet open={sheet === "log"} onClose={() => setSheet(null)} title={t("Bitácora post-sesión", "Post-session log")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await runAction(
              "save_post_session_log",
              {
                ficha_paciente_id: Number(fv("ficha")),
                session_id: fv("sesion") || null,
                modalidad: fv("modalidad", "online"),
                estado_observado_paciente: fv("estado"),
                patrones_detectados: fv("patrones"),
                recomendaciones_dadas: fv("recomendaciones"),
                transcripcion_o_notas: fv("transcripcion"),
                archivo_adjunto_url: fv("archivo"),
              },
              t("Bitácora guardada y PONO IA actualizada", "Log saved and PONO AI updated")
            );
            if (ok) setSheet(null);
          }}
        >
          <Field label={t("Paciente", "Patient")}>
            <select className={inputCls} value={fv("ficha")} onChange={(e) => setForm((p) => ({ ...p, ficha: e.target.value, sesion: "" }))}>
              {fichas.map((f) => (
                <option key={f.id} value={f.id}>{f.nombre_paciente}</option>
              ))}
            </select>
          </Field>
          <Field label={t("Cita programada (opcional)", "Booked session (optional)")}>
            <select className={inputCls} value={fv("sesion")} onChange={fs("sesion")}>
              <option value="">{t("— Sesión directa nueva —", "— New direct session —")}</option>
              {sessions
                .filter((s) => String(s.ficha_paciente_id) === fv("ficha"))
                .map((s) => (
                  <option key={s.id} value={s.id}>{String(s.fecha_sesion).slice(0, 10)} · {s.enlace_o_lugar}</option>
                ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-1.5 rounded-full bg-[#FAF7F2] p-1.5">
            {([["online", "Online"], ["presencial", t("En persona", "In person")]] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setForm((p) => ({ ...p, modalidad: id }))} className={`rounded-full py-2 text-xs font-bold ${fv("modalidad", "online") === id ? "bg-espresso text-white" : "text-espresso/60"}`}>
                {label}
              </button>
            ))}
          </div>
          <Field label={t("¿Cómo la viste hoy?", "How did she seem today?")}>
            <input required className={inputCls} value={fv("estado")} onChange={fs("estado")} placeholder={t("Más tranquila, leve fatiga…", "Calmer, mild fatigue…")} />
          </Field>
          <Field label={t("Patrones o bloqueos", "Patterns or blocks")}>
            <input className={inputCls} value={fv("patrones")} onChange={fs("patrones")} />
          </Field>
          <Field label={t("Recomendaciones que dejaste", "Recommendations given")}>
            <input required className={inputCls} value={fv("recomendaciones")} onChange={fs("recomendaciones")} />
          </Field>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-bold text-espresso/80">{t("Transcripción o notas (alimenta a PONO IA)", "Transcript or notes (feeds PONO AI)")}</span>
            </div>
            <button
              type="button"
              onClick={toggleVoice}
              className={`mb-2 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold transition ${recording ? "animate-pulse bg-[#C94A6A] text-white" : "border border-[#D85678]/40 bg-[#FCECEE] text-[#C94A6A]"}`}
            >
              {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {recording ? t("Escuchando… toca para detener", "Listening… tap to stop") : t("Dictar con la voz", "Dictate with voice")}
            </button>
            <textarea rows={3} className={inputCls} value={fv("transcripcion")} onChange={fs("transcripcion")} placeholder={t("Dicta o pega aquí la transcripción…", "Dictate or paste the transcript here…")} />
          </div>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#D85678]/40 bg-[#FCECEE]/50 px-4 py-4 text-sm font-bold text-[#C94A6A]">
            <Upload className="h-5 w-5" />
            <span className="truncate">{fv("archivo") || t("Subir Word, PDF o audio", "Upload Word, PDF or audio")}</span>
            <input type="file" accept=".pdf,.doc,.docx,.mp3,.wav,.m4a" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setForm((p) => ({ ...p, archivo: file.name })); }} />
          </label>
          <PrimaryButton type="submit" color={CORAL}>
            <Check className="h-4 w-4" />
            {t("Guardar y actualizar PONO IA", "Save & update PONO AI")}
          </PrimaryButton>
        </form>
      </Sheet>

      {/* Publicar recurso / evento */}
      <Sheet open={sheet === "publish"} onClose={() => setSheet(null)} title={t("Publicar", "Publish")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await runAction(
              "create_content",
              {
                tipo_contenido: fv("tipo", "video_bam"),
                publico_objetivo: fv("publico", "ambos"),
                titulo_es: fv("tituloEs"),
                titulo_en: fv("tituloEn") || fv("tituloEs"),
                descripcion_es: fv("desc"),
                media_url: fv("url") || "https://www.youtube.com",
                fecha_evento: fv("fecha") || null,
                es_gratuito: true,
              },
              t("¡Publicado en la comunidad!", "Published to the community!")
            );
            if (ok) setSheet(null);
          }}
        >
          <Field label={t("Tipo", "Type")}>
            <select className={inputCls} value={fv("tipo", "video_bam")} onChange={fs("tipo")}>
              <option value="video_bam">Video BAM</option>
              <option value="meditacion_audio">{t("Meditación guiada", "Guided meditation")}</option>
              <option value="musicoterapia">{t("Musicoterapia / cuencos", "Music therapy / bowls")}</option>
              <option value="guia_autocuidado">{t("Guía / nutrición", "Guide / nutrition")}</option>
              <option value="love_circle">Love Circle</option>
              <option value="workshop">Workshop</option>
            </select>
          </Field>
          <div className="grid grid-cols-3 gap-1.5 rounded-full bg-[#FAF7F2] p-1.5">
            {([["ambos", t("Todos", "Everyone")], ["paciente", t("Pacientes", "Patients")], ["cuidador", t("Cuidadores", "Caregivers")]] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setForm((p) => ({ ...p, publico: id }))} className={`rounded-full py-2 text-xs font-bold ${fv("publico", "ambos") === id ? "bg-espresso text-white" : "text-espresso/60"}`}>
                {label}
              </button>
            ))}
          </div>
          <Field label={t("Título (español)", "Title (Spanish)")}>
            <input required className={inputCls} value={fv("tituloEs")} onChange={fs("tituloEs")} />
          </Field>
          <Field label={t("Título (inglés)", "Title (English)")}>
            <input className={inputCls} value={fv("tituloEn")} onChange={fs("tituloEn")} />
          </Field>
          <Field label={t("Enlace (YouTube, Spotify, Zoom, PDF)", "Link (YouTube, Spotify, Zoom, PDF)")}>
            <input className={inputCls} value={fv("url")} onChange={fs("url")} placeholder="https://" />
          </Field>
          {["workshop", "love_circle"].includes(fv("tipo", "video_bam")) && (
            <Field label={t("Fecha y hora del evento", "Event date & time")}>
              <input type="datetime-local" className={inputCls} value={fv("fecha")} onChange={fs("fecha")} />
            </Field>
          )}
          <Field label={t("Descripción breve", "Short description")}>
            <textarea rows={2} className={inputCls} value={fv("desc")} onChange={fs("desc")} />
          </Field>
          <PrimaryButton type="submit" color={CORAL}>{t("Publicar", "Publish")}</PrimaryButton>
        </form>
      </Sheet>

      {/* Ficha pública */}
      <Sheet open={sheet === "profile"} onClose={() => setSheet(null)} title={t("Ficha pública", "Public profile")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await runAction(
              "update_healer_profile",
              { id: Number(fv("id")), especialidad: fv("especialidad"), short_bio_es: fv("bioEs"), short_bio_en: fv("bioEn"), tarifa_hora_usd: fv("tarifa"), modalidades: fv("modalidades", "ambas") },
              t("Ficha actualizada", "Profile updated")
            );
            if (ok) setSheet(null);
          }}
        >
          <Field label={t("Nombre y especialidad", "Name & specialty")}>
            <input className={inputCls} value={fv("especialidad")} onChange={fs("especialidad")} />
          </Field>
          <Field label={t("Tarifa por hora (USD)", "Hourly rate (USD)")}>
            <input type="number" className={inputCls} value={fv("tarifa")} onChange={fs("tarifa")} />
          </Field>
          <Field label="Short bio (ES)">
            <textarea rows={2} className={inputCls} value={fv("bioEs")} onChange={fs("bioEs")} />
          </Field>
          <Field label="Short bio (EN)">
            <textarea rows={2} className={inputCls} value={fv("bioEn")} onChange={fs("bioEn")} />
          </Field>
          <PrimaryButton type="submit" color={CORAL}>{t("Guardar", "Save")}</PrimaryButton>
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
          <div className="grid grid-cols-3 gap-1.5 rounded-full bg-[#FAF7F2] p-1.5">
            {([["feedback", t("Idea", "Idea")], ["soporte", t("Ayuda", "Help")], ["bug", t("Problema", "Problem")]] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setForm((p) => ({ ...p, tipo: id }))} className={`rounded-full py-2 text-xs font-bold ${fv("tipo", "feedback") === id ? "bg-espresso text-white" : "text-espresso/60"}`}>
                {label}
              </button>
            ))}
          </div>
          <input required className={inputCls} placeholder={t("Asunto", "Subject")} value={fv("asunto")} onChange={fs("asunto")} />
          <textarea required rows={3} className={inputCls} placeholder={t("Cuéntanos más…", "Tell us more…")} value={fv("descripcion")} onChange={fs("descripcion")} />
          <PrimaryButton type="submit" color={CORAL}>
            <Send className="h-4 w-4" />
            {t("Enviar", "Send")}
          </PrimaryButton>
        </form>
      </Sheet>
    </div>
  );
}

export function SanadorDashboard() {
  return (
    <Suspense fallback={null}>
      <SanadorDashboardInner />
    </Suspense>
  );
}

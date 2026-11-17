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

const CORAL = "from-[#F7A27F] via-[#EE7C86] to-[#D85678]";

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
          <main className="mt-6 space-y-7">
            <section className="animate-fade-in">
              <div className={`relative overflow-hidden rounded-[32px] bg-gradient-to-br ${CORAL} p-6 text-white shadow-[0_14px_34px_rgba(216,86,120,0.3)]`}>
                <span className="absolute -right-1 top-3 select-none text-7xl opacity-90">🌺</span>
                <span className="inline-block rounded-full bg-white/25 px-3 py-1 text-[11px] font-bold">{t("Tu agenda", "Your agenda")}</span>
                <h2 className="mt-3 max-w-[70%] font-serif text-3xl font-bold leading-tight">
                  {todayCount > 0
                    ? t(`${todayCount} sesión${todayCount > 1 ? "es" : ""} hoy`, `${todayCount} session${todayCount > 1 ? "s" : ""} today`)
                    : t("Hoy sin sesiones", "No sessions today")}
                </h2>
                <p className="mt-1 text-xs font-semibold text-white/85">
                  {programmed.length} {t("programadas en total", "scheduled in total")}
                </p>
                <button
                  type="button"
                  onClick={() => openLog()}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#D85678] shadow-lg transition active:scale-95"
                >
                  <Mic className="h-4 w-4" />
                  {t("Registrar bitácora", "Record session log")}
                </button>
              </div>
            </section>

            <section className="grid grid-cols-3 gap-3">
              {[
                { v: fichas.length, l: t("Pacientes", "Patients"), bg: "bg-[#FAD4DC]" },
                { v: programmed.length, l: t("Programadas", "Scheduled"), bg: "bg-[#D7F3EA]" },
                { v: published.length, l: t("Recursos", "Resources"), bg: "bg-[#FFF1B8]" },
              ].map((s) => (
                <div key={s.l} className={`rounded-3xl ${s.bg} py-4 text-center`}>
                  <div className="font-serif text-3xl font-bold text-espresso">{s.v}</div>
                  <div className="text-[11px] font-bold text-espresso/60">{s.l}</div>
                </div>
              ))}
            </section>

            <section>
              <SectionTitle title={t("Próximas sesiones", "Upcoming sessions")} action={t("Ver todas", "See all")} onAction={() => goToTab("alertas")} />
              <div className="space-y-2.5">
                {programmed.length === 0 && <Card className="text-center text-sm text-espresso/60">{t("No hay sesiones programadas. 🌿", "No sessions scheduled. 🌿")}</Card>}
                {programmed.slice(0, 4).map((s) => {
                  const p = patientOf(s.ficha_paciente_id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setPatientId(s.ficha_paciente_id);
                        openSheet("patient");
                      }}
                      className="flex w-full items-center gap-3 rounded-3xl bg-white px-4 py-3.5 text-left shadow-sm transition active:scale-[0.98]"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F48EA6] to-[#B03052] font-serif text-lg font-bold text-white">
                        {(p?.nombre_paciente || "P").charAt(0)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-espresso">{p?.nombre_paciente || t("Paciente", "Patient")}</span>
                        <span className="block truncate text-xs text-espresso/60">
                          {fmtDate(s.fecha_sesion)} · {String(s.modalidad).toUpperCase()}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 rounded-full bg-[#E7F2F1] px-3 py-1 text-[11px] font-bold text-[#239BA2]">
                        <Sparkles className="h-3 w-3" />
                        PONO
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <SectionTitle title={t("Acceso rápido", "Quick access")} />
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: t("Pacientes", "Patients"), icon: Users, bg: "bg-[#FAD4DC]", fg: "text-[#C94A6A]", go: () => goToTab("pacientes") },
                  { label: t("Publicar", "Publish"), icon: Plus, bg: "bg-[#E4E0FA]", fg: "text-[#7A4FD1]", go: () => openSheet("publish", { tipo: "video_bam", publico: "ambos" }) },
                  { label: t("Reservas", "Bookings"), icon: CalendarHeart, bg: "bg-[#D7F3EA]", fg: "text-[#239BA2]", go: () => goToTab("alertas") },
                  { label: t("Mi ficha", "Profile"), icon: UserCog, bg: "bg-[#FFF1B8]", fg: "text-[#B98A00]", go: () => goToTab("perfil") },
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
          </main>
        )}

        {/* ===================== PACIENTES ===================== */}
        {activeTab === "pacientes" && (
          <main className="mt-6 space-y-5">
            <div className="animate-fade-in">
              <h2 className="font-serif text-3xl font-bold leading-tight text-espresso">{t("Mis pacientes", "My patients")}</h2>
              <p className="mt-1 text-sm text-espresso/60">{t("Toca una ficha para leer el resumen de PONO IA antes de la sesión.", "Tap a chart to read the PONO AI summary before the session.")}</p>
            </div>
            <div className="space-y-3">
              {fichas.map((f) => {
                const stage = STAGES.find((s) => s.id === f.etapa_actual) || STAGES[0];
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setPatientId(f.id);
                      openSheet("patient");
                    }}
                    className="flex w-full items-center gap-4 rounded-[26px] bg-white p-4 text-left shadow-[0_8px_22px_rgba(80,60,90,0.07)] transition active:scale-[0.98]"
                  >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F48EA6] to-[#B03052] font-serif text-xl font-bold text-white">
                      {(f.nombre_paciente || "P").charAt(0)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-bold text-espresso">{f.nombre_paciente}</span>
                      <span className="mt-0.5 block text-xs text-espresso/60">
                        {stage.emoji} {isEs ? stage.es : stage.en} · {f.caregiverName ? `${t("con", "with")} ${f.caregiverName.split(" ")[0]}` : t("sin cuidador", "no caregiver")}
                      </span>
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#E7F2F1] px-2.5 py-0.5 text-[10px] font-bold text-[#239BA2]">
                        <Sparkles className="h-3 w-3" />
                        {t("Resumen PONO IA listo", "PONO AI summary ready")}
                      </span>
                    </span>
                    <ChevronRight className="h-5 w-5 text-espresso/30" />
                  </button>
                );
              })}
            </div>
          </main>
        )}

        {/* ===================== CONTENIDOS ===================== */}
        {activeTab === "contenidos" && (
          <main className="mt-6 space-y-5">
            <div className="animate-fade-in">
              <h2 className="font-serif text-3xl font-bold leading-tight text-espresso">{t("Mis contenidos", "My content")}</h2>
              <p className="mt-1 text-sm text-espresso/60">{t("Lo que publiques aparece al instante para pacientes y cuidadores.", "What you publish appears instantly for patients and caregivers.")}</p>
            </div>
            <PrimaryButton color={CORAL} onClick={() => openSheet("publish", { tipo: "video_bam", publico: "ambos" })}>
              <Plus className="h-5 w-5" />
              {t("Publicar recurso o evento", "Publish resource or event")}
            </PrimaryButton>
            <div className="space-y-3">
              {published.map((item) => {
                const meta = TYPE_META[item.tipo_contenido] || TYPE_META.guia_autocuidado;
                const Icon = meta.icon;
                return (
                  <div key={item.id} className="flex items-center gap-4 rounded-[26px] bg-white p-3.5 shadow-[0_8px_22px_rgba(80,60,90,0.07)]">
                    <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.grad} text-espresso/70`}>
                      <Icon className="h-7 w-7" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#D85678]">
                        {isEs ? meta.es : meta.en} · {item.publico_objetivo}
                      </span>
                      <span className="mt-0.5 block text-sm font-bold leading-snug text-espresso line-clamp-2">{item.titulo_es}</span>
                      {item.fecha_evento && <span className="block text-xs text-espresso/55">{String(item.fecha_evento).slice(0, 16).replace("T", " ")}</span>}
                    </span>
                    <button type="button" onClick={() => runAction("delete_content", { id: item.id }, t("Recurso eliminado", "Removed"))} className="text-espresso/35 transition hover:text-[#C94A6A]" aria-label={t("Eliminar", "Delete")}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </main>
        )}

        {/* ===================== RESERVAS ===================== */}
        {activeTab === "alertas" && (
          <main className="mt-6 space-y-5">
            <div className="animate-fade-in">
              <h2 className="font-serif text-3xl font-bold leading-tight text-espresso">{t("Reservas", "Bookings")}</h2>
              <p className="mt-1 text-sm text-espresso/60">{t("Sesiones online y en persona.", "Online and in-person sessions.")}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { v: sessions.length, l: t("Reservadas", "Booked"), bg: "bg-[#E4E0FA]" },
                { v: `$${gross}`, l: t("Facturación", "Billing"), bg: "bg-[#D7F3EA]" },
                { v: `$${fee}`, l: t("Fee LHEAPP 15%", "LHEAPP fee 15%"), bg: "bg-[#FAD4DC]" },
              ].map((s) => (
                <div key={s.l} className={`rounded-3xl ${s.bg} py-4 text-center`}>
                  <div className="font-serif text-2xl font-bold text-espresso">{s.v}</div>
                  <div className="text-[10px] font-bold text-espresso/60">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-1.5 rounded-full bg-white p-1.5 shadow-sm">
              {([["programada", t("Programadas", "Scheduled")], ["completada", t("Completadas", "Completed")], ["todas", t("Todas", "All")]] as const).map(([id, label]) => (
                <button key={id} type="button" onClick={() => setBookingFilter(id)} className={`rounded-full py-2.5 text-xs font-bold transition ${bookingFilter === id ? "bg-espresso text-white shadow" : "text-espresso/60"}`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {visibleSessions.length === 0 && <Card className="text-center text-sm text-espresso/60">{t("Nada por aquí. 🌿", "Nothing here. 🌿")}</Card>}
              {visibleSessions.map((s) => {
                const p = patientOf(s.ficha_paciente_id);
                return (
                  <div key={s.id} className="rounded-[26px] bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F48EA6] to-[#B03052] font-serif font-bold text-white">
                        {(p?.nombre_paciente || "P").charAt(0)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-espresso">{p?.nombre_paciente || t("Paciente", "Patient")}</p>
                        <p className="truncate text-xs text-espresso/60">{s.enlace_o_lugar}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${s.estado_cita === "completada" ? "bg-[#5C8D67]/15 text-[#2A5C35]" : s.estado_cita === "cancelada" ? "bg-espresso/10 text-espresso/60" : "bg-[#FFF1B8] text-[#8A6A00]"}`}>
                        {s.estado_cita}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-espresso/60">
                      {fmtDate(s.fecha_sesion)} · {String(s.modalidad).toUpperCase()} · {t("Asiste", "Attends")}: {s.asistente_rol}
                      {s.es_sesion_gratuita_mensual ? ` · ${t("gratuita", "free")}` : ""}
                    </p>
                    {s.estado_cita === "programada" && (
                      <div className="mt-3 flex gap-2">
                        <button type="button" onClick={() => openLog(s.ficha_paciente_id, s.id)} className="flex-1 rounded-full bg-[#D85678] py-2 text-xs font-bold text-white">
                          {t("Registrar bitácora", "Log session")}
                        </button>
                        <button type="button" onClick={() => runAction("update_session_status", { session_id: s.id, estado_cita: "cancelada" }, t("Sesión cancelada", "Session cancelled"))} className="rounded-full border border-espresso/15 px-4 py-2 text-xs font-bold text-espresso/70">
                          {t("Cancelar", "Cancel")}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </main>
        )}

        {/* ===================== PERFIL ===================== */}
        {activeTab === "perfil" && (
          <main className="mt-6 space-y-6">
            <div className="animate-fade-in text-center">
              <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${CORAL} text-white shadow-lg`}>
                <Sparkles className="h-10 w-10" />
              </div>
              <h2 className="mt-3 font-serif text-2xl font-bold text-espresso">Omar Melero &amp; Kelsie Reynolds</h2>
              <p className="text-xs text-espresso/55">{data.user.correo}</p>
              <span className="mt-2 inline-block rounded-full bg-[#FAD4DC] px-3 py-1 text-[11px] font-bold text-[#C94A6A]">{t("Sanadores · Piloto V1", "Healers · V1 Pilot")}</span>
            </div>

            <div className="overflow-hidden rounded-[28px] bg-white shadow-sm">
              {profiles.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    openSheet("profile", {
                      id: String(p.id),
                      especialidad: p.especialidad || "",
                      tarifa: String(p.tarifa_hora_usd ?? 85),
                      bioEs: p.short_bio_es || "",
                      bioEn: p.short_bio_en || "",
                      modalidades: p.modalidades || "ambas",
                    })
                  }
                  className={`flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-[#FFF5F0] ${i > 0 ? "border-t border-espresso/5" : ""}`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFE7D6] text-[#F2711C]">
                    <UserCog className="h-5 w-5" />
                  </span>
                  <span className="flex-1 text-sm font-bold text-espresso">
                    {t("Ficha pública de", "Public profile of")} {String(p.especialidad).split("·")[0].trim()}
                  </span>
                  <span className="text-xs text-espresso/50">${p.tarifa_hora_usd}/h</span>
                  <ChevronRight className="h-4 w-4 text-espresso/30" />
                </button>
              ))}
              {[
                { icon: Globe, label: t("Idioma", "Language"), hint: isEs ? "Español" : "English", action: () => setLocale(isEs ? "en" : "es") },
                { icon: HelpCircle, label: t("Ayuda y comentarios", "Help & feedback"), hint: "", action: () => openSheet("help", { tipo: "feedback" }) },
              ].map((row) => (
                <button key={row.label} type="button" onClick={row.action} className="flex w-full items-center gap-3 border-t border-espresso/5 px-5 py-4 text-left transition hover:bg-[#FFF5F0]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFE7D6] text-[#F2711C]">
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

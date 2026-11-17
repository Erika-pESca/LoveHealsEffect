"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  ChevronRight,
  Database,
  Download,
  Globe,
  Heart,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
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
import { STAGES, TYPE_META } from "@/components/paciente/PacienteDashboard";

const DARK = "from-[#4A4543] to-[#262322]";

const ROLE_STYLE: Record<string, { bg: string; fg: string }> = {
  paciente: { bg: "bg-[#FAD4DC]", fg: "text-[#C94A6A]" },
  cuidador: { bg: "bg-[#D7F3EA]", fg: "text-[#239BA2]" },
  sanador: { bg: "bg-[#FFE7D6]", fg: "text-[#F2711C]" },
  admin: { bg: "bg-[#E4E0FA]", fg: "text-[#7A4FD1]" },
};

function AdminDashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, setLocale } = useLanguage();
  const isEs = locale === "es";
  const t = (es: string, en: string) => (isEs ? es : en);

  const activeTab = searchParams.get("tab") || "inicio";

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [sheet, setSheet] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [ticketFilter, setTicketFilter] = useState<"abiertos" | "resueltos">("abiertos");

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
      const res = await fetch("/api/admin/dashboard");
      const json = await res.json();
      if (json.ok) setData(json);
    } catch (err) {
      console.error("Error cargando admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const runAction = async (action: string, payload: Record<string, any>, message: string) => {
    try {
      const res = await fetch("/api/admin/dashboard", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      const json = await res.json();
      if (json.ok) {
        if (message) showToast(message);
        await fetchDashboard();
        return json;
      }
      showToast(json.error || t("No se pudo completar", "Could not complete"));
    } catch (err) {
      console.error("Error en acción admin:", err);
    }
    return null;
  };

  const handleExport = () => {
    if (!data) return;
    const payload = {
      exportedAt: new Date().toISOString(),
      platform: "Love Heals Effect V1.0 (Honolulu, Hawaii)",
      metrics: data.metrics,
      usuarios: data.users,
      celulas_familiares: data.familyCells,
      contenidos_y_sanadores: data.contents,
      citas_y_bitacoras: data.sessions,
      pagos_y_suscripciones: data.payments,
      tickets_feedback: data.tickets,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `love-heals-effect-db-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t("Base de datos exportada", "Database exported"));
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
    router.push(tabId === "inicio" ? "/admin" : `/admin?tab=${tabId}`, { scroll: false });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F3EE] px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-espresso text-white shadow-lg">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <p className="font-serif text-lg font-bold text-espresso">{t("Cargando administración…", "Loading administration…")}</p>
        </div>
      </div>
    );
  }

  const { adminUser, metrics, users, familyCells, contents, sessions, payments, tickets } = data;
  const openTickets = tickets.filter((x: any) => x.estado !== "resuelto");
  const shownTickets = tickets.filter((x: any) => (ticketFilter === "abiertos" ? x.estado !== "resuelto" : x.estado === "resuelto"));
  const selectedUser = users.find((u: any) => u.id === selectedId);
  const selectedCell = familyCells.find((f: any) => f.id === selectedId);
  const selectedTicket = tickets.find((x: any) => x.id === selectedId);
  const pilotPct = Math.min(100, Math.round((metrics.totalFamilies / 3) * 100));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("Buenos días", "Good morning") : hour < 19 ? t("Buenas tardes", "Good afternoon") : t("Buenas noches", "Good evening");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EFEAE2] via-[#F9F7F3] to-[#EAF1F4] pb-44">
      <Toast message={toast} />

      <div className="mx-auto max-w-2xl px-5">
        {/* ENCABEZADO */}
        <header className="flex items-center justify-between pt-7">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => goToTab("perfil")} className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${DARK} text-white shadow-md`} aria-label={t("Mi cuenta", "My account")}>
              <ShieldCheck className="h-5 w-5 text-[#E8809A]" />
            </button>
            <div>
              <p className="text-xs font-medium text-espresso/55">{greeting}</p>
              <h1 className="font-serif text-2xl font-bold leading-tight text-espresso">{t("Panel de administración", "Admin panel")}</h1>
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
              <div className={`relative overflow-hidden rounded-[32px] bg-gradient-to-br ${DARK} p-6 text-white shadow-[0_14px_34px_rgba(38,35,34,0.3)]`}>
                <span className="absolute -right-1 top-3 select-none text-7xl opacity-90">🌺</span>
                <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold">{t("Piloto V1 · Honolulu", "V1 Pilot · Honolulu")}</span>
                <h2 className="mt-3 max-w-[72%] font-serif text-3xl font-bold leading-tight">
                  {metrics.totalFamilies} {t("de 3 familias", "of 3 families")}
                </h2>
                <div className="mt-3 h-2.5 max-w-[75%] overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#F48EA6] to-[#F7A27F] transition-all" style={{ width: `${pilotPct}%` }} />
                </div>
                <p className="mt-2 text-xs font-semibold text-white/75">
                  {metrics.linkedFamilies} {t("vinculadas 1 a 1", "linked 1-to-1")}
                </p>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              {[
                { v: metrics.totalUsers, l: t("Usuarios", "Users"), sub: `${metrics.totalPatients} ${t("pacientes", "patients")} · ${metrics.totalCaregivers} ${t("cuidadores", "caregivers")}`, bg: "bg-[#D7F3EA]", go: () => goToTab("familias") },
                { v: metrics.paidUsers, l: t("Membresías $10", "$10 memberships"), sub: `${metrics.totalSessions} ${t("sesiones", "sessions")}`, bg: "bg-[#FFF1B8]", go: () => goToTab("familias") },
                { v: metrics.totalFamilies, l: t("Familias 1 a 1", "1-to-1 families"), sub: `${metrics.linkedFamilies} ${t("vinculadas", "linked")}`, bg: "bg-[#FAD4DC]", go: () => goToTab("familias") },
                { v: metrics.openTickets, l: t("Tickets abiertos", "Open tickets"), sub: t("Toca para revisar", "Tap to review"), bg: "bg-[#E4E0FA]", go: () => goToTab("alertas") },
              ].map((m) => (
                <button key={m.l} type="button" onClick={m.go} className={`rounded-3xl ${m.bg} p-4 text-left transition active:scale-[0.97]`}>
                  <div className="font-serif text-4xl font-bold text-espresso">{m.v}</div>
                  <div className="mt-0.5 text-xs font-bold text-espresso/80">{m.l}</div>
                  <div className="mt-0.5 text-[10px] font-semibold text-espresso/55">{m.sub}</div>
                </button>
              ))}
            </section>

            <section>
              <SectionTitle title={t("Entrenar a PONO IA", "Train PONO AI")} />
              <p className="-mt-1 mb-3 text-xs text-espresso/60">{t("Revisa y aprueba el resumen que verán Omar y Kelsie de cada paciente.", "Review and approve the summary Omar and Kelsie see for each patient.")}</p>
              <div className="space-y-2.5">
                {familyCells.length === 0 && <Card className="text-center text-sm text-espresso/60">{t("Aún no hay familias registradas.", "No families registered yet.")}</Card>}
                {familyCells.map((cell: any) => (
                  <button
                    key={cell.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(cell.id);
                      openSheet("pono", { resumen: cell.resumen_ia_pono || "" });
                    }}
                    className="flex w-full items-center gap-3 rounded-3xl bg-white px-4 py-3.5 text-left shadow-sm transition active:scale-[0.98]"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E7F2F1] text-[#239BA2]">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-espresso">{cell.nombre_paciente}</span>
                      <span className="block truncate text-xs text-espresso/60">{cell.nombre_familia}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-espresso/30" />
                  </button>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle title={t("Ver como…", "View as…")} />
              <div className="grid grid-cols-3 gap-3">
                {[
                  { href: "/paciente", label: t("Paciente", "Patient"), bg: "bg-[#FAD4DC]", fg: "text-[#C94A6A]", icon: Heart },
                  { href: "/cuidador", label: t("Cuidador", "Caregiver"), bg: "bg-[#D7F3EA]", fg: "text-[#239BA2]", icon: Users },
                  { href: "/sanador", label: t("Sanador", "Healer"), bg: "bg-[#FFE7D6]", fg: "text-[#F2711C]", icon: Sparkles },
                ].map((p) => (
                  <Link key={p.href} href={p.href} className="flex flex-col items-center gap-2 rounded-3xl bg-white py-4 shadow-sm transition active:scale-95">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${p.bg} ${p.fg}`}>
                      <p.icon className="h-5 w-5" />
                    </span>
                    <span className="text-[11px] font-bold text-espresso/75">{p.label}</span>
                  </Link>
                ))}
              </div>
            </section>
          </main>
        )}

        {/* ===================== FAMILIAS Y USUARIOS ===================== */}
        {activeTab === "familias" && (
          <main className="mt-6 space-y-6">
            <div className="animate-fade-in">
              <h2 className="font-serif text-3xl font-bold leading-tight text-espresso">{t("Familias y usuarios", "Families & users")}</h2>
              <p className="mt-1 text-sm text-espresso/60">{t("Vínculos 1 a 1, roles y suscripciones.", "1-to-1 links, roles and subscriptions.")}</p>
            </div>

            <div>
              <SectionTitle title={t("Células familiares", "Family cells")} />
              <div className="space-y-3">
                {familyCells.map((cell: any) => {
                  const stage = STAGES.find((s) => s.id === cell.etapa_actual) || STAGES[0];
                  return (
                    <div key={cell.id} className="rounded-[26px] bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-serif text-base font-bold text-espresso">{cell.nombre_familia}</span>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${cell.estado_vinculo === "vinculado" ? "bg-[#5C8D67]/15 text-[#2A5C35]" : "bg-[#FFF1B8] text-[#8A6A00]"}`}>
                          {cell.estado_vinculo === "vinculado" ? `✓ ${t("Vinculados", "Linked")}` : t("Pendiente", "Pending")}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-1.5 rounded-full bg-[#FAD4DC] px-3 py-1.5 font-bold text-espresso">
                          <Heart className="h-3 w-3 text-[#C94A6A]" />
                          {String(cell.nombre_paciente).split(" ")[0]}
                        </span>
                        <span className="text-espresso/30">↔</span>
                        <span className="flex items-center gap-1.5 rounded-full bg-[#D7F3EA] px-3 py-1.5 font-bold text-espresso">
                          <Users className="h-3 w-3 text-[#239BA2]" />
                          {cell.caregiverUser ? String(cell.caregiverUser.nombre).split(" ")[0] : t("Pendiente", "Pending")}
                        </span>
                      </div>
                      <p className="mt-2.5 text-xs text-espresso/55">
                        {stage.emoji} {isEs ? stage.es : stage.en} · {cell.sessionsCount} {t("sesiones", "sessions")}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <SectionTitle title={t("Usuarios", "Users")} />
              <div className="overflow-hidden rounded-[28px] bg-white shadow-sm">
                {users.map((u: any, i: number) => {
                  const rs = ROLE_STYLE[u.rol] || ROLE_STYLE.paciente;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(u.id);
                        openSheet("user");
                      }}
                      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[#FAF7F2] ${i > 0 ? "border-t border-espresso/5" : ""}`}
                    >
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${rs.bg} ${rs.fg} font-serif text-lg font-bold`}>{String(u.nombre).charAt(0)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-espresso">{u.nombre}</span>
                        <span className="block truncate text-xs text-espresso/55">{u.correo}</span>
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${u.nivel_suscripcion === "pagada" ? "bg-[#FFF1B8] text-[#8A6A00]" : "bg-espresso/5 text-espresso/55"}`}>
                        {u.nivel_suscripcion === "pagada" ? "★ $10" : t("Gratis", "Free")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <PrimaryButton color={DARK} onClick={() => openSheet("new-user", { rol: "paciente", plan: "gratuita", pass: "Love2026" })}>
              <UserPlus className="h-5 w-5" />
              {t("Crear usuario del piloto", "Create pilot user")}
            </PrimaryButton>
          </main>
        )}

        {/* ===================== CONTENIDOS (CMS) ===================== */}
        {activeTab === "contenidos" && (
          <main className="mt-6 space-y-5">
            <div className="animate-fade-in">
              <h2 className="font-serif text-3xl font-bold leading-tight text-espresso">{t("Contenidos ES | EN", "Content ES | EN")}</h2>
              <p className="mt-1 text-sm text-espresso/60">{t("Publica anuncios, guías y eventos en español e inglés sin tocar código.", "Publish announcements, guides and events in Spanish and English without code.")}</p>
            </div>
            <PrimaryButton color={DARK} onClick={() => openSheet("cms", { tipo: "guia_autocuidado", publico: "ambos" })}>
              <Plus className="h-5 w-5" />
              {t("Publicar contenido bilingüe", "Publish bilingual content")}
            </PrimaryButton>
            <div className="space-y-3">
              {contents.map((c: any) => {
                const isProfile = c.tipo_registro === "perfil_sanador";
                const meta = TYPE_META[c.tipo_contenido] || TYPE_META.guia_autocuidado;
                const Icon = isProfile ? Users : meta.icon;
                return (
                  <div key={c.id} className="flex items-center gap-4 rounded-[26px] bg-white p-3.5 shadow-sm">
                    <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${isProfile ? "from-[#FFE7D6] to-[#FAD4DC]" : meta.grad} text-espresso/70`}>
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-espresso/50">
                        {isProfile ? t("Perfil de sanador", "Healer profile") : isEs ? meta.es : meta.en} · {c.publico_objetivo || "—"}
                      </span>
                      <span className="mt-0.5 block text-sm font-bold leading-snug text-espresso line-clamp-2">{c.titulo_es || c.especialidad}</span>
                    </span>
                    {!isProfile && (
                      <button type="button" onClick={() => runAction("delete_cms_content", { id: c.id }, t("Contenido eliminado", "Removed"))} className="text-espresso/35 transition hover:text-[#C94A6A]" aria-label={t("Eliminar", "Delete")}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </main>
        )}

        {/* ===================== TICKETS ===================== */}
        {activeTab === "alertas" && (
          <main className="mt-6 space-y-5">
            <div className="animate-fade-in">
              <h2 className="font-serif text-3xl font-bold leading-tight text-espresso">{t("Tickets y feedback", "Tickets & feedback")}</h2>
              <p className="mt-1 text-sm text-espresso/60">{t("Lo que reportan pacientes, cuidadores y sanadores.", "What patients, caregivers and healers report.")}</p>
            </div>
            <div className="grid grid-cols-2 gap-1.5 rounded-full bg-white p-1.5 shadow-sm">
              {([["abiertos", `${t("Abiertos", "Open")} (${openTickets.length})`], ["resueltos", t("Resueltos", "Resolved")]] as const).map(([id, label]) => (
                <button key={id} type="button" onClick={() => setTicketFilter(id)} className={`rounded-full py-2.5 text-xs font-bold transition ${ticketFilter === id ? "bg-espresso text-white shadow" : "text-espresso/60"}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {shownTickets.length === 0 && <Card className="text-center text-sm text-espresso/60">{t("Todo en orden por aquí. 🌿", "All clear here. 🌿")}</Card>}
              {shownTickets.map((tk: any) => (
                <button
                  key={tk.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(tk.id);
                    openSheet("ticket", { respuesta: tk.respuesta_admin || "" });
                  }}
                  className="block w-full rounded-[26px] bg-white p-4 text-left shadow-sm transition active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${tk.tipo === "bug" ? "bg-[#FAD4DC] text-[#C94A6A]" : tk.tipo === "soporte" ? "bg-[#D9E8FB] text-[#3D7BD6]" : "bg-[#FFF1B8] text-[#8A6A00]"}`}>{tk.tipo}</span>
                    <span className="text-[11px] font-semibold text-espresso/50">{tk.rol_usuario}</span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-espresso">{tk.asunto}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-espresso/65">{tk.descripcion}</p>
                </button>
              ))}
            </div>
          </main>
        )}

        {/* ===================== CUENTA Y DATOS ===================== */}
        {activeTab === "perfil" && (
          <main className="mt-6 space-y-6">
            <div className="animate-fade-in text-center">
              <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${DARK} text-white shadow-lg`}>
                <ShieldCheck className="h-10 w-10 text-[#E8809A]" />
              </div>
              <h2 className="mt-3 font-serif text-2xl font-bold text-espresso">{adminUser.nombre}</h2>
              <p className="text-xs text-espresso/55">{adminUser.correo}</p>
            </div>

            <div>
              <SectionTitle title={t("Base de datos (7 tablas)", "Database (7 tables)")} />
              <div className="overflow-hidden rounded-[28px] bg-white shadow-sm">
                {[
                  { n: "usuarios", c: users.length },
                  { n: "ficha_paciente", c: familyCells.length },
                  { n: "ficha_cuidador", c: familyCells.length },
                  { n: "sanadores_y_contenidos", c: contents.length },
                  { n: "citas_y_bitacora_sanador", c: sessions.length },
                  { n: "pagos_y_suscripciones", c: payments.length },
                  { n: "tickets_feedback", c: tickets.length },
                ].map((r, i) => (
                  <div key={r.n} className={`flex items-center gap-3 px-5 py-3 ${i > 0 ? "border-t border-espresso/5" : ""}`}>
                    <Database className="h-4 w-4 text-espresso/35" />
                    <span className="flex-1 font-mono text-xs font-bold text-espresso">{r.n}</span>
                    <span className="rounded-full bg-[#E7F2F1] px-3 py-1 text-[11px] font-bold text-[#239BA2]">{r.c}</span>
                  </div>
                ))}
              </div>
            </div>

            <PrimaryButton color={DARK} onClick={handleExport}>
              <Download className="h-5 w-5" />
              {t("Exportar base de datos (JSON)", "Export database (JSON)")}
            </PrimaryButton>

            <div className="overflow-hidden rounded-[28px] bg-white shadow-sm">
              <button type="button" onClick={() => setLocale(isEs ? "en" : "es")} className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-[#FAF7F2]">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EFEAE2] text-espresso/70"><Globe className="h-5 w-5" /></span>
                <span className="flex-1 text-sm font-bold text-espresso">{t("Idioma", "Language")}</span>
                <span className="text-xs text-espresso/50">{isEs ? "Español" : "English"}</span>
                <ChevronRight className="h-4 w-4 text-espresso/30" />
              </button>
              <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 border-t border-espresso/5 px-5 py-4 text-left text-[#C94A6A] transition hover:bg-[#FCECEE]">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FCECEE]"><LogOut className="h-5 w-5" /></span>
                <span className="flex-1 text-sm font-bold">{t("Cerrar sesión", "Log out")}</span>
              </button>
            </div>
          </main>
        )}
      </div>

      {/* ===================== HOJAS ===================== */}

      {/* PONO IA */}
      <Sheet open={sheet === "pono" && !!selectedCell} onClose={() => setSheet(null)} title={selectedCell ? `PONO IA · ${selectedCell.nombre_paciente}` : ""}>
        {selectedCell && (
          <div className="space-y-4">
            <p className="text-xs text-espresso/65">{t("Este es el resumen que Omar y Kelsie leen antes de cada cita. Edítalo o regénéralo desde la ficha.", "This is the summary Omar and Kelsie read before each session. Edit it or regenerate it from the chart.")}</p>
            <textarea rows={8} className={inputCls} value={fv("resumen")} onChange={fs("resumen")} />
            <button
              type="button"
              disabled={regenerating}
              onClick={async () => {
                setRegenerating(true);
                const res = await runAction("regenerate_pono_summary", { fichaId: selectedCell.id }, t("Resumen regenerado desde la ficha", "Summary regenerated from chart"));
                if (res?.summary) setForm((p) => ({ ...p, resumen: res.summary }));
                setRegenerating(false);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[#239BA2]/40 bg-[#E7F2F1] px-6 py-3 text-sm font-bold text-[#239BA2] disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`} />
              {t("Regenerar desde la ficha", "Regenerate from chart")}
            </button>
            <PrimaryButton
              color={DARK}
              onClick={async () => {
                const ok = await runAction("save_pono_summary", { fichaId: selectedCell.id, resumen_ia_pono: fv("resumen") }, t("Resumen aprobado", "Summary approved"));
                if (ok) setSheet(null);
              }}
            >
              <Check className="h-4 w-4" />
              {t("Aprobar y guardar", "Approve & save")}
            </PrimaryButton>
          </div>
        )}
      </Sheet>

      {/* Usuario */}
      <Sheet open={sheet === "user" && !!selectedUser} onClose={() => setSheet(null)} title={selectedUser?.nombre}>
        {selectedUser && (
          <div className="space-y-5">
            <p className="text-xs text-espresso/60">{selectedUser.correo}</p>
            <div>
              <p className="mb-2 text-xs font-bold text-espresso/70">{t("Rol", "Role")}</p>
              <div className="grid grid-cols-2 gap-2">
                {["paciente", "cuidador", "sanador", "admin"].map((r) => {
                  const rs = ROLE_STYLE[r];
                  const active = selectedUser.rol === r;
                  return (
                    <button key={r} type="button" onClick={() => runAction("update_user_access", { userId: selectedUser.id, rol: r }, t("Rol actualizado", "Role updated"))} className={`rounded-2xl py-3 text-xs font-bold capitalize transition ${active ? `${rs.bg} ${rs.fg} ring-2 ring-current` : "bg-[#FAF7F2] text-espresso/60"}`}>
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold text-espresso/70">{t("Suscripción", "Subscription")}</p>
              <div className="grid grid-cols-2 gap-2">
                {([["gratuita", t("Gratuita", "Free")], ["pagada", "★ $10 / mes"]] as const).map(([id, label]) => (
                  <button key={id} type="button" onClick={() => runAction("update_user_access", { userId: selectedUser.id, nivel_suscripcion: id }, t("Suscripción actualizada", "Subscription updated"))} className={`rounded-2xl py-3 text-xs font-bold transition ${selectedUser.nivel_suscripcion === id ? "bg-espresso text-white" : "bg-[#FAF7F2] text-espresso/60"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Sheet>

      {/* Nuevo usuario */}
      <Sheet open={sheet === "new-user"} onClose={() => setSheet(null)} title={t("Crear usuario del piloto", "Create pilot user")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await runAction("create_pilot_user", { nombre: fv("nombre"), correo: fv("correo"), rol: fv("rol", "paciente"), nivel_suscripcion: fv("plan", "gratuita"), password: fv("pass", "Love2026") }, t("Usuario creado", "User created"));
            if (res) setSheet(null);
          }}
        >
          <Field label={t("Nombre completo", "Full name")}>
            <input required className={inputCls} value={fv("nombre")} onChange={fs("nombre")} />
          </Field>
          <Field label={t("Correo", "Email")}>
            <input required type="email" className={inputCls} value={fv("correo")} onChange={fs("correo")} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("Rol", "Role")}>
              <select className={inputCls} value={fv("rol", "paciente")} onChange={fs("rol")}>
                <option value="paciente">Paciente</option>
                <option value="cuidador">Cuidador</option>
                <option value="sanador">Sanador</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
            <Field label={t("Plan", "Plan")}>
              <select className={inputCls} value={fv("plan", "gratuita")} onChange={fs("plan")}>
                <option value="gratuita">{t("Gratuita", "Free")}</option>
                <option value="pagada">{t("Pagada $10", "Paid $10")}</option>
              </select>
            </Field>
          </div>
          <Field label={t("Contraseña inicial", "Initial password")}>
            <input className={inputCls} value={fv("pass", "Love2026")} onChange={fs("pass")} />
          </Field>
          <PrimaryButton type="submit" color={DARK}>{t("Crear usuario", "Create user")}</PrimaryButton>
        </form>
      </Sheet>

      {/* CMS bilingüe */}
      <Sheet open={sheet === "cms"} onClose={() => setSheet(null)} title={t("Publicar contenido", "Publish content")}>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await runAction(
              "create_cms_content",
              { tipo_contenido: fv("tipo", "guia_autocuidado"), publico_objetivo: fv("publico", "ambos"), titulo_es: fv("tituloEs"), titulo_en: fv("tituloEn") || fv("tituloEs"), descripcion_es: fv("descEs"), descripcion_en: fv("descEn") || fv("descEs"), media_url: fv("url") },
              t("Contenido publicado", "Content published")
            );
            if (res) setSheet(null);
          }}
        >
          <Field label={t("Tipo", "Type")}>
            <select className={inputCls} value={fv("tipo", "guia_autocuidado")} onChange={fs("tipo")}>
              <option value="guia_autocuidado">{t("Anuncio / guía", "Announcement / guide")}</option>
              <option value="video_bam">Video BAM</option>
              <option value="meditacion_audio">{t("Meditación", "Meditation")}</option>
              <option value="musicoterapia">{t("Musicoterapia", "Music therapy")}</option>
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
          <div className="grid grid-cols-2 gap-3">
            <Field label="Título (ES)">
              <input required className={inputCls} value={fv("tituloEs")} onChange={fs("tituloEs")} />
            </Field>
            <Field label="Title (EN)">
              <input className={inputCls} value={fv("tituloEn")} onChange={fs("tituloEn")} />
            </Field>
          </div>
          <Field label="Descripción (ES)">
            <textarea rows={2} className={inputCls} value={fv("descEs")} onChange={fs("descEs")} />
          </Field>
          <Field label="Description (EN)">
            <textarea rows={2} className={inputCls} value={fv("descEn")} onChange={fs("descEn")} />
          </Field>
          <Field label="URL">
            <input className={inputCls} value={fv("url")} onChange={fs("url")} placeholder="https://" />
          </Field>
          <PrimaryButton type="submit" color={DARK}>{t("Publicar", "Publish")}</PrimaryButton>
        </form>
      </Sheet>

      {/* Ticket */}
      <Sheet open={sheet === "ticket" && !!selectedTicket} onClose={() => setSheet(null)} title={selectedTicket?.asunto}>
        {selectedTicket && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#FFF1B8] px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#8A6A00]">{selectedTicket.tipo}</span>
              <span className="text-xs font-semibold text-espresso/55">{selectedTicket.rol_usuario}</span>
            </div>
            <p className="rounded-2xl bg-[#FAF7F2] p-4 text-sm leading-relaxed text-espresso">{selectedTicket.descripcion}</p>
            <Field label={t("Tu respuesta o nota de resolución", "Your reply or resolution note")}>
              <textarea rows={3} className={inputCls} value={fv("respuesta")} onChange={fs("respuesta")} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={async () => {
                  const ok = await runAction("update_ticket", { ticketId: selectedTicket.id, estado: "en_revision", respuesta_admin: fv("respuesta") }, t("Marcado en revisión", "Marked in review"));
                  if (ok) setSheet(null);
                }}
                className="rounded-full border border-espresso/15 py-3 text-sm font-bold text-espresso/70"
              >
                {t("En revisión", "In review")}
              </button>
              <PrimaryButton
                color="from-[#6BB18A] to-[#3E8A5E]"
                onClick={async () => {
                  const ok = await runAction("update_ticket", { ticketId: selectedTicket.id, estado: "resuelto", respuesta_admin: fv("respuesta") || "Atendido por el equipo." }, t("Ticket resuelto", "Ticket resolved"));
                  if (ok) setSheet(null);
                }}
              >
                <Check className="h-4 w-4" />
                {t("Resolver", "Resolve")}
              </PrimaryButton>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

export function AdminDashboard() {
  return (
    <Suspense fallback={null}>
      <AdminDashboardInner />
    </Suspense>
  );
}

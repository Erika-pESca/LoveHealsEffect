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

import { DARK, ROLE_STYLE } from "./types";
import { InicioSection } from "./InicioSection";
import { FamiliasSection } from "./FamiliasSection";
import { ContenidosSection } from "./ContenidosSection";
import { TicketsSection } from "./TicketsSection";
import { PerfilSection } from "./PerfilSection";

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

      <div className="mx-auto w-full max-w-md md:max-w-4xl lg:max-w-6xl xl:max-w-7xl px-4 sm:px-6 lg:px-8 transition-all">
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
          <InicioSection
            t={t}
            isEs={isEs}
            metrics={metrics}
            pilotPct={pilotPct}
            goToTab={goToTab}
            familyCells={familyCells}
            setSelectedId={setSelectedId}
            openSheet={openSheet}
          />
        )}

        {/* ===================== FAMILIAS Y USUARIOS ===================== */}
        {activeTab === "familias" && (
          <FamiliasSection
            t={t}
            isEs={isEs}
            familyCells={familyCells}
            users={users}
            setSelectedId={setSelectedId}
            openSheet={openSheet}
          />
        )}

        {/* ===================== CONTENIDOS (CMS) ===================== */}
        {activeTab === "contenidos" && (
          <ContenidosSection
            t={t}
            isEs={isEs}
            openSheet={openSheet}
            contents={contents}
            runAction={runAction}
          />
        )}

        {/* ===================== TICKETS ===================== */}
        {activeTab === "alertas" && (
          <TicketsSection
            t={t}
            isEs={isEs}
            openTickets={openTickets}
            ticketFilter={ticketFilter}
            setTicketFilter={setTicketFilter}
            shownTickets={shownTickets}
            setSelectedId={setSelectedId}
            openSheet={openSheet}
          />
        )}

        {/* ===================== CUENTA Y DATOS ===================== */}
        {activeTab === "perfil" && (
          <PerfilSection
            t={t}
            isEs={isEs}
            adminUser={adminUser}
            users={users}
            familyCells={familyCells}
            contents={contents}
            sessions={sessions}
            payments={payments}
            tickets={tickets}
            handleExport={handleExport}
            setLocale={setLocale}
            handleLogout={handleLogout}
          />
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

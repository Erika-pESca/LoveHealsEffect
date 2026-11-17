"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock,
  Dumbbell,
  Heart,
  HeartPulse,
  Layers,
  LogOut,
  MapPin,
  User,
  Users,
} from "lucide-react";

interface ModuleScaffoldProps {
  moduleNumber: string;
  title: string;
  roleLabel: string;
  description: string;
  plannedFeatures: string[];
  folderPath: string;
}

interface SessionData {
  user: {
    id: number;
    nombre: string;
    correo: string;
    rol: string;
  };
  relation?: {
    hasPartner: boolean;
    partnerName: string | null;
    partnerEmail: string | null;
    relationship: string | null;
    stage: string | null;
    status: string;
    fichaId: number | null;
  };
}

const TAB_DESCRIPTIONS: Record<
  string,
  {
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  practicas: {
    title: "Prácticas y Bienestar Integral",
    subtitle:
      "Meditaciones, musicoterapia, cuencos sonoros, nutrición y ejercicios adaptados a tu etapa.",
    icon: Dumbbell,
  },
  autocuidado: {
    title: "Autocuidado y Guías para el Cuidador",
    subtitle:
      "Herramientas de contención emocional, descanso, manejo del agotamiento y apoyo práctico.",
    icon: Dumbbell,
  },
  contenidos: {
    title: "Biblioteca y Recursos Multimedia",
    subtitle:
      "Gestión de audios, videos BAM, podcasts, libros PDF, Love Circles y contenidos bilingües.",
    icon: Dumbbell,
  },
  salud: {
    title: "Mi Ficha de Salud y Medicamentos",
    subtitle:
      "Horarios de medicinas, suplementos, estudios de laboratorio y documentos del oncólogo.",
    icon: HeartPulse,
  },
  "salud-paciente": {
    title: "Ficha Compartida de mi Paciente (Sincronizada 1 a 1)",
    subtitle:
      "Vista en tiempo real de medicamentos, horarios, síntomas y documentos médicos de tu paciente.",
    icon: HeartPulse,
  },
  pacientes: {
    title: "Fichas de Pacientes y Resumen Ejecutivo PONO IA",
    subtitle:
      "Lectura rápida del contexto clínico-emocional antes de cada sesión y bitácora post-sesión.",
    icon: HeartPulse,
  },
  familias: {
    title: "Supervisión de Células Familiares (Paciente ↔ Cuidador)",
    subtitle:
      "Estado de vínculos 1 a 1, invitaciones activas y seguimiento integral de cada familia.",
    icon: HeartPulse,
  },
  inicio: {
    title: "Eje Central del Panel",
    subtitle:
      "Vista principal personalizada con el resumen de tu etapa, próximos pasos y acceso directo.",
    icon: MapPin,
  },
  alertas: {
    title: "Citas, Reservas y Notificaciones",
    subtitle:
      "Recordatorios de tomas de medicamentos, citas oncológicas y sesiones con sanadores.",
    icon: Bell,
  },
  perfil: {
    title: "Mi Perfil y Configuración de Vínculo",
    subtitle:
      "Datos personales, preferencia de idioma (ES / EN), estado de suscripción y vínculo familiar.",
    icon: User,
  },
};

function ModuleScaffoldInner({
  moduleNumber,
  title,
  roleLabel,
  description,
  plannedFeatures,
  folderPath,
}: ModuleScaffoldProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "inicio";
  const tabMeta = TAB_DESCRIPTIONS[activeTab] || TAB_DESCRIPTIONS.inicio;
  const TabIcon = tabMeta.icon;

  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setSession(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/auth/login");
      router.refresh();
    } catch {
      router.push("/auth/login");
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-4 pb-36 pt-10 sm:px-6 lg:pt-14">
      {/* TARJETA DE SESIÓN ACTIVA Y ESTADO DEL VÍNCULO EN BASE DE DATOS */}
      {session && session.user && (
        <div className="mb-6 rounded-3xl border border-[#DF9B80]/40 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FCECEE] text-lg font-bold text-[#E8809A]">
                {session.user.rol === "paciente" ? (
                  <Heart className="h-6 w-6" />
                ) : (
                  <Users className="h-6 w-6" />
                )}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-espresso sm:text-lg">
                    {session.user.nombre}
                  </h3>
                  <span className="rounded-full bg-[#5C8D67]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#5C8D67]">
                    ● Sesión activa ({session.user.rol})
                  </span>
                </div>
                <p className="text-xs text-espresso/60">{session.user.correo}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-espresso/15 bg-white px-4 py-2 text-xs font-bold text-espresso/80 transition hover:bg-espresso/5 hover:text-espresso"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>

          {/* Estado del vínculo en la base de datos (Paciente <-> Cuidador) */}
          {(session.user.rol === "paciente" ||
            session.user.rol === "cuidador") && (
            <div className="mt-4 rounded-2xl border border-espresso/10 bg-[#FAF9F6] p-4 text-xs">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-espresso/50">
                Conexión en Base de Datos (Relación Paciente · Cuidador)
              </span>
              {session.relation?.status === "vinculado" ? (
                <div className="flex items-center gap-2 text-[#2A5C35]">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#5C8D67]" />
                  <span>
                    <strong>Célula sincronizada con éxito:</strong> Vinculada/o
                    con{" "}
                    <strong>
                      {session.relation.partnerName ||
                        session.relation.partnerEmail}
                    </strong>
                    . Ambos perfiles comparten la misma ficha médica y bitácora
                    de salud.
                  </span>
                </div>
              ) : session.relation?.partnerEmail ? (
                <div className="flex items-center gap-2 text-[#7F3348]">
                  <Clock className="h-4 w-4 shrink-0 text-[#E8809A]" />
                  <span>
                    <strong>Invitación enviada por correo directo a:</strong>{" "}
                    <strong>{session.relation.partnerEmail}</strong>. El vínculo
                    quedará 100% activo en cuanto tu acompañante acepte y cree
                    su contraseña.
                  </span>
                </div>
              ) : (
                <p className="text-espresso/70">
                  Aún no has vinculado un acompañante. Puedes invitar a tu
                  familiar o cuidador desde este panel en cualquier momento
                  enviándole un correo directo.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* INDICADOR DE SECCIÓN ACTIVA EN LA BARRA INFERIOR CURVA */}
      <div className="mb-6 flex items-center gap-4 rounded-3xl border border-[#E8809A]/25 bg-gradient-to-r from-[#FCECEE]/80 via-white to-[#FAF7F2] p-5 shadow-sm">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F48EA6] via-[#DC5678] to-[#B03052] text-white shadow-[0_6px_16px_rgba(196,54,92,0.35)]">
          <TabIcon className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C94A6A]">
            Sección activa en la barra inferior · {activeTab.toUpperCase()}
          </span>
          <h2 className="font-serif text-lg font-bold text-espresso sm:text-xl">
            {tabMeta.title}
          </h2>
          <p className="mt-0.5 text-xs text-espresso/70 sm:text-sm">
            {tabMeta.subtitle}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-espresso/10 bg-white p-8 shadow-sm sm:p-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-soft px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-dark">
            <Layers className="h-3.5 w-3.5" />
            {moduleNumber} · {roleLabel}
          </span>
          <code className="rounded-lg bg-cream px-3 py-1 text-xs font-semibold text-espresso/75">
            {folderPath}
          </code>
        </div>

        <h1 className="mt-6 font-serif text-3xl font-bold text-espresso sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-espresso/75 sm:text-base">
          {description}
        </p>

        <div className="mt-8 rounded-2xl bg-cream p-6">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-primary">
            Funcionalidades planificadas para este módulo (V1.0):
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-espresso/85">
            {plannedFeatures.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-tertiary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-espresso px-6 py-2.5 text-xs font-bold text-white transition hover:bg-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ModuleScaffold(props: ModuleScaffoldProps) {
  return (
    <Suspense fallback={null}>
      <ModuleScaffoldInner {...props} />
    </Suspense>
  );
}

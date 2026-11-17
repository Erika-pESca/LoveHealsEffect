"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, Heart, Layers, LogOut, Users } from "lucide-react";

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

export function ModuleScaffold({
  moduleNumber,
  title,
  roleLabel,
  description,
  plannedFeatures,
  folderPath,
}: ModuleScaffoldProps) {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setSession(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSession(false));
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
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24">
      {/* TARJETA DE SESIÓN ACTIVA Y ESTADO DEL VÍNCULO EN BASE DE DATOS */}
      {session && session.user && (
        <div className="mb-6 rounded-3xl border border-[#DF9B80]/40 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FCECEE] text-[#E8809A] font-bold text-lg">
                {session.user.rol === "paciente" ? <Heart className="h-6 w-6" /> : <Users className="h-6 w-6" />}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-espresso text-base sm:text-lg">
                    {session.user.nombre}
                  </h3>
                  <span className="rounded-full bg-[#5C8D67]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#5C8D67]">
                    ● Sesión activa
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
          <div className="mt-4 rounded-2xl border border-espresso/10 bg-[#FAF9F6] p-4 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-espresso/50 block mb-1">
              Conexión en Base de Datos (Relación Paciente · Cuidador)
            </span>
            {session.relation?.status === "vinculado" ? (
              <div className="flex items-center gap-2 text-[#2A5C35]">
                <CheckCircle2 className="h-4 w-4 text-[#5C8D67] shrink-0" />
                <span>
                  <strong>Célula sincronizada con éxito:</strong> Vinculada/o con{" "}
                  <strong>{session.relation.partnerName || session.relation.partnerEmail}</strong>.
                  Ambos perfiles comparten la misma ficha médica y bitácora de salud.
                </span>
              </div>
            ) : session.relation?.partnerEmail ? (
              <div className="flex items-center gap-2 text-[#7F3348]">
                <Clock className="h-4 w-4 text-[#E8809A] shrink-0" />
                <span>
                  <strong>Invitación enviada por correo directo a:</strong>{" "}
                  <strong>{session.relation.partnerEmail}</strong>. El vínculo quedará 100% activo en
                  cuanto tu acompañante acepte y cree su contraseña.
                </span>
              </div>
            ) : (
              <p className="text-espresso/70">
                Aún no has vinculado un acompañante. Puedes invitar a tu familiar o cuidador desde este
                panel en cualquier momento enviándole un correo directo.
              </p>
            )}
          </div>
        </div>
      )}

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

"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bell, Dumbbell, HeartPulse, MapPin, User } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type RoleKey = "paciente" | "cuidador" | "sanador" | "admin";

interface NavTabItem {
  id: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  labelEs: string;
  labelEn: string;
}

const ROLE_TABS: Record<RoleKey, NavTabItem[]> = {
  paciente: [
    {
      id: "practicas",
      icon: Dumbbell,
      labelEs: "Recursos",
      labelEn: "Resources",
    },
    {
      id: "salud",
      icon: HeartPulse,
      labelEs: "Mi Camino",
      labelEn: "My Journey",
    },
    {
      id: "inicio",
      icon: MapPin,
      labelEs: "Resumen",
      labelEn: "Summary",
    },
    {
      id: "alertas",
      icon: Bell,
      labelEs: "Recordatorios",
      labelEn: "Reminders",
    },
    {
      id: "perfil",
      icon: User,
      labelEs: "Mi Perfil",
      labelEn: "My Profile",
    },
  ],
  cuidador: [
    {
      id: "autocuidado",
      icon: Dumbbell,
      labelEs: "Autocuidado",
      labelEn: "Self-Care",
    },
    {
      id: "salud-paciente",
      icon: HeartPulse,
      labelEs: "Ficha Paciente",
      labelEn: "Patient Chart",
    },
    {
      id: "inicio",
      icon: MapPin,
      labelEs: "Centro Familiar",
      labelEn: "Family Hub",
    },
    {
      id: "alertas",
      icon: Bell,
      labelEs: "Agenda y Avisos",
      labelEn: "Schedule",
    },
    {
      id: "perfil",
      icon: User,
      labelEs: "Mi Perfil",
      labelEn: "My Profile",
    },
  ],
  sanador: [
    {
      id: "contenidos",
      icon: Dumbbell,
      labelEs: "Recursos BAM",
      labelEn: "BAM Content",
    },
    {
      id: "pacientes",
      icon: HeartPulse,
      labelEs: "Fichas + IA",
      labelEn: "Charts + AI",
    },
    {
      id: "inicio",
      icon: MapPin,
      labelEs: "Agenda y Sesiones",
      labelEn: "Sessions Hub",
    },
    {
      id: "alertas",
      icon: Bell,
      labelEs: "Reservas",
      labelEn: "Bookings",
    },
    {
      id: "perfil",
      icon: User,
      labelEs: "Mi Perfil",
      labelEn: "My Profile",
    },
  ],
  admin: [
    {
      id: "contenidos",
      icon: Dumbbell,
      labelEs: "Web EN/ES",
      labelEn: "Web CMS",
    },
    {
      id: "familias",
      icon: HeartPulse,
      labelEs: "Familias 1 a 1",
      labelEn: "Family Cells",
    },
    {
      id: "inicio",
      icon: MapPin,
      labelEs: "Centro y PONO IA",
      labelEn: "Control & AI",
    },
    {
      id: "alertas",
      icon: Bell,
      labelEs: "Tickets",
      labelEn: "Tickets",
    },
    {
      id: "perfil",
      icon: User,
      labelEs: "Cuenta Admin",
      labelEn: "Admin Account",
    },
  ],
};

// Coordenadas en el sistema SVG (ancho 420, 5 columnas con margen lateral de 20 -> cada columna mide 76)
const SVG_WIDTH = 420;
const SVG_HEIGHT = 86;
const BAR_TOP_Y = 18;
const SLOT_CENTERS = [58, 134, 210, 286, 362];

function buildCurvedBarPath(cx: number): string {
  const r = 26; // Radio de las esquinas exteriores de la barra blanca
  const notchHalfWidth = 48; // Ancho medio de la curva cóncava
  const notchBottomY = 56; // Profundidad de la curva bajo la esfera rosa

  const leftStart = Math.max(r + 2, cx - notchHalfWidth);
  const rightEnd = Math.min(SVG_WIDTH - r - 2, cx + notchHalfWidth);

  return [
    `M 0 ${BAR_TOP_Y + r}`,
    `Q 0 ${BAR_TOP_Y} ${r} ${BAR_TOP_Y}`,
    `L ${leftStart.toFixed(2)} ${BAR_TOP_Y}`,
    // Curva orgánica de bajada hacia el centro de la muesca
    `C ${(cx - notchHalfWidth * 0.52).toFixed(2)} ${BAR_TOP_Y}, ${(
      cx -
      notchHalfWidth * 0.42
    ).toFixed(2)} ${notchBottomY}, ${cx.toFixed(2)} ${notchBottomY}`,
    // Curva orgánica de subida desde el centro de la muesca
    `C ${(cx + notchHalfWidth * 0.42).toFixed(2)} ${notchBottomY}, ${(
      cx +
      notchHalfWidth * 0.52
    ).toFixed(2)} ${BAR_TOP_Y}, ${rightEnd.toFixed(2)} ${BAR_TOP_Y}`,
    `L ${SVG_WIDTH - r} ${BAR_TOP_Y}`,
    `Q ${SVG_WIDTH} ${BAR_TOP_Y} ${SVG_WIDTH} ${BAR_TOP_Y + r}`,
    `L ${SVG_WIDTH} ${SVG_HEIGHT - r}`,
    `Q ${SVG_WIDTH} ${SVG_HEIGHT} ${SVG_WIDTH - r} ${SVG_HEIGHT}`,
    `L ${r} ${SVG_HEIGHT}`,
    `Q 0 ${SVG_HEIGHT} 0 ${SVG_HEIGHT - r}`,
    "Z",
  ].join(" ");
}

function resolveCurrentRole(pathname: string): RoleKey | null {
  if (pathname.startsWith("/paciente")) return "paciente";
  if (pathname.startsWith("/cuidador")) return "cuidador";
  if (pathname.startsWith("/sanador")) return "sanador";
  if (pathname.startsWith("/admin")) return "admin";
  return null;
}

function MobileBottomNavInner() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguage();
  const isEs = locale === "es";

  const role = resolveCurrentRole(pathname || "");
  const tabs = role ? ROLE_TABS[role] : null;

  // El tab central ("inicio", índice 2) es el activo por defecto, igual que en la referencia
  const currentTabParam = searchParams.get("tab") || "inicio";
  const activeIndex = tabs
    ? Math.max(
        0,
        tabs.findIndex((t) => t.id === currentTabParam) !== -1
          ? tabs.findIndex((t) => t.id === currentTabParam)
          : 2
      )
    : 2;

  const targetCx = SLOT_CENTERS[activeIndex] ?? SLOT_CENTERS[2];
  const [animatedCx, setAnimatedCx] = useState<number>(targetCx);
  const animRef = useRef<number | null>(null);
  const currentCxRef = useRef<number>(targetCx);

  useEffect(() => {
    const startCx = currentCxRef.current;
    const diff = targetCx - startCx;
    if (Math.abs(diff) < 0.5) {
      currentCxRef.current = targetCx;
      setAnimatedCx(targetCx);
      return;
    }

    const duration = 340;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Ease out back sutil para efecto orgánico de líquido
      const eased = 1 - Math.pow(1 - t, 3);
      const nextVal = startCx + diff * eased;
      currentCxRef.current = nextVal;
      setAnimatedCx(nextVal);

      if (t < 1) {
        animRef.current = requestAnimationFrame(step);
      }
    };

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [targetCx]);

  if (!role || !tabs) {
    return null;
  }

  const ActiveIcon = tabs[activeIndex]?.icon || MapPin;
  const activePercent = (animatedCx / SVG_WIDTH) * 100;

  const handleSelectTab = (tabId: string) => {
    const baseRoute = `/${role}`;
    if (tabId === "inicio") {
      router.push(baseRoute, { scroll: false });
    } else {
      router.push(`${baseRoute}?tab=${tabId}`, { scroll: false });
    }
  };

  return (
    <div className="pointer-events-none fixed bottom-3 left-0 right-0 z-50 flex justify-center px-3 sm:bottom-5">
      <nav
        aria-label={isEs ? "Navegación del panel" : "Panel navigation"}
        className="pointer-events-auto relative w-full max-w-[420px] select-none"
        style={{ aspectRatio: `${SVG_WIDTH} / ${SVG_HEIGHT}` }}
      >
        {/* 1. Resplandor rosado ambiental detrás de la muesca cóncava */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-1 h-14 w-14 -translate-x-1/2 rounded-full bg-[#E86C8D]/35 blur-md"
          style={{ left: `${activePercent}%` }}
        />

        {/* 2. Barra blanca con curva cóncava dinámica en SVG */}
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="h-full w-full drop-shadow-[0_14px_34px_rgba(38,35,34,0.18)]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="lheBarSurface" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FCFBF9" />
            </linearGradient>
          </defs>
          <path
            d={buildCurvedBarPath(animatedCx)}
            fill="url(#lheBarSurface)"
            stroke="rgba(230, 116, 142, 0.14)"
            strokeWidth="1"
          />
          {/* Línea indicadora inferior estilo iOS (como en la imagen de referencia) */}
          <rect
            x={(SVG_WIDTH - 134) / 2}
            y={SVG_HEIGHT - 9}
            width="134"
            height="4"
            rx="2"
            fill="#E3DFDC"
          />
        </svg>

        {/* 3. Botón circular flotante 3D rosa/magenta encajado dentro de la curva */}
        <div
          className="pointer-events-none absolute top-[1%] z-20 flex h-[54px] w-[54px] -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#F48EA6] via-[#DC5678] to-[#B03052] text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.45),0_10px_22px_rgba(196,54,92,0.5)] ring-1 ring-white/25"
          style={{ left: `${activePercent}%` }}
        >
          <ActiveIcon className="h-6 w-6 drop-shadow-sm" strokeWidth={2.3} />
        </div>

        {/* 4. Los 5 botones interactivos alineados con los centros de la barra */}
        <div
          className="absolute inset-x-0 bottom-[12%] top-[22%] z-30 grid grid-cols-5 px-[4.76%]"
        >
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = idx === activeIndex;
            const label = isEs ? tab.labelEs : tab.labelEn;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                title={label}
                className="group relative flex flex-col items-center justify-center focus:outline-none"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                    isActive
                      ? "pointer-events-none scale-50 opacity-0"
                      : "text-[#262322] opacity-85 group-hover:scale-110 group-hover:text-[#D85678]"
                  }`}
                >
                  <Icon className="h-[22px] w-[22px]" strokeWidth={2} />
                </span>
                <span
                  className={`mt-0.5 text-[9px] font-bold tracking-tight transition-all duration-200 ${
                    isActive
                      ? "translate-y-1 text-[#C94A6A] opacity-100"
                      : "text-[#262322]/55 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function MobileBottomNav() {
  return (
    <Suspense fallback={null}>
      <MobileBottomNavInner />
    </Suspense>
  );
}


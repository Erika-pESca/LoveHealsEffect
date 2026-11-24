"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  HeartPulse,
  Home,
  Layers,
  Leaf,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type RoleKey = "paciente" | "cuidador" | "sanador" | "admin";

interface NavTabItem {
  id: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  labelEs: string;
  labelEn: string;
}

/**
 * Íconos que representan exactamente la pantalla emergente de cada tab:
 *
 * PACIENTE:
 *   - practicas: Recursos holísticos (movimiento BAM, meditaciones, Love Circles) -> Sparkles ✨
 *   - salud: Mi Camino (cáncer, oncología, notas médicas, exámenes) -> HeartPulse 💓
 *   - inicio: Resumen / Inicio del día (PONO IA, ánimo diario, agua) -> Home 🏠 (reemplaza MapPin)
 *   - alertas: Recordatorios (tomas de medicina, citas médicas) -> Bell 🔔
 *   - perfil: Mi Perfil (datos personales y racha) -> User 👤
 *
 * CUIDADOR:
 *   - autocuidado: Autocuidado del cuidador (pausas conscientes, evitar burnout) -> Leaf 🌿
 *   - salud-paciente: Ficha Paciente (salud y medicinas del ser querido) -> HeartPulse 💓
 *   - inicio: Centro Familiar (estado diario de la célula) -> Home 🏠 (reemplaza MapPin)
 *   - alertas: Agenda y Avisos (citas y medicinas compartidas) -> Bell 🔔
 *   - perfil: Mi Perfil -> User 👤
 *
 * SANADOR:
 *   - contenidos: Recursos BAM (talleres y prácticas holísticas) -> Sparkles ✨
 *   - pacientes: Fichas + IA (seguimiento de pacientes acompañados) -> Users 👥
 *   - inicio: Agenda y Sesiones -> Home 🏠 (reemplaza MapPin)
 *   - alertas: Reservas -> Bell 🔔
 *   - perfil: Mi Perfil -> User 👤
 *
 * ADMIN:
 *   - contenidos: Web EN/ES -> Layers 📚
 *   - familias: Familias 1 a 1 -> Users 👥
 *   - inicio: Centro y PONO -> Home 🏠 (reemplaza MapPin)
 *   - alertas: Tickets -> Bell 🔔
 *   - perfil: Cuenta Admin -> User 👤
 */
const ROLE_TABS: Record<RoleKey, NavTabItem[]> = {
  paciente: [
    {
      id: "recursos",
      icon: Sparkles,
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
      icon: Home,
      labelEs: "Inicio",
      labelEn: "Home",
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
      icon: Leaf,
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
      icon: Home,
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
      icon: Sparkles,
      labelEs: "Recursos BAM",
      labelEn: "BAM Content",
    },
    {
      id: "pacientes",
      icon: Users,
      labelEs: "Fichas + IA",
      labelEn: "Charts + AI",
    },
    {
      id: "inicio",
      icon: Home,
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
      icon: Layers,
      labelEs: "Web EN/ES",
      labelEn: "Web CMS",
    },
    {
      id: "familias",
      icon: Users,
      labelEs: "Familias 1 a 1",
      labelEn: "Family Cells",
    },
    {
      id: "inicio",
      icon: Home,
      labelEs: "Centro y PONO",
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

function resolveCurrentRole(pathname: string): RoleKey | null {
  if (pathname.startsWith("/paciente")) return "paciente";
  if (pathname.startsWith("/cuidador")) return "cuidador";
  if (pathname.startsWith("/sanador")) return "sanador";
  if (pathname.startsWith("/admin")) return "admin";
  return null;
}

/* ========================================================================== */
/*  FÍSICA DEL TRAMPOLÍN LÍQUIDO V2 - liquid-tab-bar (1).html                 */
/* ========================================================================== */
const TOP = 28; // Espacio sobre la barra para que la cuna respire (px)
const BAR_H = 88; // Alto de la barra navegadora (px)
const H = TOP + BAR_H; // Alto total del SVG (116px)
const R = 28; // Radio de la burbuja (56px de diámetro)
const CORNER_R = 24; // Radio de las esquinas de la barra flotante
const HALF = 64; // Medio ancho de la cuna (px) -> liquid-tab-bar (1).html
const DEPTH = 38; // Profundidad de la cuna bajo la esfera
const STEP = 3; // Resolución horizontal de la curva del borde

const PRESS = 60; // ms de carga previa al disparo
const LOAD = 6; // px que se hunde la cuna al cargar
const FLY_BASE = 190; // ms mínimos de vuelo del salto
const FLY_PER_PX = 0.58; // ms por cada píxel de distancia recorrida
const ARC = 44; // Altura parabólica del salto sobre la barra
const H_END = 24; // Altura a la que la burbuja hace contacto al caer

const K_REL = 0.25; // Constante de resorte al soltar (la cuna se aplana de golpe)
const D_REL = 0.55; // Amortiguación de despegue
const K_LAND = 0.19; // Constante de resorte al recibir
const D_LAND = 0.54; // Amortiguación de aterrizaje sin rebote brusco

// Actualización clave de liquid-tab-bar (1).html:
const RIPPLE_OUT = 1.5; // Onda mínima al salir (borde más limpio)
const RIPPLE_IN = 2.5; // Onda mínima al caer

const DT = 1000 / 60; // Paso fijo de física (60 FPS)
const RK = 0.06;
const RW = 22;
const RC = RW / RK;

const smooth = (x: number) => {
  const c = Math.max(0, Math.min(1, x));
  return c * c * (3 - 2 * c);
};

interface Ripple {
  x: number;
  t: number;
  a: number;
  decay: number;
}

function MobileBottomNavInner() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguage();
  const isEs = locale === "es";

  const role = resolveCurrentRole(pathname || "");
  const tabs = role ? ROLE_TABS[role] : null;

  // Tab activo según query param ?tab= (por defecto "inicio", índice 2)
  const rawTabParam = searchParams.get("tab") || "inicio";
  const currentTabParam = rawTabParam === "practicas" ? "recursos" : rawTabParam;
  const targetActiveIndex = tabs
    ? Math.max(
        0,
        tabs.findIndex((t) => t.id === currentTabParam) !== -1
          ? tabs.findIndex((t) => t.id === currentTabParam)
          : 2
      )
    : 2;

  const navRef = useRef<HTMLElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  // Estados reactivos de la interfaz
  const [activeIdx, setActiveIdx] = useState<number>(targetActiveIndex);
  const [bubbleIconIdx, setBubbleIconIdx] = useState<number>(targetActiveIndex);
  const [isBubbleIconHidden, setIsBubbleIconHidden] = useState<boolean>(false);
  const [isBubbleIconPopping, setIsBubbleIconPopping] = useState<boolean>(false);
  const [dimmedIdx, setDimmedIdx] = useState<number | null>(null);
  const [pathD, setPathD] = useState<string>("");
  const [barWidth, setBarWidth] = useState<number>(400);

  // Variables mutables del motor de física continua
  const physicsRef = useRef<{
    w: number;
    centers: number[];
    idx: number;
    from: number;
    to: number;
    pending: number | null;
    phase: "idle" | "press" | "fly" | "land";
    pt: number;
    dimmed: boolean;
    nx: number;
    dp: number;
    dv: number;
    dtgt: number;
    bxp: number;
    by: number;
    by0: number;
    fromX: number;
    toX: number;
    T: number;
    stretch: number;
    stretchT: number;
    ripples: Ripple[];
    raf: number | null;
    last: number;
    acc: number;
    reduced: boolean;
  }>({
    w: 400,
    centers: [40, 120, 200, 280, 360],
    idx: targetActiveIndex,
    from: targetActiveIndex,
    to: targetActiveIndex,
    pending: null,
    phase: "idle",
    pt: 0,
    dimmed: false,
    nx: 200,
    dp: DEPTH,
    dv: 0,
    dtgt: DEPTH,
    bxp: 200,
    by: 0,
    by0: 0,
    fromX: 200,
    toX: 200,
    T: 300,
    stretch: 0,
    stretchT: 0,
    ripples: [],
    raf: null,
    last: 0,
    acc: 0,
    reduced: false,
  });

  /**
   * Generación de la curva con COSENO ELEVADO de liquid-tab-bar (1).html:
   * "Cuna en coseno elevado: baja suave, se une tangente a la recta y NUNCA sube por encima de ella".
   * Además incorpora esquinas redondeadas elegantes para la barra flotante.
   */
  const generatePathD = useCallback((w: number, nx: number, dp: number, ripples: Ripple[]) => {
    let d = `M 0 ${H - CORNER_R} L 0 ${TOP + CORNER_R} Q 0 ${TOP} ${CORNER_R} ${TOP}`;

    for (let x = CORNER_R; x <= w - CORNER_R; x += STEP) {
      const xx = Math.min(x, w - CORNER_R);
      // Fórmula del coseno elevado de liquid-tab-bar (1).html
      const u = Math.abs(xx - nx) / HALF;
      let y = TOP + (u < 1 ? dp * 0.5 * (1 + Math.cos(Math.PI * u)) : 0);

      // Ondas dinámicas sutiles en la superficie
      for (const r of ripples) {
        const dx = Math.abs(xx - r.x);
        const front = 1 / (1 + Math.exp((dx - RC * r.t) / 14));
        y += r.a * Math.sin(RK * dx - RW * r.t) * Math.exp(-dx / 160) * front;
      }
      d += ` L ${xx.toFixed(2)} ${y.toFixed(2)}`;
    }

    d += ` L ${w - CORNER_R} ${TOP} Q ${w} ${TOP} ${w} ${TOP + CORNER_R} L ${w} ${H - CORNER_R} Q ${w} ${H} ${w - CORNER_R} ${H} L ${CORNER_R} ${H} Q 0 ${H} 0 ${H - CORNER_R} Z`;
    return d;
  }, []);

  // Medición geométrica de la barra y centros de cada pestaña
  const measure = useCallback(() => {
    if (!navRef.current) return;
    const navEl = navRef.current;
    const rect = navEl.getBoundingClientRect();
    const w = rect.width || 400;
    setBarWidth(w);

    const tabButtons = navEl.querySelectorAll<HTMLButtonElement>(".lhe-tab-btn");
    const centers: number[] = [];
    tabButtons.forEach((btn) => {
      const bRect = btn.getBoundingClientRect();
      centers.push(bRect.left - rect.left + bRect.width / 2);
    });

    const fallbackCenters = [
      w * 0.1,
      w * 0.3,
      w * 0.5,
      w * 0.7,
      w * 0.9,
    ];

    const finalCenters = centers.length === 5 ? centers : fallbackCenters;
    physicsRef.current.w = w;
    physicsRef.current.centers = finalCenters;

    const currentX = finalCenters[physicsRef.current.idx] ?? w / 2;
    if (physicsRef.current.phase === "idle") {
      physicsRef.current.bxp = currentX;
      physicsRef.current.nx = currentX;
      const initialPath = generatePathD(w, currentX, DEPTH, []);
      setPathD(initialPath);
      if (pathRef.current) pathRef.current.setAttribute("d", initialPath);
      if (bubbleRef.current) {
        bubbleRef.current.style.transform = `translate3d(${currentX - R}px, 0px, 0) scale(1, 1)`;
      }
    }
  }, [generatePathD]);

  // Dibujo cuadro a cuadro del motor físico
  const draw = useCallback(() => {
    const p = physicsRef.current;
    const dStr = generatePathD(p.w, p.nx, p.dp, p.ripples);
    if (pathRef.current) {
      pathRef.current.setAttribute("d", dStr);
    }

    if (bubbleRef.current) {
      const sx = 1 + 0.14 * p.stretch;
      const sy = 1 - 0.1 * p.stretch;
      bubbleRef.current.style.transform = `translate3d(${p.bxp - R}px, ${p.by}px, 0) scale(${sx}, ${sy})`;
    }
  }, [generatePathD]);

  const land = useCallback(() => {
    const p = physicsRef.current;
    p.phase = "land";
    p.pt = 0;
    p.nx = p.toX;
    p.dp = 0;
    p.dv = 0;
    p.dtgt = DEPTH;
    p.stretchT = 0;
    p.ripples.push({ x: p.toX, t: 0, a: RIPPLE_IN, decay: 4 });

    setActiveIdx(p.to);
    setDimmedIdx(null);
    setBubbleIconIdx(p.to);
    setIsBubbleIconHidden(false);
    setIsBubbleIconPopping(true);

    setTimeout(() => {
      setIsBubbleIconPopping(false);
    }, 240);
  }, []);

  const launch = useCallback(() => {
    const p = physicsRef.current;
    p.phase = "fly";
    p.pt = 0;
    p.idx = p.to;
    p.dimmed = false;
    setDimmedIdx(null);
    p.fromX = p.centers[p.from] ?? p.w / 2;
    p.toX = p.centers[p.to] ?? p.w / 2;
    p.T = FLY_BASE + Math.abs(p.toX - p.fromX) * FLY_PER_PX;
    p.by0 = p.by;
    p.dtgt = 0; // La cuna se aplana de golpe y expulsa la burbuja
    p.dv -= 3;
    p.stretchT = 1;
    p.ripples.push({ x: p.nx, t: 0, a: RIPPLE_OUT, decay: 5 });

    setIsBubbleIconHidden(true); // Durante el vuelo la burbuja viaja vacía
  }, []);

  const stepPhysics = useCallback(() => {
    const p = physicsRef.current;
    const rel = p.phase === "press" || p.phase === "fly";
    const K = rel ? K_REL : K_LAND;
    const D = rel ? D_REL : D_LAND;
    p.dv = (p.dv + (p.dtgt - p.dp) * K) * D;
    p.dp += p.dv;
    p.stretch += (p.stretchT - p.stretch) * 0.25;

    for (const r of p.ripples) {
      r.t += DT / 1000;
      r.a *= Math.exp(-r.decay * (DT / 1000));
    }
    p.ripples = p.ripples.filter((r) => r.a > 0.15);

    if (p.phase === "press") {
      p.pt += DT;
      p.dtgt = DEPTH + LOAD;
      p.by = (p.dp - DEPTH) * 0.95;
      p.bxp = p.centers[p.from] ?? p.w / 2;
      if (p.pt >= PRESS) launch();
    } else if (p.phase === "fly") {
      p.pt += DT;
      const s = Math.min(p.pt / p.T, 1);
      // Arranca rápido y frena suavemente hacia el destino
      p.bxp = p.fromX + (p.toX - p.fromX) * (1 - Math.pow(1 - s, 2.2));
      const rise = smooth(s / 0.3);
      const fall = smooth((s - 0.6) / 0.4);
      p.by = p.by0 * (1 - rise) - rise * (ARC * (1 - fall) + H_END * fall);

      if (!p.dimmed && s >= 0.45) {
        p.dimmed = true;
        setDimmedIdx(p.to);
      }

      if (s >= 1) land();
    } else if (p.phase === "land") {
      p.pt += DT;
      p.bxp = p.toX;
      p.by = -H_END * (1 - Math.max(0, Math.min(1, p.dp / DEPTH)));
      if (p.pt > 120 && Math.abs(p.dp - DEPTH) < 0.15 && Math.abs(p.dv) < 0.15) {
        p.phase = "idle";
        p.dp = DEPTH;
        p.dv = 0;
        p.by = 0;
      }
    } else {
      // Idle
      p.bxp = p.centers[p.idx] ?? p.w / 2;
      p.by = 0;
      if (p.pending !== null) {
        const next = p.pending;
        p.pending = null;
        triggerGo(next);
      }
    }
  }, [launch, land]);

  // Bucle a 60 FPS
  const frame = useCallback(
    (now: number) => {
      const p = physicsRef.current;
      if (!p.last) p.last = now;
      p.acc += Math.min(now - p.last, 64);
      p.last = now;

      while (p.acc >= DT) {
        stepPhysics();
        p.acc -= DT;
      }
      draw();

      if (p.phase === "idle" && p.ripples.length === 0 && p.pending === null) {
        p.raf = null;
        p.last = 0;
        return;
      }
      p.raf = requestAnimationFrame(frame);
    },
    [stepPhysics, draw]
  );

  const kick = useCallback(() => {
    const p = physicsRef.current;
    if (!p.raf) {
      p.last = 0;
      p.acc = 0;
      p.raf = requestAnimationFrame(frame);
    }
  }, [frame]);

  const triggerGo = useCallback(
    (targetIndex: number) => {
      const p = physicsRef.current;
      if (p.phase !== "idle") {
        p.pending = targetIndex;
        return;
      }
      if (targetIndex === p.idx) return;

      if (p.reduced) {
        p.idx = targetIndex;
        setActiveIdx(targetIndex);
        setBubbleIconIdx(targetIndex);
        p.bxp = p.nx = p.centers[targetIndex] ?? p.w / 2;
        draw();
        return;
      }

      p.from = p.idx;
      p.to = targetIndex;
      p.phase = "press";
      p.pt = 0;
      kick();
    },
    [kick, draw]
  );

  const handleSelectTab = (idx: number, tabId: string) => {
    if (!role) return;
    triggerGo(idx);
    const baseRoute = `/${role}`;
    if (tabId === "inicio") {
      router.push(baseRoute, { scroll: false });
    } else {
      router.push(`${baseRoute}?tab=${tabId}`, { scroll: false });
    }
  };

  useEffect(() => {
    if (physicsRef.current.idx !== targetActiveIndex) {
      triggerGo(targetActiveIndex);
    }
  }, [targetActiveIndex, triggerGo]);

  useEffect(() => {
    physicsRef.current.reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    measure();

    let resizeObserver: ResizeObserver | null = null;
    if (navRef.current && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        measure();
      });
      resizeObserver.observe(navRef.current);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (physicsRef.current.raf) {
        cancelAnimationFrame(physicsRef.current.raf);
      }
    };
  }, [measure]);

  if (!role || !tabs) {
    return null;
  }

  const ActiveBubbleIcon = tabs[bubbleIconIdx]?.icon || Home;

  return (
    <div className="pointer-events-none fixed bottom-3 left-0 right-0 z-50 flex justify-center px-3 sm:bottom-5">
      <nav
        ref={navRef}
        aria-label={isEs ? "Navegación del panel" : "Panel navigation"}
        className="pointer-events-auto relative w-full max-w-[420px] select-none"
        style={{ height: `${H}px` }}
      >
        {/* 1. Fondo de la barra con la curva en coseno elevado de liquid-tab-bar (1).html */}
        <svg
          viewBox={`0 0 ${barWidth} ${H}`}
          className="absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_16px_36px_rgba(38,35,34,0.18)]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="lheLiquidBarSurfaceV2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FCFAF8" />
            </linearGradient>
          </defs>
          <path
            ref={pathRef}
            d={pathD || generatePathD(barWidth, physicsRef.current.nx, DEPTH, [])}
            fill="url(#lheLiquidBarSurfaceV2)"
            stroke="rgba(232, 128, 154, 0.18)"
            strokeWidth="1.2"
          />
          {/* Indicador inferior iOS estilizado */}
          <rect
            x={(barWidth - 120) / 2}
            y={H - 9}
            width="120"
            height="4"
            rx="2"
            fill="#E5E0DC"
          />
        </svg>

        {/* 2. Burbuja 3D flotante con física elástica de trampolín */}
        <div
          ref={bubbleRef}
          aria-hidden="true"
          className="pointer-events-none absolute z-30 flex items-center justify-center rounded-full text-white will-change-transform"
          style={{
            top: `${TOP + 9 - R}px`,
            left: 0,
            width: `${R * 2}px`,
            height: `${R * 2}px`,
            background:
              "linear-gradient(135deg, #F48EA6 0%, #DC5678 50%, #B03052 100%)",
            boxShadow:
              "0 10px 22px rgba(196, 54, 92, 0.46), inset 0 2px 3px rgba(255, 255, 255, 0.45)",
          }}
        >
          <span
            className={`flex items-center justify-center text-white transition-opacity duration-100 ${
              isBubbleIconHidden ? "opacity-0 scale-50" : "opacity-100 scale-100"
            } ${isBubbleIconPopping ? "animate-bubble-pop" : ""}`}
          >
            <ActiveBubbleIcon className="h-6 w-6 drop-shadow-xs" strokeWidth={2.2} />
          </span>
        </div>

        {/* 3. Botones interactivos distribuidos exactamente en los 5 slots */}
        <div
          className="absolute inset-x-0 grid grid-cols-5"
          style={{
            top: `${TOP + 8}px`,
            height: `${BAR_H - 12}px`,
          }}
        >
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = idx === activeIdx;
            const isDimmed = idx === dimmedIdx;
            const label = isEs ? tab.labelEs : tab.labelEn;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(idx, tab.id)}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                title={label}
                className="lhe-tab-btn group relative flex flex-col items-center justify-center focus:outline-none"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                    isActive
                      ? "pointer-events-none scale-50 opacity-0"
                      : isDimmed
                      ? "scale-90 opacity-25"
                      : "text-[#262322] opacity-85 group-hover:scale-110 group-hover:text-[#D85678]"
                  }`}
                >
                  <Icon className="h-[22px] w-[22px]" strokeWidth={2} />
                </span>

                <span
                  className={`text-[9px] font-bold tracking-tight transition-all duration-200 ${
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

      {/* Animación Pop del ícono dentro de la burbuja */}
      <style jsx global>{`
        @keyframes bubblePop {
          0% {
            transform: scale(0.45);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bubble-pop {
          animation: bubblePop 0.22s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
        }
      `}</style>
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

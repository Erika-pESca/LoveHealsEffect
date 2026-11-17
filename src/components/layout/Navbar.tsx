"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export function Navbar() {
  const { locale, setLocale, dict } = useLanguage();
  const pathname = usePathname() || "";
  const isAuthPage = pathname.startsWith("/auth");
  const isPanelPage =
    pathname.startsWith("/paciente") ||
    pathname.startsWith("/cuidador") ||
    pathname.startsWith("/sanador") ||
    pathname.startsWith("/admin");
  const isEs = locale === "es";

  // En los 4 paneles de usuario no se muestra el header superior; solo queda la barra inferior curva
  if (isPanelPage) {
    return null;
  }

  const navLinks = isEs
    ? [
        { href: "/#inicio", label: "Inicio" },
        { href: "/#que-brindamos", label: "Quiénes somos" },
        { href: "/#equipo-especializado", label: "Equipo" },
        { href: "/#que-encuentras", label: "Prácticas" },
        { href: "/#bitacora-trazabilidad", label: "Bitácora" },
      ]
    : [
        { href: "/#inicio", label: "Home" },
        { href: "/#que-brindamos", label: "About us" },
        { href: "/#equipo-especializado", label: "Care Team" },
        { href: "/#que-encuentras", label: "Practices" },
        { href: "/#bitacora-trazabilidad", label: "Medical Log" },
      ];

  return (
    <header
      className={`pointer-events-none ${
        isAuthPage ? "fixed top-3 left-0 right-0" : "sticky top-3"
      } z-40 flex justify-center px-4`}
    >
      <div className="pointer-events-auto flex w-full max-w-5xl items-center justify-between gap-3 rounded-full border border-white/70 bg-white/85 px-3.5 py-2 shadow-[0_10px_32px_rgba(232,128,154,0.2)] backdrop-blur-xl sm:px-5">
        {/* LOGO REAL */}
        <Link href="/" className="inline-flex items-center gap-2.5">
          <img
            src="/img/logo.jpg"
            alt="Love Heals Effect"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-[#E8809A]/60 shadow-sm"
          />
          <span className="font-serif text-sm font-bold tracking-tight text-[#2D2B2A] sm:text-base">
            {dict.nav.brandName}{" "}
            <span className="text-veranda-blue">{dict.nav.brandAccent}</span>
          </span>
        </Link>

        {/* ENLACES CENTRALES */}
        <nav className="hidden items-center gap-5 text-xs font-semibold text-[#2D2B2A] md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-[#E8809A]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* IDIOMA + INICIAR SESIÓN */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-full border border-[#E8809A]/25 bg-white p-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`rounded-full px-2.5 py-1 transition ${
                locale === "en"
                  ? "bg-[#2D2B2A] text-white"
                  : "text-[#2D2B2A]/60 hover:text-[#2D2B2A]"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale("es")}
              className={`rounded-full px-2.5 py-1 transition ${
                locale === "es"
                  ? "bg-[#2D2B2A] text-white"
                  : "text-[#2D2B2A]/60 hover:text-[#2D2B2A]"
              }`}
            >
              ES
            </button>
          </div>

          <Link
            href="/auth/registro"
            className="inline-flex items-center rounded-full bg-[#E8809A] px-4 py-2 text-xs font-bold text-white shadow-[0_6px_16px_rgba(232,128,154,0.35)] transition hover:brightness-105"
          >
            {isEs ? "Empieza aquí" : "Start here"}
          </Link>
        </div>
      </div>
    </header>
  );
}

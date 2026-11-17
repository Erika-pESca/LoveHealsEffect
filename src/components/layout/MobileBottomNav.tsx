"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarHeart, Compass, Home, User } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const isSessionRoute =
    pathname.startsWith("/paciente") ||
    pathname.startsWith("/cuidador") ||
    pathname.startsWith("/sanador") ||
    pathname.startsWith("/admin");

  if (!isSessionRoute) {
    return null;
  }

  const items = [
    { href: "/", icon: Home, label: "Inicio", match: (p: string) => p === "/" },
    {
      href: "/#etapas",
      icon: Compass,
      label: "Etapas",
      match: (p: string) => p.startsWith("/paciente") || p.startsWith("/cuidador"),
    },
    {
      href: "/#circulos",
      icon: CalendarHeart,
      label: "Círculos",
      match: (p: string) => p.startsWith("/sanador"),
    },
    {
      href: "/auth/login",
      icon: User,
      label: "Perfil",
      match: (p: string) => p.startsWith("/auth") || p.startsWith("/admin"),
    },
  ];

  return (
    <div className="pointer-events-none fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4">
      <nav
        aria-label="Navegación principal móvil"
        className="pointer-events-auto flex items-center gap-2 rounded-full border border-sky-cloud/30 bg-white p-2 shadow-[0_12px_36px_rgba(38,35,34,0.12)]"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${
                isActive
                  ? "bg-veranda-blue text-white shadow-sm"
                  : "text-espresso/60 hover:bg-lychee hover:text-espresso"
              }`}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

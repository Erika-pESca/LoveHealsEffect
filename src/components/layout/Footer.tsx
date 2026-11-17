"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { locale, dict } = useLanguage();
  const pathname = usePathname();

  if (pathname?.startsWith("/auth")) {
    return null;
  }

  return (
    <footer className="w-full border-t border-sky-cloud/20 bg-[#F9F8F3] text-espresso">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-espresso/60 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2.5">
          <img
            src="/img/logo.jpg"
            alt="Love Heals Effect"
            className="h-7 w-7 rounded-full object-cover"
          />
          <span className="font-serif font-bold text-espresso">
            {dict.nav.brandName}{" "}
            <span className="text-veranda-blue">{dict.nav.brandAccent}</span>
          </span>
          <span>·</span>
          <span>{dict.footer.subtitle}</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-veranda-blue">
            {locale === "es" ? "Inicio" : "Home"}
          </Link>
          <Link href="/auth/login" className="hover:text-veranda-blue">
            {locale === "es" ? "Entrar" : "Login"}
          </Link>
          <Link href="/auth/registro" className="hover:text-veranda-blue">
            {locale === "es" ? "Registro" : "Sign up"}
          </Link>
          <span className="hidden sm:inline">{dict.footer.copyright}</span>
        </div>
      </div>
    </footer>
  );
}

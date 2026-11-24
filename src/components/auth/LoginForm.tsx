"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Heart,
  Mail,
  Users,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { authDictionary } from "@/data/authDictionary";
import { validateEmail, validatePassword } from "@/lib/validation";

export function LoginForm() {
  const { locale } = useLanguage();
  const t = authDictionary[locale].login;
  const router = useRouter();

  const [role, setRole] = useState<"paciente" | "cuidador">("paciente");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validaciones solicitadas: correo con @ y contraseña con mayúscula y número
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setErrorMsg(emailCheck.error || "El correo debe incluir @ y un formato válido.");
      return;
    }

    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      setErrorMsg(passCheck.error || "La contraseña debe incluir al menos una mayúscula y un número.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "Error al iniciar sesión.");
        setLoading(false);
        return;
      }

      setSuccessMsg(
        locale === "es"
          ? "¡Bienvenida/o! Ingresando a tu espacio..."
          : "Welcome! Entering your space..."
      );

      setTimeout(() => {
        router.push(data.redirectUrl || `/${role}`);
        router.refresh();
      }, 700);
    } catch {
      setErrorMsg(
        locale === "es"
          ? "Error de conexión al servidor. Inténtalo de nuevo."
          : "Connection error. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-24 pb-16 sm:pt-28">
      {/* Video de fondo luminoso de olas en Hawái */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="pointer-events-none absolute inset-0 h-full w-full object-cover brightness-105"
      >
        <source src="/img/Waves_rolling_onto_beach_de41b66b.mp4" type="video/mp4" />
      </video>

      {/* Bruma clara y suave (sin oscurecer el video) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-lychee/35" />

      {/* Tarjeta Light Glassmorphism (luminosa y pastel) */}
      <div className="relative z-10 w-full max-w-[395px] rounded-[30px] border border-white/80 bg-white/75 p-7 text-espresso shadow-[0_24px_60px_rgba(107,177,173,0.22)] backdrop-blur-xl sm:p-8">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-[#E5F2F1] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-veranda-blue">
            {t.badge}
          </span>
          <div className="flex gap-1 rounded-full bg-white/80 p-1 text-[11px] font-semibold shadow-sm">
            <span className="rounded-full bg-veranda-blue px-3 py-1 text-white">
              Login
            </span>
            <Link
              href="/auth/registro"
              className="rounded-full px-3 py-1 text-espresso/70 transition hover:text-espresso"
            >
              {locale === "es" ? "Registro" : "Sign up"}
            </Link>
          </div>
        </div>

        <h1 className="mt-5 text-3xl font-semibold tracking-[-0.025em] tracking-tight text-espresso">
          {t.title}
        </h1>
        <p className="mt-1.5 text-xs leading-relaxed text-espresso/70">
          {t.subtitle}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
          {/* Selector de rol de primeras */}
          <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-white/90 p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setRole("paciente")}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition ${
                role === "paciente"
                  ? "bg-[#E8809A] text-white shadow-sm"
                  : "text-espresso/70 hover:text-espresso"
              }`}
            >
              <Heart className="h-3.5 w-3.5" />
              <span>{locale === "es" ? "Soy la Paciente" : "I am Patient"}</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("cuidador")}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition ${
                role === "cuidador"
                  ? "bg-[#E8809A] text-white shadow-sm"
                  : "text-espresso/70 hover:text-espresso"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>{locale === "es" ? "Soy Cuidador" : "I am Caregiver"}</span>
            </button>
          </div>

          <div className="relative">
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="w-full rounded-2xl border border-sky-cloud/35 bg-white/80 py-3.5 pl-4 pr-11 text-sm text-espresso placeholder:text-espresso/45 transition focus:border-veranda-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-veranda-blue/15"
            />
            <Mail className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-veranda-blue" />
          </div>

          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              className="w-full rounded-2xl border border-sky-cloud/35 bg-white/80 py-3.5 pl-4 pr-11 text-sm text-espresso placeholder:text-espresso/45 transition focus:border-veranda-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-veranda-blue/15"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cupid-pink transition hover:text-espresso"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex cursor-pointer items-center gap-2 font-medium text-espresso/80">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-sky-cloud accent-[#E8809A]"
              />
              <span>{locale === "es" ? "Recordarme" : "Remember me"}</span>
            </label>

            <Link
              href="/auth/recuperar-password"
              className="text-xs font-bold text-[#E8809A] hover:underline transition"
            >
              {locale === "es" ? "¿Olvidaste tu contraseña?" : "Forgot password?"}
            </Link>
          </div>

          {errorMsg && (
            <div className="rounded-2xl border border-[#E8809A]/30 bg-[#FCECEE] px-4 py-2.5 text-xs font-medium text-[#C4546A]">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="rounded-2xl border border-[#5C8D67]/30 bg-[#F4F8F5] px-4 py-2.5 text-xs font-medium text-[#2A5C35]">
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E8809A] py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(232,128,154,0.35)] transition hover:bg-[#df6f8a] active:scale-[0.99] disabled:opacity-60"
          >
            <span>
              {loading
                ? locale === "es"
                  ? "Iniciando sesión..."
                  : "Signing in..."
                : t.submitBtn}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-espresso/75">
          {t.noAccount}{" "}
          <Link
            href="/auth/registro"
            className="font-bold text-cupid-pink hover:underline"
          >
            {t.createAccountLink}
          </Link>
        </p>
      </div>
    </div>
  );
}

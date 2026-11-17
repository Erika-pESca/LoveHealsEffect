"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Mail } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { validateEmail, validatePassword } from "@/lib/validation";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";

function RecuperarPasswordContent() {
  const { locale } = useLanguage();
  const isEs = locale === "es";
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  // Estados para solicitar correo
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para definir nueva contraseña (con token)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError("");

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setRequestError(emailCheck.error || "El correo debe incluir @ y un formato válido.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setRequestError(data.error || "Ocurrió un error al enviar el correo.");
      } else {
        setEmailSent(true);
      }
    } catch {
      setRequestError("Error de conexión al servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    const passCheck = validatePassword(newPassword);
    if (!passCheck.valid) {
      setResetError(passCheck.error || "La contraseña debe incluir al menos una mayúscula y un número.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setResetError(data.error || "No se pudo actualizar la contraseña.");
      } else {
        setResetSuccess(true);
      }
    } catch {
      setResetError("Error de conexión al servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-24 pb-16 sm:pt-28">
      {/* Video de olas de fondo */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="pointer-events-none absolute inset-0 h-full w-full object-cover brightness-105"
      >
        <source src="/img/Waves_rolling_onto_beach_de41b66b.mp4" type="video/mp4" />
      </video>

      {/* Bruma suave */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-lychee/30" />

      {/* Tarjeta de recuperación */}
      <div className="relative z-10 w-full max-w-[420px] rounded-[32px] border border-white/80 bg-white/85 p-6 text-espresso shadow-[0_24px_60px_rgba(107,177,173,0.22)] backdrop-blur-xl sm:p-8">
        {!token ? (
          /* CASO 1: SOLICITAR ENLACE POR CORREO */
          <div>
            <div className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FCECEE] text-[#E8809A]">
                <KeyRound className="h-6 w-6" />
              </span>
              <h1 className="mt-3 font-serif text-2xl font-bold text-espresso">
                {isEs ? "Recuperar Contraseña" : "Reset Password"}
              </h1>
              <p className="mt-1 text-xs text-espresso/70 leading-relaxed">
                {isEs
                  ? "Ingresa el correo electrónico de tu cuenta. Te enviaremos un enlace seguro directo para definir una nueva contraseña."
                  : "Enter your registered email. We'll send a direct secure link to set a new password."}
              </p>
            </div>

            {requestError && (
              <div className="mt-4 rounded-2xl bg-[#FCECEE] p-3 text-xs text-[#C4546A] border border-[#E8809A]/30">
                {requestError}
              </div>
            )}

            {emailSent ? (
              <div className="mt-5 space-y-4 text-center">
                <div className="rounded-2xl border border-[#5C8D67]/30 bg-[#F4F8F5] p-4 text-xs text-[#2A5C35]">
                  <CheckCircle2 className="mx-auto h-7 w-7 text-[#5C8D67] mb-2" />
                  <p className="font-bold">
                    {isEs ? "¡Correo enviado con éxito!" : "Email sent successfully!"}
                  </p>
                  <p className="mt-1 text-espresso/75 leading-relaxed">
                    {isEs
                      ? `Revisa la bandeja de entrada de ${email}. Si no lo ves, revisa tu carpeta de spam o correo no deseado.`
                      : `Check your inbox at ${email}. Be sure to look into spam if needed.`}
                  </p>
                </div>

                <Link
                  href="/auth/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E8809A] py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#df6f8a]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>{isEs ? "Volver a Iniciar Sesión" : "Back to Sign In"}</span>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleRequestReset} className="mt-5 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-espresso/80">
                    {isEs ? "Correo electrónico" : "Email address"}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isEs ? "tu@correo.com" : "you@email.com"}
                      className="w-full rounded-2xl border border-espresso/15 bg-white/90 py-3 pl-10 pr-4 text-xs text-espresso shadow-xs transition placeholder:text-espresso/40 focus:border-[#E8809A] focus:outline-none focus:ring-2 focus:ring-[#E8809A]/20"
                    />
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso/45" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E8809A] py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(232,128,154,0.35)] transition hover:bg-[#df6f8a] active:scale-[0.99] disabled:opacity-60"
                >
                  <span>
                    {loading
                      ? isEs
                        ? "Enviando..."
                        : "Sending..."
                      : isEs
                      ? "Enviar Enlace de Recuperación"
                      : "Send Recovery Link"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="text-center pt-2">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-espresso/70 hover:text-espresso"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    <span>{isEs ? "Regresar al Login" : "Return to Login"}</span>
                  </Link>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* CASO 2: DEFINIR NUEVA CONTRASEÑA CON TOKEN */
          <div>
            <div className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FCECEE] text-[#E8809A]">
                <KeyRound className="h-6 w-6" />
              </span>
              <h1 className="mt-3 font-serif text-2xl font-bold text-espresso">
                {isEs ? "Nueva Contraseña" : "New Password"}
              </h1>
              <p className="mt-1 text-xs text-espresso/70">
                {isEs
                  ? "Define tu nueva contraseña segura para acceder a tu cuenta."
                  : "Set a new secure password to access your account."}
              </p>
            </div>

            {resetError && (
              <div className="mt-4 rounded-2xl bg-[#FCECEE] p-3 text-xs text-[#C4546A] border border-[#E8809A]/30">
                {resetError}
              </div>
            )}

            {resetSuccess ? (
              <div className="mt-5 space-y-4 text-center">
                <div className="rounded-2xl border border-[#5C8D67]/30 bg-[#F4F8F5] p-4 text-xs text-[#2A5C35]">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-[#5C8D67] mb-2" />
                  <p className="font-bold text-sm">
                    {isEs ? "¡Contraseña actualizada!" : "Password updated!"}
                  </p>
                  <p className="mt-1 text-espresso/75 leading-relaxed">
                    {isEs
                      ? "Tu contraseña ha sido cambiada con éxito. Ya puedes iniciar sesión."
                      : "Your password was updated successfully. You can now sign in."}
                  </p>
                </div>

                <Link
                  href="/auth/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E8809A] py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(232,128,154,0.35)] transition hover:bg-[#df6f8a]"
                >
                  <span>{isEs ? "Iniciar Sesión Ahora" : "Sign In Now"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="mt-5 space-y-3.5">
                <div>
                  <label className="mb-1 block text-xs font-bold text-espresso/80">
                    {isEs ? "Nueva contraseña" : "New password"}
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-espresso/15 bg-white/90 py-3 px-4 text-xs text-espresso shadow-xs transition placeholder:text-espresso/40 focus:border-[#E8809A] focus:outline-none focus:ring-2 focus:ring-[#E8809A]/20"
                  />

                  {/* Ralla visual de fuerza y requisitos que se deben cumplir */}
                  <PasswordStrengthIndicator password={newPassword} isEs={isEs} />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-espresso/80">
                    {isEs ? "Confirmar nueva contraseña" : "Confirm new password"}
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-espresso/15 bg-white/90 py-3 px-4 text-xs text-espresso shadow-xs transition placeholder:text-espresso/40 focus:border-[#E8809A] focus:outline-none focus:ring-2 focus:ring-[#E8809A]/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E8809A] py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(232,128,154,0.35)] transition hover:bg-[#df6f8a] active:scale-[0.99] disabled:opacity-60"
                >
                  <span>
                    {loading
                      ? isEs
                        ? "Actualizando..."
                        : "Updating..."
                      : isEs
                      ? "Guardar Nueva Contraseña"
                      : "Save New Password"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecuperarPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-espresso/70">
          Cargando...
        </div>
      }
    >
      <RecuperarPasswordContent />
    </Suspense>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Heart,
  Lock,
  Mail,
  Phone,
  User,
  Users,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { authDictionary } from "@/data/authDictionary";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  sanitizeNameInput,
  sanitizePhoneInput,
} from "@/lib/validation";

type RegisterRole = "paciente" | "cuidador";

export function RegisterWizard() {
  const { locale } = useLanguage();
  const t = authDictionary[locale].register;
  const isEs = locale === "es";
  const searchParams = useSearchParams();

  const [role, setRole] = useState<RegisterRole>("paciente");
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  const [familyName, setFamilyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [stage, setStage] = useState("diagnostico");
  const [inviteCaregiver, setInviteCaregiver] = useState(true);
  const [caregiverName, setCaregiverName] = useState("");
  const [caregiverEmail, setCaregiverEmail] = useState("");

  const [relationship, setRelationship] = useState("");
  const [isOtherRel, setIsOtherRel] = useState(false);
  const [customRelationship, setCustomRelationship] = useState("");
  const [availability, setAvailability] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [step1Error, setStep1Error] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [serverInviteUrl, setServerInviteUrl] = useState<string | null>(null);
  const [autoLinked, setAutoLinked] = useState(false);
  const [linkedPartnerName, setLinkedPartnerName] = useState<string | null>(null);
  const [linkedPartnerEmail, setLinkedPartnerEmail] = useState<string | null>(null);
  const [invitationInfo, setInvitationInfo] = useState<{
    inviterName: string;
    patientName: string;
    targetRole: string;
  } | null>(null);

  useEffect(() => {
    const rolParam = searchParams.get("rol");
    if (rolParam === "cuidador" || rolParam === "paciente") {
      setRole(rolParam);
      setStep(1);
    }

    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      fetch(`/api/auth/verify-invitation?token=${tokenParam}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && data.invitation) {
            setRole(data.invitation.targetRole);
            setInvitationInfo(data.invitation);
            if (data.invitation.targetRole === "cuidador") {
              setPatientName(data.invitation.patientName);
            }
            setStep(1);
          }
        })
        .catch(() => {});
    }
  }, [searchParams]);

  const handleProceedToStep2 = () => {
    setStep1Error("");

    // 1. Validar nombre completo (sin números)
    const nameCheck = validateName(fullName, isEs ? "nombre completo" : "full name");
    if (!nameCheck.valid) {
      setStep1Error(nameCheck.error || "Nombre inválido.");
      return;
    }

    // 2. Validar correo (debe tener @ y dominio)
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setStep1Error(emailCheck.error || "El correo debe incluir @ y un formato válido.");
      return;
    }

    // 3. Validar celular (sin letras)
    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) {
      setStep1Error(phoneCheck.error || "El celular no debe contener letras.");
      return;
    }

    // 4. Validar contraseña (al menos 1 mayúscula y 1 número)
    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      setStep1Error(passCheck.error || "La contraseña debe incluir al menos una mayúscula y un número.");
      return;
    }

    setStep(2);
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");

    // Validaciones de datos del Paso 2
    if (role === "cuidador") {
      const patientCheck = validateName(patientName, isEs ? "nombre de la paciente" : "patient name");
      if (!patientCheck.valid) {
        setRegisterError(patientCheck.error || "Nombre de paciente inválido.");
        return;
      }
      if (patientEmail) {
        const patientEmailCheck = validateEmail(patientEmail);
        if (!patientEmailCheck.valid) {
          setRegisterError(patientEmailCheck.error || "Correo de paciente inválido.");
          return;
        }
      }
    } else if (role === "paciente" && inviteCaregiver) {
      if (caregiverName) {
        const caregiverCheck = validateName(caregiverName, isEs ? "nombre del cuidador" : "caregiver name");
        if (!caregiverCheck.valid) {
          setRegisterError(caregiverCheck.error || "Nombre del cuidador inválido.");
          return;
        }
      }
      if (caregiverEmail) {
        const caregiverEmailCheck = validateEmail(caregiverEmail);
        if (!caregiverEmailCheck.valid) {
          setRegisterError(caregiverEmailCheck.error || "Correo del cuidador inválido.");
          return;
        }
      }
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          fullName,
          email,
          phone,
          password,
          cancerStage: stage,
          inviteCaregiver,
          caregiverName,
          caregiverEmail,
          caregiverRelationship: isOtherRel ? customRelationship : relationship,
          patientName,
          patientEmail,
          caregiverSchedule: availability,
          invitationToken: searchParams.get("token") || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setRegisterError(data.error || "Error al completar el registro.");
        setLoading(false);
        return;
      }

      if (data.autoLinked) {
        setAutoLinked(true);
        setLinkedPartnerName(data.linkedPartnerName || null);
        setLinkedPartnerEmail(data.linkedPartnerEmail || null);
      }

      if (data.inviteUrl) {
        setServerInviteUrl(data.inviteUrl);
      }

      setStep(3);
    } catch {
      setRegisterError("Error de conexión al servidor. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const isPatient = role === "paciente";

  const quickRelationships =
    isEs
      ? ["Esposo/a", "Hijo/a", "Madre/Padre", "Hermano/a", "Amigo/a", "Otro"]
      : ["Spouse", "Son/Daughter", "Parent", "Sibling", "Close Friend", "Other"];

  const handleSelectRelationship = (rel: string) => {
    if (rel === "Otro" || rel === "Other") {
      setIsOtherRel(true);
      setRelationship(customRelationship || "");
    } else {
      setIsOtherRel(false);
      setRelationship(rel);
    }
  };

  const [copied, setCopied] = useState(false);
  const handleCopyInviteLink = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      const inviteUrl =
        serverInviteUrl ||
        `${window.location.origin}/auth/registro?rol=${isPatient ? "cuidador" : "paciente"}&invitacion=acompanante`;
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const quickAvailability =
    isEs
      ? ["Mañanas", "Tardes", "Fines de semana", "Tiempo completo"]
      : ["Mornings", "Afternoons", "Weekends", "Full-time"];

  const lightInput =
    "w-full rounded-2xl border border-sky-cloud/35 bg-white/80 py-3.5 pl-4 pr-11 text-sm text-espresso placeholder:text-espresso/45 transition focus:border-veranda-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-veranda-blue/15";

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

      {/* Bruma clara y suave (idéntica al Login) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-lychee/35" />

      {/* Tarjeta Light Glassmorphism con ancho adaptable */}
      <div className="relative z-10 w-full max-w-[430px] rounded-[32px] border border-white/80 bg-white/85 p-6 text-espresso shadow-[0_24px_60px_rgba(107,177,173,0.22)] backdrop-blur-xl sm:p-8">
        {/* Cabecera de pasos y login toggle */}
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-[#FCECEE] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E8809A]">
            {step === 0 && (isEs ? "Paso 1 · Elige tu Rol" : "Step 1 · Choose Role")}
            {step === 1 && (isEs ? "Paso 2 · Tus Datos" : "Step 2 · Your Info")}
            {step === 2 && (isEs ? "Paso 3 · Acompañamiento" : "Step 3 · Support")}
            {step === 3 && (isEs ? "Completado" : "Completed")}
          </span>
          <div className="flex gap-1 rounded-full bg-white/80 p-1 text-[11px] font-semibold shadow-sm">
            <Link
              href="/auth/login"
              className="rounded-full px-3 py-1 text-espresso/70 transition hover:text-espresso"
            >
              Login
            </Link>
            <span className="rounded-full bg-[#E8809A] px-3 py-1 text-white font-bold">
              {isEs ? "Registro" : "Sign up"}
            </span>
          </div>
        </div>

        {/* PASO 0: PRIMERO LA OPCIÓN (Soy Paciente o Soy Cuidador) */}
        {step === 0 && (
          <div className="mt-5">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-espresso sm:text-3xl">
              {isEs ? "¿Cómo deseas unirte?" : "How would you like to join?"}
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-espresso/70">
              {isEs
                ? "Elige primero tu rol para personalizar tu registro y tu acompañamiento dentro de la comunidad:"
                : "Choose your role first to personalize your registration and care within the community:"}
            </p>

            <div className="mt-6 space-y-3.5">
              {/* Opción 1: Soy la Paciente */}
              <button
                type="button"
                onClick={() => {
                  setRole("paciente");
                  setStep(1);
                }}
                className="group flex w-full items-start gap-4 rounded-2xl border-2 border-transparent bg-white/90 p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E8809A] hover:bg-white hover:shadow-md active:scale-[0.99]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FCECEE] text-[#E8809A] shadow-xs transition-transform group-hover:scale-110">
                  <Heart className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-espresso group-hover:text-[#E8809A]">
                      {isEs ? "Soy la Paciente" : "I am the Patient"}
                    </h3>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FAF9F6] text-[#2D2B2A] transition group-hover:bg-[#E8809A] group-hover:text-white">
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-espresso/70">
                    {isEs
                      ? "Estoy transitando un diagnóstico o tratamiento y busco acompañamiento médico integrativo, meditaciones y apoyo amoroso."
                      : "Navigating diagnosis or cancer treatment and seeking holistic, compassionate care."}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#E8809A]">
                    {isEs ? "Elegir esta opción →" : "Choose this option →"}
                  </span>
                </div>
              </button>

              {/* Opción 2: Soy Familiar o Cuidador */}
              <button
                type="button"
                onClick={() => {
                  setRole("cuidador");
                  setStep(1);
                }}
                className="group flex w-full items-start gap-4 rounded-2xl border-2 border-transparent bg-white/90 p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#5C8D67] hover:bg-white hover:shadow-md active:scale-[0.99]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E5F2F1] text-[#5C8D67] shadow-xs transition-transform group-hover:scale-110">
                  <Users className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-espresso group-hover:text-[#5C8D67]">
                      {isEs ? "Soy Familiar o Cuidador" : "I am a Caregiver / Family"}
                    </h3>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FAF9F6] text-[#2D2B2A] transition group-hover:bg-[#5C8D67] group-hover:text-white">
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-espresso/70">
                    {isEs
                      ? "Acompaño y sostengo a un ser querido. Busco soporte emocional, autorregulación y seguimiento compartido sin quemarme."
                      : "Supporting a loved one through illness. Seeking grounding, self-regulation, and shared care."}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#5C8D67]">
                    {isEs ? "Elegir esta opción →" : "Choose this option →"}
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* PASO 1: AHORA SÍ LA INFORMACIÓN PARA EL LOGIN Y EL REGISTRO */}
        {step === 1 && (
          <div className="mt-5 space-y-4">
            {/* Indicador de rol seleccionado con botón para cambiar */}
            <div className="flex items-center justify-between rounded-2xl border border-espresso/10 bg-white/90 px-3.5 py-2.5 shadow-sm">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-xl text-white ${
                    isPatient ? "bg-[#E8809A]" : "bg-[#5C8D67]"
                  }`}
                >
                  {isPatient ? <Heart className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                </span>
                <div>
                  <span className="text-[10px] font-semibold text-espresso/60 block leading-tight">
                    {isEs ? "Registrándome como:" : "Registering as:"}
                  </span>
                  <span
                    className={`text-xs font-bold leading-tight ${
                      isPatient ? "text-[#E8809A]" : "text-[#5C8D67]"
                    }`}
                  >
                    {isPatient
                      ? isEs
                        ? "Soy la Paciente"
                        : "I am the Patient"
                      : isEs
                        ? "Soy Familiar o Cuidador"
                        : "I am a Caregiver"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(0)}
                className="rounded-full bg-espresso/5 px-2.5 py-1 text-[10px] font-bold text-espresso/70 transition hover:bg-espresso/10 hover:text-espresso"
              >
                {isEs ? "Cambiar rol" : "Change"}
              </button>
            </div>

            {invitationInfo && (
              <div className="rounded-2xl border border-[#5C8D67]/30 bg-[#F4F8F5] p-3 text-xs text-[#2A5C35]">
                <p className="font-bold">
                  {isEs ? "✨ Invitación vinculada" : "✨ Linked invitation"}
                </p>
                <p className="mt-0.5 text-espresso/75 leading-relaxed">
                  {isEs
                    ? `Te estás registrando para acompañar a ${invitationInfo.patientName}. Al completar tu registro, sus cuentas quedarán sincronizadas.`
                    : `You are registering to support ${invitationInfo.patientName}. Your accounts will be synchronized.`}
                </p>
              </div>
            )}

            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-espresso sm:text-3xl">
                {isEs ? "Tus datos de cuenta" : "Your Account Details"}
              </h1>
              <p className="mt-1 text-xs leading-relaxed text-espresso/70">
                {isEs
                  ? "Ingresa tus credenciales personales para crear tu acceso:"
                  : "Enter your personal credentials to create your account:"}
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(sanitizeNameInput(e.target.value))}
                  placeholder={isEs ? "Nombre completo (sin números)" : "Full name (no numbers)"}
                  className={lightInput}
                />
                <User className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cupid-pink" />
              </div>

              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.fields.email}
                  className={lightInput}
                />
                <Mail className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-veranda-blue" />
              </div>

              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
                  placeholder={isEs ? "Teléfono / Celular (solo dígitos)" : "Phone (digits only)"}
                  className={lightInput}
                />
                <Phone className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso/45" />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.fields.password}
                  className="w-full rounded-2xl border border-sky-cloud/35 bg-white/80 py-3.5 pl-4 pr-12 text-sm text-espresso placeholder:text-espresso/45 transition focus:border-veranda-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-veranda-blue/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cupid-pink transition hover:text-espresso p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Ralla visual de fuerza y opciones que se deben cumplir */}
              <PasswordStrengthIndicator password={password} isEs={isEs} />
            </div>

            {step1Error && (
              <div className="rounded-2xl border border-[#E8809A]/30 bg-[#FCECEE] p-3 text-xs text-[#C4546A]">
                {step1Error}
              </div>
            )}

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-white/85 px-4 py-3.5 text-xs font-bold text-espresso shadow-sm transition hover:bg-lychee"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{t.buttons.back}</span>
              </button>
              <button
                type="button"
                onClick={handleProceedToStep2}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#E8809A] py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(232,128,154,0.35)] transition hover:bg-[#df6f8a] active:scale-[0.99]"
              >
                <span>{t.buttons.next}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: ACOMPAÑANTE / PACIENTE */}
        {step === 2 && (
          <form onSubmit={handleFinish} className="mt-5 space-y-4">
            {isPatient ? (
              /* CASO PACIENTE: Preguntar si desea registrar a su familiar/acompañante (OPCIONAL) */
              <>
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FCECEE] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E8809A]">
                    <Heart className="h-3 w-3" />
                    {isEs ? "Acompañamiento Opcional" : "Optional Support"}
                  </span>
                  <h2 className="mt-2 font-serif text-xl font-bold tracking-tight text-espresso sm:text-2xl">
                    {isEs
                      ? "¿Deseas registrar a un familiar o persona que te acompañe?"
                      : "Would you like to register a family member or caregiver?"}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-espresso/70">
                    {isEs
                      ? "Puedes vincular ahora a tu cuidador principal para compartir la bitácora de citas y medicamentos, o continuar sola y agregarlo cuando quieras."
                      : "You can link your main caregiver now to share appointment and medication tracking, or continue on your own and add them anytime."}
                  </p>
                </div>

                {/* Selector Sí / Por ahora no */}
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/90 p-1.5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setInviteCaregiver(true)}
                    className={`rounded-xl py-2.5 text-xs font-bold transition ${
                      inviteCaregiver
                        ? "bg-[#E8809A] text-white shadow-sm"
                        : "text-espresso/70 hover:text-espresso"
                    }`}
                  >
                    {isEs ? "✓ Sí, registrarlo ahora" : "✓ Yes, add caregiver"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteCaregiver(false)}
                    className={`rounded-xl py-2.5 text-xs font-bold transition ${
                      !inviteCaregiver
                        ? "bg-[#2D2B2A] text-white shadow-sm"
                        : "text-espresso/70 hover:text-espresso"
                    }`}
                  >
                    {isEs ? "Por ahora no" : "Not right now"}
                  </button>
                </div>

                {inviteCaregiver ? (
                  <div className="space-y-3 rounded-2xl border border-espresso/10 bg-white/70 p-3.5">
                    <p className="text-[11px] font-bold text-espresso/80">
                      {isEs ? "Datos de tu familiar o cuidador:" : "Caregiver details:"}
                    </p>
                    <input
                      type="text"
                      value={caregiverName}
                      onChange={(e) => setCaregiverName(sanitizeNameInput(e.target.value))}
                      placeholder={isEs ? "Nombre de quien te acompaña (sin números)" : "Caregiver's name (no numbers)"}
                      className={lightInput}
                    />
                    <input
                      type="email"
                      value={caregiverEmail}
                      onChange={(e) => setCaregiverEmail(e.target.value)}
                      placeholder={isEs ? "Correo electrónico del familiar" : "Caregiver's email"}
                      className={lightInput}
                    />

                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold text-espresso/75">
                        {isEs ? "Parentesco o relación:" : "Relationship:"}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {quickRelationships.map((rel) => {
                          const isSelected =
                            rel === "Otro" || rel === "Other"
                              ? isOtherRel
                              : relationship === rel && !isOtherRel;
                          return (
                            <button
                              key={rel}
                              type="button"
                              onClick={() => handleSelectRelationship(rel)}
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                                isSelected
                                  ? "bg-[#E8809A] text-white shadow-xs"
                                  : "bg-white text-espresso/80 hover:bg-lychee"
                              }`}
                            >
                              {rel}
                            </button>
                          );
                        })}
                      </div>

                      {/* Si elige "Otro", escribe quién es ese otro */}
                      {isOtherRel && (
                        <div className="mt-2 space-y-1">
                          <label className="block text-[11px] font-bold text-espresso/70">
                            {isEs ? "¿Quién es ese otro parentesco?" : "Who is this? (Specify relationship):"}
                          </label>
                          <input
                            type="text"
                            required
                            autoFocus
                            value={customRelationship}
                            onChange={(e) => {
                              setCustomRelationship(e.target.value);
                              setRelationship(e.target.value);
                            }}
                            placeholder={isEs ? "Ej: Tía, Prima, Vecina, Terapeuta, Compañera..." : "e.g., Aunt, Cousin, Neighbor..."}
                            className={lightInput}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-espresso/10 bg-[#FAF9F6] p-3.5 text-xs text-espresso/75">
                    {isEs
                      ? "Entendido. Podrás invitar o agregar a tu cuidador en cualquier momento desde tu panel."
                      : "Understood. You can invite or add your caregiver anytime from your dashboard."}
                  </div>
                )}

                {/* Etapa actual */}
                <div className="pt-1">
                  <label className="mb-1.5 block text-xs font-bold text-espresso/80">
                    {t.fields.stageLabel}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {t.fields.stages.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setStage(s.value)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          stage === s.value
                            ? "bg-[#E8809A] text-white shadow-sm"
                            : "bg-white/80 text-espresso/75 hover:bg-lychee"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* CASO CUIDADOR: Registrar a la paciente es OBLIGATORIO */
              <>
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FCECEE] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E8809A]">
                    <Users className="h-3 w-3" />
                    {isEs ? "Paso Obligatorio" : "Mandatory Step"}
                  </span>
                  <h2 className="mt-2 font-serif text-xl font-bold tracking-tight text-espresso sm:text-2xl">
                    {isEs
                      ? "Registra a tu Paciente"
                      : "Register Your Patient"}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-espresso/70">
                    {isEs
                      ? "Como familiar o cuidador, es indispensable registrar los datos de la paciente para vincular sus cuentas y activar el seguimiento médico compartido."
                      : "As a caregiver or family member, patient details are required to link your accounts and activate shared health tracking."}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-espresso/80">
                      {isEs ? "Nombre completo de la Paciente *" : "Patient's Full Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(sanitizeNameInput(e.target.value))}
                      placeholder={isEs ? "Nombre y apellido de tu paciente (sin números)" : "Patient's name (no numbers)"}
                      className={lightInput}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-espresso/80">
                      {isEs ? "Parentesco con la Paciente *" : "Relationship with Patient *"}
                    </label>
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {quickRelationships.map((rel) => {
                        const isSelected =
                          rel === "Otro" || rel === "Other"
                            ? isOtherRel
                            : relationship === rel && !isOtherRel;
                        return (
                          <button
                            key={rel}
                            type="button"
                            onClick={() => handleSelectRelationship(rel)}
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                              isSelected
                                ? "bg-[#E8809A] text-white shadow-xs"
                                : "bg-white text-espresso/80 hover:bg-lychee"
                            }`}
                          >
                            {rel}
                          </button>
                        );
                      })}
                    </div>

                    {/* Si elige "Otro", escribe quién es ese otro parentesco */}
                    {isOtherRel ? (
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-espresso/70">
                          {isEs ? "¿Quién es ese otro parentesco? *" : "Who is this? (Specify relationship) *"}
                        </label>
                        <input
                          type="text"
                          required
                          autoFocus
                          value={customRelationship}
                          onChange={(e) => {
                            setCustomRelationship(e.target.value);
                            setRelationship(e.target.value);
                          }}
                          placeholder={isEs ? "Ej: Tía, Prima, Vecina, Terapeuta, Compañera..." : "e.g., Aunt, Cousin, Neighbor..."}
                          className={lightInput}
                        />
                      </div>
                    ) : (
                      !relationship && (
                        <p className="text-[10px] text-espresso/50 italic">
                          {isEs
                            ? "Selecciona una opción o elige 'Otro' para escribirlo"
                            : "Select an option or choose 'Other' to type it"}
                        </p>
                      )
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-espresso/80">
                      {isEs ? "Correo de la Paciente (Opcional)" : "Patient's Email (Optional)"}
                    </label>
                    <input
                      type="email"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      placeholder={isEs ? "Para que ella pueda iniciar sesión después" : "So she can sign in later"}
                      className={lightInput}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-espresso/80">
                      {isEs ? "Horarios en que acompañas:" : "Available care hours:"}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {quickAvailability.map((avail) => (
                        <button
                          key={avail}
                          type="button"
                          onClick={() => setAvailability(avail)}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                            availability === avail
                              ? "bg-[#2D2B2A] text-white"
                              : "bg-white text-espresso/80 hover:bg-lychee"
                          }`}
                        >
                          {avail}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {registerError && (
              <div className="rounded-2xl border border-[#E8809A]/30 bg-[#FCECEE] p-3 text-xs text-[#C4546A]">
                {registerError}
              </div>
            )}

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-white/85 px-4 py-3.5 text-xs font-bold text-espresso shadow-sm transition hover:bg-lychee disabled:opacity-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{t.buttons.back}</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#E8809A] py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(232,128,154,0.35)] transition hover:bg-[#df6f8a] active:scale-[0.99] disabled:opacity-60"
              >
                <span>
                  {loading
                    ? isEs
                      ? "Creando cuenta..."
                      : "Creating account..."
                    : isEs
                    ? "Finalizar Registro"
                    : "Complete Registration"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* PASO 3: CONFIRMACIÓN Y ESTADO DE LA INVITACIÓN AL FAMILIAR / PACIENTE */}
        {step === 3 && (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-white/95 p-5 text-center shadow-sm">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FCECEE] text-[#E8809A]">
                <CheckCircle2 className="h-7 w-7" />
              </span>
              <h2 className="mt-3 font-serif text-xl font-bold text-espresso sm:text-2xl">
                {isEs ? "¡Tu cuenta está lista!" : "Your account is ready!"}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-espresso/70">
                {isEs
                  ? "Tu registro se ha completado con éxito. Ya puedes iniciar sesión para acceder a tu espacio."
                  : "Your registration is complete. You can now sign in to access your space."}
              </p>

              {/* Tarjeta de estado: Célula vinculada de inmediato vs Invitación */}
              {autoLinked ? (
                <div className="mt-4 rounded-2xl border border-[#5C8D67]/40 bg-[#FAF9F6] p-4 text-left">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5C8D67]/15 text-[#5C8D67]">
                      <Users className="h-4 w-4" />
                    </span>
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-[#5C8D67]">
                        {isEs
                          ? "¡Cuentas vinculadas automáticamente!"
                          : "Accounts linked automatically!"}
                      </p>
                      <p className="mt-1 text-espresso/75 leading-relaxed">
                        {isEs ? (
                          <>
                            Detectamos que tu {isPatient ? "cuidador/a" : "paciente"}{" "}
                            <strong className="text-espresso font-semibold">
                              {linkedPartnerName || (isPatient ? caregiverName : patientName)}
                            </strong>{" "}
                            {linkedPartnerEmail || (isPatient ? caregiverEmail : patientEmail) ? (
                              <span className="text-espresso/60 font-mono text-[11px]">
                                ({linkedPartnerEmail || (isPatient ? caregiverEmail : patientEmail)})
                              </span>
                            ) : null}{" "}
                            ya tiene una cuenta activa en Love Heals Effect.
                            <br />
                            <br />
                            <strong className="text-[#5C8D67]">
                              ¡Sus perfiles quedaron enlazados de inmediato!
                            </strong>{" "}
                            Ambos compartirán el mismo calendario médico, bitácora de salud y seguimiento sin esperas. Además, le enviamos un correo confirmando la sincronización de sus perfiles.
                          </>
                        ) : (
                          <>
                            We detected that your {isPatient ? "caregiver" : "patient"}{" "}
                            <strong className="text-espresso font-semibold">
                              {linkedPartnerName || (isPatient ? caregiverName : patientName)}
                            </strong>{" "}
                            already has an active account on Love Heals Effect.
                            <br />
                            <br />
                            <strong className="text-[#5C8D67]">
                              Your profiles were linked immediately!
                            </strong>{" "}
                            You are now synchronized to the same care log and appointments.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ) : isPatient ? (
                inviteCaregiver && caregiverEmail ? (
                  <div className="mt-4 rounded-2xl border border-[#DF9B80]/40 bg-[#FAF9F6] p-4 text-left">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8809A]/15 text-[#E8809A]">
                        <Mail className="h-4 w-4" />
                      </span>
                      <div className="flex-1 text-xs">
                        <p className="font-bold text-espresso">
                          {isEs ? "Invitación enviada a tu familiar / cuidador" : "Invitation sent to your caregiver"}
                        </p>
                        <p className="mt-1 text-espresso/75 leading-relaxed">
                          {isEs ? (
                            <>
                              Enviamos una invitación al correo <strong className="text-espresso font-semibold">{caregiverEmail}</strong> para que <strong className="text-[#E8809A]">{caregiverName || "tu familiar"}</strong> pueda entrar, crear su propia contraseña y registrarse como Cuidador.
                            </>
                          ) : (
                            <>
                              We sent an invite to <strong className="text-espresso font-semibold">{caregiverEmail}</strong> so <strong className="text-[#E8809A]">{caregiverName || "your caregiver"}</strong> can set up their password and register.
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Botón para compartir enlace directo por WhatsApp */}
                    <div className="mt-3.5 border-t border-espresso/10 pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-[11px] font-semibold text-espresso/70">
                        {isEs ? "¿Deseas enviarle el enlace por WhatsApp?" : "Share link directly:"}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyInviteLink}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-espresso shadow-xs border border-espresso/15 transition hover:bg-espresso/5 active:scale-95"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-[#5C8D67]" />
                            <span className="text-[#5C8D67]">{isEs ? "¡Enlace copiado!" : "Copied!"}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-[#E8809A]" />
                            <span>{isEs ? "Copiar enlace de invitación" : "Copy invite link"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-espresso/10 bg-[#FAF9F6] p-3.5 text-left text-xs">
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E8809A]/15 text-[#E8809A]">
                        <Users className="h-3.5 w-3.5" />
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-espresso">
                          {isEs ? "Tu espacio de Paciente está activo" : "Your Patient Space is active"}
                        </p>
                        <p className="mt-0.5 text-espresso/75 leading-relaxed">
                          {isEs
                            ? "Cuando desees vincular a tu acompañante, podrás enviarle una invitación directa por correo desde tu panel para que active su propio usuario."
                            : "Whenever you wish to link your caregiver, you can invite them from your dashboard to activate their access."}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                /* Caso Cuidador que registró a su Paciente */
                <div className="mt-4 rounded-2xl border border-[#DF9B80]/40 bg-[#FAF9F6] p-4 text-left">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5C8D67]/15 text-[#5C8D67]">
                      <Mail className="h-4 w-4" />
                    </span>
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-espresso">
                        {patientEmail
                          ? isEs
                            ? "Invitación enviada a tu Paciente"
                            : "Invitation sent to your Patient"
                          : isEs
                            ? "Ficha de Paciente vinculada con éxito"
                            : "Patient profile linked successfully"}
                      </p>
                      <p className="mt-1 text-espresso/75 leading-relaxed">
                        {patientEmail ? (
                          isEs ? (
                            <>
                              Enviamos una invitación a <strong className="text-espresso font-semibold">{patientEmail}</strong> para que <strong className="text-[#5C8D67]">{patientName}</strong> pueda entrar y crear su contraseña cuando se sienta descansada.
                            </>
                          ) : (
                            <>
                              We sent an invite to <strong className="text-espresso font-semibold">{patientEmail}</strong> so <strong className="text-[#5C8D67]">{patientName}</strong> can set up her password when feeling rested.
                            </>
                          )
                        ) : isEs ? (
                          <>
                            La ficha de <strong className="text-espresso font-semibold">{patientName}</strong> quedó vinculada a tu cuenta. Podrás enviarle su invitación para que active su login en cualquier momento.
                          </>
                        ) : (
                          <>
                            The profile for <strong className="text-espresso font-semibold">{patientName}</strong> is linked to your account. You can invite her to activate her login anytime.
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {patientEmail && (
                    <div className="mt-3.5 border-t border-espresso/10 pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-[11px] font-semibold text-espresso/70">
                        {isEs ? "Compartir enlace por WhatsApp:" : "Share link directly:"}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyInviteLink}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-espresso shadow-xs border border-espresso/15 transition hover:bg-espresso/5 active:scale-95"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-[#5C8D67]" />
                            <span className="text-[#5C8D67]">{isEs ? "¡Enlace copiado!" : "Copied!"}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-[#E8809A]" />
                            <span>{isEs ? "Copiar enlace de invitación" : "Copy invite link"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Botón único de Iniciar Sesión */}
              <div className="mt-6 flex justify-center">
                <Link
                  href="/auth/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E8809A] py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(232,128,154,0.35)] transition hover:bg-[#df6f8a] active:scale-[0.99]"
                >
                  <span>{isEs ? "Iniciar Sesión" : "Sign In"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {step !== 3 && (
          <p className="mt-4 text-center text-xs text-espresso/75">
            {t.hasAccount}{" "}
            <Link
              href="/auth/login"
              className="font-bold text-cupid-pink hover:underline"
            >
              {t.loginLink}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

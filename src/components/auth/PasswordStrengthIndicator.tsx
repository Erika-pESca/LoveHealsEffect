import React from "react";
import { Check, Circle } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
  isEs?: boolean;
}

export function PasswordStrengthIndicator({
  password,
  isEs = true,
}: PasswordStrengthProps) {
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-ZÁÉÍÓÚÑ]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const fulfilledCount = [hasMinLength, hasUppercase, hasNumber].filter(Boolean).length;

  // Configuración de la barra de fuerza ("la ralla")
  const barConfig = [
    {
      active: fulfilledCount >= 1,
      color: fulfilledCount === 1 ? "bg-[#E27D60]" : fulfilledCount === 2 ? "bg-[#DF9B80]" : "bg-[#5C8D67]",
    },
    {
      active: fulfilledCount >= 2,
      color: fulfilledCount === 2 ? "bg-[#DF9B80]" : "bg-[#5C8D67]",
    },
    {
      active: fulfilledCount === 3,
      color: "bg-[#5C8D67]",
    },
  ];

  const strengthLabel =
    fulfilledCount === 3
      ? isEs
        ? "Segura y lista ✓"
        : "Strong and ready ✓"
      : fulfilledCount === 2
      ? isEs
        ? "Fuerza media"
        : "Medium strength"
      : fulfilledCount === 1
      ? isEs
        ? "Débil"
        : "Weak"
      : isEs
      ? "Requisitos pendientes"
      : "Pending requirements";

  const labelColor =
    fulfilledCount === 3
      ? "text-[#5C8D67]"
      : fulfilledCount === 2
      ? "text-[#DF9B80]"
      : fulfilledCount === 1
      ? "text-[#E27D60]"
      : "text-espresso/50";

  return (
    <div className="mt-1.5 space-y-2 rounded-2xl border border-espresso/10 bg-[#FAF9F6] p-2.5 text-xs transition-all">
      {/* 1. Barra visual de progreso dividida en segmentos ("la ralla") */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-espresso/70">
          <span>{isEs ? "Seguridad de la contraseña:" : "Password strength:"}</span>
          <span className={`font-bold transition-colors ${labelColor}`}>
            {strengthLabel}
          </span>
        </div>

        {/* 3 segmentos de la ralla que se llenan según se cumplan las opciones */}
        <div className="grid grid-cols-3 gap-1.5">
          {barConfig.map((bar, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                bar.active ? bar.color : "bg-espresso/15"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 2. Lista interactiva de opciones que se deben cumplir */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5">
        <div
          className={`flex items-center gap-2 text-[11px] transition-colors ${
            hasMinLength ? "font-bold text-[#5C8D67]" : "text-espresso/60"
          }`}
        >
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
              hasMinLength
                ? "bg-[#5C8D67] text-white shadow-xs scale-105"
                : "border border-espresso/25 bg-white text-espresso/30"
            }`}
          >
            {hasMinLength ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : <Circle className="h-2 w-2 text-espresso/30 fill-espresso/20" />}
          </span>
          <span>{isEs ? "Mínimo 6 caracteres" : "At least 6 characters"}</span>
        </div>

        <div
          className={`flex items-center gap-2 text-[11px] transition-colors ${
            hasUppercase ? "font-bold text-[#5C8D67]" : "text-espresso/60"
          }`}
        >
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
              hasUppercase
                ? "bg-[#5C8D67] text-white shadow-xs scale-105"
                : "border border-espresso/25 bg-white text-espresso/30"
            }`}
          >
            {hasUppercase ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : <Circle className="h-2 w-2 text-espresso/30 fill-espresso/20" />}
          </span>
          <span>
            {isEs
              ? "Al menos 1 letra mayúscula (A-Z)"
              : "At least 1 uppercase letter (A-Z)"}
          </span>
        </div>

        <div
          className={`flex items-center gap-2 text-[11px] transition-colors ${
            hasNumber ? "font-bold text-[#5C8D67]" : "text-espresso/60"
          }`}
        >
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
              hasNumber
                ? "bg-[#5C8D67] text-white shadow-xs scale-105"
                : "border border-espresso/25 bg-white text-espresso/30"
            }`}
          >
            {hasNumber ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : <Circle className="h-2 w-2 text-espresso/30 fill-espresso/20" />}
          </span>
          <span>
            {isEs ? "Al menos 1 número (0-9)" : "At least 1 number (0-9)"}
          </span>
        </div>
      </div>
    </div>
  );
}

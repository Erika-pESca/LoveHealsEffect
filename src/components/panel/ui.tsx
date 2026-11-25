"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

/** Estilo único para inputs de los paneles (grandes, redondeados y fáciles de tocar). */
export const inputCls =
  "w-full rounded-2xl border border-espresso/10 bg-[#FAF7F2] px-4 py-3 text-sm text-espresso placeholder:text-espresso/40 transition focus:border-[#D85678] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#D85678]/10";

/** Hoja inferior (bottom sheet) para formularios y reproductor. */
export function Sheet({
  open,
  onClose,
  title,
  maxWidth = "max-w-lg",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  maxWidth?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-espresso/40 backdrop-blur-[2px]"
      />
      <div className={`relative z-10 max-h-[92vh] w-full ${maxWidth} animate-sheet-up overflow-y-auto rounded-t-[32px] bg-white p-6 pb-10 shadow-2xl sm:rounded-[32px] sm:pb-6`}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-espresso/15 sm:hidden" />
        <div className="mb-4 flex items-start justify-between gap-3">
          {title ? (
            <h3 className="text-xl font-semibold leading-tight tracking-[-0.02em] text-espresso">
              {title}
            </h3>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FAF7F2] text-espresso/70 transition hover:bg-[#FCECEE] hover:text-[#C94A6A]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Etiqueta + campo para formularios dentro de Sheet. */
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-espresso/80">
        {label}
      </span>
      {children}
    </label>
  );
}

/** Botón principal grande de los paneles. */
export function PrimaryButton({
  children,
  onClick,
  type = "button",
  color = "from-[#F48EA6] via-[#DC5678] to-[#B03052]",
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  color?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r ${color} px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(216,86,120,0.3)] transition active:scale-[0.98] hover:brightness-105 disabled:opacity-60 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );
}

/** Tarjeta base blanca redondeada. */
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_8px_26px_rgba(80,60,90,0.07)] ${className}`}
    >
      {children}
    </div>
  );
}

/** Título de sección con acción opcional ("Ver todo"). */
export function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="text-lg font-semibold tracking-[-0.02em] text-espresso">{title}</h2>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="text-xs font-bold text-[#C94A6A] hover:underline"
        >
          {action}
        </button>
      )}
    </div>
  );
}

/** Mensaje flotante de confirmación. */
export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed left-1/2 top-5 z-[70] flex -translate-x-1/2 animate-fade-in items-center gap-2 rounded-full border border-[#5C8D67]/25 bg-white px-5 py-3 text-xs font-bold text-[#2A5C35] shadow-[0_12px_30px_rgba(38,35,34,0.16)]">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#5C8D67] text-[10px] text-white">
        ✓
      </span>
      <span>{message}</span>
    </div>
  );
}


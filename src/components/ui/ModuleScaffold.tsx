import React from "react";
import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";

interface ModuleScaffoldProps {
  moduleNumber: string;
  title: string;
  roleLabel: string;
  description: string;
  plannedFeatures: string[];
  folderPath: string;
}

export function ModuleScaffold({
  moduleNumber,
  title,
  roleLabel,
  description,
  plannedFeatures,
  folderPath,
}: ModuleScaffoldProps) {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16 lg:py-24">
      <div className="rounded-3xl border border-espresso/10 bg-white p-8 shadow-sm sm:p-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-soft px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-dark">
            <Layers className="h-3.5 w-3.5" />
            {moduleNumber} · {roleLabel}
          </span>
          <code className="rounded-lg bg-cream px-3 py-1 text-xs font-semibold text-espresso/75">
            {folderPath}
          </code>
        </div>

        <h1 className="mt-6 font-serif text-3xl font-bold text-espresso sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-espresso/75 sm:text-base">
          {description}
        </p>

        <div className="mt-8 rounded-2xl bg-cream p-6">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-primary">
            Funcionalidades planificadas para este módulo (V1.0):
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-espresso/85">
            {plannedFeatures.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-tertiary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-espresso px-6 py-2.5 text-xs font-bold text-white transition hover:bg-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </Link>
        </div>
      </div>
    </section>
  );
}

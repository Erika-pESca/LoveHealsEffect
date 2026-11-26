"use client";

import React, { useEffect } from "react";
import {
  AlertCircle,
  ClipboardList,
  Copy,
  FileText,
  Pill,
  Printer,
  Share2,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";
import { STAGES } from "@/components/paciente/types";

interface ConsultSummarySheetProps {
  open: boolean;
  onClose: () => void;
  audience: "medico" | "sanador";
  onChangeAudience: (audience: "medico" | "sanador") => void;
  patientName: string;
  ficha: any;
  timeline: any[];
  onToast: (msg: string) => void;
  t: (es: string, en: string) => string;
  isEs: boolean;
}

function escapeHtml(value: string): string {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function ConsultSummarySheet({
  open,
  onClose,
  audience,
  onChangeAudience,
  patientName,
  ficha,
  timeline,
  onToast,
  t,
  isEs,
}: ConsultSummarySheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !ficha) return null;

  const stageObj = STAGES.find((s) => s.id === ficha.etapa_actual) || STAGES[0];
  const stageLabel = isEs ? stageObj.es : stageObj.en;
  const meds: any[] = Array.isArray(ficha.medicamentos_y_horarios)
    ? ficha.medicamentos_y_horarios
    : [];
  const supplements: any[] = Array.isArray(ficha.suplementos) ? ficha.suplementos : [];
  const docs: any[] = Array.isArray(ficha.documentos_oncologo)
    ? ficha.documentos_oncologo
    : [];
  const recentTimeline = (Array.isArray(timeline) ? timeline : []).slice(0, 5);
  const todayStr = new Date().toLocaleDateString(isEs ? "es-ES" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isDoctor = audience === "medico";

  const suggestedQuestions = isDoctor
    ? isEs
      ? [
          `¿Debo ajustar alguna dosis o horario en mis medicamentos actuales (${meds.length} registrados)?`,
          supplements.length > 0
            ? "¿Todos mis suplementos actuales son compatibles con mi etapa de tratamiento?"
            : "¿Recomienda algún suplemento o cuidado de apoyo para esta etapa?",
          "¿Qué síntomas de alerta debo vigilar antes de la próxima consulta?",
          "¿Cuál es el siguiente examen o control que debemos programar?",
        ]
      : [
          `Should I adjust any dose or schedule in my current medications (${meds.length} listed)?`,
          supplements.length > 0
            ? "Are all my current supplements safe with my treatment stage?"
            : "Do you recommend any supportive supplement or care for this stage?",
          "What warning symptoms should I watch for before our next visit?",
          "What is the next lab test or follow-up we should schedule?",
        ]
    : isEs
      ? [
          "¿Qué práctica suave (respiración, meditación o sonido) recomiendas para mi nivel de energía actual?",
          "¿Cómo puedo apoyar mejor mi descanso y manejo emocional esta semana?",
          "¿Qué hábitos de alimentación o autocuidado se adaptan mejor a mi etapa actual?",
        ]
      : [
          "Which gentle practice (breathwork, meditation, or sound) fits my current energy best?",
          "How can I better support my rest and emotional balance this week?",
          "Which nutrition or self-care habits best support my current stage?",
        ];

  const buildPlainText = () => {
    const lines: string[] = [];
    lines.push(
      `LOVE HEALS EFFECT · ${
        isDoctor
          ? t("RESUMEN PARA CONSULTA MÉDICA", "MEDICAL VISIT SUMMARY")
          : t("RESUMEN PARA SESIÓN CON SANADOR", "HEALER SESSION SUMMARY")
      }`
    );
    lines.push(`${t("Paciente", "Patient")}: ${patientName}`);
    lines.push(`${t("Fecha", "Date")}: ${todayStr}`);
    lines.push(`${t("Etapa actual", "Current stage")}: ${stageLabel}`);
    lines.push("");

    if (ficha.alergias) {
      lines.push(`⚠ ${t("Alergias", "Allergies")}: ${ficha.alergias}`);
      lines.push("");
    }

    if (ficha.historia_medica) {
      lines.push(`${t("Historia / Contexto", "History / Context")}:`);
      lines.push(ficha.historia_medica);
      lines.push("");
    }

    if (!isDoctor && ficha.datos_nutricionales) {
      lines.push(`${t("Alimentación e hidratación", "Nutrition & hydration")}:`);
      lines.push(ficha.datos_nutricionales);
      lines.push("");
    }

    lines.push(`${t("Medicamentos activos", "Active medications")} (${meds.length}):`);
    if (meds.length === 0) {
      lines.push(`- ${t("Sin medicamentos registrados", "No medications recorded")}`);
    } else {
      meds.forEach((m) => {
        lines.push(
          `- ${m.nombre}${m.dosis ? ` · ${m.dosis}` : ""}${m.horario ? ` · ${m.horario}` : ""}${
            m.indicaciones ? ` (${m.indicaciones})` : ""
          }`
        );
      });
    }
    lines.push("");

    if (supplements.length > 0) {
      lines.push(`${t("Suplementos", "Supplements")} (${supplements.length}):`);
      supplements.forEach((s) => {
        lines.push(`- ${s.nombre}${s.dosis ? ` · ${s.dosis}` : ""}${s.horario ? ` · ${s.horario}` : ""}`);
      });
      lines.push("");
    }

    if (recentTimeline.length > 0) {
      lines.push(`${t("Registros recientes de bitácora", "Recent journal entries")}:`);
      recentTimeline.forEach((item) => {
        lines.push(`- [${item.fecha}] ${item.titulo}${item.detalle ? `: ${item.detalle}` : ""}`);
      });
      lines.push("");
    }

    if (isDoctor && docs.length > 0) {
      lines.push(`${t("Documentos recientes", "Recent documents")}:`);
      docs.slice(0, 5).forEach((d) => {
        lines.push(`- [${d.fecha}] ${d.titulo} (${d.tipo})`);
      });
      lines.push("");
    }

    lines.push(`${t("Preguntas sugeridas", "Suggested questions")}:`);
    suggestedQuestions.forEach((q) => lines.push(`• ${q}`));

    return lines.join("\n");
  };

  const handleCopy = async () => {
    const text = buildPlainText();
    try {
      await navigator.clipboard.writeText(text);
      onToast(t("Resumen copiado al portapapeles", "Summary copied to clipboard"));
    } catch {
      onToast(t("No se pudo copiar automáticamente", "Could not copy automatically"));
    }
  };

  const handleShare = async () => {
    const text = buildPlainText();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Love Heals Effect · ${t("Resumen para mi cita", "Visit summary")}`,
          text,
        });
        return;
      } catch {
        // Usuario canceló compartir o no soportado
      }
    }
    await handleCopy();
  };

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=820,height=920");
    if (!win) {
      onToast(t("Permite ventanas emergentes para imprimir o guardar PDF", "Allow pop-ups to print or save as PDF"));
      return;
    }

    const medsHtml =
      meds.length === 0
        ? `<p class="muted">${escapeHtml(t("Sin medicamentos registrados.", "No medications recorded."))}</p>`
        : `<ul>${meds
            .map(
              (m) =>
                `<li><strong>${escapeHtml(m.nombre)}</strong>${
                  m.dosis ? ` — ${escapeHtml(m.dosis)}` : ""
                }${m.horario ? ` (${escapeHtml(m.horario)})` : ""}${
                  m.indicaciones ? `<br/><span class="muted">${escapeHtml(m.indicaciones)}</span>` : ""
                }</li>`
            )
            .join("")}</ul>`;

    const suppsHtml =
      supplements.length === 0
        ? ""
        : `<h2>${escapeHtml(t("Suplementos", "Supplements"))}</h2><ul>${supplements
            .map(
              (s) =>
                `<li><strong>${escapeHtml(s.nombre)}</strong>${
                  s.dosis ? ` — ${escapeHtml(s.dosis)}` : ""
                }${s.horario ? ` (${escapeHtml(s.horario)})` : ""}</li>`
            )
            .join("")}</ul>`;

    const timelineHtml =
      recentTimeline.length === 0
        ? ""
        : `<h2>${escapeHtml(t("Registros recientes de bitácora", "Recent journal entries"))}</h2><ul>${recentTimeline
            .map(
              (item) =>
                `<li><strong>[${escapeHtml(item.fecha)}] ${escapeHtml(item.titulo)}</strong>${
                  item.detalle ? ` — ${escapeHtml(item.detalle)}` : ""
                }</li>`
            )
            .join("")}</ul>`;

    const questionsHtml = `<h2>${escapeHtml(
      t("Preguntas para la consulta", "Questions for the visit")
    )}</h2><ul>${suggestedQuestions.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}</ul>`;

    win.document.write(`<!DOCTYPE html>
<html lang="${isEs ? "es" : "en"}">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(t("Resumen para mi cita", "Visit Summary"))} - ${escapeHtml(patientName)}</title>
<style>
  body { font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #262322; margin: 32px; line-height: 1.55; font-size: 13px; }
  .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #E8809A; padding-bottom: 12px; margin-bottom: 20px; }
  .brand { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #239BA2; }
  h1 { font-size: 22px; margin: 4px 0 0; }
  h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.06em; color: #239BA2; margin-top: 18px; margin-bottom: 6px; border-bottom: 1px solid #edecdb; padding-bottom: 4px; }
  .meta { font-size: 12px; color: #5c5652; text-align: right; }
  .alert { background: #FFF5E2; border: 1px solid #F2C97D; border-radius: 10px; padding: 10px 14px; margin: 12px 0; font-size: 12px; }
  ul { padding-left: 18px; margin: 6px 0; }
  li { margin: 4px 0; }
  .muted { color: #6c6662; }
  .footer { margin-top: 28px; padding-top: 10px; border-top: 1px solid #edecdb; font-size: 11px; color: #7a736e; text-align: center; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Love Heals Effect · ${escapeHtml(
        isDoctor ? t("Consulta Médica", "Medical Visit") : t("Sesión Integrativa", "Healer Session")
      )}</div>
      <h1>${escapeHtml(patientName)}</h1>
    </div>
    <div class="meta">
      <div><strong>${escapeHtml(t("Etapa", "Stage"))}:</strong> ${escapeHtml(stageLabel)}</div>
      <div>${escapeHtml(todayStr)}</div>
    </div>
  </div>
  ${
    ficha.alergias
      ? `<div class="alert"><strong>${escapeHtml(t("Alergias registradas", "Recorded allergies"))}:</strong> ${escapeHtml(
          ficha.alergias
        )}</div>`
      : ""
  }
  ${
    ficha.historia_medica
      ? `<h2>${escapeHtml(t("Contexto / Historia", "Context / History"))}</h2><p>${escapeHtml(
          ficha.historia_medica
        )}</p>`
      : ""
  }
  ${
    !isDoctor && ficha.datos_nutricionales
      ? `<h2>${escapeHtml(t("Alimentación e hidratación", "Nutrition & hydration"))}</h2><p>${escapeHtml(
          ficha.datos_nutricionales
        )}</p>`
      : ""
  }
  <h2>${escapeHtml(t("Medicamentos activos", "Active medications"))}</h2>
  ${medsHtml}
  ${suppsHtml}
  ${timelineHtml}
  ${questionsHtml}
  <div class="footer">${escapeHtml(
    t(
      "Resumen generado automáticamente con la información registrada en tu ficha de Love Heals Effect. No sustituye la valoración médica profesional.",
      "Automatically generated from your Love Heals Effect chart. It does not replace professional medical advice."
    )
  )}</div>
</body>
</html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 250);
  };

  return (
    <div
      className="fixed inset-0 z-[65] flex items-center justify-center bg-espresso/45 p-3 backdrop-blur-[2px] sm:p-5"
      onClick={onClose}
    >
      <div
        className="relative max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-white/90 bg-white p-5 shadow-2xl sm:p-6 lg:overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera horizontal: Título + Selector + Acciones + Cerrar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-espresso/10 pb-3.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-lg font-bold tracking-[-0.02em] text-espresso sm:text-xl">
              {t("Resumen para mi cita", "Summary for my visit")}
            </h3>
            <span className="rounded-full bg-[#FAF7F2] px-2.5 py-1 text-xs font-semibold text-espresso/75">
              {patientName}
            </span>
            <span className="rounded-full bg-[#FCECEE] px-3 py-1 text-[11px] font-bold text-[#C9526D]">
              {stageLabel}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Selector Médico / Sanador */}
            <div className="inline-flex rounded-full bg-[#FAF7F2] p-1">
              <button
                type="button"
                onClick={() => onChangeAudience("medico")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition focus:outline-none ${
                  isDoctor
                    ? "bg-[#239BA2] text-white shadow-sm"
                    : "text-espresso/65 hover:text-espresso"
                }`}
              >
                <Stethoscope className="h-3.5 w-3.5" />
                <span>{t("Médico", "Doctor")}</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeAudience("sanador")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition focus:outline-none ${
                  !isDoctor
                    ? "bg-[#E8809A] text-white shadow-sm"
                    : "text-espresso/65 hover:text-espresso"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t("Sanador", "Healer")}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={t("Cerrar", "Close")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF7F2] text-espresso/70 transition hover:bg-[#FCECEE] hover:text-[#C94A6A] focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Franja compacta de alergias */}
        {ficha.alergias && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-[#FFF5E2] px-3.5 py-2 text-xs text-espresso">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#B87D14]" />
            <p className="line-clamp-2 leading-snug">
              <strong className="font-bold">{t("Alergias:", "Allergies:")}</strong>{" "}
              {ficha.alergias}
            </p>
          </div>
        )}

        {/* Distribución horizontal en 2 columnas sin scroll */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Columna izquierda: Medicamentos + Suplementos */}
          <div className="flex flex-col justify-between rounded-2xl border border-espresso/10 bg-[#FAF7F2]/60 p-4 lg:col-span-6">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-espresso/70">
                  <Pill className="h-3.5 w-3.5 text-[#E8809A]" />
                  <span>
                    {t("Medicamentos activos", "Active medications")} ({meds.length})
                  </span>
                </div>
              </div>

              {meds.length === 0 ? (
                <p className="mt-2.5 text-xs text-espresso/55">
                  {t("Aún no tienes medicamentos registrados.", "No medications recorded yet.")}
                </p>
              ) : (
                <ul className="mt-2.5 space-y-2 text-xs text-espresso/85">
                  {meds.slice(0, 4).map((m, idx) => (
                    <li key={m.id ?? idx} className="rounded-xl bg-white px-3 py-2 shadow-sm">
                      <div className="flex flex-wrap items-baseline justify-between gap-1">
                        <span className="font-bold text-espresso">{m.nombre}</span>
                        {(m.dosis || m.horario) && (
                          <span className="text-[11px] font-medium text-[#239BA2]">
                            {[m.dosis, m.horario].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </div>
                      {m.indicaciones && (
                        <p className="mt-0.5 truncate text-[11px] text-espresso/60">
                          {m.indicaciones}
                        </p>
                      )}
                    </li>
                  ))}
                  {meds.length > 4 && (
                    <li className="text-[11px] font-semibold text-espresso/55">
                      +{meds.length - 4} {t("más en el PDF completo", "more in full PDF")}
                    </li>
                  )}
                </ul>
              )}
            </div>

            {supplements.length > 0 && (
              <div className="mt-3 border-t border-espresso/10 pt-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#239BA2]">
                  {t("Suplementos", "Supplements")} ({supplements.length})
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {supplements.map((s, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-espresso/80 shadow-sm"
                    >
                      {s.nombre}
                      {s.dosis ? ` · ${s.dosis}` : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha: Bitácora + Documentos/Nutrición + Preguntas */}
          <div className="flex flex-col gap-3 lg:col-span-6">
            {/* Últimos registros de bitácora (compacto) */}
            {recentTimeline.length > 0 && (
              <div className="rounded-2xl border border-espresso/10 bg-white p-3.5">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-espresso/70">
                  <ClipboardList className="h-3.5 w-3.5 text-[#239BA2]" />
                  <span>{t("Últimos registros de bitácora", "Recent journal entries")}</span>
                </div>
                <ul className="mt-2 space-y-1.5 text-xs text-espresso/80">
                  {recentTimeline.slice(0, 4).map((item, idx) => (
                    <li key={item.id ?? idx} className="flex items-center justify-between gap-2">
                      <span className="truncate">
                        <strong className="font-semibold text-espresso">{item.titulo}</strong>
                        {item.detalle ? ` — ${item.detalle}` : ""}
                      </span>
                      <span className="shrink-0 text-[10px] font-semibold text-espresso/45">
                        {item.fecha}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Documentos recientes (para médico) o Nutrición (para sanador) */}
            {isDoctor && docs.length > 0 && (
              <div className="rounded-2xl border border-espresso/10 bg-white p-3.5">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-espresso/70">
                  <FileText className="h-3.5 w-3.5 text-[#B8913A]" />
                  <span>
                    {t("Documentos clínicos", "Clinical documents")} ({docs.length})
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {docs.slice(0, 4).map((d, idx) => (
                    <span
                      key={d.id ?? idx}
                      className="rounded-full bg-[#FAF7F2] px-2.5 py-1 text-[11px] font-medium text-espresso"
                    >
                      📄 {d.titulo} <span className="text-espresso/45">({d.fecha})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!isDoctor && ficha.datos_nutricionales && (
              <div className="rounded-2xl border border-espresso/10 bg-[#E7F2F1]/55 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#239BA2]">
                  {t("Alimentación e hidratación", "Nutrition & hydration")}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-espresso/80">
                  {ficha.datos_nutricionales}
                </p>
              </div>
            )}

            {/* Preguntas sugeridas */}
            <div className="rounded-2xl bg-[#FDF3EF] p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#C9526D]">
                {t("Preguntas sugeridas para tu cita", "Suggested questions for your visit")}
              </p>
              <ul className="mt-1.5 space-y-1 text-xs leading-snug text-espresso/85">
                {suggestedQuestions.slice(0, 3).map((q, i) => (
                  <li key={i}>• {q}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Pie compacto con botones de acción en línea */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-espresso/10 pt-3.5">
          <p className="text-[11px] text-espresso/50">
            {t(
              "Armado automáticamente con tu ficha. No sustituye la atención médica.",
              "Automatically built from your chart. Does not replace medical care."
            )}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="inline-flex items-center gap-1.5 rounded-full border border-espresso/15 bg-white px-4 py-2 text-xs font-bold text-espresso/80 transition hover:bg-[#FAF7F2] active:scale-95"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{t("Copiar", "Copy")}</span>
            </button>
            <button
              type="button"
              onClick={() => void handleShare()}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#E5F2F1] px-4 py-2 text-xs font-bold text-[#239BA2] transition hover:bg-[#d2eae8] active:scale-95"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{t("Compartir", "Share")}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#E8809A] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#d66a85] active:scale-95"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{t("PDF / Imprimir", "PDF / Print")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Cliente y motor PONO IA (Google AI Studio / Gemini API).
 * Uso interno en Fase 1 (Back-office para Sanadores y Administradores).
 * Sintetiza la ficha médica, medicamentos, documentos del oncólogo y bitácoras previas
 * para que la paciente y su cuidador no tengan que repetir su historia en cada sesión.
 */
export const geminiConfig = {
  apiKey: (process.env.GEMINI_API_KEY ?? "").trim(),
  model: "gemini-2.5-flash",
};

export interface PonoSummaryInput {
  ficha: Record<string, any>;
  bitacoras: Array<Record<string, any>>;
  caregiverName?: string | null;
}

export async function generatePonoExecutiveSummary(
  input: PonoSummaryInput
): Promise<{ summary: string; source: "gemini-api" | "pono-engine" }> {
  const { ficha, bitacoras, caregiverName } = input;

  const meds = Array.isArray(ficha.medicamentos_y_horarios)
    ? ficha.medicamentos_y_horarios
        .map((m: any) => `${m.nombre} (${m.dosis} - ${m.horario})`)
        .join(", ")
    : "";

  const sups = Array.isArray(ficha.suplementos)
    ? ficha.suplementos.map((s: any) => `${s.nombre} (${s.dosis})`).join(", ")
    : "";

  const docs = Array.isArray(ficha.documentos_oncologo)
    ? ficha.documentos_oncologo
        .map((d: any) => `${d.titulo}: ${d.notas || d.tipo}`)
        .join(" | ")
    : "";

  const logsText = bitacoras
    .filter(
      (b) =>
        b.estado_observado_paciente ||
        b.patrones_detectados ||
        b.recomendaciones_dadas ||
        b.transcripcion_o_notas
    )
    .slice(0, 4)
    .map(
      (b, idx) =>
        `Sesión ${idx + 1} (${String(b.fecha_sesion).slice(0, 10)}): Estado=${
          b.estado_observado_paciente || "N/A"
        }; Patrones=${b.patrones_detectados || "N/A"}; Recomendaciones=${
          b.recomendaciones_dadas || "N/A"
        }; Transcripción=${b.transcripcion_o_notas || "N/A"}`
    )
    .join("\n");

  // 1. Si hay GEMINI_API_KEY real configurada en .env, consultar Gemini 2.5 Flash
  if (
    geminiConfig.apiKey &&
    !geminiConfig.apiKey.includes("tu-api-key") &&
    geminiConfig.apiKey.length > 10
  ) {
    try {
      const prompt = `Eres PONO IA, el asistente clínico-holístico interno de Love Heals Effect (Honolulu, Hawái) exclusivo para los sanadores Omar Melero y Kelsie Reynolds.
Genera un Resumen Ejecutivo claro, empático y estructurado en máximo 6 líneas para que el sanador conozca el contexto completo de la paciente antes de atenderla, evitando que ella repita su historia:
- Paciente: ${ficha.nombre_paciente} (${ficha.nombre_familia})
- Etapa actual de cáncer de mama: ${ficha.etapa_actual}
- Cuidador vinculado: ${caregiverName || "Pendiente de vincular"}
- Historia médica: ${ficha.historia_medica || "Sin registro"}
- Alergias: ${ficha.alergias || "Ninguna reportada"}
- Nutrición: ${ficha.datos_nutricionales || "Sin notas"}
- Medicamentos activos: ${meds || "Ninguno"}
- Suplementos: ${sups || "Ninguno"}
- Documentos del oncólogo: ${docs || "Sin documentos"}
- Historial de bitácoras y transcripciones previas:
${logsText || "Primera sesión con sanadores"}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiConfig.model}:generateContent?key=${geminiConfig.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const text =
          json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        if (text) {
          return { summary: text, source: "gemini-api" };
        }
      }
    } catch (err) {
      console.warn("Aviso: Fallback local de PONO IA activado:", err);
    }
  }

  // 2. Motor estructurado PONO IA (funciona de inmediato sin requerir llave externa)
  const latestLog = bitacoras.find(
    (b) =>
      b.estado_observado_paciente ||
      b.patrones_detectados ||
      b.transcripcion_o_notas
  );

  const summaryParts = [
    `• CONTEXTO Y ETAPA: ${ficha.nombre_paciente} (${
      ficha.nombre_familia
    }) se encuentra en etapa de '${String(ficha.etapa_actual).replace(
      /_/g,
      " "
    )}'. ${
      caregiverName
        ? `Célula sincronizada 1 a 1 con su cuidador ${caregiverName}.`
        : "Aún sin cuidador activo vinculado."
    }`,
    `• HISTORIA Y ALERGIAS: ${
      ficha.historia_medica || "En seguimiento integrativo inicial."
    } | Alergias: ${ficha.alergias || "Ninguna reportada"}.`,
    `• MEDICACIÓN Y SUPLEMENTOS ACTIVOS: Medicinas: ${
      meds || "Sin medicación registrada"
    }. Suplementos: ${sups || "Sin suplementos registrados"}.`,
    docs ? `• NOTAS DEL ONCÓLOGO: ${docs}.` : null,
    latestLog
      ? `• ÚLTIMA BITÁCORA / TRANSCRIPCIÓN DE SANADOR: Estado observado: "${
          latestLog.estado_observado_paciente || "Estable"
        }". Patrones detectados: "${
          latestLog.patrones_detectados || "En observación"
        }". Recomendación previa: "${
          latestLog.recomendaciones_dadas ||
          latestLog.transcripcion_o_notas ||
          "Continuar prácticas suaves"
        }".`
      : `• FOCO SUGERIDO PARA LA SESIÓN DE HOY: Validar niveles de energía física, revisar descanso nocturno y guiar práctica suave de regulación nerviosa / BAM acorde a su etapa.`,
  ].filter(Boolean);

  return {
    summary: summaryParts.join("\n"),
    source: "pono-engine",
  };
}

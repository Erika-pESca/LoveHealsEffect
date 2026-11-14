/**
 * Cliente para Google AI Studio / Gemini API.
 * Usado en el servidor para generar el resumen ejecutivo de trazabilidad de la paciente.
 */
export const geminiConfig = {
  apiKey: process.env.GEMINI_API_KEY ?? "",
  model: "gemini-2.5-flash",
};


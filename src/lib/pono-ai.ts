/**
 * PONO IA para la Paciente (Fase 1).
 * Todas las funciones usan Gemini cuando hay GEMINI_API_KEY y, si no hay llave o falla,
 * caen a un motor local por reglas para que el panel funcione siempre.
 * La IA NO diagnostica ni cambia tratamientos: organiza, resume y recomienda recursos.
 */
import { geminiConfig } from "@/lib/gemini";

export type Lang = "es" | "en";
type Source = "gemini-api" | "pono-engine";

const SAFETY_ES =
  "Nunca diagnostiques, no cambies dosis ni tratamientos y recuerda que no sustituyes la atención médica. Tono cálido, claro y breve.";
const SAFETY_EN =
  "Never diagnose, never change doses or treatments, and remember you do not replace medical care. Warm, clear and brief tone.";

async function callGemini(prompt: string, json = false): Promise<string | null> {
  const key = geminiConfig.apiKey;
  if (!key || key.length < 10 || key.includes("tu-api-key")) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiConfig.model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          ...(json ? { generationConfig: { responseMimeType: "application/json" } } : {}),
        }),
      }
    );
    if (!res.ok) return null;
    const j = await res.json();
    return j?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

function parseJson<T>(text: string | null): T | null {
  if (!text) return null;
  try {
    return JSON.parse(
      text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim()
    ) as T;
  } catch {
    return null;
  }
}

const iso = (d: Date) => d.toLocaleDateString("en-CA");
const addDays = (base: string, n: number) => {
  const d = new Date(`${base}T12:00:00`);
  d.setDate(d.getDate() + n);
  return iso(d);
};
const daysBetween = (a: string, b: string) =>
  Math.round(
    (new Date(`${b}T12:00:00`).getTime() - new Date(`${a}T12:00:00`).getTime()) /
      86400000
  );

/* ------------------------------------------------------------------ */
/*  1. Recomendar recursos según cómo se siente                        */
/* ------------------------------------------------------------------ */

const MOOD_TYPES: Record<string, string[]> = {
  radiante: ["video_bam", "guia_autocuidado"],
  tranquila: ["meditacion_audio", "guia_autocuidado"],
  cansada: ["musicoterapia", "meditacion_audio"],
  ansiosa: ["meditacion_audio", "musicoterapia"],
  triste: ["meditacion_audio", "love_circle"],
  dolor: ["guia_autocuidado", "meditacion_audio"],
};

const MOOD_MSG: Record<string, Record<Lang, string>> = {
  radiante: {
    es: "¡Qué hermoso verte radiante! Aprovecha esa energía con algo de movimiento suave.",
    en: "How lovely to see you radiant! Use that energy with some gentle movement.",
  },
  tranquila: {
    es: "Qué bien que estés en calma. Estas prácticas ayudan a sostenerla.",
    en: "Great that you feel calm. These practices help sustain it.",
  },
  cansada: {
    es: "Descansar también es sanar. Hoy elige algo suave, sin exigirte.",
    en: "Resting is healing too. Pick something gentle today, no pressure.",
  },
  ansiosa: {
    es: "Respira conmigo. Estas prácticas están pensadas para calmar la mente.",
    en: "Breathe with me. These practices are made to calm the mind.",
  },
  triste: {
    es: "Está bien sentirlo. No estás sola; esto puede acompañarte hoy.",
    en: "It's okay to feel it. You're not alone; this can keep you company today.",
  },
  dolor: {
    es: "Gracias por contarlo. Si las molestias son nuevas o intensas, avísale a tu equipo médico. Mientras tanto, esto puede aliviar.",
    en: "Thanks for sharing. If discomfort is new or intense, tell your medical team. Meanwhile, this may help.",
  },
};

const NOTE_KEYWORDS: Array<[RegExp, string]> = [
  [/(dormir|sueñ|insomn|noche|sleep)/i, "musicoterapia"],
  [/(náusea|nausea|comer|apetito|aliment|cocina|nutri|eat)/i, "guia_autocuidado"],
  [/(miedo|ansied|nervi|resultado|cita|scan|fear|anxi|worr)/i, "meditacion_audio"],
  [/(sola|soledad|llor|apoyo|lonely|cry|support)/i, "love_circle"],
  [/(dolor|molest|pain|ache)/i, "guia_autocuidado"],
  [/(energ|mover|rigid|cuerpo|stretch|body)/i, "video_bam"],
];

const REASON: Record<string, Record<Lang, string>> = {
  video_bam: { es: "Movimiento suave que reconecta con tu cuerpo.", en: "Gentle movement that reconnects you with your body." },
  meditacion_audio: { es: "Una pausa guiada para calmar tu mente.", en: "A guided pause to calm your mind." },
  musicoterapia: { es: "Sonidos que invitan al descanso profundo.", en: "Sounds that invite deep rest." },
  guia_autocuidado: { es: "Información práctica para cuidarte mejor.", en: "Practical information to care for yourself." },
  love_circle: { es: "Comunidad: compartir con quienes te entienden.", en: "Community: share with people who understand." },
  workshop: { es: "Un espacio para aprender y acompañarte.", en: "A space to learn and feel supported." },
};

export async function aiRecommend(input: {
  mood: string;
  note?: string;
  resources: any[];
  lang: Lang;
}): Promise<{ message: string; picks: Array<{ id: number; reason: string }>; source: Source }> {
  const { mood, note = "", resources, lang } = input;
  const pool = resources.slice(0, 24);

  const fallback = () => {
    const types = MOOD_TYPES[mood] || ["meditacion_audio", "guia_autocuidado"];
    const noteTypes = NOTE_KEYWORDS.filter(([re]) => re.test(note)).map(([, t]) => t);
    const scored = pool
      .map((r) => {
        let s = 0;
        if (r.tipo_contenido === types[0]) s += 3;
        if (r.tipo_contenido === types[1]) s += 2;
        if (noteTypes.includes(r.tipo_contenido)) s += 3;
        if (r.es_gratuito !== false) s += 0.5;
        return { r, s };
      })
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 3);
    return {
      message: (MOOD_MSG[mood] || MOOD_MSG.tranquila)[lang],
      picks: scored.map(({ r }) => ({
        id: r.id,
        reason: (REASON[r.tipo_contenido] || REASON.guia_autocuidado)[lang],
      })),
      source: "pono-engine" as Source,
    };
  };

  const list = pool
    .map((r) => `${r.id}|${r.tipo_contenido}|${r.titulo_es}|${r.descripcion_es || ""}`)
    .join("\n");
  const prompt = `Eres PONO IA, acompañante de una paciente con cáncer de mama en Love Heals Effect. ${
    lang === "es" ? SAFETY_ES : SAFETY_EN
  }
Hoy ella se siente: "${mood}". ${note ? `Nos cuenta: "${note}".` : ""}
Elige de 1 a 3 recursos de esta lista (id|tipo|título|descripción) que más le ayuden y explica en una frase por qué.
${list}
Responde SOLO JSON: {"message":"frase breve y empática en ${lang === "es" ? "español" : "inglés"}","picks":[{"id":number,"reason":"por qué en ${lang === "es" ? "español" : "inglés"}"}]}`;

  const gem = parseJson<{ message?: string; picks?: Array<{ id: number; reason: string }> }>(
    await callGemini(prompt, true)
  );
  const valid = (gem?.picks || []).filter((p) => pool.some((r) => r.id === p.id)).slice(0, 3);
  if (gem?.message && valid.length > 0) {
    return { message: gem.message, picks: valid, source: "gemini-api" };
  }
  return fallback();
}

/* ------------------------------------------------------------------ */
/*  2. Estructurar una entrada de bitácora a partir de texto libre     */
/* ------------------------------------------------------------------ */

export interface StructuredEntry {
  tipo: string;
  titulo: string;
  detalle: string;
  fecha: string;
  medico: string;
  lugar: string;
  etiquetas: string[];
  source: Source;
}

const SYMPTOMS = [
  "dolor", "náuseas", "nauseas", "vómito", "vomito", "fatiga", "cansancio", "fiebre", "mareo",
  "insomnio", "sofocos", "ansiedad", "hinchazón", "hinchazon", "caída del cabello", "neuropatía",
  "neuropatia", "diarrea", "estreñimiento", "llagas", "falta de apetito", "dolor de cabeza",
  "nausea", "pain", "fatigue", "fever", "dizziness", "insomnia", "hot flashes", "swelling",
];
const MEDS = [
  "tamoxifeno", "letrozol", "anastrozol", "exemestano", "trastuzumab", "herceptin", "pertuzumab",
  "paclitaxel", "docetaxel", "doxorrubicina", "ciclofosfamida", "palbociclib", "ondansetrón",
  "ondansetron", "dexametasona", "olanzapina", "tamoxifen", "letrozole", "anastrozole",
];
const MONTHS: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5, julio: 6, agosto: 7,
  septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, july: 6, august: 7,
  september: 8, october: 9, november: 10, december: 11,
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function heuristicEntry(text: string, today: string, lang: Lang): StructuredEntry {
  const clean = text.replace(/\s+/g, " ").trim();
  const lower = clean.toLowerCase();

  const sintomas = Array.from(new Set(SYMPTOMS.filter((s) => lower.includes(s))));
  const meds = Array.from(new Set(MEDS.filter((m) => lower.includes(m))));

  let tipo = "nota";
  if (/(diagnos|diagnóstic|patolog|estadio|etapa)/i.test(clean)) tipo = "diagnostico";
  else if (/(quimio|radio|cirug|biopsia|mastectom|lumpect|resonancia|mamograf|ecograf|tomograf|\bpet\b|laboratorio|análisis|analisis|infusi|inyecci|surgery|chemo|biopsy|scan)/i.test(clean)) tipo = "procedimiento";
  else if (/(\bdr\.?\b|\bdra\.?\b|doctor|oncólog|oncolog|consulta|cita con|médic|medic|cirujan|appointment)/i.test(clean)) tipo = "cita";
  else if (meds.length > 0 || /(empez|inici|suspend|cambi|dosis|pastilla|medicament|started|stopped|dose)/i.test(clean)) tipo = "medicamento";
  else if (sintomas.length > 0) tipo = "sintoma";

  const doc = clean.match(
    /(?:\bdr\.?|\bdra\.?|doctor(?:a)?|oncólog[oa]|cirujan[oa])\s+([A-ZÁÉÍÓÚÑ][\wáéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][\wáéíóúñ]+)?)/
  );
  const medico = doc ? `${/\bdra\b|doctora|oncólog[a]|cirujan[a]/i.test(doc[0]) ? "Dra." : "Dr."} ${doc[1]}` : "";

  const place = clean.match(
    /(?:\ben\b|\bat\b)\s+((?:Queen'?s|Hospital|Clínica|Clinica|Centro|Kaiser|Straub|Center)[^,.;]*)/i
  );
  const lugar = place ? place[1].trim() : "";

  let fecha = today;
  if (/\bayer\b|yesterday/i.test(lower)) fecha = addDays(today, -1);
  else if (/anteayer|antier/i.test(lower)) fecha = addDays(today, -2);
  const isoM = clean.match(/(\d{4}-\d{2}-\d{2})/);
  const textM = lower.match(/(\d{1,2})\s+de\s+([a-záéíóú]+)/);
  if (isoM) fecha = isoM[1];
  else if (textM && MONTHS[textM[2]] !== undefined) {
    const y = Number(today.slice(0, 4));
    fecha = iso(new Date(y, MONTHS[textM[2]], Number(textM[1]), 12));
  }

  const titles: Record<string, string> = {
    sintoma: `${lang === "es" ? "Síntomas" : "Symptoms"}: ${sintomas.map(cap).join(", ")}`,
    cita: `${lang === "es" ? "Cita con" : "Visit with"} ${medico || (lang === "es" ? "mi médico" : "my doctor")}`,
    medicamento: `${lang === "es" ? "Medicación" : "Medication"}: ${meds.map(cap).join(", ") || (lang === "es" ? "cambio" : "change")}`,
    procedimiento: lang === "es" ? "Procedimiento o tratamiento" : "Procedure or treatment",
    diagnostico: lang === "es" ? "Diagnóstico / resultados" : "Diagnosis / results",
    nota: cap(clean.slice(0, 60)) + (clean.length > 60 ? "…" : ""),
  };

  return {
    tipo,
    titulo: titles[tipo] || titles.nota,
    detalle: clean,
    fecha,
    medico,
    lugar,
    etiquetas: Array.from(new Set([...sintomas, ...meds])).slice(0, 8),
    source: "pono-engine",
  };
}

export async function aiStructureEntry(input: {
  text: string;
  lang: Lang;
  today: string;
}): Promise<StructuredEntry> {
  const { text, lang, today } = input;
  const base = heuristicEntry(text, today, lang);

  const prompt = `Eres PONO IA. Organiza el relato de una paciente con cáncer de mama en UNA entrada de su bitácora clínica. ${
    lang === "es" ? SAFETY_ES : SAFETY_EN
  } No inventes datos que ella no dijo.
Hoy es ${today}. Relato: """${text}"""
Responde SOLO JSON con: {"tipo":"sintoma|cita|procedimiento|medicamento|diagnostico|nota","titulo":"corto","detalle":"resumen fiel en primera persona","fecha":"YYYY-MM-DD","medico":"nombre o vacío","lugar":"lugar o vacío","etiquetas":["síntomas o medicinas mencionados"]}
Escribe en ${lang === "es" ? "español" : "inglés"}.`;

  const gem = parseJson<Partial<StructuredEntry>>(await callGemini(prompt, true));
  if (gem && gem.titulo) {
    const tipos = ["sintoma", "cita", "procedimiento", "medicamento", "diagnostico", "nota"];
    return {
      tipo: tipos.includes(String(gem.tipo)) ? String(gem.tipo) : base.tipo,
      titulo: String(gem.titulo || base.titulo).slice(0, 90),
      detalle: String(gem.detalle || base.detalle),
      fecha: /^\d{4}-\d{2}-\d{2}$/.test(String(gem.fecha)) ? String(gem.fecha) : base.fecha,
      medico: String(gem.medico || base.medico),
      lugar: String(gem.lugar || base.lugar),
      etiquetas: Array.isArray(gem.etiquetas) ? gem.etiquetas.map(String).slice(0, 8) : base.etiquetas,
      source: "gemini-api",
    };
  }
  return base;
}

/* ------------------------------------------------------------------ */
/*  3. Resumen para llevar a la cita (médico o sanador)                */
/* ------------------------------------------------------------------ */

function symptomCounts(timeline: any[], since: string) {
  const counts: Record<string, number> = {};
  timeline
    .filter((e) => String(e.fecha) >= since)
    .forEach((e) => {
      const tags: string[] = Array.isArray(e.etiquetas) ? e.etiquetas : [];
      tags
        .filter((t) => SYMPTOMS.includes(String(t).toLowerCase()))
        .forEach((t) => {
          const k = String(t).toLowerCase();
          counts[k] = (counts[k] || 0) + 1;
        });
      if (e.tipo === "sintoma" && tags.length === 0) {
        counts[String(e.titulo)] = (counts[String(e.titulo)] || 0) + 1;
      }
    });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

export async function aiConsultSummary(input: {
  audience: "medico" | "sanador";
  ficha: any;
  timeline: any[];
  caregiverName?: string | null;
  lang: Lang;
  today: string;
}): Promise<{ summary: string; questions: string[]; source: Source }> {
  const { audience, ficha, timeline, caregiverName, lang, today } = input;
  const es = lang === "es";
  const stageMap: Record<string, Record<Lang, string>> = {
    diagnostico: { es: "Diagnóstico", en: "Diagnosis" },
    tratamiento_activo: { es: "Tratamiento activo", en: "Active treatment" },
    cirugia_recuperacion: { es: "Cirugía y recuperación", en: "Surgery & recovery" },
    post_tratamiento: { es: "Post-tratamiento", en: "Post-treatment" },
  };
  const meds = (ficha.medicamentos_y_horarios || [])
    .map((m: any) => `${m.nombre} (${m.dosis}${m.horario ? `, ${m.horario}` : ""})`)
    .join("; ");
  const sups = (ficha.suplementos || []).map((s: any) => `${s.nombre} (${s.dosis})`).join("; ");
  const since30 = addDays(today, -30);
  const recent = [...timeline]
    .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
    .filter((e) => String(e.fecha) >= since30)
    .slice(0, 8);
  const sy = symptomCounts(timeline, since30);
  const doctors = Array.from(
    new Set(timeline.map((e) => String(e.medico || "").trim()).filter(Boolean))
  );

  const lines = [
    `${es ? "RESUMEN PARA MI CITA" : "SUMMARY FOR MY APPOINTMENT"} (${
      audience === "medico" ? (es ? "Médico" : "Doctor") : es ? "Sanador" : "Healer"
    }) — ${today}`,
    `${es ? "Paciente" : "Patient"}: ${ficha.nombre_paciente} · ${es ? "Etapa" : "Stage"}: ${
      (stageMap[ficha.etapa_actual] || stageMap.diagnostico)[lang]
    }${caregiverName ? ` · ${es ? "Cuidador" : "Caregiver"}: ${caregiverName}` : ""}`,
    `${es ? "Alergias" : "Allergies"}: ${ficha.alergias || (es ? "ninguna reportada" : "none reported")}`,
    `${es ? "Medicinas actuales" : "Current medications"}: ${meds || (es ? "ninguna registrada" : "none recorded")}`,
    `${es ? "Suplementos" : "Supplements"}: ${sups || (es ? "ninguno" : "none")}`,
    ficha.historia_medica ? `${es ? "Historia" : "History"}: ${ficha.historia_medica}` : "",
    sy.length
      ? `${es ? "Síntomas registrados (30 días)" : "Symptoms logged (30 days)"}: ${sy
          .map(([k, n]) => `${k} (${n})`)
          .join(", ")}`
      : "",
    doctors.length ? `${es ? "Médicos con los que ha pasado" : "Doctors seen"}: ${doctors.join(", ")}` : "",
    recent.length ? `${es ? "Evolución reciente" : "Recent progress"}:` : "",
    ...recent.map(
      (e) =>
        ` • ${String(e.fecha)} — ${e.titulo}${e.medico ? ` (${e.medico})` : ""}${
          e.detalle && e.origen !== "auto" ? `: ${String(e.detalle).slice(0, 140)}` : ""
        }`
    ),
  ].filter(Boolean);
  const baseSummary = lines.join("\n");

  const questions: string[] = [];
  sy.slice(0, 2).forEach(([k]) =>
    questions.push(
      es
        ? `¿Es esperado presentar ${k} con mi tratamiento actual y qué puedo hacer para sobrellevarlo?`
        : `Is it expected to have ${k} with my current treatment and what can I do to cope?`
    )
  );
  if (meds)
    questions.push(
      es
        ? "¿Hay alguna interacción entre mis medicinas y mis suplementos que deba conocer?"
        : "Are there any interactions between my medications and supplements I should know about?"
    );
  questions.push(
    audience === "sanador"
      ? es
        ? "¿Qué práctica integrativa me recomiendas según cómo me he sentido últimamente?"
        : "Which integrative practice do you recommend based on how I've been feeling?"
      : es
      ? "¿Cuáles son mis próximos pasos y las fechas de mis siguientes controles?"
      : "What are my next steps and the dates of my next check-ups?"
  );

  const prompt = `Eres PONO IA. Redacta un resumen claro y ordenado para que una paciente con cáncer de mama (o su cuidador) lo muestre a su ${
    audience === "medico" ? "médico" : "sanador integrativo"
  } sin olvidar nada. ${es ? SAFETY_ES : SAFETY_EN} Usa solo estos datos, sin inventar:
${baseSummary}
Responde SOLO JSON: {"summary":"texto con viñetas '•' por secciones, en ${es ? "español" : "inglés"}","questions":["hasta 4 preguntas útiles para hacerle a su ${audience === "medico" ? "médico" : "sanador"}"]}`;
  const gem = parseJson<{ summary?: string; questions?: string[] }>(await callGemini(prompt, true));
  if (gem?.summary) {
    return {
      summary: gem.summary,
      questions: Array.isArray(gem.questions) && gem.questions.length ? gem.questions.slice(0, 4) : questions.slice(0, 4),
      source: "gemini-api",
    };
  }
  return { summary: baseSummary, questions: questions.slice(0, 4), source: "pono-engine" };
}

/* ------------------------------------------------------------------ */
/*  4. Resumen del día: recordatorios + alertas inteligentes           */
/* ------------------------------------------------------------------ */

export interface Reminder {
  id: string;
  kind: "med" | "cita" | "sesion" | "practica" | "bitacora";
  title: string;
  sub: string;
  habitKey?: string;
  resourceId?: number;
}
export interface Insight {
  id: string;
  text: string;
  action?: "bitacora" | "consult";
}

export async function aiBriefing(input: {
  name: string;
  ficha: any;
  sessions: any[];
  timeline: any[];
  resources: any[];
  lastMood?: string | null;
  lang: Lang;
  today: string;
}): Promise<{ message: string; reminders: Reminder[]; insights: Insight[]; source: Source }> {
  const { name, ficha, sessions, timeline, resources, lastMood, lang, today } = input;
  const es = lang === "es";
  const horizon = addDays(today, 3);
  const reminders: Reminder[] = [];

  (ficha.medicamentos_y_horarios || []).forEach((m: any, i: number) => {
    reminders.push({
      id: `med-${m.id ?? i}`,
      kind: "med",
      title: m.nombre,
      sub: `${m.dosis || ""}${m.horario ? ` · ${m.horario}` : ""}`,
      habitKey: `med-${m.id ?? i}`,
    });
  });

  (ficha.citas_medicas || []).forEach((c: any, i: number) => {
    const d = String(c.fecha).slice(0, 10);
    if (d >= today && d <= horizon) {
      const n = daysBetween(today, d);
      reminders.push({
        id: `cita-${c.id ?? i}`,
        kind: "cita",
        title: c.titulo,
        sub: `${n === 0 ? (es ? "Hoy" : "Today") : n === 1 ? (es ? "Mañana" : "Tomorrow") : d}${c.hora ? ` · ${c.hora}` : ""}${c.lugar ? ` · ${c.lugar}` : ""}`,
      });
    }
  });

  sessions
    .filter((s) => s.estado_cita === "programada")
    .forEach((s) => {
      const d = String(s.fecha_sesion).slice(0, 10);
      if (d >= today && d <= horizon) {
        const n = daysBetween(today, d);
        reminders.push({
          id: `ses-${s.id}`,
          kind: "sesion",
          title: s.enlace_o_lugar,
          sub: `${n === 0 ? (es ? "Hoy" : "Today") : n === 1 ? (es ? "Mañana" : "Tomorrow") : d} · ${String(s.modalidad).toUpperCase()}`,
        });
      }
    });

  const pick =
    resources.find((r) => r.tipo_contenido === (MOOD_TYPES[lastMood || ""] || ["meditacion_audio"])[0]) ||
    resources[0];
  if (pick) {
    reminders.push({
      id: `prac-${pick.id}`,
      kind: "practica",
      title: es ? pick.titulo_es : pick.titulo_en || pick.titulo_es,
      sub: es ? "Tu práctica sugerida de hoy" : "Your suggested practice today",
      resourceId: pick.id,
    });
  }

  const insights: Insight[] = [];
  const sorted = [...timeline].sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  const lastEntry = sorted.find((e) => e.origen !== "auto");
  const gap = lastEntry ? daysBetween(String(lastEntry.fecha), today) : 99;
  if (gap >= 3) {
    insights.push({
      id: "gap",
      action: "bitacora",
      text: lastEntry
        ? es
          ? `Hace ${gap} días que no escribes en tu bitácora. ¿Cómo te has sentido? Cuéntamelo y yo la organizo.`
          : `It's been ${gap} days since your last journal entry. How have you felt? Tell me and I'll organize it.`
        : es
        ? "Aún no tienes entradas en tu bitácora. Cuéntame cómo vas y yo la organizo por ti."
        : "You have no journal entries yet. Tell me how you're doing and I'll organize it for you.",
    });
  }
  const sy = symptomCounts(timeline, addDays(today, -7)).filter(([, n]) => n >= 2);
  if (sy[0]) {
    insights.push({
      id: "symptom",
      action: "consult",
      text: es
        ? `Registraste "${sy[0][0]}" ${sy[0][1]} veces esta semana. Vale la pena mencionarlo en tu próxima cita: ya lo dejé en tu resumen.`
        : `You logged "${sy[0][0]}" ${sy[0][1]} times this week. Worth mentioning at your next visit: it's already in your summary.`,
    });
  }
  const nextVisit = (ficha.citas_medicas || [])
    .map((c: any) => String(c.fecha).slice(0, 10))
    .filter((d: string) => d >= today)
    .sort()[0];
  if (nextVisit && daysBetween(today, nextVisit) <= 2) {
    insights.push({
      id: "prep",
      action: "consult",
      text: es
        ? "Tu cita médica está muy cerca. Prepara tu resumen con PONO IA para no olvidar nada."
        : "Your medical visit is very close. Prepare your summary with PONO AI so you don't forget anything.",
    });
  }

  const meds = reminders.filter((r) => r.kind === "med").length;
  const visits = reminders.filter((r) => r.kind === "cita" || r.kind === "sesion").length;
  const fallbackMsg = es
    ? `Hola ${name}, hoy tienes ${meds} medicina${meds === 1 ? "" : "s"} y ${visits} cita${visits === 1 ? "" : "s"} en los próximos 3 días. Aquí estoy para ayudarte. 🌺`
    : `Hi ${name}, today you have ${meds} medication${meds === 1 ? "" : "s"} and ${visits} appointment${visits === 1 ? "" : "s"} in the next 3 days. I'm here to help. 🌺`;

  const gemMsg = await callGemini(
    `Eres PONO IA. Escribe UNA frase cálida (máx. 28 palabras) en ${es ? "español" : "inglés"} saludando a ${name} y resumiendo su día: ${meds} medicinas hoy, ${visits} citas en 3 días${lastMood ? `, ayer/hoy se sintió "${lastMood}"` : ""}. ${es ? SAFETY_ES : SAFETY_EN} Sin listas.`
  );

  return {
    message: gemMsg || fallbackMsg,
    reminders,
    insights,
    source: gemMsg ? "gemini-api" : "pono-engine",
  };
}


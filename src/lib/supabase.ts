import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ""
).trim();
const supabaseSecretKey = (
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  ""
).trim();
const supabasePublishableKey = (
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ""
).trim();

const forceLocalDb =
  process.env.USE_LOCAL_DB === "true" ||
  process.env.USE_LOCAL_DB === "1";

const hasSupabaseConfig =
  !forceLocalDb &&
  Boolean(supabaseUrl) &&
  Boolean(supabaseSecretKey || supabasePublishableKey) &&
  supabaseUrl.startsWith("http") &&
  !supabaseUrl.includes("tu-proyecto.supabase.co") &&
  !supabaseSecretKey.includes("tu-service-role");

// ============================================================================
// MODO BASE DE DATOS LOCAL DE RESPALDO (cuando aún no se ha copiado .env.local)
// ============================================================================
type RowRecord = Record<string, any>;

interface LocalDatabaseSchema {
  usuarios: RowRecord[];
  ficha_paciente: RowRecord[];
  ficha_cuidador: RowRecord[];
  sanadores_y_contenidos: RowRecord[];
  citas_y_bitacora_sanador: RowRecord[];
  pagos_y_suscripciones: RowRecord[];
  tickets_feedback: RowRecord[];
}

const LOCAL_DB_PATH = path.join(process.cwd(), "database", "local-dev-db.json");

function createInitialSeed(): LocalDatabaseSchema {
  // Contraseña por defecto para las cuentas demo: Love2026
  const defaultPasswordHash = bcrypt.hashSync("Love2026", 10);
  const now = new Date().toISOString();

  return {
    usuarios: [
      {
        id: 1,
        nombre: "Elena Kalani (Paciente Demo)",
        correo: "paciente@loveheals.com",
        password_hash: defaultPasswordHash,
        telefono: "8085550101",
        rol: "paciente",
        nivel_suscripcion: "pagada",
        idioma_preferido: "es",
        estado: "activo",
        creado_en: now,
      },
      {
        id: 2,
        nombre: "Mateo Kalani (Cuidador Demo)",
        correo: "cuidador@loveheals.com",
        password_hash: defaultPasswordHash,
        telefono: "8085550102",
        rol: "cuidador",
        nivel_suscripcion: "pagada",
        idioma_preferido: "es",
        estado: "activo",
        creado_en: now,
      },
      {
        id: 3,
        nombre: "Omar & Kelsey (Sanadores)",
        correo: "sanador@loveheals.com",
        password_hash: defaultPasswordHash,
        telefono: "8085550103",
        rol: "sanador",
        nivel_suscripcion: "pagada",
        idioma_preferido: "es",
        estado: "activo",
        creado_en: now,
      },
      {
        id: 4,
        nombre: "Erika Admin",
        correo: "admin@loveheals.com",
        password_hash: defaultPasswordHash,
        telefono: "8085550104",
        rol: "admin",
        nivel_suscripcion: "pagada",
        idioma_preferido: "es",
        estado: "activo",
        creado_en: now,
      },
    ],
    ficha_paciente: [
      {
        id: 1,
        nombre_familia: "Familia Kalani",
        paciente_usuario_id: 1,
        cuidador_usuario_id: 2,
        nombre_paciente: "Elena Kalani (Paciente Demo)",
        correo_invitacion_paciente: "paciente@loveheals.com",
        correo_invitacion_cuidador: "cuidador@loveheals.com",
        etapa_actual: "tratamiento_activo",
        historia_medica:
          "En proceso de acompañamiento integrativo en Honolulu. Respondiendo favorablemente a sesiones de meditación y nutrición antiinflamatoria.",
        alergias: "Penicilina",
        datos_nutricionales: "Hidratación constante, dieta alcalina y tés herbales.",
        suplementos: [
          { nombre: "Vitamina D3", dosis: "2000 UI", horario: "08:00 AM" },
          { nombre: "Magnesio Glicinato", dosis: "400 mg", horario: "09:00 PM" },
        ],
        resultados_laboratorio: [],
        medicamentos_y_horarios: [
          {
            nombre: "Ondansetrón",
            dosis: "8 mg",
            horario: "07:30 AM",
            indicaciones: "30 min antes del desayuno para control de náuseas",
          },
        ],
        citas_medicas: [
          {
            titulo: "Control con Oncología — Queen's Medical Center",
            fecha: "2026-11-24T10:00:00Z",
            lugar: "Honolulu, HI",
          },
        ],
        documentos_oncologo: [],
        contactos_personales: [],
        resumen_ia_pono:
          "Paciente en etapa de tratamiento activo, vinculada 1 a 1 con su cuidador Mateo Kalani. Priorizar manejo de energía matutina y relajación nerviosa con cuencos sonoros.",
        resumen_ia_actualizado_en: now,
        registrado_por: "paciente",
        creado_en: now,
        actualizado_en: now,
      },
    ],
    ficha_cuidador: [
      {
        id: 1,
        cuidador_usuario_id: 2,
        ficha_paciente_id: 1,
        relacion_familiar: "Esposo / Acompañante Principal",
        nivel_experiencia: "Intermedio",
        habitos_autocuidado: "Caminata matutina de 20 min y respiración guiada",
        horarios_disponibles: "Mañanas y tardes",
        areas_de_interes: "Nutrición, manejo del sueño y grupos con Omar",
        estado_vinculo: "vinculado",
        creado_en: now,
      },
    ],
    sanadores_y_contenidos: [
      {
        id: 1,
        sanador_usuario_id: 3,
        tipo_registro: "perfil_sanador",
        especialidad: "Kelsie Reynolds · Holistic Breast Cancer Coach & BAM",
        short_bio_es:
          "Cofundadora de Love Heals Effect en Honolulu. Especialista en acompañamiento emocional para pacientes, Body Awareness Movement (BAM) y círculos de sanación.",
        short_bio_en:
          "Co-founder of Love Heals Effect in Honolulu. Specialist in emotional accompaniment for patients, Body Awareness Movement (BAM), and healing circles.",
        tarifa_hora_usd: 85,
        modalidades: "ambas",
        disponibilidad_horaria: { dias: "Lunes a Viernes", horas: "9:00 AM - 4:00 PM HST" },
        es_sanador_interno: true,
        publico_objetivo: "paciente",
        es_gratuito: false,
        estado: "activo",
        creado_en: now,
      },
      {
        id: 2,
        sanador_usuario_id: 3,
        tipo_registro: "perfil_sanador",
        especialidad: "Omar Melero · Integrative Coach & Caregiver Circle Lead",
        short_bio_es:
          "Cofundador de Love Heals Effect. Facilitador de resiliencia familiar, regulación del sistema nervioso, meditación guiada y grupos de soporte en Hawái.",
        short_bio_en:
          "Co-founder of Love Heals Effect. Family resilience facilitator, nervous system regulation, guided meditation, and support groups in Hawaii.",
        tarifa_hora_usd: 85,
        modalidades: "ambas",
        disponibilidad_horaria: { dias: "Martes a Sábado", horas: "10:00 AM - 5:00 PM HST" },
        es_sanador_interno: true,
        publico_objetivo: "ambos",
        es_gratuito: false,
        estado: "activo",
        creado_en: now,
      },
      {
        id: 3,
        sanador_usuario_id: 3,
        tipo_registro: "contenido",
        tipo_contenido: "video_bam",
        titulo_es: "Suavizando el Cuerpo tras Quimioterapia (BAM 15 min)",
        titulo_en: "Softening the Body Post-Chemo (15-min BAM)",
        descripcion_es:
          "Movimiento consciente suave guiado por Kelsie para liberar tensión linfática y reconectar con tu respiración sin esfuerzo.",
        descripcion_en:
          "Gentle conscious movement guided by Kelsie to release lymphatic tension and reconnect with your breath effortlessly.",
        media_url: "https://www.youtube.com/watch?v=inpok4MKVLM",
        publico_objetivo: "paciente",
        es_gratuito: true,
        estado: "activo",
        creado_en: now,
      },
      {
        id: 4,
        sanador_usuario_id: 3,
        tipo_registro: "contenido",
        tipo_contenido: "meditacion_audio",
        titulo_es: "Meditación Aloha: Calma antes de tu Cita Oncológica",
        titulo_en: "Aloha Meditation: Calm Before Your Oncology Visit",
        descripcion_es:
          "Audio de 10 minutos para regular la ansiedad antes de exámenes de laboratorio o consultas médicas.",
        descripcion_en:
          "10-minute audio to regulate anxiety before lab tests or medical appointments.",
        media_url: "https://open.spotify.com",
        publico_objetivo: "ambos",
        es_gratuito: true,
        estado: "activo",
        creado_en: now,
      },
      {
        id: 5,
        sanador_usuario_id: 3,
        tipo_registro: "contenido",
        tipo_contenido: "musicoterapia",
        titulo_es: "Cuencos Sonoros y Brisa de O'ahu (432 Hz)",
        titulo_en: "Sound Bowls & O'ahu Ocean Breeze (432 Hz)",
        descripcion_es:
          "Sesión de musicoterapia restaurativa ideal para descansar durante la tarde o conciliar el sueño.",
        descripcion_en:
          "Restorative music therapy session ideal for afternoon rest or deep sleep.",
        media_url: "https://open.spotify.com",
        publico_objetivo: "ambos",
        es_gratuito: true,
        estado: "activo",
        creado_en: now,
      },
      {
        id: 6,
        sanador_usuario_id: 3,
        tipo_registro: "contenido",
        tipo_contenido: "guia_autocuidado",
        titulo_es: "Guía de Nutrición Antiinflamatoria e Hidratación en Tratamiento",
        titulo_en: "Anti-inflammatory Nutrition & Hydration Guide During Treatment",
        descripcion_es:
          "Recetas sencillas, infusiones para aliviar náuseas y alimentos alcalinos recomendados para tu semana.",
        descripcion_en:
          "Simple recipes, nausea-soothing infusions, and alkaline foods recommended for your week.",
        media_url: "#guia-nutricion",
        publico_objetivo: "ambos",
        es_gratuito: true,
        estado: "activo",
        creado_en: now,
      },
      {
        id: 7,
        sanador_usuario_id: 3,
        tipo_registro: "workshop",
        tipo_contenido: "love_circle",
        titulo_es: "Love Circle for Patients · Círculo Semanal con Kelsie",
        titulo_en: "Love Circle for Patients · Weekly Circle with Kelsie",
        descripcion_es:
          "Espacio íntimo y gratuito de contención emocional entre mujeres atravesando el proceso de cáncer de mama (Zoom y Honolulu).",
        descripcion_en:
          "Free intimate emotional support space for women navigating breast cancer (Zoom & Honolulu).",
        media_url: "https://zoom.us",
        fecha_evento: "2026-11-21T18:00:00Z",
        publico_objetivo: "paciente",
        es_gratuito: true,
        estado: "activo",
        creado_en: now,
      },
    ],
    citas_y_bitacora_sanador: [
      {
        id: 1,
        ficha_paciente_id: 1,
        sanador_usuario_id: 3,
        reservado_por_usuario_id: 1,
        asistente_rol: "paciente",
        modalidad: "online",
        fecha_sesion: "2026-11-22T15:00:00Z",
        es_sesion_gratuita_mensual: true,
        enlace_o_lugar: "Sesión Virtual con Kelsie Reynolds (Sala Love Heals)",
        estado_cita: "programada",
        estado_observado_paciente: "",
        patrones_detectados: "",
        recomendaciones_dadas: "",
        archivo_adjunto_url: "",
        transcripcion_o_notas: "",
        creado_en: now,
      },
    ],
    pagos_y_suscripciones: [],
    tickets_feedback: [],
  };
}

function readLocalDb(): LocalDatabaseSchema {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      const seed = createInitialSeed();
      fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true });
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(seed, null, 2), "utf-8");
      return seed;
    }
    const raw = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
    return JSON.parse(raw) as LocalDatabaseSchema;
  } catch {
    return createInitialSeed();
  }
}

function writeLocalDb(db: LocalDatabaseSchema) {
  try {
    fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true });
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("No se pudo guardar local-dev-db.json:", err);
  }
}

class LocalQueryBuilder {
  private tableName: keyof LocalDatabaseSchema;
  private operation: "select" | "insert" | "update" | "delete" = "select";
  private filters: Array<(row: RowRecord) => boolean> = [];
  private payload: any = null;
  private headOnly = false;
  private sortCol: string | null = null;
  private sortAsc = true;
  private maxRows: number | null = null;

  constructor(tableName: keyof LocalDatabaseSchema) {
    this.tableName = tableName;
  }

  select(_columns = "*", options?: { count?: string; head?: boolean }) {
    if (options?.head) {
      this.headOnly = true;
    }
    return this;
  }

  insert(values: RowRecord | RowRecord[]) {
    this.operation = "insert";
    this.payload = values;
    return this;
  }

  update(values: RowRecord) {
    this.operation = "update";
    this.payload = values;
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push(
      (row) =>
        row[column] === value ||
        (row[column] !== null &&
          row[column] !== undefined &&
          value !== null &&
          value !== undefined &&
          String(row[column]) === String(value))
    );
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push((row) => row[column] !== value);
    return this;
  }

  in(column: string, values: any[]) {
    const set = new Set((values || []).map((v) => String(v)));
    this.filters.push((row) => row[column] !== undefined && set.has(String(row[column])));
    return this;
  }

  ilike(column: string, pattern: string) {
    const clean = String(pattern || "").replace(/%/g, "").toLowerCase();
    this.filters.push((row) => String(row[column] || "").toLowerCase().includes(clean));
    return this;
  }

  is(column: string, value: any) {
    this.filters.push((row) => (row[column] ?? null) === value);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.sortCol = column;
    this.sortAsc = options?.ascending !== false;
    return this;
  }

  limit(count: number) {
    this.maxRows = count;
    return this;
  }

  private execute(): { data: any; error: null | { message: string }; count?: number } {
    const db = readLocalDb();
    const table = (db[this.tableName] || []) as RowRecord[];

    if (this.operation === "insert") {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload];
      const maxId = table.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0);
      const inserted = items.map((item, idx) => ({
        id: item.id ?? maxId + idx + 1,
        creado_en: new Date().toISOString(),
        ...item,
      }));
      table.push(...inserted);
      db[this.tableName] = table;
      writeLocalDb(db);
      return {
        data: Array.isArray(this.payload) ? inserted : inserted[0],
        error: null,
      };
    }

    let matched = table.filter((row) => this.filters.every((fn) => fn(row)));

    if (this.operation === "update") {
      matched.forEach((row) => {
        Object.assign(row, this.payload, {
          actualizado_en: new Date().toISOString(),
        });
      });
      db[this.tableName] = table;
      writeLocalDb(db);
      return { data: matched, error: null };
    }

    if (this.operation === "delete") {
      db[this.tableName] = table.filter(
        (row) => !this.filters.every((fn) => fn(row))
      );
      writeLocalDb(db);
      return { data: matched, error: null };
    }

    if (this.sortCol) {
      const col = this.sortCol;
      const dir = this.sortAsc ? 1 : -1;
      matched = [...matched].sort((a, b) =>
        String(a[col] ?? "").localeCompare(String(b[col] ?? "")) * dir
      );
    }

    const totalCount = matched.length;
    if (this.maxRows !== null && this.maxRows >= 0) {
      matched = matched.slice(0, this.maxRows);
    }

    if (this.headOnly) {
      return { data: null, error: null, count: totalCount };
    }

    return { data: matched, error: null, count: totalCount };
  }

  async maybeSingle() {
    const res = this.execute();
    if (Array.isArray(res.data)) {
      return { data: res.data[0] ?? null, error: res.error };
    }
    return { data: res.data ?? null, error: res.error };
  }

  async single() {
    const res = this.execute();
    if (Array.isArray(res.data)) {
      if (!res.data[0]) {
        return { data: null, error: { message: "Registro no encontrado" } };
      }
      return { data: res.data[0], error: null };
    }
    return { data: res.data, error: res.error };
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: any; error: any; count?: number }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }
}

const localSupabaseFallback = {
  from(table: keyof LocalDatabaseSchema) {
    return new LocalQueryBuilder(table);
  },
} as unknown as SupabaseClient;

if (!hasSupabaseConfig) {
  console.info(
    "ℹ️ [Love Heals Effect] SUPABASE_URL no detectado en .env. Usando base de datos local de desarrollo (database/local-dev-db.json)."
  );
}

/**
 * Cliente administrativo de Supabase para uso en el servidor (src/app/api/).
 * Si aún no se ha configurado .env.local con SUPABASE_URL, usa automáticamente
 * database/local-dev-db.json para que Login, Registro y los 4 paneles funcionen sin bloqueos.
 */
export const supabaseAdmin: SupabaseClient = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseSecretKey || supabasePublishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : localSupabaseFallback;

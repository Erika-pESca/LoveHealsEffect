-- ============================================================================
-- LOVE HEALS EFFECT APP (LHEAPP V1.0) — Esquema PostgreSQL (Google Cloud SQL)
-- Especializado en: Cáncer de Mama (Célula Familiar Paciente-Cuidador)
-- IA Interna: PONO (Resumen y trazabilidad hacia los Sanadores)
-- ============================================================================

-- 1. TABLA: usuarios (Credenciales y Roles)
-- Roles: 'paciente' | 'cuidador' | 'sanador' (Omar & Kelsey en V1) | 'admin'
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(60) DEFAULT '',
    rol VARCHAR(30) NOT NULL CHECK (rol IN ('paciente', 'cuidador', 'sanador', 'admin')),
    nivel_suscripcion VARCHAR(20) NOT NULL DEFAULT 'gratuita' CHECK (nivel_suscripcion IN ('gratuita', 'pagada')),
    idioma_preferido VARCHAR(5) NOT NULL DEFAULT 'es' CHECK (idioma_preferido IN ('es', 'en')),
    estado VARCHAR(30) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'pendiente_activacion', 'inactivo')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: ficha_paciente (Eje Central — Célula Familiar 1 a 1)
-- Todo gira alrededor de la paciente. 'nombre_familia' asocia la célula Paciente-Cuidador.
CREATE TABLE IF NOT EXISTS ficha_paciente (
    id SERIAL PRIMARY KEY,
    nombre_familia VARCHAR(150) NOT NULL DEFAULT 'Familia Love Heals',
    paciente_usuario_id INT UNIQUE REFERENCES usuarios(id) ON DELETE SET NULL,
    cuidador_usuario_id INT UNIQUE REFERENCES usuarios(id) ON DELETE SET NULL,
    nombre_paciente VARCHAR(255) NOT NULL,
    correo_invitacion_paciente VARCHAR(255) DEFAULT '',
    correo_invitacion_cuidador VARCHAR(255) DEFAULT '',
    etapa_actual VARCHAR(50) NOT NULL DEFAULT 'diagnostico'
        CHECK (etapa_actual IN ('diagnostico', 'tratamiento_activo', 'cirugia_recuperacion', 'post_tratamiento')),
    historia_medica TEXT DEFAULT '',
    alergias TEXT DEFAULT '',
    datos_nutricionales TEXT DEFAULT '',
    suplementos JSONB DEFAULT '[]'::jsonb,
    resultados_laboratorio JSONB DEFAULT '[]'::jsonb,
    medicamentos_y_horarios JSONB DEFAULT '[]'::jsonb, -- Dosis, indicaciones, contraindicaciones y horarios
    citas_medicas JSONB DEFAULT '[]'::jsonb,           -- Planificador de citas, controles y chequeos
    documentos_oncologo JSONB DEFAULT '[]'::jsonb,     -- Recetas, notas y estudios digitalizados
    contactos_personales JSONB DEFAULT '[]'::jsonb,    -- Directorio básico de contactos personales
    bienestar_diario JSONB DEFAULT '{}'::jsonb,        -- Check-in diario: ánimo, hábitos y agua por fecha
    bitacora_clinica JSONB DEFAULT '[]'::jsonb,        -- Línea de tiempo del proceso: síntomas, citas, procedimientos, medicinas...
    resumen_ia_pono TEXT DEFAULT '',                   -- Resumen interno generado por PONO para sanadores
    resumen_ia_actualizado_en TIMESTAMP WITH TIME ZONE,
    registrado_por VARCHAR(30) DEFAULT 'paciente' CHECK (registrado_por IN ('paciente', 'cuidador')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: ficha_cuidador (Perfil propio del Cuidador)
CREATE TABLE IF NOT EXISTS ficha_cuidador (
    id SERIAL PRIMARY KEY,
    cuidador_usuario_id INT UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    ficha_paciente_id INT NOT NULL REFERENCES ficha_paciente(id) ON DELETE CASCADE,
    relacion_familiar VARCHAR(100) NOT NULL DEFAULT '',
    nivel_experiencia VARCHAR(80) DEFAULT 'Inicial',
    habitos_autocuidado TEXT DEFAULT '',
    horarios_disponibles TEXT DEFAULT '',
    areas_de_interes TEXT DEFAULT '',
    bienestar_diario JSONB DEFAULT '{}'::jsonb,        -- Check-in diario del cuidador: ánimo y autocuidado
    estado_vinculo VARCHAR(30) DEFAULT 'vinculado' CHECK (estado_vinculo IN ('pendiente', 'vinculado')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA: sanadores_y_contenidos (Fase 1: Omar y Kelsey)
-- Guarda el perfil del sanador (short bio, tarifario, disponibilidad) y sus contenidos gratuitos
-- (guías, audios de meditación, musicoterapia, videos BAM, podcasts, libros, workshops).
CREATE TABLE IF NOT EXISTS sanadores_y_contenidos (
    id SERIAL PRIMARY KEY,
    sanador_usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_registro VARCHAR(30) NOT NULL CHECK (tipo_registro IN ('perfil_sanador', 'contenido', 'workshop')),
    -- Campos de perfil del sanador
    especialidad VARCHAR(150) DEFAULT '',
    short_bio_es TEXT DEFAULT '',
    short_bio_en TEXT DEFAULT '',
    tarifa_hora_usd NUMERIC(10, 2) DEFAULT 0.00,
    modalidades VARCHAR(30) DEFAULT 'ambas' CHECK (modalidades IN ('online', 'presencial', 'ambas')),
    disponibilidad_horaria JSONB DEFAULT '{}'::jsonb,
    es_sanador_interno BOOLEAN DEFAULT TRUE,         -- TRUE para Omar y Kelsey en V1
    -- Campos de contenido o workshop
    tipo_contenido VARCHAR(40) DEFAULT 'video_bam'
        CHECK (tipo_contenido IN ('guia_autocuidado', 'meditacion_audio', 'musicoterapia', 'video_bam', 'podcast', 'libro_pdf', 'workshop', 'love_circle')),
    titulo_es VARCHAR(255) DEFAULT '',
    titulo_en VARCHAR(255) DEFAULT '',
    descripcion_es TEXT DEFAULT '',
    descripcion_en TEXT DEFAULT '',
    media_url TEXT DEFAULT '',                         -- YouTube (no listado), Vimeo, Spotify o PDF
    fecha_evento TIMESTAMP WITH TIME ZONE,             -- Para Workshops / Love Circles sin cruce de horarios
    publico_objetivo VARCHAR(30) DEFAULT 'ambos' CHECK (publico_objetivo IN ('paciente', 'cuidador', 'ambos')),
    es_gratuito BOOLEAN DEFAULT TRUE,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLA: citas_y_bitacora_sanador (Booking, Sesiones y Trazabilidad Post-Sesión)
CREATE TABLE IF NOT EXISTS citas_y_bitacora_sanador (
    id SERIAL PRIMARY KEY,
    ficha_paciente_id INT NOT NULL REFERENCES ficha_paciente(id) ON DELETE CASCADE,
    sanador_usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    reservado_por_usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    asistente_rol VARCHAR(30) DEFAULT 'paciente' CHECK (asistente_rol IN ('paciente', 'cuidador', 'ambos')),
    modalidad VARCHAR(30) NOT NULL CHECK (modalidad IN ('online', 'presencial')),
    fecha_sesion TIMESTAMP WITH TIME ZONE NOT NULL,
    es_sesion_gratuita_mensual BOOLEAN DEFAULT FALSE,  -- 1 sesión mensual gratuita de coaching
    enlace_o_lugar TEXT DEFAULT '',
    estado_cita VARCHAR(30) DEFAULT 'programada' CHECK (estado_cita IN ('programada', 'completada', 'cancelada')),
    -- Bitácora Post-Sesión y Audio a Texto / Transcripción
    estado_observado_paciente TEXT DEFAULT '',
    patrones_detectados TEXT DEFAULT '',
    recomendaciones_dadas TEXT DEFAULT '',
    archivo_adjunto_url TEXT DEFAULT '',               -- Archivo Word, PDF o Audio subido
    transcripcion_o_notas TEXT DEFAULT '',             -- Texto transcrito que alimenta a PONO IA
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA: pagos_y_suscripciones ($10 USD/mes por familia + sesiones individuales)
CREATE TABLE IF NOT EXISTS pagos_y_suscripciones (
    id SERIAL PRIMARY KEY,
    ficha_paciente_id INT REFERENCES ficha_paciente(id) ON DELETE SET NULL,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_pago VARCHAR(40) NOT NULL CHECK (tipo_pago IN ('suscripcion_familiar', 'sesion_sanador', 'workshop_presencial')),
    monto_usd NUMERIC(10, 2) NOT NULL,
    fee_plataforma_usd NUMERIC(10, 2) DEFAULT 0.00,
    referencia_pasarela VARCHAR(255) DEFAULT '',
    estado_pago VARCHAR(30) NOT NULL DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'completado', 'fallido', 'reembolsado')),
    periodo_fin TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA: tickets_feedback (Sistema de Tickets / Reporte de Bugs y Mejoras)
CREATE TABLE IF NOT EXISTS tickets_feedback (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    rol_usuario VARCHAR(30) DEFAULT 'paciente',
    tipo VARCHAR(30) NOT NULL DEFAULT 'feedback' CHECK (tipo IN ('bug', 'mejora', 'soporte', 'feedback')),
    asunto VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto', 'en_revision', 'resuelto')),
    respuesta_admin TEXT DEFAULT '',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_ficha_paciente_usuario ON ficha_paciente(paciente_usuario_id);
CREATE INDEX IF NOT EXISTS idx_ficha_paciente_cuidador ON ficha_paciente(cuidador_usuario_id);
CREATE INDEX IF NOT EXISTS idx_sanadores_usuario ON sanadores_y_contenidos(sanador_usuario_id, tipo_registro);
CREATE INDEX IF NOT EXISTS idx_bitacora_paciente ON citas_y_bitacora_sanador(ficha_paciente_id, fecha_sesion DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_estado ON tickets_feedback(estado, creado_en DESC);


-- Migración para bases ya creadas (ejecutar una vez en el SQL Editor de Supabase):
ALTER TABLE ficha_paciente ADD COLUMN IF NOT EXISTS bienestar_diario JSONB DEFAULT '{}'::jsonb;
ALTER TABLE ficha_cuidador ADD COLUMN IF NOT EXISTS bienestar_diario JSONB DEFAULT '{}'::jsonb;
ALTER TABLE ficha_paciente ADD COLUMN IF NOT EXISTS bitacora_clinica JSONB DEFAULT '[]'::jsonb;

-- ============================================================================
-- LOVE HEALS EFFECT (V1.0) — Esquema Simplificado de Base de Datos (PostgreSQL)
-- Despliegue: Google Cloud SQL (PostgreSQL)
-- Eje Central: La Paciente (Cáncer de Mama) y su Trazabilidad Integral
-- Estructura: 5 Tablas Esenciales para los 4 Roles
-- ============================================================================

-- 1. TABLA: usuarios (El Login y Rol de todos)
-- Guarda las credenciales individuales de acceso para cualquiera de los 4 roles:
-- 'paciente' | 'cuidador' | 'sanador' | 'admin'
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(60) DEFAULT '',
    rol VARCHAR(30) NOT NULL CHECK (rol IN ('paciente', 'cuidador', 'sanador', 'admin')),
    idioma_preferido VARCHAR(5) NOT NULL DEFAULT 'es' CHECK (idioma_preferido IN ('es', 'en')),
    estado VARCHAR(30) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'pendiente_activacion', 'inactivo')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: ficha_paciente (El corazón donde todo se conecta)
-- Todo el sistema gira alrededor de la paciente.
-- Nota clave: 'cuidador_usuario_id' une 1 a 1 al Cuidador con su Paciente.
-- Si la paciente se registra primero sin cuidador, 'cuidador_usuario_id' queda NULL (Pendiente).
-- Si el cuidador la registra primero en 3 pasos, 'paciente_usuario_id' puede quedar NULL hasta que ella active su cuenta.
CREATE TABLE IF NOT EXISTS ficha_paciente (
    id SERIAL PRIMARY KEY,
    paciente_usuario_id INT UNIQUE REFERENCES usuarios(id) ON DELETE SET NULL,
    cuidador_usuario_id INT UNIQUE REFERENCES usuarios(id) ON DELETE SET NULL,
    nombre_paciente VARCHAR(255) NOT NULL,
    correo_invitacion_paciente VARCHAR(255) DEFAULT '',
    correo_invitacion_cuidador VARCHAR(255) DEFAULT '',
    etapa_actual VARCHAR(50) NOT NULL DEFAULT 'diagnostico'
        CHECK (etapa_actual IN ('diagnostico', 'tratamiento_activo', 'cirugia_recuperacion', 'remision')),
    antecedentes_medicos TEXT DEFAULT '',
    medicamentos_y_horarios JSONB DEFAULT '[]'::jsonb, -- Lista de medicinas/suplementos y horarios de toma
    citas_medicas JSONB DEFAULT '[]'::jsonb,           -- Calendario compartido de citas con el oncólogo
    documentos_oncologo JSONB DEFAULT '[]'::jsonb,     -- Enlaces y texto extraído de notas/documentos médicos
    resumen_ia TEXT DEFAULT '',                        -- Resumen automático generado por IA para los sanadores
    resumen_ia_actualizado_en TIMESTAMP WITH TIME ZONE,
    registrado_por VARCHAR(30) DEFAULT 'paciente' CHECK (registrado_por IN ('paciente', 'cuidador')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: ficha_cuidador (Información propia y necesidades del Cuidador)
-- Permite personalizar el contenido que ve el cuidador sin mezclarlo con el de la paciente.
CREATE TABLE IF NOT EXISTS ficha_cuidador (
    id SERIAL PRIMARY KEY,
    cuidador_usuario_id INT UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    ficha_paciente_id INT NOT NULL REFERENCES ficha_paciente(id) ON DELETE CASCADE,
    parentesco VARCHAR(100) NOT NULL DEFAULT '',       -- Ej: Esposo/Pareja, Hija/o, Hermana, Amiga
    rol_cuidado VARCHAR(120) DEFAULT 'Cuidador Principal',
    horarios_disponibles TEXT DEFAULT '',              -- Horarios en los que puede cuidar
    areas_de_interes TEXT DEFAULT '',                  -- Ej: Nutrición, manejo de estrés, turnos de descanso
    estado_vinculo VARCHAR(30) DEFAULT 'vinculado' CHECK (estado_vinculo IN ('pendiente', 'vinculado')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA: sanadores_y_contenidos (Fase 1: Omar & Kelsey, escalable a más sanadores)
-- Unifica el perfil del sanador y los recursos que sube (música, podcasts, libros, meditaciones).
-- tipo_registro distingue entre la ficha principal del sanador ('perfil_sanador') y sus contenidos ('contenido').
CREATE TABLE IF NOT EXISTS sanadores_y_contenidos (
    id SERIAL PRIMARY KEY,
    sanador_usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_registro VARCHAR(30) NOT NULL CHECK (tipo_registro IN ('perfil_sanador', 'contenido')),
    -- Campos cuando tipo_registro = 'perfil_sanador'
    especialidad VARCHAR(150) DEFAULT '',              -- Coaching, Sound Bowls, Reiki, Quiropraxia, Música, etc.
    short_bio_es TEXT DEFAULT '',
    short_bio_en TEXT DEFAULT '',
    modalidades VARCHAR(30) DEFAULT 'ambas' CHECK (modalidades IN ('online', 'presencial', 'ambas')),
    disponibilidad_horaria JSONB DEFAULT '{}'::jsonb,
    es_fundador BOOLEAN DEFAULT FALSE,                 -- TRUE para Omar y Kelsey en Fase 1
    -- Campos cuando tipo_registro = 'contenido'
    tipo_contenido VARCHAR(40) DEFAULT 'video'
        CHECK (tipo_contenido IN ('musica', 'podcast', 'libro_pdf', 'video', 'meditacion', 'guia')),
    titulo_es VARCHAR(255) DEFAULT '',
    titulo_en VARCHAR(255) DEFAULT '',
    descripcion_es TEXT DEFAULT '',
    descripcion_en TEXT DEFAULT '',
    media_url TEXT DEFAULT '',                         -- Enlace a YouTube, Vimeo, Spotify o PDF
    publico_objetivo VARCHAR(30) DEFAULT 'ambos' CHECK (publico_objetivo IN ('paciente', 'cuidador', 'ambos')),
    es_gratuito BOOLEAN DEFAULT TRUE,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLA: citas_y_bitacora_sanador (Reservas / Booking y Trazabilidad Post-Sesión)
-- Une al Sanador con la Paciente en cada sesión y alimenta el resumen de IA.
CREATE TABLE IF NOT EXISTS citas_y_bitacora_sanador (
    id SERIAL PRIMARY KEY,
    ficha_paciente_id INT NOT NULL REFERENCES ficha_paciente(id) ON DELETE CASCADE,
    sanador_usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    reservado_por_usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    asistente_rol VARCHAR(30) DEFAULT 'paciente' CHECK (asistente_rol IN ('paciente', 'cuidador', 'ambos')),
    modalidad VARCHAR(30) NOT NULL CHECK (modalidad IN ('online', 'presencial')),
    fecha_sesion TIMESTAMP WITH TIME ZONE NOT NULL,
    enlace_o_lugar TEXT DEFAULT '',
    estado_cita VARCHAR(30) DEFAULT 'programada' CHECK (estado_cita IN ('programada', 'completada', 'cancelada')),
    -- Bitácora Post-Sesión del Sanador (Trazabilidad hacia la Paciente y la IA)
    estado_observado_paciente TEXT DEFAULT '',         -- Síntomas o estado emocional con el que llegó
    patrones_detectados TEXT DEFAULT '',               -- Patrones identificados en la sesión
    recomendaciones_dadas TEXT DEFAULT '',             -- Acuerdos y actividades recomendadas
    archivo_adjunto_url TEXT DEFAULT '',               -- Documento Word/PDF o audio de la sesión
    transcripcion_o_notas TEXT DEFAULT '',             -- Texto o transcripción que actualiza el resumen_ia
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_ficha_paciente_usuario ON ficha_paciente(paciente_usuario_id);
CREATE INDEX IF NOT EXISTS idx_ficha_paciente_cuidador ON ficha_paciente(cuidador_usuario_id);
CREATE INDEX IF NOT EXISTS idx_sanadores_usuario ON sanadores_y_contenidos(sanador_usuario_id, tipo_registro);
CREATE INDEX IF NOT EXISTS idx_bitacora_paciente ON citas_y_bitacora_sanador(ficha_paciente_id, fecha_sesion DESC);

# Love Heals Effect

Plataforma web comunitaria e integrativa especializada en **cáncer de mama** (**Love Heals Effect** — Honolulu, Hawái), construida con **Next.js 15 (App Router)**, **TypeScript** y **Tailwind CSS**.

## Estructura Modular del Código (`src/`)

El código está organizado por **módulos funcionales** en `src/modules/` y conectado a sus rutas públicas/internas en `src/app/`:

```text
Love Heals Effect/
├── database/
│   └── schema.sql                       # Esquema simplificado de 5 tablas (PostgreSQL / Google Cloud SQL)
├── ARQUITECTURA_MODULOS_Y_BD.md         # Justificación de los 6 módulos, 4 roles y 5 tablas
└── src/
    ├── app/                             # RUTAS DE NEXT.JS (URLs)
    │   ├── page.tsx                     # /               -> Módulo 1: Inicio Público
    │   ├── auth/
    │   │   ├── login/page.tsx           # /auth/login     -> Módulo 2: Login Único por Rol
    │   │   └── registro/page.tsx        # /auth/registro  -> Módulo 2: Registro 1 a 1 (Paciente <-> Cuidador)
    │   ├── paciente/page.tsx            # /paciente       -> Módulo 3: Panel de la Paciente (Eje Central)
    │   ├── cuidador/page.tsx            # /cuidador       -> Módulo 4: Panel del Cuidador
    │   ├── sanador/page.tsx             # /sanador        -> Módulo 5: Panel del Sanador (Omar & Kelsey)
    │   ├── admin/page.tsx               # /admin          -> Módulo 6: Panel Administrador
    │   ├── layout.tsx                   # Layout global con Navbar, Footer y LanguageProvider
    │   └── globals.css                  # Estilos base y paleta cream / espresso / rose / sage
    │
    ├── modules/                         # LÓGICA Y COMPONENTES POR MÓDULO
    │   ├── inicio/components/           # HeroSection, MarqueeRibbon, JourneyTabsSection, CommunityCirclesSection
    │   ├── auth/components/             # Formularios de Login y Registro vinculado 1 a 1
    │   ├── paciente/components/         # Ficha médica, medicinas, citas, documentos y reservas
    │   ├── cuidador/components/         # Ficha cuidador, tablero compartido y registro en 3 pasos
    │   ├── sanador/components/          # Perfil, subida de música/podcasts/libros, booking, bitácora e IA
    │   └── admin/components/            # Gestión CMS, usuarios, sanadores y revisión IA
    │
    ├── components/
    │   ├── layout/                      # Navbar.tsx y Footer.tsx compartidos
    │   └── ui/                          # Componentes reutilizables (SectionHeading, ModuleScaffold)
    ├── context/                         # LanguageContext.tsx (Inglés / Español)
    ├── i18n/                            # homeDictionary.ts (EN | ES)
    ├── lib/                             # Conexión futura a PostgreSQL (Google Cloud) y Gemini IA
    └── types/                           # Tipos TypeScript compartidos
```

## Comandos

- **Desarrollo local:** `npm run dev`
- **Compilar producción:** `npm run build`

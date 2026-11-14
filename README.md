# Love Heals Effect

Plataforma web comunitaria e integrativa especializada en **cáncer de mama** (**Love Heals Effect** — Honolulu, Hawái), construida con **Next.js 15 (App Router)**, **TypeScript** y **Tailwind CSS**.

## Estructura del Proyecto (`src/`)

Organización limpia y estándar de Next.js:

```text
Love Heals Effect/
├── database/
│   └── schema.sql                       # 5 tablas esenciales en PostgreSQL (Google Cloud SQL)
├── ARQUITECTURA_MODULOS_Y_BD.md         # Alcance de los 4 roles, módulos y base de datos
└── src/
    ├── app/                             # RUTAS DE LA WEB Y APIS DE BACKEND
    │   ├── api/                         # Endpoints del servidor (cuando conectemos BD e IA)
    │   ├── auth/
    │   │   ├── login/page.tsx           # /auth/login
    │   │   └── registro/page.tsx        # /auth/registro (Vínculo 1 a 1 Paciente <-> Cuidador)
    │   ├── paciente/page.tsx            # /paciente
    │   ├── cuidador/page.tsx            # /cuidador
    │   ├── sanador/page.tsx             # /sanador (Fase 1: Omar & Kelsey)
    │   ├── admin/page.tsx               # /admin
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx                     # / (Inicio Público)
    │
    ├── components/                      # TODOS LOS COMPONENTES VISUALES EN UN SOLO LUGAR
    │   ├── layout/                      # Navbar.tsx y Footer.tsx
    │   ├── ui/                          # Piezas reutilizables (SectionHeading, ModuleScaffold)
    │   └── inicio/                      # HeroSection, MarqueeRibbon, JourneyTabsSection, CommunityCirclesSection
    │
    ├── context/                         # LanguageContext.tsx (Inglés / Español)
    ├── data/                            # homeDictionary.ts (Textos EN | ES y configuraciones)
    ├── lib/                             # Lógica de servidor y conexiones (db.ts, auth.ts, gemini.ts, utils.ts)
    └── types/                           # Tipos TypeScript (index.ts, database.ts)
```

## Comandos

- **Desarrollo local:** `npm run dev`
- **Compilar producción:** `npm run build`

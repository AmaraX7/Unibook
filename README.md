# Unibook

API REST y frontend para gestionar una **cadena de clínicas médicas**. Permite administrar doctores, pacientes, visitas, ingresos hospitalarios y medicación, con detección automática de solapamientos por doctor y aislamiento multi-tenant por empresa.

**API en producción**: https://unibook-api.onrender.com  
**Swagger**: https://unibook-api.onrender.com/api

---

## Estructura del repositorio

```
Unibook/
├── apps/
│   ├── api/     # Backend REST (NestJS + PostgreSQL)
│   └── web/     # Frontend (Next.js App Router)
└── README.md
```

Documentación técnica completa del backend: **[apps/api/README.md](apps/api/README.md)**

---

## Stack

| Capa | Tecnologías |
|------|-------------|
| **API** | NestJS, TypeScript, PostgreSQL, TypeORM, JWT, Swagger, Jest |
| **Web** | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui |
| **IA / Bots** | Gemini 2.5 Flash, Telegraf (Telegram) |
| **Deploy** | Docker, Render, Supabase |

---

## Funcionalidades principales

- **Multi-tenancy** por `Company` con roles `PATIENT`, `DOCTOR`, `CLINIC_ADMIN` y `SUPER_ADMIN`
- **Personas** con herencia de tabla (`Doctor`, `Patient`, `Staff`)
- **Clínicas**, **visitas médicas** con bloqueo pesimista ante solapamientos
- **Ingresos** vinculados a visitas y **administración de medicamentos**
- **Chatbot** con contexto dinámico (clínicas y visitas del día)
- **Bot de Telegram** integrado con el chatbot
- **Auth** con JWT + refresh tokens en cookies HttpOnly
- Tests E2E, CI con GitHub Actions, migraciones TypeORM y despliegue en Render

---

## Roles

| Rol | Permisos |
|-----|----------|
| `PATIENT` | Ver sus visitas, consultar disponibilidad de doctores |
| `DOCTOR` | Gestionar visitas, ingresos y medicación de sus pacientes |
| `CLINIC_ADMIN` | Gestionar clínicas y personas de su empresa |
| `SUPER_ADMIN` | Acceso total al sistema |

---

## Estado del proyecto

### Backend — completado
Auth, personas, clínicas, visitas, ingresos, medicamentos, administraciones, empresas, chatbot, Telegram, Swagger, Docker, CI/CD y despliegue.

### Frontend — en progreso
- Login / Register con cookies HttpOnly y refresh automático
- Dashboard doctor (visitas, ingresos, crear visita, detalle)
- Pendiente: dashboards por rol, panel de medicación, perfil de usuario

---

## Arranque local

### API (recomendado con Docker)

```bash
cd apps/api
cp .env.example .env   # rellena tus valores
make up
```

Sin Docker:

```bash
cd apps/api
npm install
npm run start:dev
```

La API queda en **http://localhost:3001**.

### Web

```bash
cd apps/web
npm install
```

Crea `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

```bash
npm run dev
```

La app se abre en **http://localhost:3000**.

---

## CI

En cada push/PR a `main` se ejecutan los tests E2E del backend (ver [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

---

## Autor

[Mohamed Amara](https://github.com/AmaraX7)

# Unibook

Plataforma para gestionar reservas de espacios de coworking. Las empresas administran sus recursos y usuarios; los usuarios finales descubren y reservan mesas, salas y otros espacios por franjas horarias.

**API en producción**: https://unibook-api.onrender.com  
**Swagger**: https://unibook-api.onrender.com/api

---

## Estructura del repositorio

```
Unibook/
├── apps/
│   ├── api/     # Backend REST (NestJS + PostgreSQL) — completo y desplegado
│   └── web/     # Frontend (Next.js) — en desarrollo
└── README.md
```

---

## Stack

| Capa | Tecnologías |
|------|-------------|
| **API** | NestJS, TypeScript, PostgreSQL, TypeORM, JWT, Swagger, Docker |
| **Web** | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui |
| **Deploy** | Render (API) + Supabase (base de datos) |

---

## Funcionalidades (API)

- Modelo **multi-tenant** por empresa (`Company`)
- Gestión de recursos (mesa, sala, cabina, parking, etc.) con un único modelo `Resource`
- Reservas con detección de solapamientos y **bloqueo pesimista** en transacción
- Autenticación **JWT** con access token y refresh token
- Control de acceso por roles: `USER`, `COMPANY_ADMIN`, `SUPER_ADMIN`
- Paginación, rate limiting, migraciones TypeORM y tests E2E en CI

Para la documentación completa de endpoints, arquitectura, seed y variables de entorno, consulta **[apps/api/README.md](apps/api/README.md)**.

---

## Roles

| Rol | Permisos |
|-----|----------|
| `USER` | Registro, login, crear y gestionar sus reservas |
| `COMPANY_ADMIN` | Todo lo anterior + gestionar recursos y usuarios de su empresa |
| `SUPER_ADMIN` | Acceso total: empresas, usuarios, recursos y reservas |

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

La API queda en **http://localhost:3001**. Puedes poblar datos de prueba con `make seed` (contraseña por defecto: `password123`).

### Web (en desarrollo)

```bash
cd apps/web
npm install
```

Crea un `.env.local` con la URL de la API:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Luego:

```bash
npm run dev
```

La app se abre en **http://localhost:3000**.

> **Estado del frontend:** la integración con la API está empezada (cliente HTTP con refresh automático, pantalla de login). El dashboard y el resto de flujos están pendientes.

---

## CI

En cada push/PR a `main` se ejecutan los tests E2E del backend contra PostgreSQL (ver [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

---

## Autor

[Mohamed Amara](https://github.com/AmaraX7)

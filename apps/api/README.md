# Unibook API — Sistema de Gestión Clínica

API REST para gestionar una cadena de clínicas médicas. Permite gestionar doctores, pacientes, visitas médicas e ingresos hospitalarios, incluyendo la administración de medicamentos durante los ingresos. El sistema detecta conflictos de solapamiento de visitas por doctor automáticamente y aplica aislamiento multi-tenant por empresa.

**Producción**: https://unibook-api.onrender.com  
**Swagger**: https://unibook-api.onrender.com/api

---

## Stack

- **Framework**: NestJS (Node.js + TypeScript)
- **Base de datos**: PostgreSQL con TypeORM
- **Auth**: JWT con Passport + refresh tokens
- **Validación**: class-validator + class-transformer
- **Documentación**: Swagger automático (@nestjs/swagger)
- **Rate limiting**: @nestjs/throttler
- **Tests**: Jest
- **Despliegue**: Docker + Render + Supabase

---

## URLs

| Entorno | URL |
|---------|-----|
| API | https://unibook-api.onrender.com |
| Swagger | https://unibook-api.onrender.com/api |

---

## Estructura de módulos

```text
src/
├── app.module.ts
├── main.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   ├── jwt-auth.guard.ts
│   ├── roles.guard.ts
│   ├── roles.decorator.ts
│   ├── jwt-payload.interface.ts
│   ├── request-with-user.interface.ts
│   └── dto/
│       ├── login.dto.ts
│       └── refresh.dto.ts
├── companies/
├── persons/
│   └── entities/
│       ├── person.entity.ts
│       ├── doctor.entity.ts
│       ├── patient.entity.ts
│       └── staff.entity.ts
├── clinics/
├── visits/
├── admissions/
├── medications/
├── administrations/
├── chatbot/
├── telegram/
├── common/
│   ├── filters/http-exception.filter.ts
│   ├── middleware/logger.middleware.ts
│   └── dto/pagination.dto.ts
├── migrations/
└── seed.ts
```

---

## Entidades principales

### Company
- `id`, `name`, `description`, `createdAt`
- Relación: tiene muchas `Clinic`, tiene muchas `Person`

### Person (TableInheritance — tabla única con discriminador `role`)
- `id`, `firstName`, `lastName`, `email`, `password`, `dni`, `phone`, `birthDate`, `role`, `companyId`, `createdAt`, `deletedAt`
- Subclases: `Doctor`, `Patient`, `Staff`

### Doctor (ChildEntity de Person)
- Añade: `specialty`, `licenseNumber`, `yearsOfExperience`

### Patient (ChildEntity de Person)
- Añade: `bloodType`, `allergies`, `insuranceNumber`

### Staff (ChildEntity de Person — CLINIC_ADMIN)
- Añade: `position`

### Clinic
- `id`, `name`, `description`, `address`, `specialty`, `capacity` (nullable), `companyId`, `createdAt`
- Relación: pertenece a `Company`, tiene muchas `Visit`

### Visit (asociativa: Doctor + Patient + Clinic)
- `id`, `doctorId`, `patientId`, `clinicId`, `startTime`, `endTime`, `status`, `createdAt`
- `status` enum: `CONFIRMED` | `CANCELLED` | `COMPLETED`
- Relación: puede tener un `Admission` (OneToOne opcional)

### Admission (especialización de Visit vía OneToOne)
- `id`, `visitId`, `admissionDate`, `dischargeDate` (nullable), `room`, `notes`, `createdAt`, `deletedAt`
- Relación: pertenece a `Visit`, tiene muchas `Administration`

### Medication
- `id`, `name`, `description`, `dosageUnit`, `sideEffects`
- Relación: tiene muchas `Administration`

### Administration (ternaria resuelta: Admission + Medication + fecha)
- `id`, `admissionId`, `medicationId`, `administeredAt`, `dosage`, `notes`, `createdAt`

---

## Decisiones de arquitectura

- **Herencia de personas con TableInheritance** — existe una única tabla `persons` con columna discriminadora `role`. `Doctor`, `Patient` y `Staff` son subclases (`@ChildEntity`) con campos específicos. Evita joins innecesarios y centraliza la autenticación.
- **JWT stateless con refresh tokens** — access token de vida corta (15m), refresh token de vida larga (7d) con secret distinto. `POST /auth/refresh` renueva el par sin requerir login. El token contiene `id`, `email`, `role` y `companyId`.
- **RolesGuard + @Roles decorator** — el decorador guarda el rol requerido como metadata; el guard lo lee con `Reflector` y compara con `req.user.role`.
- **Detección de solapamiento con bloqueo pesimista** — query con `LessThan`/`MoreThan` sobre visitas `CONFIRMED` del mismo doctor, dentro de una transacción con `pessimistic_write` lock para evitar race conditions.
- **QueryRunner para visitas** — el método `create` usa transacción manual (`connect → startTransaction → commit/rollback → release`) para garantizar atomicidad.
- **Paginación con findAndCount** — los listados aceptan `?page` y `?limit`, devuelven `{ data, total }`.
- **Migraciones con synchronize: false en producción** — las migraciones corren automáticamente en el `CMD` del Dockerfile al desplegar.
- **Filtro global de excepciones** — todas las respuestas de error tienen el mismo formato: `statusCode`, `message`, `timestamp`, `path`.
- **Rate limiting** — `@nestjs/throttler` limita requests por IP (20 req/60s).
- **Multi-tenancy con Company** — cada `Clinic` pertenece a una `Company`. `CLINIC_ADMIN` solo puede gestionar clínicas y personas de su empresa. `SUPER_ADMIN` gestiona todo. El aislamiento se aplica en el Service con `ForbiddenException`.
- **companyId en JWT** — el token incluye `id`, `email`, `role` y `companyId` para filtrar por empresa sin consultar la BD.
- **Ingreso solo desde visita válida** — no se puede crear un `Admission` desde una visita `CANCELLED`. Se verifica en el service antes de persistir.
- **Validación de fechas de administración** — `administeredAt` debe estar dentro del rango `admissionDate → dischargeDate` del ingreso. Se valida en create y update.
- **Soft delete en Person y Admission** — se usa `@DeleteDateColumn` para no romper el historial de visitas e ingresos.
- **Chatbot con Gemini 2.5 Flash** — integración con `@google/generative-ai`. Usa `startChat` para mantener historial por sesión. El system prompt se construye dinámicamente con datos reales de clínicas y visitas del día.
- **SessionId como clave de conversación** — el cliente genera un `sessionId` (UUID o id de Telegram). El backend guarda las sesiones en un `Map<string, any>` en memoria. Suficiente para MVP.
- **Caché en memoria para el chatbot** — clínicas se cachean 5 minutos, disponibilidad 1 minuto. Sin Redis.
- **Bot de Telegram con Telegraf** — `TelegramModule` con `TelegramService` que implementa `OnModuleInit`. Usa el id de Telegram del usuario como `sessionId`, conectando con `ChatbotService`.
- **JWT con cookies HttpOnly** — access token (15m) y refresh token (7d) almacenados en cookies HttpOnly, Secure, SameSite=Lax generadas por el backend. El frontend usa `credentials: 'include'` y no accede a los tokens desde JavaScript.

---

## Endpoints principales

### Auth

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Crear cuenta |
| POST | `/auth/login` | Obtener JWT |
| POST | `/auth/refresh` | Renovar access token |

### Persons

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/persons/me` | Perfil propio | JWT |
| PATCH | `/persons/me` | Actualizar perfil propio | JWT |
| DELETE | `/persons/me` | Eliminar cuenta propia | JWT |
| GET | `/persons` | Listar personas | SUPER_ADMIN / CLINIC_ADMIN |
| GET | `/persons/by-email?email=` | Buscar por email | SUPER_ADMIN |
| PATCH | `/persons/:id/role` | Cambiar rol | SUPER_ADMIN / CLINIC_ADMIN |
| DELETE | `/persons/:id` | Eliminar persona | SUPER_ADMIN / CLINIC_ADMIN |

### Clinics

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/clinics?page=1&limit=10` | Listar clínicas paginadas | Público |
| GET | `/clinics/:id` | Detalle de clínica | Público |
| POST | `/clinics` | Crear clínica | SUPER_ADMIN / CLINIC_ADMIN |
| PATCH | `/clinics/:id` | Actualizar clínica | SUPER_ADMIN / CLINIC_ADMIN |
| DELETE | `/clinics/:id` | Eliminar clínica | SUPER_ADMIN / CLINIC_ADMIN |

### Visits

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/visits` | Crear visita con check de solapamiento | SUPER_ADMIN / CLINIC_ADMIN / DOCTOR |
| GET | `/visits` | Listar todas las visitas paginadas | SUPER_ADMIN / CLINIC_ADMIN |
| GET | `/visits/my-visits` | Mis visitas como doctor o paciente | JWT |
| GET | `/visits/patient/:id` | Visitas de un paciente | SUPER_ADMIN / CLINIC_ADMIN / DOCTOR |
| GET | `/visits/doctor/:id` | Visitas de un doctor | SUPER_ADMIN / CLINIC_ADMIN |
| GET | `/visits/doctor/:id/availability?date=` | Disponibilidad por fecha | JWT |
| GET | `/visits/:id` | Detalle de visita | JWT |
| PATCH | `/visits/:id/status` | Actualizar estado | SUPER_ADMIN / CLINIC_ADMIN / DOCTOR |

### Admissions

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/admissions` | Crear ingreso desde visita | SUPER_ADMIN / CLINIC_ADMIN / DOCTOR |
| GET | `/admissions` | Listar todos los ingresos | SUPER_ADMIN / CLINIC_ADMIN |
| GET | `/admissions/visit/:visitId` | Ingreso de una visita | SUPER_ADMIN / CLINIC_ADMIN / DOCTOR |
| GET | `/admissions/:id` | Detalle de ingreso | SUPER_ADMIN / CLINIC_ADMIN / DOCTOR |
| PATCH | `/admissions/:id` | Actualizar ingreso | SUPER_ADMIN / CLINIC_ADMIN / DOCTOR |
| PATCH | `/admissions/:id/discharge` | Dar de alta al paciente | SUPER_ADMIN / CLINIC_ADMIN / DOCTOR |

### Medications

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/medications` | Crear medicamento | SUPER_ADMIN / CLINIC_ADMIN |
| GET | `/medications` | Listar medicamentos | JWT |
| GET | `/medications/:id` | Detalle de medicamento | JWT |
| PATCH | `/medications/:id` | Actualizar medicamento | SUPER_ADMIN / CLINIC_ADMIN |
| DELETE | `/medications/:id` | Eliminar medicamento | SUPER_ADMIN |

### Administrations

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/administrations` | Registrar administración | SUPER_ADMIN / CLINIC_ADMIN / DOCTOR |
| GET | `/administrations` | Listar todas | SUPER_ADMIN / CLINIC_ADMIN |
| GET | `/administrations/admission/:admissionId` | Por ingreso | SUPER_ADMIN / CLINIC_ADMIN / DOCTOR |
| GET | `/administrations/:id` | Detalle | SUPER_ADMIN / CLINIC_ADMIN / DOCTOR |
| PATCH | `/administrations/:id` | Actualizar | SUPER_ADMIN / CLINIC_ADMIN / DOCTOR |
| DELETE | `/administrations/:id` | Eliminar | SUPER_ADMIN / CLINIC_ADMIN |

### Companies (todos SUPER_ADMIN)

| Método | Endpoint |
|--------|----------|
| POST | `/companies` |
| GET | `/companies` |
| GET | `/companies/:id` |
| PATCH | `/companies/:id` |
| DELETE | `/companies/:id` |

---

## Lógica de negocio

### Al crear una visita

1. Verificar que la clínica existe (dentro de la transacción)
2. Verificar que `startTime < endTime`
3. Verificar solapamiento con lock pesimista: `startTime < otraVisita.endTime AND endTime > otraVisita.startTime`
4. Si ok → `status CONFIRMED` automáticamente + commit
5. Si solapamiento → `BadRequestException` + rollback

### Al actualizar estado de visita

- `CANCELLED` → solo `CLINIC_ADMIN` o `DOCTOR`
- `COMPLETED` → solo `CLINIC_ADMIN` o `SUPER_ADMIN`
- `CONFIRMED` → no se puede asignar manualmente

### Al crear un ingreso

- Solo desde una visita no `CANCELLED`
- No puede existir más de un ingreso por visita
- `dischargeDate` no puede ser anterior a `admissionDate`

### Al registrar administración de medicamento

- `administeredAt` debe estar dentro del rango `admissionDate → dischargeDate` del ingreso
- Se valida tanto en create como en update

### Refresh tokens

- `access_token`: vida corta (15m)
- `refresh_token`: vida larga (7d), secret distinto (`JWT_REFRESH_SECRET`)
- `POST /auth/refresh` verifica el refresh token y devuelve tokens nuevos sin necesidad de login

### Roles

| Rol | Permisos |
|-----|----------|
| `PATIENT` | Ver sus propias visitas, consultar disponibilidad de doctores |
| `DOCTOR` | Ver sus visitas, crear y gestionar visitas, registrar ingresos y medicación |
| `CLINIC_ADMIN` | Gestionar clínicas y personas de su empresa, ver visitas de su empresa |
| `SUPER_ADMIN` | Acceso total: empresas, clínicas, personas, medicamentos |

---

## Arranque local

### Con Docker (recomendado)

```bash
cd apps/api
cp .env.example .env
make up
```

### Sin Docker

```bash
npm install
npm run start:dev
```

### Comandos útiles (Makefile)

```bash
make up                # docker-compose up --build
make down              # docker-compose down
make down-v            # docker-compose down -v (borra la BD)
make logs              # docker-compose logs -f
make dev               # npm run start:dev
make seed              # poblar BD local
make seed-docker       # seed en contenedor Docker
make migration-generate name=NombreMigracion
make migration-run
make migration-revert
```

---

## Variables de entorno

```env
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=tu_db
JWT_SECRET=una_clave_secreta_larga
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=otro_secret_diferente_largo
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
GEMINI_API_KEY=tu_gemini_key
TELEGRAM_BOT_TOKEN=tu_telegram_token
```

---

## Estado actual

### Completado

- Auth completo (register, login, JWT, guards, roles, refresh tokens)
- Persons (TableInheritance: Person, Doctor, Patient, Staff)
- Clinics (CRUD, paginación, multi-tenancy)
- Visits (solapamiento, bloqueo pesimista, disponibilidad por doctor)
- Admissions (crear, actualizar, dar de alta)
- Medications y Administrations
- Companies (CRUD, solo SUPER_ADMIN)
- Filtro global de excepciones, Swagger, rate limiting, logs
- Docker + Render + Supabase, migraciones TypeORM, Makefile
- Tests Jest E2E, CI/CD con GitHub Actions
- Chatbot IA con Gemini 2.5 Flash
- Bot de Telegram con Telegraf
- Monorepo (`apps/api` + `apps/web`)

### Pendiente

- [ ] Chatbot adaptado al dominio médico
- [ ] Seed con datos médicos realistas
- [ ] Actualizar tests E2E con nuevo dominio
- [ ] Dashboards por rol en frontend (patient/admin/super)
- [ ] Panel de medicación y perfil de usuario
- [ ] Despliegue final del frontend

---

## Reglas de desarrollo

- DTOs con validadores en todos los endpoints
- Nunca exponer `password` en ninguna respuesta
- Manejar errores con excepciones de NestJS
- Separar lógica de negocio en el Service
- Variables de entorno en `.env`
- Swagger en todos los endpoints
- Migraciones para cualquier cambio de esquema en producción

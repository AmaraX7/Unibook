# Proyecto: Sistema de Reservas Universitario

## Que es esto
API REST para gestionar la reserva de recursos universitarios (salas, portátiles, material de laboratorio, etc.).
Los usuarios pueden ver qué recursos hay disponibles, hacer una reserva por franja horaria, y el sistema detecta conflictos de solapamiento automáticamente.

## Stack
 Logger de NestJS integrado (implementado)
 Log de cada request y cada error (implementado)
- **Auth**: JWT con Passport
- **Validacion**: class-validator + class-transformer
 ✅ Logs (middleware y Logger en servicios)
- Es su primer proyecto real con NestJS y TypeScript - priorizar claridad sobre elegancia

## Estructura de modulos
|   |-- jwt.strategy.ts
|   |-- jwt-auth.guard.ts
|   |-- roles.guard.ts
|   |-- roles.decorator.ts
|   \-- dto/
|       |-- register.dto.ts
|       \-- login.dto.ts
|-- users/
|   |-- users.module.ts
|   |-- users.controller.ts
|   |-- users.service.ts
|   |-- entities/
|   |   \-- user.entity.ts
|   \-- dto/
|       |-- create-user.dto.ts
|       \-- update-role.dto.ts
|-- resources/
|   |-- resources.module.ts
|   |-- resources.controller.ts
|   |-- resources.service.ts
|   |-- entities/
|   |   |-- resource.entity.ts
|   |   |-- room.entity.ts
|   |   |-- laptop.entity.ts
|   |   \-- lab-equipment.entity.ts
|   \-- dto/
|       |-- create-room.dto.ts
|       |-- create-laptop.dto.ts
|       |-- create-lab-equipment.dto.ts
|       \-- update-resource.dto.ts
\-- reservations/
    |-- reservations.module.ts
    |-- reservations.controller.ts
    |-- reservations.service.ts
    |-- entities/
    |   \-- reservation.entity.ts
    \-- dto/
        |-- create-reservation.dto.ts
        \-- update-reservation.dto.ts
```

## Entidades principales

### Resource (tabla base — Single Table Inheritance)
- id, name, description, location, status, createdAt, type (discriminador)
- status enum: AVAILABLE | UNAVAILABLE | MAINTENANCE
- Relacion: tiene muchas Reservations

### Room (extiende Resource)
- capacity, floor, building, hasCampusView, hasTV

### Laptop (extiende Resource)
- brand, ram, storage, os

### LabEquipment (extiende Resource)
- materialType, requiresTraining

### User
- id, email, password, role (USER | ADMIN), createdAt
- Relacion: tiene muchas Reservations

### Reservation (tabla asociativa entre User y Resource)
- id, userId, resourceId, startTime, endTime, status, createdAt
- status enum: CONFIRMED | CANCELLED | COMPLETED
- Se confirma automaticamente si no hay solapamiento

## Endpoints principales

### Auth
- POST /auth/register - crear cuenta
- POST /auth/login - obtener JWT

### Users (todos protegidos, admin)
- GET /users/by-email/:email - buscar usuario por email
- PATCH /users/:id/role - cambiar rol de usuario
- DELETE /users/:id - eliminar usuario

### Resources (publico para GET, admin para mutaciones)
- GET /resources - listar todos los recursos
- GET /resources/:id - detalle de un recurso
- POST /resources/room - crear sala
- POST /resources/laptop - crear portatil
- POST /resources/lab - crear material de lab
- PATCH /resources/:id - actualizar recurso
- DELETE /resources/:id - eliminar recurso

### Reservations (todos protegidos con JWT)
- POST /reservations - crear reserva (verifica solapamiento, confirma automaticamente)
- GET /reservations/my - reservas del usuario autenticado
- GET /reservations/:id - detalle de una reserva
- PATCH /reservations/:id/status - actualizar estado
- GET /reservations/all - todas las reservas (admin)

## Logica de negocio importante

### Al crear una reserva
1. Verificar que el recurso existe
2. Verificar que startTime < endTime
3. Verificar solapamiento: startTime < otraReserva.endTime AND endTime > otraReserva.startTime
4. Si ok → status CONFIRMED automaticamente
5. Si solapamiento → BadRequestException

### Al actualizar estado
- CANCELLED → solo el propio usuario sobre su reserva
- COMPLETED → solo admin
- CONFIRMED → no se puede cambiar manualmente

### Roles
- USER → puede crear reservas, ver las suyas, cancelar las suyas
- ADMIN → puede hacer todo lo anterior + gestionar recursos + ver todas las reservas + completar reservas + gestionar usuarios

## Proximas features (fase 2)

### 🔐 Refresh tokens
- JWT actual expira y el usuario tiene que hacer login otra vez
- Con refresh tokens se renueva automaticamente
- Endpoint POST /auth/refresh

### 📄 Paginacion
- GET /resources?page=1&limit=10
- GET /reservations/all?page=1&limit=10
- Usar .findAndCount() de TypeORM

### 🚫 Rate limiting
- @nestjs/throttler — limitar requests por IP
- Evita abuso de la API

### 🧾 Logs
- Logger de NestJS integrado
- Log de cada request y cada error

### ⚠️ Manejo de errores consistente
- Filtro global de excepciones
- Respuestas de error siempre con el mismo formato

### 🔔 WebSockets
- Notificaciones en tiempo real cuando cambia el estado de una reserva
- @nestjs/websockets + Socket.io

### 👤 Gestion de cuenta
- DELETE /users/me — el usuario borra su propia cuenta
- PATCH /users/me — el usuario actualiza sus datos

## Reglas de desarrollo

- Usar DTOs con validadores en todos los endpoints
- Nunca exponer password en ninguna respuesta
- Manejar errores con excepciones de NestJS
- Separar logica de negocio en el Service
- Variables de entorno en .env
- Swagger en todos los endpoints

## Variables de entorno (.env)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=university_reservations
JWT_SECRET=una_clave_secreta_larga
JWT_EXPIRES_IN=7d
PORT=3000
```

## Plan de desarrollo

- Dia 1: nest new + estructura base ✅
- Dia 2: TypeScript + DTOs + validacion ✅
- Dia 3: PostgreSQL + TypeORM + entidades ✅
- Dia 4: Users + Auth JWT + guards ✅
- Dia 5: Resources con STI + Reservations + logica de solapamiento ✅
- Dia 6: Tests Jest + Swagger + manejo de errores consistente
- Dia 7: Docker + despliegue Railway/Render + README
- Fase 2: Refresh tokens + paginacion + rate limiting + logs + WebSockets

## Estado actual
- ✅ Auth completo (register, login, JWT, guards, roles)
- ✅ Users (entidad, servicio, controller, roles)
- ✅ Resources (STI con Room, Laptop, LabEquipment, CRUD completo)
- ✅ Reservations (crear, cancelar, completar, solapamiento)
- [ ] Tests Jest
- [ ] Swagger
- [ ] Manejo de errores consistente
- [ ] Docker + despliegue
- [ ] Fase 2

## Como pedir ayuda
- En que dia/tarea estas
- Que estas intentando hacer
- El error exacto
- El codigo relevante
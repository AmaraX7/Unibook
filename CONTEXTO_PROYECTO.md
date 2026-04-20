# Proyecto: Sistema de prestamo de equipamiento

## Que es esto
API REST para gestionar el prestamo de equipamiento (bicis, libros, instrumentos, herramientas, etc.).
Los usuarios pueden ver que items hay disponibles, pedir un prestamo, devolverlos, y el sistema detecta retrasos automaticamente.

## Stack
- **Framework**: NestJS (Node.js + TypeScript)
- **Base de datos**: PostgreSQL con TypeORM
- **Auth**: JWT con Passport
- **Validacion**: class-validator + class-transformer
- **Documentacion**: Swagger automatico (@nestjs/swagger)
- **Tests**: Jest
- **Despliegue**: Docker + Railway/Render

## Contexto del desarrollador
- Estudiante de ultimo ano de ingenieria informatica (mencion software)
- Buena base en C++, Java, algo de Python/Django
- Conoce conceptos de arquitectura de software, REST, OpenAPI, diagramas UML
- Familiarizado con PostgreSQL y Docker
- Es su primer proyecto real con NestJS y TypeScript - priorizar claridad sobre elegancia

## Estructura de modulos

```text
src/
|-- app.module.ts
|-- main.ts
|-- auth/
|   |-- auth.module.ts
|   |-- auth.controller.ts
|   |-- auth.service.ts
|   |-- jwt.strategy.ts
|   \-- dto/
|       |-- register.dto.ts
|       \-- login.dto.ts
|-- users/
|   |-- users.module.ts
|   |-- users.service.ts
|   \-- entities/
|       \-- user.entity.ts
|-- items/
|   |-- items.module.ts
|   |-- items.controller.ts
|   |-- items.service.ts
|   |-- entities/
|   |   \-- item.entity.ts
|   \-- dto/
|       |-- create-item.dto.ts
|       \-- update-item.dto.ts
\-- loans/
    |-- loans.module.ts
    |-- loans.controller.ts
    |-- loans.service.ts
    |-- entities/
    |   \-- loan.entity.ts
    \-- dto/
        |-- create-loan.dto.ts
        \-- return-loan.dto.ts
```

## Entidades principales

### User
- id, email, passwordHash, name, createdAt
- Relacion: tiene muchos Loans

### Item
- id, name, description, totalStock, availableStock, category, createdAt
- Relacion: tiene muchos Loans

### Loan
- id, userId, itemId, quantity, borrowedAt, dueDate, returnedAt, status, penaltyDays
- Status enum: ACTIVE | RETURNED | OVERDUE

## Endpoints principales

### Auth
- POST /auth/register - crear cuenta
- POST /auth/login - obtener JWT

### Items (publico para GET, protegido para mutaciones)
- GET /items - listar items con stock disponible
- GET /items/:id - detalle de un item
- POST /items - crear item (admin)
- PATCH /items/:id - actualizar item (admin)
- DELETE /items/:id - eliminar item (admin)

### Loans (todos protegidos con JWT)
- POST /loans - crear prestamo (verifica stock disponible)
- GET /loans/my - prestamos del usuario autenticado
- PATCH /loans/:id/return - devolver item (calcula penalizacion si hay retraso)
- GET /loans - todos los prestamos (admin)

## Logica de negocio importante

### Al crear un prestamo
1. Verificar que item existe
2. Verificar que availableStock >= quantity solicitada
3. Decrementar availableStock
4. Crear Loan con status ACTIVE y dueDate = borrowedAt + X dias
5. Todo en una transaccion de base de datos

### Al devolver un prestamo
1. Verificar que el prestamo existe y pertenece al usuario
2. Calcular penaltyDays = max(0, dias desde dueDate)
3. Incrementar availableStock
4. Actualizar status a RETURNED o OVERDUE si hay penalizacion
5. Guardar returnedAt = now()

### Deteccion de items con retraso
- Un job o endpoint puede marcar como OVERDUE los loans ACTIVE con dueDate < now()

## Reglas de desarrollo

- Usar DTOs con validadores (@IsString, @IsInt, @Min, etc.) en todos los endpoints
- Nunca exponer passwordHash en ninguna respuesta
- Manejar errores con las excepciones de NestJS (NotFoundException, BadRequestException, etc.)
- Separar logica de negocio en el Service, el Controller solo enruta
- Variables de entorno en .env (nunca hardcodear credenciales)
- Swagger decorado en todos los endpoints (@ApiTags, @ApiOperation, @ApiBearerAuth)

## Variables de entorno necesarias (.env)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=loan_system
JWT_SECRET=una_clave_secreta_larga
JWT_EXPIRES_IN=7d
PORT=3000
```

## Plan de desarrollo (7 dias)

- Dia 1: nest new + estructura base + primer endpoint GET /items hardcodeado
- Dia 2: TypeScript + DTOs + class-validator + POST /items con validacion
- Dia 3: PostgreSQL + TypeORM + entidades + CRUD completo persistido
- Dia 4: Modulo loans + logica de negocio + estados + transacciones
- Dia 5: Auth JWT + guards + registro/login
- Dia 6: Tests Jest (3-4 unitarios) + Swagger + .env
- Dia 7: Docker + despliegue Railway/Render + README

## Como pedirme ayuda
Cuando estes atascado dime:
- En que dia/tarea estas
- Que estas intentando hacer
- El error exacto o el comportamiento inesperado
- El codigo relevante

Asi puedo ayudarte de forma precisa sin adivinar el contexto.

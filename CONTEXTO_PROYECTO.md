# Proyecto: API REST Ecommerce

## Que es esto
API REST para gestionar un ecommerce. Los usuarios pueden ver productos, añadirlos a un pedido, y el sistema gestiona el stock y los estados del pedido automaticamente.

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
|   |-- jwt-auth.guard.ts
|   \-- dto/
|       |-- register.dto.ts
|       \-- login.dto.ts
|-- users/
|   |-- users.module.ts
|   |-- users.service.ts
|   \-- entities/
|       \-- user.entity.ts
|-- products/
|   |-- products.module.ts
|   |-- products.controller.ts
|   |-- products.service.ts
|   |-- entities/
|   |   \-- product.entity.ts
|   \-- dto/
|       |-- create-product.dto.ts
|       \-- update-product.dto.ts
\-- orders/
    |-- orders.module.ts
    |-- orders.controller.ts
    |-- orders.service.ts
    |-- entities/
    |   |-- order.entity.ts
    |   \-- order-item.entity.ts
    \-- dto/
        |-- create-order.dto.ts
        \-- update-order-status.dto.ts
```

## Entidades principales

### User
- id, email, password, role (USER | ADMIN), createdAt
- Relacion: tiene muchos Orders

### Product
- id, name, description, price, stock, category, createdAt
- Relacion: tiene muchos OrderItems

### Order
- id, userId, status, total, createdAt, updatedAt
- Status enum: PENDING | PAID | SHIPPED | DELIVERED | CANCELLED
- Relacion: pertenece a User, tiene muchos OrderItems

### OrderItem
- id, orderId, productId, quantity, unitPrice
- unitPrice guarda el precio en el momento de la compra (el precio del producto puede cambiar despues)
- Relacion: pertenece a Order y a Product

## Endpoints principales

### Auth
- POST /auth/register - crear cuenta
- POST /auth/login - obtener JWT

### Products (publico para GET, protegido para mutaciones)
- GET /products - listar productos con stock disponible
- GET /products/:id - detalle de un producto
- POST /products - crear producto (admin)
- PATCH /products/:id - actualizar producto (admin)
- DELETE /products/:id - eliminar producto (admin)

### Orders (todos protegidos con JWT)
- POST /orders - crear pedido (verifica stock, calcula total)
- GET /orders/my - pedidos del usuario autenticado
- PATCH /orders/:id/status - actualizar estado del pedido (admin)
- GET /orders - todos los pedidos (admin)

## Logica de negocio importante

### Al crear un pedido
1. Verificar que todos los productos existen
2. Verificar que hay stock suficiente para cada producto
3. Calcular el total = suma de (quantity * price) por cada producto
4. Guardar unitPrice en OrderItem (precio en el momento de compra)
5. Decrementar el stock de cada producto
6. Crear Order con status PENDING
7. Todo en una transaccion de base de datos

### Al cancelar un pedido
1. Verificar que el pedido existe y pertenece al usuario
2. Verificar que el estado es PENDING (no se puede cancelar si ya fue enviado)
3. Restaurar el stock de cada producto
4. Actualizar status a CANCELLED

### Cambio de estado (admin)
- PENDING → PAID → SHIPPED → DELIVERED
- Solo admin puede cambiar estados
- No se puede retroceder un estado

## Reglas de desarrollo

- Usar DTOs con validadores (@IsString, @IsInt, @Min, etc.) en todos los endpoints
- Nunca exponer password en ninguna respuesta
- Manejar errores con las excepciones de NestJS (NotFoundException, BadRequestException, etc.)
- Separar logica de negocio en el Service, el Controller solo enruta
- Variables de entorno en .env (nunca hardcodear credenciales)
- Swagger decorado en todos los endpoints (@ApiTags, @ApiOperation, @ApiBearerAuth)

## Variables de entorno necesarias (.env)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=ecommerce
JWT_SECRET=una_clave_secreta_larga
JWT_EXPIRES_IN=7d
PORT=3000
```

## Plan de desarrollo (7 dias)

- Dia 1: nest new + estructura base + primer endpoint GET /products hardcodeado
- Dia 2: TypeScript + DTOs + class-validator + POST /products con validacion
- Dia 3: PostgreSQL + TypeORM + entidades + CRUD completo de products persistido
- Dia 4: Users + Auth JWT + guards + registro/login ✅
- Dia 5: Modulo orders + logica de negocio + transacciones + control de stock
- Dia 6: Tests Jest (3-4 unitarios) + Swagger + .env
- Dia 7: Docker + despliegue Railway/Render + README

## Estado actual
- ✅ Auth completo (register, login, JWT, guards)
- ✅ Users (entidad, servicio)
- ✅ Products (CRUD completo, endpoints protegidos con JwtAuthGuard)
- [ ] Orders (siguiente paso — dia 5)

## Como pedirme ayuda
Cuando estes atascado dime:
- En que dia/tarea estas
- Que estas intentando hacer
- El error exacto o el comportamiento inesperado
- El codigo relevante

Asi puedo ayudarte de forma precisa sin adivinar el contexto.
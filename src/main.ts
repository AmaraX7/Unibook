import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // useGlobalPipes aplica la validación a TODOS los endpoints automáticamente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // descarta campos que no están en el DTO
      forbidNonWhitelisted: true, // si viene un campo extra, devuelve 400
      transform: true,           // convierte tipos: ej. "1" (string) → 1 (number)
    }),
  );

  // escucha en el puerto definido en .env o 3000 por defecto
  await app.listen(process.env.PORT ?? 3001);
}
// bootstrap es la función principal que arranca la aplicación NestJS, creando una instancia de la app
bootstrap();
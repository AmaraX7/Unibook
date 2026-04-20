import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// define el controlador principal de la app, con una ruta raiz y un metodo get que devuelve un string, delegando la logica al servicio
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

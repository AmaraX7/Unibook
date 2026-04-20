import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';


// agrupa el controlador de lsoi tems con el sevicio (modelo) para que la app lo importo tood d1
@Module({
  controllers: [ItemsController],
  providers: [ItemsService]
})
export class ItemsModule {}

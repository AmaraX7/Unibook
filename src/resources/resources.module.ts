import { Module } from '@nestjs/common';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { Resource } from './entities/resource.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity.';
import { Laptop } from './entities/laptop.entity';
import { LabEquipment } from './entities/lab-equipment.entity';



// Agrupa el controlador de products con el servicio para importarlo en la app.
@Module({
  imports: [TypeOrmModule.forFeature([Resource, Room, Laptop, LabEquipment])],
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [ResourcesService]
})
export class ResourcesModule {}


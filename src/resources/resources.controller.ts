import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ResourcesService } from './resources.service';
import { Resource } from './entities/resource.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateLabEquipmentDto } from './dto/create-lab-equipment.dto';
import { CreateLaptopDto } from './dto/create-laptop.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

// El controlador recibe peticiones y delega la logica al servicio.
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

    @Get() 
  getAll(): Promise<Resource[]> {
    return this.resourcesService.findAll();
  }
  
    @Post() 
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
  create(@Body() dto: CreateRoomDto): Promise<Resource> {
  return this.resourcesService.createResource(dto);
  }
  
  @Post('room')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
createRoom(@Body() dto: CreateRoomDto) {
  return this.resourcesService.createRoom(dto);
}


@Post('laptop')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
createLaptop(@Body() dto: CreateLaptopDto) {
  return this.resourcesService.createLaptop(dto);
}

@Post('lab')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
createLabEquipment(@Body() dto: CreateLabEquipmentDto) {
  return this.resourcesService.createLabEquipment(dto);
}

@Delete(':id') 
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
deleteOne(@Param('id') id: number): Promise<void> {
    return this.resourcesService.deleteOne(id);
  }


    @Get(':id')
  getOne(@Param('id') id: number): Promise<Resource> {
    return this.resourcesService.findOne(id);
  }

    @Patch(':id') 
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    update(@Param('id') id: number, @Body() updateResourceDto: UpdateResourceDto): Promise<Resource> {
    return this.resourcesService.update(id, updateResourceDto);
    }
}

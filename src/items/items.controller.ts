import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item, ItemsService } from './items.service';

// el controlador se encarga de recibir las peticiones, y delegar la logica al servicio, el servicio es el modelo@Controller('items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

    @Get()
  getAll(): Item[] {
    return this.itemsService.findAll();
  }
  
    @Post()
  create(@Body() createItemDto: CreateItemDto) { //TRANSOformo lo q viene del body a un DTO
    return this.itemsService.create(createItemDto);
  }

    @Patch(':id')
    update(@Param('id') id: number, @Body() updateItemDto: UpdateItemDto) {
    return this.itemsService.update(id, updateItemDto);
    }
}
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// El controlador recibe peticiones y delega la logica al servicio.
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

    @Get() 
  getAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }
  
    @Post() 
    @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateProductDto): Promise<Product> {
  return this.productsService.create(dto);
  }

  @Delete(':id') 
  @UseGuards(JwtAuthGuard)
  deleteOne(@Param('id') id: number): Promise<void> {
    return this.productsService.deleteOne(id);
  }

    @Delete() 
    @UseGuards(JwtAuthGuard)
  deleteAll(): Promise<void> {
    return this.productsService.deleteAll();
  } 

    @Get(':id')
  getOne(@Param('id') id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

    @Patch(':id') 
    @UseGuards(JwtAuthGuard)
    update(@Param('id') id: number, @Body() updateProductDto: UpdateProductDto): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
    }
}
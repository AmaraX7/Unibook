import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination.dto';
import type { RequestWithUser } from '../auth/request-with-user.interface';
import { PersonRole } from '../persons/entities/person.entity';

@ApiTags('clinics')
@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar clínicas' })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('companyId', new ParseIntPipe({ optional: true })) companyId?: number,
  ) {
    return this.clinicsService.findAll(pagination, companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar clínica por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clinicsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear clínica' })
  create(@Body() dto: CreateClinicDto, @Request() req: RequestWithUser) {
    return this.clinicsService.create(dto, req.user.role, req.user.companyId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar clínica' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClinicDto, @Request() req: RequestWithUser) {
    return this.clinicsService.update(id, dto, req.user.role, req.user.companyId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar clínica' })
  deleteOne(@Param('id', ParseIntPipe) id: number, @Request() req: RequestWithUser) {
    return this.clinicsService.deleteOne(id, req.user.role, req.user.companyId);
  }
}
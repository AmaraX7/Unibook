import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PersonRole } from '../persons/entities/person.entity';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import type { RequestWithUser } from '../auth/request-with-user.interface';

@ApiTags('visits')
@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN, PersonRole.DOCTOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear visita' })
  create(@Body() dto: CreateVisitDto) {
    return this.visitsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar todas las visitas' })
  findAll(@Query() pagination: PaginationDto) {
    return this.visitsService.findAll(pagination);
  }

  @Get('my-visits')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mis visitas (paciente o doctor)' })
  findMine(@Request() req: RequestWithUser) {
    if (req.user.role === PersonRole.PATIENT)
      return this.visitsService.findByPatient(req.user.userId);
    if (req.user.role === PersonRole.DOCTOR)
      return this.visitsService.findByDoctor(req.user.userId);
    return this.visitsService.findAll({ page: 1, limit: 20 });
  }

  @Get('patient/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN, PersonRole.DOCTOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Visitas de un paciente' })
  findByPatient(@Param('id', ParseIntPipe) id: number) {
    return this.visitsService.findByPatient(id);
  }

  @Get('doctor/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Visitas de un doctor' })
  findByDoctor(@Param('id', ParseIntPipe) id: number) {
    return this.visitsService.findByDoctor(id);
  }

  @Get('doctor/:id/availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Disponibilidad de un doctor por fecha' })
  getDoctorAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Query('date') date: string,
  ) {
    return this.visitsService.getDoctorAvailability(id, date);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buscar visita por ID' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.visitsService.findById(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN, PersonRole.DOCTOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar estado de visita' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVisitDto,
    @Request() req: RequestWithUser,
  ) {
    return this.visitsService.updateStatus(id, dto, req.user.role);
  }
}
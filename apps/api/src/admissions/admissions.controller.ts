import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PersonRole } from '../persons/entities/person.entity';
import { AdmissionsService } from './admissions.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionDto } from './dto/update-admission.dto';

@ApiTags('admissions')
@Controller('admissions')
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN, PersonRole.DOCTOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear ingreso a partir de una visita' })
  create(@Body() dto: CreateAdmissionDto) {
    return this.admissionsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar todos los ingresos' })
  findAll() {
    return this.admissionsService.findAll();
  }

  @Get('visit/:visitId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN, PersonRole.DOCTOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buscar ingreso por visita' })
  findByVisit(@Param('visitId', ParseIntPipe) visitId: number) {
    return this.admissionsService.findByVisit(visitId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN, PersonRole.DOCTOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buscar ingreso por ID' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.admissionsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN, PersonRole.DOCTOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar ingreso (habitación, notas, alta)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAdmissionDto) {
    return this.admissionsService.update(id, dto);
  }

  @Patch(':id/discharge')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN, PersonRole.DOCTOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Dar de alta al paciente' })
  discharge(@Param('id', ParseIntPipe) id: number) {
    return this.admissionsService.discharge(id);
  }
}
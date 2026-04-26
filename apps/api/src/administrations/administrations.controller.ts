import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PersonRole } from '../persons/entities/person.entity';
import { AdministrationsService } from './administrations.service';
import { CreateAdministrationDto } from './dto/create-administration.dto';
import { UpdateAdministrationDto } from './dto/update-administration.dto';

@ApiTags('administrations')
@Controller('administrations')
export class AdministrationsController {
  constructor(private readonly administrationsService: AdministrationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN, PersonRole.DOCTOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Registrar administración de medicamento' })
  create(@Body() dto: CreateAdministrationDto) {
    return this.administrationsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar todas las administraciones' })
  findAll() {
    return this.administrationsService.findAll();
  }

  @Get('admission/:admissionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN, PersonRole.DOCTOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Administraciones de un ingreso' })
  findByAdmission(@Param('admissionId', ParseIntPipe) admissionId: number) {
    return this.administrationsService.findByAdmission(admissionId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN, PersonRole.DOCTOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buscar administración por ID' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.administrationsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN, PersonRole.DOCTOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar administración' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAdministrationDto) {
    return this.administrationsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar administración' })
  deleteOne(@Param('id', ParseIntPipe) id: number) {
    return this.administrationsService.deleteOne(id);
  }
}
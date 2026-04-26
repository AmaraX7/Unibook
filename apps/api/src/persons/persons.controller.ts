import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PersonsService } from './persons.service';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiOperation, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdatePersonDto } from './dto/update.person.dto';
import type { RequestWithUser } from '../auth/request-with-user.interface';
import { PersonRole } from './entities/person.entity';

@ApiTags('persons')
@Controller('persons')
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar personas (super_admin: todas, clinic_admin: las de su clínica)' })
  async findAll(@Request() req: RequestWithUser) {
    return this.personsService.findAll(req.user.role, req.user.companyId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener perfil propio' })
  getMe(@Request() req: RequestWithUser) {
    return this.personsService.findById(req.user.userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar perfil propio' })
  updateMe(@Request() req: RequestWithUser, @Body() dto: UpdatePersonDto) {
    return this.personsService.updateMe(req.user.userId, dto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar cuenta propia' })
  deleteMe(@Request() req: RequestWithUser): Promise<void> {
    return this.personsService.deleteById(
      req.user.userId,
      req.user.userId,
      req.user.role,
      req.user.companyId,
    );
  }

  @Get('by-email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buscar persona por email' })
  async findByEmail(@Query('email') email: string) {
    return this.personsService.findByEmail(email);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar persona' })
  async deletePerson(
    @Param('id') id: number,
    @Request() req: RequestWithUser,
  ): Promise<void> {
    return this.personsService.deleteById(
      id,
      req.user.userId,
      req.user.role,
      req.user.companyId,
    );
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PersonRole.SUPER_ADMIN, PersonRole.CLINIC_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar rol de persona' })
  async updateRole(
    @Param('id') id: number,
    @Body() dto: UpdateRoleDto,
    @Request() req: RequestWithUser,
  ) {
    return this.personsService.updateRole(
      id,
      dto,
      req.user.role,
      req.user.companyId,
    );
  }
}
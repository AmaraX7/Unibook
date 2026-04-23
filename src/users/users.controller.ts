import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { User } from './entities/users.entity';
import { UsersService } from './users.service';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiOperation, ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Get('by-email/:email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Buscar usuario por email' })
  @ApiBearerAuth('JWT-auth')
  async findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }


  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiBearerAuth('JWT-auth')
  async deleteUser(@Param('id') id: number): Promise<void> {
    return this.usersService.deleteById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/role')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar rol de un usuario' })
  async updateRole(@Param('id') id: number, @Body() dto: UpdateRoleDto){
    return this.usersService.updateRole(id, dto);
  }
}
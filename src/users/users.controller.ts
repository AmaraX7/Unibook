import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { User } from './entities/users.entity';
import { UsersService } from './users.service';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Get('by-email/:email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findByEmail(@Param('email') email: string): Promise<User | null> {
    return this.usersService.findByEmail(email);
  }


  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteUser(@Param('id') id: number): Promise<void> {
    return this.usersService.deleteById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/role')
  async updateRole(@Param('id') id: number, @Body() dto: UpdateRoleDto): Promise<User> {
    return this.usersService.updateRole(id, dto);
  }
}
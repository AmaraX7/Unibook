import { Controller, Get } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { Body, Post, Request, UseGuards, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('reservations')
export class ReservationsController {
    constructor(private readonly reservationsService: ReservationsService) {}

@Post()
@UseGuards(JwtAuthGuard)
create(@Body() dto: CreateReservationDto, @Request() req) {
  return this.reservationsService.create(req.user.userId, dto);
}

@Get('my')
@UseGuards(JwtAuthGuard)
async findByUser(@Request() req) {
  return this.reservationsService.findByUser(req.user.userId);
}

// PATCH /reservations/:id/status — actualizar estado (admin y usuario)
// GET /reservations — todas las reservas (admin)

@Patch(':id/status')
@UseGuards(JwtAuthGuard)
updateStatus(@Param('id') id: number, @Body() dto: UpdateReservationDto, @Request() req) {
  return this.reservationsService.updateStatus(id, dto, req.user.userId, req.user.role);
}

@Get('all')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
async findAll() {
  return this.reservationsService.findAll();
}

@Get(':id')
@UseGuards(JwtAuthGuard)
findById(@Param('id') id: string) {
  return this.reservationsService.findById(Number(id));
}

}

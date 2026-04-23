import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from './entities/reservations.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ResourcesService } from '../resources/resources.service';
import { LessThan, MoreThan } from 'typeorm';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,

    private readonly resourcesService: ResourcesService,
  ) {}

  
// // SELECT * FROM products WHERE price > 100 ORDER BY price ASC LIMIT 10
// this.productsRepository.find({
//   where: { price: MoreThan(100) },  // necesita import de typeorm
//   order: { price: 'ASC' },
//   take: 10,                         // LIMIT
// });
  async create(userId: number, dto: CreateReservationDto): Promise<Reservation> {
    this.logger.log(`Creating reservation userId=${userId}, resourceId=${dto.resourceId}`);
    const resource = await this.resourcesService.findOne(dto.resourceId);
        if (!resource) throw new NotFoundException(`Resource #${dto.resourceId} not found`);

        if (dto.startTime >= dto.endTime) {
        this.logger.warn(`Invalid reservation range userId=${userId}, resourceId=${dto.resourceId}`);
            throw new BadRequestException('startTime must be before endTime');
        }
        const overlapping = await this.reservationsRepository.findOne({
            where: {
                resource: { id: dto.resourceId },
                startTime: LessThan(dto.endTime),
                endTime: MoreThan(dto.startTime),
                status: ReservationStatus.CONFIRMED
            }
        });
        if (overlapping) {
          this.logger.warn(`Overlapping reservation detected for resourceId=${dto.resourceId}`);
            throw new BadRequestException('there is an overlapping reservation for this resource and time');
        }
        const reservation = this.reservationsRepository.create({ 
  ...dto, 
  user: { id: userId },
  resource: { id: dto.resourceId }
});

        const savedReservation = await this.reservationsRepository.save(reservation);
        this.logger.log(`Reservation created id=${savedReservation.id}`);
        return savedReservation;

    // 1. Verificar que el recurso existe
    // 2. Verificar que startTime < endTime
    // 3. Detectar solapamiento
    // 4. Crear y guardar la reserva
  }

async findAll(): Promise<Reservation[]> {
  this.logger.log('Listing all reservations');
  return this.reservationsRepository.find();
}

async findByUser(userId: number): Promise<Reservation[]> {
  this.logger.log(`Listing reservations for userId=${userId}`);
  return this.reservationsRepository.find({ where: { userId: userId } });
}

async findById(id: number): Promise<Reservation> {
  const reservation = await this.reservationsRepository.findOne({ where: { id: id } });
  if (!reservation) {
    this.logger.warn(`Reservation not found: id=${id}`);
    throw new NotFoundException(`Reservation #${id} not found`);
  }
  return reservation;
}

async updateStatus(id: number, dto: UpdateReservationDto, userId: number, role: string): Promise<Reservation> {
  const reservation = await this.reservationsRepository.findOne({ where: { id: id } });
  if (!reservation) {
    this.logger.warn(`Reservation not found for status update: id=${id}`);
    throw new NotFoundException(`Reservation #${id} not found`);
  }

  if (dto.status === ReservationStatus.CANCELLED) {
    if (reservation.userId !== userId) {
      throw new BadRequestException('you can only cancel your own reservations!');
    }
    reservation.status = ReservationStatus.CANCELLED;
  } else {
    if (role !== 'admin') {
      throw new BadRequestException('only admins can update to COMPLETED!');
    }
    reservation.status = ReservationStatus.COMPLETED;
  }

  await this.reservationsRepository.update(id, { status: reservation.status });
  this.logger.log(`Updated reservation status id=${id}, status=${reservation.status}`);
  return reservation;
}
}
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Administration } from './entities/administration.entity';
import { Admission } from '../admissions/entities/admission.entity';
import { Medication } from '../medications/entities/medication.entity';
import { CreateAdministrationDto } from './dto/create-administration.dto';
import { UpdateAdministrationDto } from './dto/update-administration.dto';

@Injectable()
export class AdministrationsService {
  private readonly logger = new Logger(AdministrationsService.name);

  constructor(
    @InjectRepository(Administration)
    private readonly administrationsRepository: Repository<Administration>,
    @InjectRepository(Admission)
    private readonly admissionsRepository: Repository<Admission>,
    @InjectRepository(Medication)
    private readonly medicationsRepository: Repository<Medication>,
  ) {}

  async create(dto: CreateAdministrationDto): Promise<Administration> {
    this.logger.log(`Creating administration admissionId=${dto.admissionId}, medicationId=${dto.medicationId}`);

    // 1. Verificar que el ingreso existe
    const admission = await this.admissionsRepository.findOne({ where: { id: dto.admissionId } });
    if (!admission) throw new NotFoundException(`Admission #${dto.admissionId} not found`);

    // 2. Verificar que el medicamento existe
    const medication = await this.medicationsRepository.findOne({ where: { id: dto.medicationId } });
    if (!medication) throw new NotFoundException(`Medication #${dto.medicationId} not found`);

    // 3. Validar que administeredAt está dentro del rango del ingreso
    const administeredAt = new Date(dto.administeredAt);
    const admissionDate = new Date(admission.admissionDate);

    if (administeredAt < admissionDate)
      throw new BadRequestException('administeredAt cannot be before admissionDate');

    if (admission.dischargeDate && administeredAt > new Date(admission.dischargeDate))
      throw new BadRequestException('administeredAt cannot be after dischargeDate');

    const administration = this.administrationsRepository.create(dto);
    const saved = await this.administrationsRepository.save(administration);
    this.logger.log(`Administration created id=${saved.id}`);
    return saved;
  }

  async findAll(): Promise<Administration[]> {
    this.logger.log('Listing all administrations');
    return this.administrationsRepository.find({
      relations: ['admission', 'medication'],
    });
  }

  async findByAdmission(admissionId: number): Promise<Administration[]> {
    this.logger.log(`Listing administrations for admissionId=${admissionId}`);
    return this.administrationsRepository.find({
      where: { admissionId },
      relations: ['medication'],
    });
  }

  async findById(id: number): Promise<Administration> {
    const administration = await this.administrationsRepository.findOne({
      where: { id },
      relations: ['admission', 'medication'],
    });
    if (!administration) {
      this.logger.warn(`Administration not found: id=${id}`);
      throw new NotFoundException(`Administration #${id} not found`);
    }
    return administration;
  }

  async update(id: number, dto: UpdateAdministrationDto): Promise<Administration> {
    const administration = await this.findById(id);

    // Re-validar fecha si se actualiza administeredAt
    if (dto.administeredAt) {
      const admission = await this.admissionsRepository.findOne({
        where: { id: administration.admissionId },
      });
      if (!admission) throw new NotFoundException(`Admission not found`);

      const administeredAt = new Date(dto.administeredAt);
      if (administeredAt < new Date(admission.admissionDate))
        throw new BadRequestException('administeredAt cannot be before admissionDate');
      if (admission.dischargeDate && administeredAt > new Date(admission.dischargeDate))
        throw new BadRequestException('administeredAt cannot be after dischargeDate');
    }

    Object.assign(administration, dto);
    const updated = await this.administrationsRepository.save(administration);
    this.logger.log(`Updated administration id=${id}`);
    return updated;
  }

  async deleteOne(id: number): Promise<void> {
    await this.findById(id);
    await this.administrationsRepository.delete(id);
    this.logger.log(`Deleted administration id=${id}`);
  }
}
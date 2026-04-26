import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admission } from './entities/admission.entity';
import { Visit, VisitStatus } from '../visits/entities/visit.entity';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionDto } from './dto/update-admission.dto';


@Injectable()
export class AdmissionsService {
  private readonly logger = new Logger(AdmissionsService.name);

  constructor(
    @InjectRepository(Admission)
    private readonly admissionsRepository: Repository<Admission>,
    @InjectRepository(Visit)
    private readonly visitsRepository: Repository<Visit>,
  ) {}

  async create(dto: CreateAdmissionDto): Promise<Admission> {
    this.logger.log(`Creating admission for visitId=${dto.visitId}`);

    // 1. Verificar que la visita existe
    const visit = await this.visitsRepository.findOne({ where: { id: dto.visitId } });
    if (!visit) throw new NotFoundException(`Visit #${dto.visitId} not found`);

    // 2. Solo se puede ingresar si la visita está CONFIRMED o COMPLETED
    if (visit.status === VisitStatus.CANCELLED)
      throw new BadRequestException('Cannot admit a patient from a cancelled visit');

    // 3. Verificar que no existe ya un ingreso para esta visita
    const existing = await this.admissionsRepository.findOne({ where: { visitId: dto.visitId } });
    if (existing) throw new BadRequestException(`Visit #${dto.visitId} already has an admission`);

    const admission = this.admissionsRepository.create(dto);
    const saved = await this.admissionsRepository.save(admission);
    this.logger.log(`Admission created id=${saved.id}`);
    return saved;
  }

  async findAll(): Promise<Admission[]> {
    this.logger.log('Listing all admissions');
    return this.admissionsRepository.find({
      relations: ['visit', 'administrations'],
    });
  }

  async findById(id: number): Promise<Admission> {
    const admission = await this.admissionsRepository.findOne({
      where: { id },
      relations: ['visit', 'administrations'],
    });
    if (!admission) {
      this.logger.warn(`Admission not found: id=${id}`);
      throw new NotFoundException(`Admission #${id} not found`);
    }
    return admission;
  }

  async findByVisit(visitId: number): Promise<Admission> {
    const admission = await this.admissionsRepository.findOne({
      where: { visitId },
      relations: ['administrations'],
    });
    if (!admission) throw new NotFoundException(`No admission found for visit #${visitId}`);
    return admission;
  }

  async update(id: number, dto: UpdateAdmissionDto): Promise<Admission> {
    const admission = await this.admissionsRepository.findOne({ where: { id } });
    if (!admission) throw new NotFoundException(`Admission #${id} not found`);

    if (dto.dischargeDate && new Date(dto.dischargeDate) < new Date(admission.admissionDate))
      throw new BadRequestException('dischargeDate cannot be before admissionDate');

    Object.assign(admission, dto);
    const updated = await this.admissionsRepository.save(admission);
    this.logger.log(`Updated admission id=${id}`);
    return updated;
  }

  async discharge(id: number): Promise<Admission> {
    const admission = await this.admissionsRepository.findOne({ where: { id } });
    if (!admission) throw new NotFoundException(`Admission #${id} not found`);
    if (admission.dischargeDate)
      throw new BadRequestException(`Admission #${id} already discharged`);

    admission.dischargeDate = new Date();
    const updated = await this.admissionsRepository.save(admission);
    this.logger.log(`Discharged admission id=${id}`);
    return updated;
  }
}
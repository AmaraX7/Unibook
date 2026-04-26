import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medication } from './entities/medication.entity';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

@Injectable()
export class MedicationsService {
  private readonly logger = new Logger(MedicationsService.name);

  constructor(
    @InjectRepository(Medication)
    private readonly medicationsRepository: Repository<Medication>,
  ) {}

  async create(dto: CreateMedicationDto): Promise<Medication> {
    this.logger.log(`Creating medication name=${dto.name}`);
    const existing = await this.medicationsRepository.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`Medication '${dto.name}' already exists`);
    const medication = this.medicationsRepository.create(dto);
    const saved = await this.medicationsRepository.save(medication);
    this.logger.log(`Medication created id=${saved.id}`);
    return saved;
  }

  async findAll(): Promise<Medication[]> {
    this.logger.log('Listing all medications');
    return this.medicationsRepository.find();
  }

  async findById(id: number): Promise<Medication> {
    const medication = await this.medicationsRepository.findOne({ where: { id } });
    if (!medication) {
      this.logger.warn(`Medication not found: id=${id}`);
      throw new NotFoundException(`Medication #${id} not found`);
    }
    return medication;
  }

  async update(id: number, dto: UpdateMedicationDto): Promise<Medication> {
    const medication = await this.findById(id);
    Object.assign(medication, dto);
    const updated = await this.medicationsRepository.save(medication);
    this.logger.log(`Updated medication id=${id}`);
    return updated;
  }

  async deleteOne(id: number): Promise<void> {
    const medication = await this.findById(id);
    await this.medicationsRepository.delete(medication.id);
    this.logger.log(`Deleted medication id=${id}`);
  }
}
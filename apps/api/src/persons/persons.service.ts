import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Person, PersonRole } from './entities/person.entity';
import { Doctor } from './entities/doctor.entity';
import { Patient } from './entities/patient.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update.person.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PersonsService {
  private readonly logger = new Logger(PersonsService.name);

  constructor(
    @InjectRepository(Person)
    private readonly personsRepository: Repository<Person>,
  ) {}

  async findAll(role: PersonRole, companyId: number | null) {
    if (role === PersonRole.SUPER_ADMIN) {
      const persons = await this.personsRepository.find();
      return persons.map(({ password: _password, ...p }) => p);
    }
    if (role === PersonRole.CLINIC_ADMIN) {
      if (!companyId) throw new ForbiddenException('No company associated');
      const persons = await this.personsRepository.find({ where: { companyId } });
      return persons.map(({ password: _password, ...p }) => p);
    }
    throw new ForbiddenException();
  }

  async findByEmail(email: string) {
    const person = await this.personsRepository.findOne({ where: { email } });
    if (!person) return null;
    const { password, ...result } = person;
    return result; // role sigue aquí ✓
  }

  async findById(id: number) {
    const person = await this.personsRepository.findOne({ where: { id } });
    if (!person) throw new NotFoundException(`Person #${id} not found`);
    const { password, ...result } = person;
    return result;
  }

  async findByEmailWithPassword(email: string): Promise<Person | null> {
    return this.personsRepository.findOne({ where: { email } });
  }

    async createPerson(dto: CreatePersonDto) {
      this.logger.log(`Creating person email=${dto.email}`);
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const person = this.personsRepository.create({ ...dto, password: hashedPassword });
    const saved = await this.personsRepository.save(person);
    const { password, ...result } = saved;
    return result; // role sigue aquí ✓
    }

  async updateMe(id: number, dto: UpdatePersonDto) {
    const person = await this.personsRepository.findOne({ where: { id } });
    if (!person) throw new NotFoundException(`Person #${id} not found`);
    Object.assign(person, dto);
    const updated = await this.personsRepository.save(person);
    this.logger.log(`Updated person id=${id}`);
    const { password, ...result } = updated;
    return result;
  }

  async deleteById(
    id: number,
    requesterId: number,
    requesterRole: PersonRole,
    requesterCompanyId: number | null,
  ): Promise<void> {
    const person = await this.personsRepository.findOne({ where: { id } });
    if (!person) throw new NotFoundException(`Person #${id} not found`);

    if (
      requesterRole === PersonRole.CLINIC_ADMIN &&
      person.companyId !== requesterCompanyId
    ) {
      throw new ForbiddenException('Cannot delete persons from another company');
    }
    await this.personsRepository.softDelete(id);
    this.logger.log(`Deleted person id=${id}`);
  }

  async updateRole(
    id: number,
    dto: UpdateRoleDto,
    requesterRole: PersonRole,
    requesterCompanyId: number | null,
  ) {
    const person = await this.personsRepository.findOne({ where: { id } });
    if (!person) throw new NotFoundException(`Person #${id} not found`);

    if (requesterRole === PersonRole.CLINIC_ADMIN) {
      if (person.companyId !== requesterCompanyId)
        throw new ForbiddenException('Cannot update persons from another company');
      if (dto.role === PersonRole.SUPER_ADMIN)
        throw new ForbiddenException('Cannot assign super_admin role');
    }

    Object.assign(person, dto);
    const updated = await this.personsRepository.save(person);
    this.logger.log(`Updated person role id=${id}, role=${dto.role}`); 
    const { password, ...result } = updated;
    return result;
  }
}
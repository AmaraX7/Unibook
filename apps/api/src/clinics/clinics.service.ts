import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clinic } from './entities/clinic.entity';           // ← Resource → Clinic
import { CreateClinicDto } from './dto/create-clinic.dto';   // ← cambiado
import { UpdateClinicDto } from './dto/update-clinic.dto';   // ← cambiado
import { PaginationDto } from '../common/dto/pagination.dto';
import { PersonRole } from '../persons/entities/person.entity'; // ← UserRole → PersonRole

// OPERACIONES TYPEORM a SQL

// // SELECT * FROM products
// this.productsRepository.find();

// // SELECT * FROM products WHERE category = 'Electronics'
// this.productsRepository.find({ where: { category: 'Electronics' } });

// // SELECT * FROM products WHERE id = 1 LIMIT 1
// this.productsRepository.findOne({ where: { id: 1 } });

// // INSERT INTO products (name, price) VALUES ('Laptop', 999)
// const resource = this.productsRepository.create(dto);
// this.productsRepository.save(resource);

// // UPDATE products SET price = 500 WHERE id = 1
// const resource = await this.productsRepository.findOne({ where: { id: 1 } });
// Object.assign(resource, { price: 500 });
// this.productsRepository.save(resource);

// // DELETE FROM products WHERE id = 1
// this.productsRepository.delete(1);

// // SELECT COUNT(*) FROM products
// this.productsRepository.count();

// // SELECT * FROM products WHERE price > 100 ORDER BY price ASC LIMIT 10
// this.productsRepository.find({
//   where: { price: MoreThan(100) },  // necesita import de typeorm
//   order: { price: 'ASC' },
//   take: 10,                         // LIMIT
// });

// // SELECT * FROM products WHERE price > 100 ORDER BY price ASC LIMIT 10 OFFSET 20
// this.productsRepository.find({
//   where: { price: MoreThan(100) },
//   order: { price: 'ASC' },
//   take: 10,   // LIMIT
//   skip: 20,   // OFFSET â€” para paginaciÃ³n
// });

@Injectable()
export class ClinicsService {
  private readonly logger = new Logger(ClinicsService.name);

  constructor(
    @InjectRepository(Clinic)
    private readonly clinicsRepository: Repository<Clinic>,
  ) {}

  async findAll(pagination: PaginationDto, companyId?: number) {
    const [data, total] = await this.clinicsRepository.findAndCount({
      where: companyId ? { companyId } : {},
      take: pagination.limit,
      skip: (pagination.page - 1) * pagination.limit,
    });
    return { data, total };
  }

  async findOne(id: number): Promise<Clinic> {
    const clinic = await this.clinicsRepository.findOne({ where: { id } });
    if (!clinic) throw new NotFoundException(`Clinic #${id} not found`);
    return clinic;
  }

  async create(dto: CreateClinicDto, role: PersonRole, companyId: number | null) {
    if (role === PersonRole.CLINIC_ADMIN) {
      if (!companyId) throw new ForbiddenException('No company associated');
      dto.companyId = companyId;
    }
    const clinic = this.clinicsRepository.create(dto);
    return this.clinicsRepository.save(clinic);
  }

  async update(id: number, dto: UpdateClinicDto, role: PersonRole, companyId: number | null) {
    const clinic = await this.findOne(id);
    if (role === PersonRole.CLINIC_ADMIN && clinic.companyId !== companyId)
      throw new ForbiddenException('Cannot update clinics from another company');
    Object.assign(clinic, dto);
    return this.clinicsRepository.save(clinic);
  }

  async deleteOne(id: number, role: PersonRole, companyId: number | null): Promise<void> {
    const clinic = await this.findOne(id);
    if (role === PersonRole.CLINIC_ADMIN && clinic.companyId !== companyId)
      throw new ForbiddenException('Cannot delete clinics from another company');
    await this.clinicsRepository.delete(id);
  }
}
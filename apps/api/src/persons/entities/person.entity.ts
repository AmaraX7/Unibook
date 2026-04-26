// person.entity.ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  TableInheritance,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

export enum PersonRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  CLINIC_ADMIN = 'clinic_admin',
  SUPER_ADMIN = 'super_admin',
}

@Entity('persons')
@TableInheritance({ column: { type: 'enum', enum: PersonRole, name: 'role' } })
export class Person {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstName!: string;

  @Column({ type: 'enum', enum: PersonRole })
  role!: PersonRole;

  @Column()
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ unique: true })
  dni!: string;

  @Column({ type: 'varchar', nullable: true })
  phone?: string;

  @Column({ type: 'date', nullable: true })
  birthDate?: Date;

  @ManyToOne(() => Company, (company) => company.persons, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @Column({ nullable: true })
  companyId!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
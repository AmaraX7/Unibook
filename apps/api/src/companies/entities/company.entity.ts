import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Clinic } from '../../clinics/entities/clinic.entity'; // ← Resource → Clinic
import { Person } from '../../persons/entities/person.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => Clinic, (clinic) => clinic.company)
  clinics!: Clinic[];                                

  @OneToMany(() => Person, (person) => person.company)
  persons!: Person[];

  @CreateDateColumn()
  createdAt!: Date;
}
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Visit } from '../../visits/entities/visit.entity';

@Entity('clinics')
export class Clinic {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  address!: string; 

  @Column()
  specialty!: string; 

  @Column({ nullable: true })
  capacity?: number;     // útil para clínicas pequeñas, pero no obligatorio

  @ManyToOne(() => Company, (company) => company.clinics, { eager: false })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  @Column()
  companyId!: number;

  @OneToMany(() => Visit, (visit) => visit.clinic)
  visits!: Visit[];

  @CreateDateColumn()
  createdAt!: Date;
}
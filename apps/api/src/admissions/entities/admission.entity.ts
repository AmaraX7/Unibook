import { Column, Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { Visit } from '../../visits/entities/visit.entity';
import { Administration } from '../../administrations/entities/administration.entity';

@Entity('admissions')
export class Admission {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Visit, (visit) => visit.admission, { eager: false })
  @JoinColumn({ name: 'visitId' })
  visit!: Visit;

  @Column()
  visitId!: number;

  @Column({ type: 'date' })
  admissionDate!: Date;

  @Column({ type: 'date', nullable: true })
  dischargeDate?: Date;

  @Column({ nullable: true })
  room?: string;

  @Column({ nullable: true })
  notes?: string;

  @OneToMany(() => Administration, (admin) => admin.admission)
  administrations!: Administration[];

  @CreateDateColumn()
  createdAt!: Date;

  @DeleteDateColumn()
deletedAt?: Date;
}
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Admission } from '../../admissions/entities/admission.entity';
import { Medication } from '../../medications/entities/medication.entity';

@Entity('administrations')
export class Administration {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Admission, (admission) => admission.administrations, { eager: false })
  @JoinColumn({ name: 'admissionId' })
  admission!: Admission;

  @Column()
  admissionId!: number;

  @ManyToOne(() => Medication, (medication) => medication.administrations, { eager: false })
  @JoinColumn({ name: 'medicationId' })
  medication!: Medication;

  @Column()
  medicationId!: number;

  @Column({ type: 'timestamp' })
  administeredAt!: Date;

  @Column('float')
  dosage!: number;

  @Column({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
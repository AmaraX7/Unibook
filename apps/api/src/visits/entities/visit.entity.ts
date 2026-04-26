import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Doctor } from '../../persons/entities/doctor.entity';
import { Patient } from '../../persons/entities/patient.entity';
import { Clinic } from '../../clinics/entities/clinic.entity';
import { Admission } from '../../admissions/entities/admission.entity';

export enum VisitStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

@Entity('visits')
export class Visit {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Doctor, { eager: false })
  @JoinColumn({ name: 'doctorId' })
  doctor!: Doctor;

  @Column()
  doctorId!: number;

  @ManyToOne(() => Patient, { eager: false })
  @JoinColumn({ name: 'patientId' })
  patient!: Patient;

  @Column()
  patientId!: number;

  @ManyToOne(() => Clinic, (clinic) => clinic.visits, { eager: false })
  @JoinColumn({ name: 'clinicId' })
  clinic!: Clinic;

  @Column()
  clinicId!: number;

  @Column({ type: 'enum', enum: VisitStatus, default: VisitStatus.CONFIRMED })
  status!: VisitStatus;

  @Column()
  startTime!: Date;

  @Column()
  endTime!: Date;

  @Column({ nullable: true })
  notes?: string;

  @OneToOne(() => Admission, (admission) => admission.visit, { nullable: true })
  admission?: Admission;

  @CreateDateColumn()
  createdAt!: Date;
}
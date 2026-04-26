import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Administration } from '../../administrations/entities/administration.entity';

@Entity('medications')
export class Medication {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  dosageUnit?: string;    // mg, ml, etc.

  @Column({ nullable: true })
  sideEffects?: string;

  @OneToMany(() => Administration, (admin) => admin.medication)
  administrations!: Administration[];
}
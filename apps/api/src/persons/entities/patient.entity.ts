// patient.entity.ts
import { ChildEntity, Column } from 'typeorm';
import { Person, PersonRole } from './person.entity';

@ChildEntity(PersonRole.PATIENT)
export class Patient extends Person {
  @Column({ nullable: true })
  bloodType?: string;

  @Column({ nullable: true })
  allergies?: string;

  @Column({ nullable: true })
  insuranceNumber?: string;
}
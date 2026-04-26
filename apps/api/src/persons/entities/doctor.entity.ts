// doctor.entity.ts
import { ChildEntity, Column } from 'typeorm';
import { Person, PersonRole } from './person.entity';


@ChildEntity(PersonRole.DOCTOR)
export class Doctor extends Person {
  @Column()
  specialty!: string;

  @Column({ unique: true })
  licenseNumber!: string;

  @Column({ nullable: true })
  yearsOfExperience?: number;
}
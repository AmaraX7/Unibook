// staff.entity.ts
import { ChildEntity, Column } from 'typeorm';
import { Person, PersonRole } from './person.entity';

@ChildEntity(PersonRole.CLINIC_ADMIN)
export class Staff extends Person {
  @Column({ nullable: true })
  position?: string;
}
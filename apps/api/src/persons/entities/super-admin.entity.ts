import { ChildEntity } from 'typeorm';
import { Person, PersonRole } from './person.entity';

@ChildEntity(PersonRole.SUPER_ADMIN)
export class SuperAdmin extends Person {}
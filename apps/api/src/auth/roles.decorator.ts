import { SetMetadata } from '@nestjs/common';
import { PersonRole } from '../persons/entities/person.entity';


export const Roles = (...roles: PersonRole[]) => SetMetadata('roles', roles);
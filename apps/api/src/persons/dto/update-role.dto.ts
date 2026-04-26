// update-role.dto.ts
import { IsEnum } from 'class-validator';
import { PersonRole } from '../entities/person.entity';

export class UpdateRoleDto {
  @IsEnum(PersonRole)
  role!: PersonRole;
}
import { IsEnum } from 'class-validator';
import { VisitStatus } from '../entities/visit.entity';

export class UpdateVisitDto {
  @IsEnum(VisitStatus)
  status!: VisitStatus;
}
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateVisitDto {
  @IsInt()
  @Min(1)
  doctorId!: number;

  @IsInt()
  @Min(1)
  patientId!: number;

  @IsInt()
  @Min(1)
  clinicId!: number;

  @IsDate()
  @Type(() => Date)
  startTime!: Date;

  @IsDate()
  @Type(() => Date)
  endTime!: Date;

  @IsString()
  @IsOptional()
  notes?: string;        // motivo de la visita
}
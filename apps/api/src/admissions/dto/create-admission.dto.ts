import { IsInt, IsDateString, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdmissionDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  visitId!: number;

  @ApiProperty({ example: '2026-05-10' })
  @IsDateString()
  admissionDate!: string;

  @ApiPropertyOptional({ example: '2026-05-15' })
  @IsDateString()
  @IsOptional()
  dischargeDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  room?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
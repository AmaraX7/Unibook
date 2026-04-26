import { IsInt, IsNumber, IsDateString, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdministrationDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  admissionId!: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  medicationId!: number;

  @ApiProperty({ example: '2026-05-10T09:00:00Z' })
  @IsDateString()
  administeredAt!: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  dosage!: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
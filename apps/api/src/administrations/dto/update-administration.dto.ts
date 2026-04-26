import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAdministrationDto {
  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  administeredAt?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  dosage?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
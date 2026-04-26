import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAdmissionDto {
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
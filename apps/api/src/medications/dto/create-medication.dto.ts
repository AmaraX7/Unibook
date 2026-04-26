import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMedicationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'mg' })
  @IsString()
  @IsOptional()
  dosageUnit?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sideEffects?: string;
}
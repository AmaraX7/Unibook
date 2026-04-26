import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClinicDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Calle Mayor 1, Barcelona' })
  @IsString()
  @IsNotEmpty()
  address!: string;        // ← location → address

  @ApiProperty({ example: 'cardiology', enum: ['cardiology', 'pediatrics', 'emergency', 'general'] })
  @IsString()
  @IsNotEmpty()
  specialty!: string;      // ← type → specialty

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  companyId?: number;
}
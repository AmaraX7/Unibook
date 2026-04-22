import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ResourceStatus } from '../entities/resource.entity';

export class UpdateResourceDto {
  // Base Resource
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(ResourceStatus)
  @IsOptional()
  status?: ResourceStatus;

  // Room
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  floor?: number;

  @IsString()
  @IsOptional()
  building?: string;

  @IsBoolean()
  @IsOptional()
  hasProjector?: boolean;

  // Laptop
  @IsString()
  @IsOptional()
  brand?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  ram?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  storage?: number;

  @IsString()
  @IsOptional()
  os?: string;

  // LabEquipment
  @IsString()
  @IsOptional()
  materialType?: string;

  @IsBoolean()
  @IsOptional()
  requiresTraining?: boolean;
}
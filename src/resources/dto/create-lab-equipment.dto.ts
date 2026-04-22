import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ResourceStatus } from '../entities/resource.entity';

// DTO para crear material de laboratorio
export class CreateLabEquipmentDto {
  // Base Resource
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsEnum(ResourceStatus)
  @IsOptional()
  status?: ResourceStatus;

  // LabEquipment
  @IsString()
  @IsNotEmpty()
  materialType!: string;

  @IsBoolean()
  requiresTraining!: boolean;
}
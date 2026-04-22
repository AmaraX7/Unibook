import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ResourceStatus } from '../entities/resource.entity';

export class CreateLaptopDto {
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

  // Laptop
  @IsString()
  @IsNotEmpty()
  brand!: string;

  @IsInt()
  @Min(1)
  ram!: number; // GB

  @IsInt()
  @Min(1)
  storage!: number; // GB

  @IsString()
  @IsNotEmpty()
  os!: string;
}
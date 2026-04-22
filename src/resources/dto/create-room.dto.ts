import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ResourceStatus } from '../entities/resource.entity';

export class CreateRoomDto {
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

  // Room
  @IsInt()
  @Min(1)
  capacity!: number;

  @IsInt()
  @Min(0)
  floor!: number;

  @IsString()
  @IsNotEmpty()
  building!: string;

  @IsBoolean()
  hasCampusView!: boolean;

  @IsBoolean()
  hasTV!: boolean;
}
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { PersonRole } from '../entities/person.entity';

export class CreatePersonDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  dni!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;


  @IsOptional()
@IsEnum(PersonRole)
role?: PersonRole = PersonRole.PATIENT;
}
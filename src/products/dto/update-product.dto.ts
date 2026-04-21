import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';


// DTO para actualizar products; todo es opcional para permitir cambios parciales.
export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  stock?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;
}
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';


// DTO para crear un nuevo product, el ! es obligatorio y el ? opcional.
// esto es cuando al controller le llega un body, lo transforma a este dto
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsInt()
  @Min(1)
  stock!: number;

  @IsNumber()
  @Min(0)
  price!: number;
}
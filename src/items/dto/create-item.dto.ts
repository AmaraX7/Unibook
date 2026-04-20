import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';


// DTO para crear un nuevo item, el ! es obligatorio, y el ? opcional,
// esto es cuando al controller le llega un body, lo transforma a este dto
export class CreateItemDto {
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
  totalStock!: number;

  @IsInt()
  @Min(0)
  availableStock!: number;

  @IsNumber()
  @Min(0)
  price!: number;
}
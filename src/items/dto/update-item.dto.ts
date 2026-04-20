import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';


// dto para actualizar los items, como no quiero que sea obligatorio actualziarlo todo lo pongo opcional
export class UpdateItemDto {
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
  totalStock?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  availableStock?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;
}
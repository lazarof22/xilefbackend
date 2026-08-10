import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUnidadMedidaDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsOptional()
  abreviatura?: string;
}

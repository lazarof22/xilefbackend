import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTipoGastoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsOptional()
  codigo?: string;
}

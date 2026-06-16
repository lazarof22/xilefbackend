import { IsString, IsNotEmpty, IsNumber, IsOptional, IsMongoId, IsDateString, IsEnum, Min } from 'class-validator';

export class CreateActivoFijoDto {
  @IsString()
  @IsNotEmpty()
  codigoActivo!: string;

  @IsString()
  @IsNotEmpty()
  descripcionActivo!: string;

  @IsMongoId()
  @IsOptional()
  area?: string;

  @IsDateString()
  @IsOptional()
  fechaCompra?: string;

  @IsNumber()
  @IsNotEmpty()
  valor!: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  valorResidual!: number;          

  
  @IsMongoId()
  @IsOptional()
  depreciacionActivo?: string;

  @IsString()
  @IsOptional()
  compra?: string;

  @IsNumber()
  @IsOptional()
  ajusteValor?: number;

  @IsMongoId()
  @IsOptional()
  movimiento?: string;

  @IsMongoId()
  @IsOptional()
  estadoActivo?: string;
}
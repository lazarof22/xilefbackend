import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsMongoId,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateActivoFijoDto {
  @IsString()
  @IsNotEmpty()
  codigoActivo!: string;

  @IsString()
  @IsNotEmpty()
  descripcionActivo!: string;

  @IsMongoId()
  @IsNotEmpty()
  proveedor!: string;

  @IsMongoId()
  @IsNotEmpty()
  area!: string;

  @IsDateString()
  @IsNotEmpty()
  fechaCompra!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  valor!: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  valorResidual!: number;

  @IsMongoId()
  @IsNotEmpty()
  depreciacionActivo!: string;

  @IsMongoId()
  @IsNotEmpty()
  moneda!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  vidaUtil!: number;

  @IsMongoId()
  @IsNotEmpty()
  pais!: string;

  @IsMongoId()
  @IsNotEmpty()
  concepto!: string;

  @IsNumber()
  @IsOptional()
  ajusteValor?: number;

  @IsMongoId()
  @IsNotEmpty()
  movimiento!: string;

  @IsMongoId()
  @IsNotEmpty()
  estadoActivo!: string;
}
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsDateString, IsMongoId, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoTransaccion, MetodoPago } from '../types/transaccion.types';

export class CreateTransaccionDto {
  @ApiProperty({ description: 'Código único de la transacción' })
  @IsString() @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ enum: TipoTransaccion })
  @IsEnum(TipoTransaccion) @IsNotEmpty()
  tipo!: TipoTransaccion;

  @ApiProperty({ description: 'Categoría (Concepto contable)' })
  @IsMongoId() @IsNotEmpty()
  categoria!: string;

  @ApiProperty({ description: 'Monto de la transacción' })
  @IsNumber() @IsNotEmpty() @Min(0)
  monto!: number;

  @ApiProperty({ description: 'ID de la moneda' })
  @IsMongoId() @IsNotEmpty()
  moneda!: string;

  @ApiProperty({ description: 'Fecha de la transacción' })
  @IsDateString() @IsNotEmpty()
  fecha!: string;

  @ApiProperty({ enum: MetodoPago })
  @IsEnum(MetodoPago) @IsNotEmpty()
  metodoPago!: MetodoPago;

  @ApiPropertyOptional({ description: 'Número de referencia' })
  @IsString() @IsOptional()
  referencia?: string;

  @ApiPropertyOptional({ description: 'Descripción' })
  @IsString() @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'ID de la cuenta bancaria (si aplica)' })
  @IsMongoId() @IsOptional()
  cuentaBancaria?: string;

  @ApiPropertyOptional({ description: 'ID del cliente (si aplica)' })
  @IsMongoId() @IsOptional()
  cliente?: string;

  @ApiPropertyOptional({ description: 'ID del proveedor (si aplica)' })
  @IsMongoId() @IsOptional()
  proveedor?: string;
}

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsMongoId,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoCuentaCaja } from '../types/caja.types';

export class CreateCuentaCajaDto {
  @ApiProperty({ description: 'Código único de la cuenta de caja' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ description: 'Nombre descriptivo de la cuenta' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({ enum: TipoCuentaCaja, description: 'Tipo de cuenta de caja' })
  @IsEnum(TipoCuentaCaja)
  @IsNotEmpty()
  tipo!: TipoCuentaCaja;

  @ApiProperty({ description: 'ID de la moneda' })
  @IsMongoId()
  @IsNotEmpty()
  moneda!: string;

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  saldoInicial?: number;

  @ApiPropertyOptional({ description: 'Monto del fondo fijo (si aplica)' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  montoFondoFijo?: number;

  @ApiPropertyOptional({ description: 'Monto mínimo que activa reposición' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  montoMinimo?: number;

  @ApiPropertyOptional({ description: 'Responsable de la cuenta' })
  @IsString()
  @IsOptional()
  responsable?: string;

  @ApiPropertyOptional({
    description: 'ID de la cuenta bancaria para reposiciones',
  })
  @IsMongoId()
  @IsOptional()
  cuentaBancariaReposicion?: string;
}

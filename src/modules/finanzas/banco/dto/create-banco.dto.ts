import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  IsMongoId,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoCuentaBancaria, EstadoCuentaBancaria } from '../types/banco.types';

export class CreateBancoDto {
  @ApiProperty({ description: 'Código interno de la cuenta bancaria' })
  @IsString()
  @IsNotEmpty()
  codigoBanco!: string;

  @ApiProperty({ description: 'Nombre del banco' })
  @IsString()
  @IsNotEmpty()
  nombreBanco!: string;

  @ApiProperty({ description: 'Número de cuenta' })
  @IsString()
  @IsNotEmpty()
  numeroCuenta!: string;

  @ApiProperty({ enum: TipoCuentaBancaria, description: 'Tipo de cuenta' })
  @IsEnum(TipoCuentaBancaria)
  @IsNotEmpty()
  tipoCuenta!: TipoCuentaBancaria;

  @ApiProperty({ description: 'ID de la moneda' })
  @IsMongoId()
  @IsNotEmpty()
  moneda!: string;

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  saldoInicial?: number;

  @ApiProperty({ description: 'Fecha de apertura' })
  @IsDateString()
  @IsNotEmpty()
  fechaApertura!: string;

  @ApiProperty({ description: 'Titular de la cuenta' })
  @IsString()
  @IsNotEmpty()
  titular!: string;
}

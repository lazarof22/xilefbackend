import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NaturalezaCuenta } from '../schema/cuenta.schema';

export class CreateCuentaDto {
  @ApiProperty({
    description: 'Código único de la cuenta contable (ej: 1.1.1)',
  })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ description: 'Nombre de la cuenta contable' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({
    enum: NaturalezaCuenta,
    description: 'Naturaleza de la cuenta',
  })
  @IsEnum(NaturalezaCuenta)
  @IsNotEmpty()
  naturaleza!: NaturalezaCuenta;

  @ApiPropertyOptional({
    description: 'ID de la cuenta padre (jerarquía del clasificador)',
  })
  @IsMongoId()
  @IsOptional()
  padre?: string;

  @ApiProperty({ description: 'ID de la moneda (nomenclador)' })
  @IsMongoId()
  @IsNotEmpty()
  moneda!: string;

  @ApiPropertyOptional({
    description: 'Nivel en la jerarquía (se calcula del código si no se envía)',
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  nivel?: number;
}

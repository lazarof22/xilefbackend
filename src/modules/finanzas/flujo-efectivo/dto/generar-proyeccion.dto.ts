import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoPeriodoFlujo } from '../types/flujo-efectivo.types';

export class GenerarProyeccionDto {
  @ApiProperty({ description: 'Fecha de inicio (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  fechaInicio!: string;

  @ApiProperty({ description: 'Fecha de fin (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  fechaFin!: string;

  @ApiProperty({ enum: TipoPeriodoFlujo, description: 'Tipo de periodo' })
  @IsEnum(TipoPeriodoFlujo)
  @IsNotEmpty()
  tipoPeriodo!: TipoPeriodoFlujo;

  @ApiProperty({ description: 'Saldo inicial' })
  @IsNumber()
  @IsNotEmpty()
  saldoInicial!: number;
}

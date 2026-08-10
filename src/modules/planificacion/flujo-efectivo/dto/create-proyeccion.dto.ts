import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoPeriodoFlujo } from '../types/flujo-efectivo.types';

export class CreateProyeccionDto {
  @ApiProperty({ description: 'Código único de la proyección' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ description: 'Fecha de inicio del periodo proyectado' })
  @IsDateString()
  @IsNotEmpty()
  fecha!: string;

  @ApiProperty({
    description: 'Nombre del periodo (ej: "2026-01", "Semana 1", "2026-01-15")',
  })
  @IsString()
  @IsNotEmpty()
  periodo!: string;

  @ApiProperty({ description: 'Tipo de periodo', enum: TipoPeriodoFlujo })
  @IsEnum(TipoPeriodoFlujo)
  @IsNotEmpty()
  tipoPeriodo!: TipoPeriodoFlujo;

  @ApiProperty({ description: 'Saldo inicial del periodo' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  saldoInicial!: number;
}

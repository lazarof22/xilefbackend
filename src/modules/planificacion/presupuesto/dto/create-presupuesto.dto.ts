import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsMongoId,
  IsEnum,
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoPresupuesto } from '../types/presupuesto.types';

export class CreatePresupuestoDto {
  @ApiProperty({ description: 'Código único del presupuesto' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ description: 'Nombre del presupuesto' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({ description: 'Período (ej: "2026")' })
  @IsString()
  @IsNotEmpty()
  periodo!: string;

  @ApiProperty({ description: 'Tipo de presupuesto', enum: TipoPresupuesto })
  @IsEnum(TipoPresupuesto)
  @IsNotEmpty()
  tipo!: TipoPresupuesto;

  @ApiProperty({ description: 'ID del centro de costo' })
  @IsMongoId()
  @IsNotEmpty()
  centroCosto!: string;

  @ApiPropertyOptional({ description: 'ID del tipo de gasto' })
  @IsMongoId()
  @IsOptional()
  tipoGasto?: string;

  @ApiProperty({ description: 'Plan anual del presupuesto' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  planAnual!: number;

  @ApiPropertyOptional({
    description: 'Desglose mensual (12 posiciones: enero a diciembre)',
    type: [Number],
  })
  @IsArray()
  @IsOptional()
  @ArrayMinSize(12)
  @ArrayMaxSize(12)
  planMensual?: number[];

  @ApiPropertyOptional({ description: 'ID de la moneda' })
  @IsMongoId()
  @IsOptional()
  moneda?: string;

  @ApiPropertyOptional({ description: 'Observaciones' })
  @IsString()
  @IsOptional()
  observaciones?: string;
}

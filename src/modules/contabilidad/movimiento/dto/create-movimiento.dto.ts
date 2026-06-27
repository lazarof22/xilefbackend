import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsDateString,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TipoMovimientoEnum {
  ALTA = 'alta',
  MODIFICACION = 'modificacion',
  TRASLADO = 'traslado',
  BAJA_PARCIAL = 'baja_parcial',
  BAJA_TOTAL = 'baja_total',
  REVALUACION = 'revaluacion',
  DEPRECIACION = 'depreciacion',
  REPARACION = 'reparacion',
}

export class CreateMovimientoDto {
  @ApiProperty({ description: 'ID del activo fijo' })
  @IsMongoId()
  @IsNotEmpty()
  activoFijo!: string;

  @ApiProperty({ enum: TipoMovimientoEnum, description: 'Tipo de movimiento' })
  @IsEnum(TipoMovimientoEnum)
  @IsNotEmpty()
  tipo!: TipoMovimientoEnum;

  @ApiProperty({ description: 'Fecha del movimiento' })
  @IsDateString()
  @IsNotEmpty()
  fechaMovimiento!: string;

  @ApiProperty({ description: 'Descripción del movimiento' })
  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @ApiPropertyOptional({ description: 'Área de origen (para traslados)' })
  @IsMongoId()
  @IsOptional()
  areaOrigen?: string;

  @ApiPropertyOptional({ description: 'Área de destino (para traslados)' })
  @IsMongoId()
  @IsOptional()
  areaDestino?: string;

  @ApiPropertyOptional({ description: 'Estado anterior del activo' })
  @IsMongoId()
  @IsOptional()
  estadoAnterior?: string;

  @ApiPropertyOptional({ description: 'Estado nuevo del activo' })
  @IsMongoId()
  @IsOptional()
  estadoNuevo?: string;

  @ApiPropertyOptional({ description: 'Valor anterior del activo' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  valorAnterior?: number;

  @ApiPropertyOptional({ description: 'Valor nuevo del activo' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  valorNuevo?: number;

  @ApiPropertyOptional({ description: 'Depreciación acumulada anterior' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  depreciacionAcumuladaAnterior?: number;

  @ApiPropertyOptional({ description: 'Depreciación acumulada nueva' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  depreciacionAcumuladaNueva?: number;

  @ApiPropertyOptional({ description: 'Valor de baja (para bajas)' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  valorBaja?: number;

  @ApiPropertyOptional({ description: 'Motivo de baja' })
  @IsString()
  @IsOptional()
  motivoBaja?: string;

  @ApiPropertyOptional({ description: 'Costo de reparación' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  costoReparacion?: number;

  @ApiPropertyOptional({ description: 'Proveedor de reparación' })
  @IsMongoId()
  @IsOptional()
  proveedorReparacion?: string;

  @ApiPropertyOptional({
    description: 'Documento de referencia (factura, orden, etc.)',
  })
  @IsString()
  @IsOptional()
  documentoReferencia?: string;
}

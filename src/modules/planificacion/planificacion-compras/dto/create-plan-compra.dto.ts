import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsMongoId,
  IsDateString,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PrioridadCompra } from '../types/plan-compra.types';

export class CreatePlanCompraDto {
  @ApiProperty({ description: 'Código único del plan de compra' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ description: 'ID del producto' })
  @IsMongoId()
  @IsNotEmpty()
  producto!: string;

  @ApiProperty({ description: 'Cantidad planificada a comprar' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  cantidadPlanificada!: number;

  @ApiProperty({ description: 'Precio estimado por unidad' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  precioEstimado!: number;

  @ApiPropertyOptional({ description: 'ID del proveedor preferido' })
  @IsMongoId()
  @IsOptional()
  proveedorPreferido?: string;

  @ApiPropertyOptional({ description: 'ID del centro de costo' })
  @IsMongoId()
  @IsOptional()
  centroCosto?: string;

  @ApiPropertyOptional({
    description: 'Prioridad de la compra',
    enum: PrioridadCompra,
  })
  @IsEnum(PrioridadCompra)
  @IsOptional()
  prioridad?: PrioridadCompra;

  @ApiProperty({ description: 'Fecha planificada de compra' })
  @IsDateString()
  @IsNotEmpty()
  fechaPlanificada!: string;

  @ApiPropertyOptional({ description: 'ID de la moneda' })
  @IsMongoId()
  @IsOptional()
  moneda?: string;

  @ApiPropertyOptional({ description: 'Notas adicionales' })
  @IsString()
  @IsOptional()
  notas?: string;
}

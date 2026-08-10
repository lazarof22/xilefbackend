import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsMongoId,
  IsDateString,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoPlanPago } from '../types/plan-pago.types';

export class CreatePlanPagoDto {
  @ApiProperty({ description: 'Código único del plan de pago' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ description: 'ID del proveedor (Empresa)' })
  @IsMongoId()
  @IsNotEmpty()
  proveedor!: string;

  @ApiPropertyOptional({ description: 'ID de la cuenta por pagar asociada' })
  @IsMongoId()
  @IsOptional()
  cuentaPagar?: string;

  @ApiProperty({ description: 'Monto programado del pago' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  montoProgramado!: number;

  @ApiProperty({ description: 'Fecha programada del pago' })
  @IsDateString()
  @IsNotEmpty()
  fechaProgramada!: string;

  @ApiPropertyOptional({ description: 'ID de la cuenta bancaria' })
  @IsMongoId()
  @IsOptional()
  cuentaBancaria?: string;

  @ApiPropertyOptional({ description: 'ID de la caja de origen' })
  @IsMongoId()
  @IsOptional()
  cajaOrigen?: string;

  @ApiPropertyOptional({
    enum: EstadoPlanPago,
    description: 'Estado del plan de pago (solo para recuperación)',
  })
  @IsEnum(EstadoPlanPago)
  @IsOptional()
  estado?: EstadoPlanPago;

  @ApiPropertyOptional({ description: 'Método de pago' })
  @IsString()
  @IsOptional()
  metodoPago?: string;

  @ApiPropertyOptional({ description: 'Prioridad (1-5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  prioridad?: number;

  @ApiPropertyOptional({ description: 'Observaciones' })
  @IsString()
  @IsOptional()
  observaciones?: string;
}

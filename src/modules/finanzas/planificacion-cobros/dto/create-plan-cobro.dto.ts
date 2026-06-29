import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsMongoId,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlanCobroDto {
  @ApiProperty({ description: 'Código único del plan de cobro' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ description: 'ID del cliente' })
  @IsMongoId()
  @IsNotEmpty()
  cliente!: string;

  @ApiPropertyOptional({ description: 'ID de la cuenta por cobrar asociada' })
  @IsMongoId()
  @IsOptional()
  cuentaCobrar?: string;

  @ApiProperty({ description: 'Monto programado a cobrar' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  montoProgramado!: number;

  @ApiProperty({ description: 'Fecha programada del cobro' })
  @IsDateString()
  @IsNotEmpty()
  fechaProgramada!: string;

  @ApiPropertyOptional({ description: 'ID de la cuenta bancaria destino' })
  @IsMongoId()
  @IsOptional()
  cuentaBancaria?: string;

  @ApiPropertyOptional({ description: 'ID de la caja destino' })
  @IsMongoId()
  @IsOptional()
  cajaDestino?: string;

  @ApiPropertyOptional({ description: 'Método de pago' })
  @IsString()
  @IsOptional()
  metodoPago?: string;

  @ApiPropertyOptional({
    description: 'Probabilidad de cobro (0-100)',
    default: 100,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  probabilidad?: number;

  @ApiPropertyOptional({ description: 'Observaciones' })
  @IsString()
  @IsOptional()
  observaciones?: string;
}

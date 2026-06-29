import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EjecutarPlanPagoDto {
  @ApiProperty({ description: 'Monto a ejecutar del pago' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  monto!: number;

  @ApiPropertyOptional({ description: 'Método de pago' })
  @IsString()
  @IsOptional()
  metodoPago?: string;

  @ApiPropertyOptional({ description: 'Referencia del pago' })
  @IsString()
  @IsOptional()
  referencia?: string;

  @ApiPropertyOptional({ description: 'Fecha de ejecución' })
  @IsDateString()
  @IsOptional()
  fechaEjecucion?: string;
}

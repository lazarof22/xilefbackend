import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CobrarPlanCobroDto {
  @ApiProperty({ description: 'Monto a cobrar' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  monto!: number;

  @ApiPropertyOptional({ description: 'Método de pago' })
  @IsString()
  @IsOptional()
  metodoPago?: string;

  @ApiPropertyOptional({ description: 'Referencia del cobro' })
  @IsString()
  @IsOptional()
  referencia?: string;

  @ApiPropertyOptional({ description: 'Fecha del cobro (por defecto hoy)' })
  @IsDateString()
  @IsOptional()
  fechaCobro?: string;
}

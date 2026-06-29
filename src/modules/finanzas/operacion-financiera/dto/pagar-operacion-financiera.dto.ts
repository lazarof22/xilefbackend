import {
  IsNumber,
  IsOptional,
  IsDateString,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PagarOperacionFinancieraDto {
  @ApiProperty({ description: 'Monto a pagar' })
  @IsNumber()
  @Min(0)
  monto!: number;

  @ApiPropertyOptional({ description: 'Fecha del pago (por defecto hoy)' })
  @IsDateString()
  @IsOptional()
  fechaPago?: string;

  @ApiPropertyOptional({ description: 'Número de comprobante' })
  @IsString()
  @IsOptional()
  comprobante?: string;
}

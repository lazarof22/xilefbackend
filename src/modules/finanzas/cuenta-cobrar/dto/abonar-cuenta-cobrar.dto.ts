import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AbonarCuentaCobrarDto {
  @ApiProperty({ description: 'Monto del abono' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  monto!: number;

  @ApiPropertyOptional({ description: 'Fecha del pago (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  fechaPago?: string;

  @ApiPropertyOptional({ description: 'Referencia del pago' })
  @IsString()
  @IsOptional()
  referencia?: string;
}

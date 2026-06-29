import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerarQrDinamicoDto {
  @ApiProperty({ description: 'Monto a cobrar' })
  @IsNumber()
  @IsNotEmpty()
  monto!: number;

  @ApiPropertyOptional({ description: 'Concepto del cobro' })
  @IsString()
  @IsOptional()
  concepto?: string;

  @ApiPropertyOptional({
    description: 'Referencia para vincular con Cuenta por Cobrar',
  })
  @IsString()
  @IsOptional()
  referencia?: string;

  @ApiPropertyOptional({
    description: 'Fecha de vencimiento del QR (ISO 8601)',
  })
  @IsDateString()
  @IsOptional()
  vencimiento?: string;
}

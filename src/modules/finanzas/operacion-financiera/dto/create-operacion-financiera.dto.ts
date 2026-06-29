import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  IsMongoId,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoOperacionFinanciera } from '../types/operacion-financiera.types';

export class CreateOperacionFinancieraDto {
  @ApiProperty({ description: 'Código único de la operación financiera' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({
    enum: TipoOperacionFinanciera,
    description: 'Tipo de operación financiera',
  })
  @IsEnum(TipoOperacionFinanciera)
  @IsNotEmpty()
  tipo!: TipoOperacionFinanciera;

  @ApiProperty({ description: 'Período de la operación (ej. "2026-06")' })
  @IsString()
  @IsNotEmpty()
  periodo!: string;

  @ApiProperty({ description: 'Monto total de la operación' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  monto!: number;

  @ApiProperty({ description: 'Fecha límite de pago' })
  @IsDateString()
  @IsNotEmpty()
  fechaLimite!: string;

  @ApiPropertyOptional({ description: 'ID de la cuenta bancaria (si aplica)' })
  @IsMongoId()
  @IsOptional()
  cuentaBancaria?: string;

  @ApiPropertyOptional({ description: 'ID de la caja de origen (si aplica)' })
  @IsMongoId()
  @IsOptional()
  cajaOrigen?: string;

  @ApiPropertyOptional({ description: 'Observaciones' })
  @IsString()
  @IsOptional()
  observaciones?: string;
}

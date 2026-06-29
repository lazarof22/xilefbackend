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
import { TipoTransferencia, TipoCuentaRef } from '../types/transferencia.types';

export class CreateTransferenciaDto {
  @ApiProperty({ description: 'Código único de la transferencia' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({
    enum: TipoTransferencia,
    description: 'Tipo de transferencia',
  })
  @IsEnum(TipoTransferencia)
  @IsNotEmpty()
  tipo!: TipoTransferencia;

  @ApiProperty({ enum: TipoCuentaRef, description: 'Tipo de cuenta origen' })
  @IsEnum(TipoCuentaRef)
  @IsNotEmpty()
  origenCuentaTipo!: TipoCuentaRef;

  @ApiProperty({ description: 'ID de la cuenta origen' })
  @IsMongoId()
  @IsNotEmpty()
  origenCuentaId!: string;

  @ApiProperty({ enum: TipoCuentaRef, description: 'Tipo de cuenta destino' })
  @IsEnum(TipoCuentaRef)
  @IsNotEmpty()
  destinoCuentaTipo!: TipoCuentaRef;

  @ApiProperty({ description: 'ID de la cuenta destino' })
  @IsMongoId()
  @IsNotEmpty()
  destinoCuentaId!: string;

  @ApiProperty({ description: 'Monto de la transferencia' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  monto!: number;

  @ApiProperty({ description: 'ID de la moneda' })
  @IsMongoId()
  @IsNotEmpty()
  moneda!: string;

  @ApiPropertyOptional({ description: 'Comisión asociada', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  comision?: number;

  @ApiProperty({ description: 'Fecha de la transferencia' })
  @IsDateString()
  @IsNotEmpty()
  fecha!: string;

  @ApiPropertyOptional({ description: 'Descripción' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Comprobante o referencia' })
  @IsString()
  @IsOptional()
  comprobante?: string;
}

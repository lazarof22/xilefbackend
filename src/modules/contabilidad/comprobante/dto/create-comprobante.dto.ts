import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LineaComprobanteDto {
  @ApiProperty({ description: 'ID de la cuenta contable' })
  @IsMongoId()
  @IsNotEmpty()
  cuentaId!: string;

  @ApiProperty({ description: 'Nombre de la cuenta (denormalizado)' })
  @IsString()
  @IsNotEmpty()
  cuentaNombre!: string;

  @ApiPropertyOptional({ description: 'ID del elemento de gasto' })
  @IsMongoId()
  @IsOptional()
  elementoGastoId?: string;

  @ApiPropertyOptional({
    description: 'Nombre del elemento de gasto (denormalizado)',
  })
  @IsString()
  @IsOptional()
  elementoGastoNombre?: string;

  @ApiPropertyOptional({ description: 'ID del centro de costo' })
  @IsMongoId()
  @IsOptional()
  centroCostoId?: string;

  @ApiPropertyOptional({
    description: 'Nombre del centro de costo (denormalizado)',
  })
  @IsString()
  @IsOptional()
  centroCostoNombre?: string;

  @ApiProperty({ description: 'Débito de la línea' })
  @IsNumber()
  @Min(0)
  debe!: number;

  @ApiProperty({ description: 'Haber de la línea' })
  @IsNumber()
  @Min(0)
  haber!: number;

  @ApiPropertyOptional({ description: 'Descripción de la línea' })
  @IsString()
  @IsOptional()
  descripcion?: string;
}

export class CreateComprobanteDto {
  @ApiProperty({ description: 'Fecha del comprobante (ISO)' })
  @IsDateString()
  @IsNotEmpty()
  fecha!: string;

  @ApiProperty({ description: 'Número del comprobante (ej: CMP-0001)' })
  @IsString()
  @IsNotEmpty()
  numero!: string;

  @ApiProperty({ description: 'Concepto de la operación' })
  @IsString()
  @IsNotEmpty()
  concepto!: string;

  @ApiProperty({
    description: 'Líneas del comprobante',
    type: [LineaComprobanteDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineaComprobanteDto)
  lineas!: LineaComprobanteDto[];

  @ApiPropertyOptional({
    description: 'Total débito (se recalcula si no se envía)',
  })
  @IsNumber()
  @IsOptional()
  totalDebito?: number;

  @ApiPropertyOptional({
    description: 'Total crédito (se recalcula si no se envía)',
  })
  @IsNumber()
  @IsOptional()
  totalCredito?: number;
}

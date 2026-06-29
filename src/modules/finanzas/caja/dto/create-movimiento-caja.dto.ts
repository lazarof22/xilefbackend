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
import { TipoMovimientoCaja, ConceptoCaja } from '../types/caja.types';

export class CreateMovimientoCajaDto {
  @ApiPropertyOptional({ description: 'ID de la cuenta de caja asociada' })
  @IsMongoId()
  @IsOptional()
  cajaId?: string;

  @ApiProperty({ description: 'Código único del movimiento' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ enum: TipoMovimientoCaja })
  @IsEnum(TipoMovimientoCaja)
  @IsNotEmpty()
  tipo!: TipoMovimientoCaja;

  @ApiProperty({ enum: ConceptoCaja })
  @IsEnum(ConceptoCaja)
  @IsNotEmpty()
  concepto!: ConceptoCaja;

  @ApiProperty({ description: 'Descripción del movimiento' })
  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @ApiProperty({ description: 'Monto' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  monto!: number;

  @ApiProperty({ description: 'Fecha del movimiento' })
  @IsDateString()
  @IsNotEmpty()
  fecha!: string;

  @ApiPropertyOptional({ description: 'Referencia (factura, recibo, etc.)' })
  @IsString()
  @IsOptional()
  referencia?: string;

  @ApiPropertyOptional({ description: 'Responsable' })
  @IsString()
  @IsOptional()
  responsable?: string;
}

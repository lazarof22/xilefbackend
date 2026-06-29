import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TipoExtracto } from '../types/conciliacion.types';

class PartidaExtractoDto {
  @ApiProperty({ description: 'Fecha del movimiento' })
  @IsNotEmpty()
  fecha!: Date;

  @ApiPropertyOptional({ description: 'Descripción del movimiento' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ description: 'Monto del movimiento' })
  @IsNumber()
  @IsNotEmpty()
  monto!: number;

  @ApiProperty({
    enum: TipoExtracto,
    description: 'Tipo de extracto (débito/crédito)',
  })
  @IsEnum(TipoExtracto)
  @IsNotEmpty()
  tipo!: TipoExtracto;

  @ApiPropertyOptional({ description: 'Número de referencia' })
  @IsString()
  @IsOptional()
  numeroReferencia?: string;
}

export class ImportarExtractoDto {
  @ApiProperty({
    type: [PartidaExtractoDto],
    description: 'Lista de partidas a importar',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PartidaExtractoDto)
  partidas!: PartidaExtractoDto[];
}

import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsMongoId,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoTasa } from '../types/tasa-cambio.types';

export class CreateTasaCambioDto {
  @ApiProperty({ description: 'ID de la moneda de origen' })
  @IsMongoId()
  @IsNotEmpty()
  monedaOrigen!: string;

  @ApiProperty({ description: 'ID de la moneda de destino' })
  @IsMongoId()
  @IsNotEmpty()
  monedaDestino!: string;

  @ApiProperty({ description: 'Tasa de cambio', minimum: 0 })
  @IsNumber()
  @Min(0)
  tasa!: number;

  @ApiProperty({ description: 'Fecha de la tasa' })
  @IsString()
  @IsNotEmpty()
  fecha!: string;

  @ApiProperty({ enum: TipoTasa, default: TipoTasa.OFICIAL, required: false })
  @IsEnum(TipoTasa)
  @IsOptional()
  tipo?: TipoTasa;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fuente?: string;
}

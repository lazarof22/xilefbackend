import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoCombustible } from '../types/combustible.types';

export class CreateVehiculoDto {
  @ApiProperty({ description: 'Código interno del vehículo' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ description: 'Placa del vehículo' })
  @IsString()
  @IsNotEmpty()
  placa!: string;

  @ApiProperty({ description: 'Marca' })
  @IsString()
  @IsNotEmpty()
  marca!: string;

  @ApiProperty({ description: 'Modelo' })
  @IsString()
  @IsNotEmpty()
  modelo!: string;

  @ApiProperty({ enum: TipoCombustible })
  @IsEnum(TipoCombustible)
  @IsNotEmpty()
  tipoCombustible!: TipoCombustible;

  @ApiPropertyOptional({ description: 'Consumo promedio (L/100km)' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  consumoPromedio?: number;
}

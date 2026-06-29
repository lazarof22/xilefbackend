import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoTarjeta } from '../types/combustible.types';

export class CreateTarjetaDto {
  @ApiProperty({ description: 'Número de tarjeta prepagada' })
  @IsString()
  @IsNotEmpty()
  numeroTarjeta!: string;

  @ApiProperty({ description: 'ID del vehículo asociado' })
  @IsMongoId()
  @IsNotEmpty()
  vehiculo!: string;

  @ApiPropertyOptional({ enum: EstadoTarjeta, default: EstadoTarjeta.ACTIVA })
  @IsEnum(EstadoTarjeta)
  @IsOptional()
  estado?: EstadoTarjeta;
}

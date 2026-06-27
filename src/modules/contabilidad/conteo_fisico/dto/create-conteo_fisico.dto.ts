import { IsString, IsNotEmpty, IsOptional, IsMongoId, IsDateString, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoConteo } from '../schema/conteo_fisico.schema';

export class CreateConteoFisicoDto {
  @ApiProperty({ description: 'Código único del conteo' })
  @IsString()
  @IsNotEmpty()
  codigoConteo!: string;

  @ApiProperty({ description: 'Fecha programada para el conteo' })
  @IsDateString()
  @IsNotEmpty()
  fechaProgramada!: string;

  @ApiPropertyOptional({ description: 'Fecha de realización' })
  @IsDateString()
  @IsOptional()
  fechaRealizacion?: string;

  @ApiPropertyOptional({ enum: EstadoConteo, default: EstadoConteo.PROGRAMADO })
  @IsEnum(EstadoConteo)
  @IsOptional()
  estado?: EstadoConteo;

  @ApiPropertyOptional({ description: 'ID del área a contar (vacío = toda la empresa)' })
  @IsMongoId()
  @IsOptional()
  area?: string;

  @ApiPropertyOptional({ description: 'Observaciones generales' })
  @IsString()
  @IsOptional()
  observaciones?: string;

  @ApiProperty({ description: 'Total de activos en el sistema' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  totalActivosSistema!: number;

  @ApiPropertyOptional({ description: 'Realizado por' })
  @IsString()
  @IsOptional()
  realizadoPor?: string;

  @ApiPropertyOptional({ description: 'Autorizado por' })
  @IsString()
  @IsOptional()
  autorizadoPor?: string;
}

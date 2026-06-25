import { IsString, IsNotEmpty, IsOptional, IsMongoId, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResultadoConteo } from '../schema/conteo_detalle.schema';

export class CreateConteoDetalleDto {
  @ApiProperty({ description: 'ID del conteo físico' })
  @IsMongoId()
  @IsNotEmpty()
  conteoFisico!: string;

  @ApiPropertyOptional({ description: 'ID del activo fijo (si aplica)' })
  @IsMongoId()
  @IsOptional()
  activoFijo?: string;

  @ApiPropertyOptional({ description: 'Código del activo en sistema' })
  @IsString()
  @IsOptional()
  codigoActivoSistema?: string;

  @ApiPropertyOptional({ description: 'Descripción del activo' })
  @IsString()
  @IsOptional()
  descripcionActivoSistema?: string;

  @ApiPropertyOptional({ description: 'Ubicación según sistema' })
  @IsString()
  @IsOptional()
  ubicacionSistema?: string;

  @ApiPropertyOptional({ description: 'Ubicación real encontrada' })
  @IsString()
  @IsOptional()
  ubicacionReal?: string;

  @ApiProperty({ enum: ResultadoConteo, description: 'Resultado del conteo para este activo' })
  @IsEnum(ResultadoConteo)
  @IsNotEmpty()
  resultado!: ResultadoConteo;

  @ApiPropertyOptional({ description: 'Observaciones del detalle' })
  @IsString()
  @IsOptional()
  observaciones?: string;

  @ApiProperty({ description: 'Cantidad según sistema' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  cantidadSistema!: number;

  @ApiPropertyOptional({ default: 1 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  cantidadReal?: number;
}

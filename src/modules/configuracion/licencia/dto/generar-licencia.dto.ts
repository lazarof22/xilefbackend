import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  Max,
  MaxLength,
  IsISO8601,
  IsObject,
  ValidateIf,
  Validate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LICENCIA_TIPOS, LicenciaTipo } from '../constants/licencia.constants';
import { MetadataSize } from './validators/metadata-size.validator';

export class GenerarLicenciaDto {
  @ApiProperty({
    description: 'Nombre de la empresa',
    example: 'Mi Empresa S.A.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200, {
    message: 'El nombre de la empresa no puede exceder 200 caracteres',
  })
  empresa_nombre!: string;

  @ApiProperty({
    description: 'ID fiscal de la empresa (RUC/NIT). Máx 64 caracteres.',
    example: '1234567890-1',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64, { message: 'empresa_id no puede exceder 64 caracteres' })
  empresa_id!: string;

  @ApiProperty({
    description: 'Tipo de licencia',
    enum: LICENCIA_TIPOS,
    example: 'suscripcion_anual',
  })
  @IsEnum(LICENCIA_TIPOS)
  tipo!: LicenciaTipo;

  @ApiPropertyOptional({
    description: 'Duración en días (ignorado si es perpetua)',
    example: 365,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3650)
  duracion_dias?: number;

  @ApiPropertyOptional({
    description: 'Máximo de usuarios (0 = ilimitado)',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  max_usuarios?: number;

  @ApiPropertyOptional({
    description: 'Fecha de inicio personalizada (ISO 8601 estricto)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsString()
  @IsISO8601(
    { strict: true },
    { message: 'fecha_inicio debe ser ISO 8601 válido' },
  )
  fecha_inicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de vencimiento personalizada (ISO 8601 estricto)',
    example: '2026-02-01',
  })
  @IsOptional()
  @IsString()
  @IsISO8601(
    { strict: true },
    { message: 'fecha_vencimiento debe ser ISO 8601 válido' },
  )
  fecha_vencimiento?: string;

  @ApiPropertyOptional({
    description: 'Metadatos adicionales (máx 4096 chars en JSON)',
  })
  @IsOptional()
  @IsObject()
  @ValidateIf((o) => o.metadata)
  @Validate(MetadataSize, [4096])
  metadata?: Record<string, unknown>;
}

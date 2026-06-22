import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LICENCIA_TIPOS, LicenciaTipo } from '../constants/licencia.constants';

export class GenerarLicenciaDto {
  @ApiProperty({
    description: 'Nombre de la empresa',
    example: 'Mi Empresa S.A.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: 'El nombre de la empresa no puede exceder 200 caracteres' })
  empresa_nombre!: string;

  @ApiProperty({
    description: 'ID fiscal de la empresa (RUC/NIT)',
    example: '1234567890-1',
  })
  @IsString()
  @IsNotEmpty()
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
    description: 'Fecha de inicio personalizada (ISO 8601)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsString()
  fecha_inicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de vencimiento personalizada (ISO 8601)',
    example: '2026-02-01',
  })
  @IsOptional()
  @IsString()
  fecha_vencimiento?: string;

  @ApiPropertyOptional({
    description: 'Metadatos adicionales',
  })
  @IsOptional()
  metadata?: Record<string, unknown>;
}

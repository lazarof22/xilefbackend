import {
  IsString,
  IsNotEmpty,
  Matches,
  MaxLength,
  IsObject,
  IsOptional,
  IsNumber,
  Min,
  IsISO8601,
  IsEnum,
  ValidateIf,
  Validate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MetadataSize } from './validators/metadata-size.validator';
import { LICENCIA_TIPOS, LicenciaTipo } from '../constants/licencia.constants';

export class ActivarLicenciaDto {
  @ApiProperty({
    description: 'Clave de activación en formato XILEF-XXXX-XXXX-XXXX-XXXX',
    example: 'XILEF-A1B2-C3D4-E5F6-F7A8',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^XILEF-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/, {
    message: 'Formato de clave inválido. Debe ser XILEF-XXXX-XXXX-XXXX-XXXX',
  })
  clave_activacion: string;

  @ApiPropertyOptional({
    description:
      'Nombre de la empresa (opcional - se toma del registro si no se envía)',
    example: 'Mi Empresa S.A.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, {
    message: 'El nombre de la empresa no puede exceder 200 caracteres',
  })
  empresa_nombre?: string;

  @ApiProperty({
    description:
      'ID fiscal de la empresa (obligatorio - forma parte del payload firmado). Máximo 64 caracteres.',
    example: '1234567890-1',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64, { message: 'empresa_id no puede exceder 64 caracteres' })
  empresa_id: string;

  @ApiProperty({
    description: 'Nonce único para prevenir replay attacks (obligatorio)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128, { message: 'nonce no puede exceder 128 caracteres' })
  nonce: string;

  @ApiProperty({
    description:
      'Fingerprint de hardware del dispositivo (obligatorio). Se persiste hasheado (SHA-256).',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128, { message: 'hardware_id no puede exceder 128 caracteres' })
  hardware_id: string;

  @ApiPropertyOptional({
    description: 'Metadatos adicionales (máx 4096 chars en JSON)',
  })
  @IsOptional()
  @IsObject()
  @ValidateIf((o) => o.metadata)
  @Validate(MetadataSize, [4096])
  metadata?: Record<string, unknown>;

  @ApiProperty({
    description: 'Tipo de licencia (forma parte del payload firmado)',
    enum: LICENCIA_TIPOS,
    example: 'suscripcion_anual',
  })
  @IsEnum(LICENCIA_TIPOS)
  tipo: LicenciaTipo;

  @ApiProperty({
    description:
      'Fecha de inicio (ISO 8601 estricto, parte del payload firmado)',
    example: '2026-01-01',
  })
  @IsString()
  @IsNotEmpty()
  @IsISO8601(
    { strict: true },
    { message: 'fecha_inicio debe ser ISO 8601 válido' },
  )
  fecha_inicio: string;

  @ApiProperty({
    description:
      'Fecha de vencimiento (ISO 8601 estricto, parte del payload firmado)',
    example: '2026-02-01',
  })
  @IsString()
  @IsNotEmpty()
  @IsISO8601(
    { strict: true },
    { message: 'fecha_vencimiento debe ser ISO 8601 válido' },
  )
  fecha_vencimiento: string;

  @ApiPropertyOptional({
    description:
      'Máximo de usuarios (0 = ilimitado). Parte del payload firmado.',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  max_usuarios?: number;

  @ApiProperty({
    description:
      'Firma Ed25519 de XILEF (hex, 128 chars) sobre el payload canónico v2',
    example: 'a'.repeat(128),
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9a-fA-F]{128}$/, {
    message: 'firma_ed25519 debe ser hex de 128 caracteres (64 bytes)',
  })
  firma_ed25519: string;
}

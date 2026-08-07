import {
  IsString,
  IsNotEmpty,
  Matches,
  MaxLength,
  IsObject,
  IsOptional,
  ValidateIf,
  Validate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MetadataSize } from './validators/metadata-size.validator';

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

  @ApiPropertyOptional({
    description:
      'ID fiscal de la empresa (opcional - se toma del registro si no se envía). Máximo 64 caracteres.',
    example: '1234567890-1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64, { message: 'empresa_id no puede exceder 64 caracteres' })
  empresa_id?: string;

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
}

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
    description: 'Nombre de la empresa (opcional - se toma del registro si no se envía)',
    example: 'Mi Empresa S.A.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'El nombre de la empresa no puede exceder 200 caracteres' })
  empresa_nombre?: string;

  @ApiPropertyOptional({
    description: 'ID fiscal de la empresa (opcional - se toma del registro si no se envía)',
    example: '1234567890-1',
  })
  @IsOptional()
  @IsString()
  empresa_id?: string;

  @ApiPropertyOptional({
    description: 'Nonce único para prevenir replay attacks',
  })
  @IsOptional()
  @IsString()
  nonce?: string;

  @ApiPropertyOptional({
    description: 'Fingerprint de hardware del dispositivo',
  })
  @IsOptional()
  @IsString()
  hardware_id?: string;
}

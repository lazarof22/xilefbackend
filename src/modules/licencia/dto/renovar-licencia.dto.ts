import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RenovarLicenciaDto {
  @ApiPropertyOptional({
    description: 'ID fiscal de la empresa',
    example: '1234567890-1',
  })
  @IsOptional()
  @IsString()
  empresa_id?: string;

  @ApiPropertyOptional({
    description: 'Clave de activación (alternativa a empresa_id)',
    example: 'XILEF-A1B2-C3D4-E5F6-F7A8',
  })
  @IsOptional()
  @IsString()
  clave_activacion?: string;

  @ApiPropertyOptional({
    description: 'Días a extender la licencia',
    example: 30,
    default: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3650)
  dias?: number;

  @ApiPropertyOptional({
    description: 'Fecha de vencimiento deseada (ISO 8601)',
    example: '2026-07-22',
  })
  @IsOptional()
  @IsString()
  fecha_vencimiento?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio (ISO 8601)',
    example: '2026-06-21',
  })
  @IsOptional()
  @IsString()
  fecha_inicio?: string;
}

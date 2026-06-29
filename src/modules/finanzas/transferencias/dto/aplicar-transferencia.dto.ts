import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AplicarTransferenciaDto {
  @ApiPropertyOptional({
    description:
      'Fecha de aplicación (si no se especifica, se usa la fecha actual)',
  })
  @IsDateString()
  @IsOptional()
  fechaAplicacion?: string;

  @ApiPropertyOptional({ description: 'Número de referencia o comprobante' })
  @IsString()
  @IsOptional()
  referencia?: string;
}

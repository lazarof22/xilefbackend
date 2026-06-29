import { IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MetodoAmortizacion } from '../types/credito.types';

export class GenerarAmortizacionDto {
  @ApiPropertyOptional({
    enum: MetodoAmortizacion,
    description: 'Sobrescribe el método de amortización del crédito',
  })
  @IsEnum(MetodoAmortizacion)
  @IsOptional()
  metodo?: MetodoAmortizacion;

  @ApiPropertyOptional({
    description: 'Forzar regeneración aunque ya existan cuotas',
  })
  @IsBoolean()
  @IsOptional()
  forzar?: boolean;
}

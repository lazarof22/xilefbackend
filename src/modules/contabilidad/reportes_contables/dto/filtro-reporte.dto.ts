import { IsDateString, IsMongoId, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FiltroReporteDto {
  @ApiPropertyOptional({ description: 'Fecha inicio (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({ description: 'Fecha fin (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({ description: 'ID de la cuenta (submayor)' })
  @IsOptional()
  @IsMongoId()
  cuentaId?: string;

  @ApiPropertyOptional({ description: 'ID del centro de costo (submayor)' })
  @IsOptional()
  @IsMongoId()
  centroCostoId?: string;
}

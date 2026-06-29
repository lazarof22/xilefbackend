import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RechazarLiquidacionDto {
  @ApiPropertyOptional({ description: 'Motivo del rechazo' })
  @IsString()
  @IsOptional()
  motivo?: string;
}

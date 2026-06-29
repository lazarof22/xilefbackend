import { IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReponerFondoFijoDto {
  @ApiPropertyOptional({
    description: 'Monto a reponer (si se omite, se calcula automáticamente)',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  monto?: number;

  @ApiPropertyOptional({ description: 'Referencia de la reposición' })
  @IsString()
  @IsOptional()
  referencia?: string;
}

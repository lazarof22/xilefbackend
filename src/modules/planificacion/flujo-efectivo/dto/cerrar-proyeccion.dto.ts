import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CerrarProyeccionDto {
  @ApiProperty({ description: 'Ingresos reales del periodo' })
  @IsNumber()
  @Min(0)
  ingresosReales!: number;

  @ApiProperty({ description: 'Egresos reales del periodo' })
  @IsNumber()
  @Min(0)
  egresosReales!: number;

  @ApiPropertyOptional({ description: 'Observaciones sobre el cierre' })
  @IsString()
  @IsOptional()
  observaciones?: string;
}

import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGrupoActivoDto {
  @ApiProperty({ description: 'Código único del grupo' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ description: 'Nombre del grupo' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiPropertyOptional({ description: 'Descripción del grupo' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ description: 'Vida útil mínima en años' })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  vidaUtilMinima!: number;

  @ApiProperty({ description: 'Vida útil máxima en años' })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  vidaUtilMaxima!: number;

  @ApiProperty({ description: 'Tasa de depreciación mínima anual (%)' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  tasaDepreciacionMinima!: number;

  @ApiProperty({ description: 'Tasa de depreciación máxima anual (%)' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  tasaDepreciacionMaxima!: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

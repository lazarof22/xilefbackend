import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RevaluacionActivoDto {
  @ApiProperty({ description: 'Fecha de la revaluación' })
  @IsString()
  @IsNotEmpty()
  fechaRevaluacion!: string;

  @ApiProperty({ description: 'Valor determinado por el avalúo' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  valorAvaluo!: number;

  @ApiProperty({ description: 'Nombre de la entidad avaluadora autorizada' })
  @IsString()
  @IsNotEmpty()
  entidadAvaluadora!: string;

  @ApiPropertyOptional({ description: 'Documento de respaldo del avalúo' })
  @IsString()
  @IsOptional()
  documentoRevaluacion?: string;
}

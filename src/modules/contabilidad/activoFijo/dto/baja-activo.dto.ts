import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BajaActivoDto {
  @ApiProperty({ description: 'Fecha de la baja' })
  @IsString()
  @IsNotEmpty()
  fechaBaja!: string;

  @ApiProperty({ description: 'Motivo de la baja' })
  @IsString()
  @IsNotEmpty()
  motivoBaja!: string;

  @ApiProperty({ description: 'Tipo de baja: venta, donacion, perdida, robo, obsolescencia, destruccion' })
  @IsString()
  @IsNotEmpty()
  tipoBaja!: string;

  @ApiProperty({ description: 'Valor recuperado en la baja (0 si no hay recuperación)' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  valorBaja!: number;

  @ApiPropertyOptional({ description: 'Documento de respaldo' })
  @IsString()
  @IsOptional()
  documentoBaja?: string;
}

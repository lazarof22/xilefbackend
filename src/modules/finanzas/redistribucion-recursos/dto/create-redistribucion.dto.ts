import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RedistribucionItemDto } from './redistribucion-item.dto';

export class CreateRedistribucionDto {
  @ApiProperty({ description: 'Código único de redistribución' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ description: 'Descripción de la redistribución' })
  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @ApiProperty({ description: 'Fecha de la redistribución' })
  @IsNotEmpty()
  fecha!: Date;

  @ApiProperty({
    type: [RedistribucionItemDto],
    description: 'Items de la redistribución (origen/destino)',
  })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => RedistribucionItemDto)
  items!: RedistribucionItemDto[];

  @ApiProperty({ description: 'Monto total a redistribuir' })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  montoTotal!: number;

  @ApiPropertyOptional({ description: 'Justificación de la redistribución' })
  @IsString()
  @IsOptional()
  justificacion?: string;
}

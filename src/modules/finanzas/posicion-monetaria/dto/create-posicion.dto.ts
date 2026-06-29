import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePosicionMonetariaDto {
  @ApiProperty({ description: 'Código único de la posición monetaria' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ description: 'Fecha de la posición' })
  @IsDateString()
  @IsNotEmpty()
  fecha!: string;

  @ApiPropertyOptional({ description: 'Observaciones' })
  @IsString()
  @IsOptional()
  observaciones?: string;
}

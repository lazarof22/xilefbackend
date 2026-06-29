import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsMongoId,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArqueoCajaDto {
  @ApiPropertyOptional({ description: 'ID de la cuenta de caja' })
  @IsMongoId()
  @IsOptional()
  cajaId?: string;
  @ApiProperty({ description: 'Total de efectivo contado físicamente' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  efectivoContado!: number;

  @ApiPropertyOptional({ description: 'Observaciones del arqueo' })
  @IsString()
  @IsOptional()
  observaciones?: string;

  @ApiPropertyOptional({ description: 'Realizado por' })
  @IsString()
  @IsOptional()
  realizadoPor?: string;
}

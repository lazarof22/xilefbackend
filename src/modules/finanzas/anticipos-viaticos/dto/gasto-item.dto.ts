import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsMongoId,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GastoItemDto {
  @ApiProperty({ description: 'Descripción del gasto' })
  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @ApiProperty({ description: 'Monto del gasto' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  monto!: number;

  @ApiProperty({ description: 'ID de la categoría (Concepto contable)' })
  @IsMongoId()
  @IsNotEmpty()
  categoria!: string;

  @ApiProperty({ description: 'Fecha del gasto' })
  @IsDateString()
  @IsNotEmpty()
  fecha!: string;
}

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsMongoId,
  ValidateNested,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GastoItemDto } from './gasto-item.dto';

export class CreateLiquidacionViaticoDto {
  @ApiProperty({ description: 'ID del anticipo a liquidar' })
  @IsMongoId()
  @IsNotEmpty()
  anticipo!: string;

  @ApiProperty({ description: 'Fecha de la liquidación' })
  @IsDateString()
  @IsNotEmpty()
  fecha!: string;

  @ApiProperty({ description: 'Monto total real gastado' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  gastoReal!: number;

  @ApiProperty({
    type: [GastoItemDto],
    description: 'Detalle de gastos realizados',
  })
  @ValidateNested({ each: true })
  @Type(() => GastoItemDto)
  @ArrayMinSize(1)
  detalleGastos!: GastoItemDto[];

  @ApiPropertyOptional({ description: 'Observaciones de la liquidación' })
  @IsString()
  @IsOptional()
  observaciones?: string;
}

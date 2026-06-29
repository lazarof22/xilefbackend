import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsMongoId,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCambioDivisaDto {
  @ApiProperty({ description: 'Código único de la operación de cambio' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ description: 'ID de la moneda de origen' })
  @IsMongoId()
  @IsNotEmpty()
  monedaOrigen!: string;

  @ApiProperty({ description: 'ID de la moneda de destino' })
  @IsMongoId()
  @IsNotEmpty()
  monedaDestino!: string;

  @ApiProperty({ description: 'Monto en moneda de origen' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  montoOrigen!: number;

  @ApiPropertyOptional({ description: 'ID de la cuenta bancaria de origen' })
  @IsMongoId()
  @IsOptional()
  cuentaOrigen?: string;

  @ApiPropertyOptional({ description: 'ID de la cuenta bancaria de destino' })
  @IsMongoId()
  @IsOptional()
  cuentaDestino?: string;

  @ApiPropertyOptional({ description: 'ID de la caja de origen' })
  @IsMongoId()
  @IsOptional()
  cajaOrigen?: string;

  @ApiPropertyOptional({ description: 'ID de la caja de destino' })
  @IsMongoId()
  @IsOptional()
  cajaDestino?: string;

  @ApiPropertyOptional({ description: 'Descripción de la operación' })
  @IsString()
  @IsOptional()
  descripcion?: string;
}

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  IsMongoId,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoAnticipo } from '../types/anticipos-viaticos.types';

export class CreateAnticipoDto {
  @ApiProperty({ description: 'Código único del anticipo' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ enum: TipoAnticipo })
  @IsEnum(TipoAnticipo)
  @IsNotEmpty()
  tipo!: TipoAnticipo;

  @ApiProperty({ description: 'ID del empleado beneficiario' })
  @IsMongoId()
  @IsNotEmpty()
  beneficiario!: string;

  @ApiProperty({ description: 'Monto del anticipo' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  monto!: number;

  @ApiProperty({ description: 'Fecha del anticipo' })
  @IsDateString()
  @IsNotEmpty()
  fecha!: string;

  @ApiPropertyOptional({ description: 'ID de la caja de origen' })
  @IsMongoId()
  @IsOptional()
  cajaOrigen?: string;

  @ApiPropertyOptional({ description: 'ID de la cuenta bancaria de origen' })
  @IsMongoId()
  @IsOptional()
  cuentaBancariaOrigen?: string;

  @ApiPropertyOptional({ description: 'Descripción del anticipo' })
  @IsString()
  @IsOptional()
  descripcion?: string;
}

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsMongoId,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoCheque } from '../types/cheque.types';
export class CreateChequeDto {
  @ApiProperty({ description: 'Número de cheque' })
  @IsString()
  @IsNotEmpty()
  numeroCheque!: string;
  @ApiProperty({ enum: TipoCheque })
  @IsEnum(TipoCheque)
  @IsNotEmpty()
  tipo!: TipoCheque;
  @ApiProperty({ description: 'Beneficiario' })
  @IsString()
  @IsNotEmpty()
  beneficiario!: string;
  @ApiProperty({ description: 'ID de la cuenta bancaria' })
  @IsMongoId()
  @IsNotEmpty()
  cuentaBancaria!: string;
  @ApiProperty({ description: 'Monto' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  monto!: number;
  @ApiProperty({ description: 'Fecha de emisión' })
  @IsDateString()
  @IsNotEmpty()
  fechaEmision!: string;
  @ApiPropertyOptional({ description: 'Concepto' })
  @IsString()
  @IsOptional()
  concepto?: string;
}

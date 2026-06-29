import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConciliacionDto {
  @ApiProperty({ description: 'Código único de conciliación' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ description: 'ID de la cuenta bancaria' })
  @IsMongoId()
  @IsNotEmpty()
  cuentaBancaria!: string;

  @ApiProperty({ description: 'Período (MM-YYYY)' })
  @IsString()
  @IsNotEmpty()
  periodo!: string;

  @ApiProperty({ description: 'Saldo según banco' })
  @IsNumber()
  @IsNotEmpty()
  saldoBanco!: number;

  @ApiProperty({ description: 'Saldo según libros' })
  @IsNumber()
  @IsNotEmpty()
  saldoLibros!: number;

  @ApiPropertyOptional({ description: 'Observaciones' })
  @IsString()
  @IsOptional()
  observaciones?: string;
}

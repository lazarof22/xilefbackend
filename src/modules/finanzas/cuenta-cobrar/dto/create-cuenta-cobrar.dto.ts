import { IsString, IsNotEmpty, IsOptional, IsNumber, IsMongoId, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCuentaCobrarDto {
  @ApiProperty({ description: 'Código único de la cuenta por cobrar' })
  @IsString() @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ description: 'ID del cliente' })
  @IsMongoId() @IsNotEmpty()
  cliente!: string;

  @ApiProperty({ description: 'ID del concepto contable' })
  @IsMongoId() @IsNotEmpty()
  concepto!: string;

  @ApiProperty({ description: 'Monto original de la deuda' })
  @IsNumber() @IsNotEmpty() @Min(0)
  montoOriginal!: number;

  @ApiProperty({ description: 'Fecha de emisión' })
  @IsDateString() @IsNotEmpty()
  fechaEmision!: string;

  @ApiProperty({ description: 'Fecha de vencimiento' })
  @IsDateString() @IsNotEmpty()
  fechaVencimiento!: string;

  @ApiPropertyOptional({ description: 'Notas u observaciones' })
  @IsString() @IsOptional()
  notas?: string;
}

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
import {
  TipoCredito,
  MetodoAmortizacion,
  PeriodicidadCuota,
} from '../types/credito.types';

export class CreateCreditoDto {
  @ApiProperty({ description: 'Código del crédito' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;
  @ApiProperty({ description: 'ID del banco' })
  @IsMongoId()
  @IsNotEmpty()
  banco!: string;
  @ApiProperty({ enum: TipoCredito })
  @IsEnum(TipoCredito)
  @IsNotEmpty()
  tipo!: TipoCredito;
  @ApiProperty({ description: 'Monto solicitado' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  montoSolicitado!: number;
  @ApiProperty({ description: 'Tasa interés anual %' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  tasaInteres!: number;
  @ApiProperty({ description: 'Plazo en meses' })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  plazoMeses!: number;
  @ApiProperty({ description: 'Fecha de solicitud' })
  @IsDateString()
  @IsNotEmpty()
  fechaSolicitud!: string;
  @ApiPropertyOptional({ description: 'Garantía' })
  @IsString()
  @IsOptional()
  garantia?: string;
  @ApiPropertyOptional({
    enum: MetodoAmortizacion,
    description: 'Método de amortización',
  })
  @IsEnum(MetodoAmortizacion)
  @IsOptional()
  metodoAmortizacion?: MetodoAmortizacion;
  @ApiPropertyOptional({
    enum: PeriodicidadCuota,
    description: 'Periodicidad de cuotas',
  })
  @IsEnum(PeriodicidadCuota)
  @IsOptional()
  periodicidadCuota?: PeriodicidadCuota;
}

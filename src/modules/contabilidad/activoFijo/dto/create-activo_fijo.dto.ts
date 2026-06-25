import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsDateString,
  IsNumber,
  IsEnum,
  Min,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MetodoDepreciacion } from '../schema/activo_fijo.schema';

export class CreateActivoFijoDto {
  @ApiProperty({ description: 'Código único del activo fijo' })
  @IsString()
  @IsNotEmpty()
  codigoActivo!: string;

  @ApiProperty({ description: 'Descripción del activo' })
  @IsString()
  @IsNotEmpty()
  descripcionActivo!: string;

  @ApiPropertyOptional({ description: 'Marca del activo' })
  @IsString()
  @IsOptional()
  marca?: string;

  @ApiPropertyOptional({ description: 'Modelo del activo' })
  @IsString()
  @IsOptional()
  modelo?: string;

  @ApiPropertyOptional({ description: 'Número de serie' })
  @IsString()
  @IsOptional()
  numeroSerie?: string;

  @ApiProperty({ description: 'ID del proveedor (Empresa)' })
  @IsMongoId()
  @IsNotEmpty()
  proveedor!: string;

  @ApiProperty({ description: 'ID del área/ubicación' })
  @IsMongoId()
  @IsNotEmpty()
  area!: string;

  @ApiPropertyOptional({ description: 'ID del grupo/categoría del activo' })
  @IsMongoId()
  @IsOptional()
  grupoActivo?: string;

  @ApiProperty({ description: 'Fecha de compra' })
  @IsDateString()
  @IsNotEmpty()
  fechaCompra!: string;

  @ApiPropertyOptional({ description: 'Fecha de puesta en marcha' })
  @IsDateString()
  @IsOptional()
  fechaPuestaMarcha?: string;

  @ApiProperty({ description: 'Valor de adquisición' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  valorAdquisicion!: number;

  @ApiProperty({ description: 'Valor residual' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  valorResidual!: number;

  @ApiProperty({ description: 'Vida útil en años' })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  vidaUtil!: number;

  @ApiProperty({ description: 'ID de la tasa de depreciación' })
  @IsMongoId()
  @IsNotEmpty()
  tasaDepreciacion!: string;

  @ApiProperty({
    enum: MetodoDepreciacion,
    default: MetodoDepreciacion.LINEA_RECTA,
  })
  @IsEnum(MetodoDepreciacion)
  @IsOptional()
  metodoDepreciacion?: MetodoDepreciacion;

  @ApiProperty({ description: 'ID de la moneda' })
  @IsMongoId()
  @IsNotEmpty()
  moneda!: string;

  @ApiPropertyOptional({ description: 'ID del país' })
  @IsMongoId()
  @IsOptional()
  pais?: string;

  @ApiPropertyOptional({ description: 'ID del concepto contable' })
  @IsMongoId()
  @IsOptional()
  concepto?: string;

  @ApiProperty({ description: 'ID del estado del activo' })
  @IsMongoId()
  @IsNotEmpty()
  estadoActivo!: string;

  @ApiPropertyOptional({ description: 'ID de la cuenta contable (debe)' })
  @IsMongoId()
  @IsOptional()
  cuentaDebe?: string;

  @ApiPropertyOptional({ description: 'ID de la cuenta contable (haber)' })
  @IsMongoId()
  @IsOptional()
  cuentaHaber?: string;

  @ApiPropertyOptional({
    description: 'ID de la cuenta de depreciación acumulada',
  })
  @IsMongoId()
  @IsOptional()
  cuentaDepreciacion?: string;

  @ApiPropertyOptional({ description: 'Número de factura' })
  @IsString()
  @IsOptional()
  numeroFactura?: string;

  @ApiPropertyOptional({ description: 'Orden de compra' })
  @IsString()
  @IsOptional()
  ordenCompra?: string;

  @ApiPropertyOptional({ description: 'Observaciones' })
  @IsString()
  @IsOptional()
  observaciones?: string;

  @ApiPropertyOptional({ description: 'Ajuste de valor' })
  @IsNumber()
  @IsOptional()
  ajusteValor?: number;

  @ApiPropertyOptional({ description: 'Activo o inactivo' })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

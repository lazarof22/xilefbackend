import { Type } from 'class-transformer';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { TipoCliente } from '../schema/pago_efectivo.schema';

export class DesgloseBilletesDto {
  @IsNumber()
  @IsOptional()
  billete5000?: number = 0;

  @IsNumber()
  @IsOptional()
  billete2000?: number = 0;

  @IsNumber()
  @IsOptional()
  billete1000?: number = 0;

  @IsNumber()
  @IsOptional()
  billete500?: number = 0;

  @IsNumber()
  @IsOptional()
  billete200?: number = 0;

  @IsNumber()
  @IsOptional()
  billete100?: number = 0;

  @IsNumber()
  @IsOptional()
  billete50?: number = 0;

  @IsNumber()
  @IsOptional()
  billete20?: number = 0;

  @IsNumber()
  @IsOptional()
  billete10?: number = 0;

  @IsNumber()
  @IsOptional()
  billete5?: number = 0;

  @IsNumber()
  @IsOptional()
  billete3?: number = 0;

  @IsNumber()
  @IsOptional()
  billete1?: number = 0;
}

export class PagoBaseDto {
  @IsEnum(['efectivo', 'transferencia', 'credito'])
  @IsOptional()
  metodoPago?: string;
}

export class DatosClienteDescuentoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  ci!: string;

  @IsString()
  @IsNotEmpty()
  telefono!: string;
}

export class CreatePagoEfectivoDto extends PagoBaseDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => DesgloseBilletesDto)
  desglose?: DesgloseBilletesDto;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  monto_pagar_CUP?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  monto_pagar_alCambio?: number;

  // Contrato del frontend (PagoEfectivoDialog / ventaService)
  @IsNumber()
  @Min(0)
  @IsOptional()
  monto_pagar?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cambio?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  monto_pagado?: number;

  @IsOptional()
  @IsMongoId()
  @IsString()
  moneda?: string;

  @IsOptional()
  @IsEnum(TipoCliente)
  cliente?: TipoCliente; // cliente-estandar | cliente-por-descuento | cliente-cuenta-casa

  @IsOptional()
  @ValidateNested()
  @Type(() => DatosClienteDescuentoDto)
  datosClienteDescuento?: DatosClienteDescuentoDto; // Solo si cliente = cliente-por-descuento
}

export class CreatePagoTransferenciaDto extends PagoBaseDto {
  @IsString()
  @IsOptional()
  numeroCuenta?: string;

  @IsString()
  @IsOptional()
  banco?: string;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  montoPagar?: number;

  @IsMongoId()
  @IsOptional()
  clienteId?: string;

  // Compatibilidad con el contrato de ventaService (crearPagoTransferencia)
  @IsNumber()
  @Min(0)
  @IsOptional()
  monto_pagado?: number;

  @IsString()
  @IsOptional()
  ciCliente?: string;

  @IsString()
  @IsOptional()
  nombreCliente?: string;

  @IsString()
  @IsOptional()
  referenciaPago?: string;
}

export class CreatePagoCreditoDto extends PagoBaseDto {
  @IsMongoId()
  @IsOptional()
  @IsString()
  clienteId?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  monto_pagar?: number;
}

export class CreatePagoDto extends PagoBaseDto {}

import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
  ValidateNested,
} from 'class-validator';
import { VentaTipoPago } from '../schema/venta.schema';


class ItemVentaDto {
  @IsMongoId()
  @IsNotEmpty()
  productoId: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  cantidad: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  descuentoMonto: number = 0;
}

export class CreateVentaDto {
  @IsMongoId()
  @IsNotEmpty()
  clienteId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemVentaDto)
  productos: ItemVentaDto[];

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  subtotal_venta: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  descuento_total: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  efectivo_pagado: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  cambio_devuelto: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  impuesto: number;

  @IsEnum(VentaTipoPago)
  tipo_pago: VentaTipoPago;
}

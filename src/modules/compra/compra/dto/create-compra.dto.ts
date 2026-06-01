import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsMongoId, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Pago, Compra } from '../schema/compra.schema';

class ItemCompraDto {
	@IsMongoId()
	productoId!: string;

	@IsNumber()
	cantidad!: number;

	@IsNumber()
	precioCompra!: number;
}

export class CreateCompraDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ItemCompraDto)
	productos!: ItemCompraDto[];

	@IsNumber()
	subtotalCompra!: number;

	@IsNumber()
	descuentoTotal!: number;

	@IsMongoId()
	moneda!: string;

	@IsMongoId()
	empresa!: string;

	@IsEnum(Pago)
	modoPago!: Pago;

	@IsOptional()
	@IsNumber()
	tasaBancoCentral?: number;

	@IsOptional()
	@IsNumber()
	tasaBancoInformal?: number;

	@IsOptional()
	@IsNumber()
	fluctuacion?: number;

	@IsOptional()
	@IsNumber()
	recargo?: number;
}

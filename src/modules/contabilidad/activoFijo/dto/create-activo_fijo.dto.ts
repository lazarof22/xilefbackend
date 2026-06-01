import { IsString, IsNotEmpty, IsNumber, IsOptional, IsMongoId, IsDateString, IsEnum } from 'class-validator';
import { MovimientoActivoFijo } from '../schema/activo_fijo.schema';

export class CreateActivoFijoDto {
	@IsString()
	@IsNotEmpty()
	codigoActivo!: string;

	@IsString()
	@IsNotEmpty()
	descripcionActivo!: string;

	@IsMongoId()
	@IsOptional()
	area?: string;

	@IsDateString()
	@IsOptional()
	fechaCompra?: string;

	@IsNumber()
	@IsNotEmpty()
	valor!: number;

	@IsMongoId()
	@IsOptional()
	depreciacionActivo?: string;

	@IsString()
	@IsOptional()
	compra?: string;

	@IsNumber()
	@IsOptional()
	ajusteValor?: number;

	@IsEnum(MovimientoActivoFijo)
	@IsOptional()
	movimiento?: MovimientoActivoFijo;

	@IsMongoId()
	@IsOptional()
	estadoActivo?: string;
}

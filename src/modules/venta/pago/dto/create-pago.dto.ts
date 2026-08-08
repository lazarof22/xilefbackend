import { Type } from "class-transformer";
import { IsEnum, IsIn, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min, ValidateNested } from "class-validator";
import { TipoCliente } from "../schema/pago_efectivo.schema";

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
    @ValidateNested()
    @Type(() => DesgloseBilletesDto)
    desglose!: DesgloseBilletesDto;

    @IsNumber()
    @IsPositive()
    monto_pagar_CUP!: number;

    @IsNumber()
    @IsPositive()
    monto_pagar_alCambio!: number;

    @IsNumber()
    @IsPositive()
    cambio!: number;

    @IsNumber()
    @IsPositive()
    monto_pagado!: number;

    @IsMongoId()
    @IsString()
    moneda!: string;

    @IsEnum(TipoCliente)
    cliente!: TipoCliente; // cliente-estandar | cliente-por-descuento | cliente-cuenta-casa

    @IsOptional()
    @ValidateNested()
    @Type(() => DatosClienteDescuentoDto)
    datosClienteDescuento?: DatosClienteDescuentoDto; // Solo si cliente = cliente-por-descuento
}

export class CreatePagoTransferenciaDto extends PagoBaseDto {

    @IsString()
    @IsNotEmpty()
    numeroCuenta!: string;

    @IsNumber()
    @IsPositive()
    montoPagar!: number;
}

export class CreatePagoCreditoDto extends PagoBaseDto {

    @IsMongoId()
    @IsString()
    clienteId!: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    monto_pagar?: number;

}

export class CreatePagoDto extends PagoBaseDto {

}

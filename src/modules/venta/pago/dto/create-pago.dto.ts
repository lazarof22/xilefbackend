import { Type } from "class-transformer";
import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min, ValidateNested } from "class-validator";

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
    metodoPago!: string;
}

export class CreatePagoEfectivoDto extends PagoBaseDto {
    @ValidateNested()
    @Type(() => DesgloseBilletesDto)
    desglose!: DesgloseBilletesDto;

    @IsNumber()
    @IsPositive()
    monto_pagar!: number;

    @IsNumber()
    @IsPositive()
    cambio!: number;

    @IsNumber()
    @IsPositive()
    monto_pagado!: number;
    
}

export class CreatePagoTransferenciaDto extends PagoBaseDto {
    @IsString()
    @IsNotEmpty()
    ciCliente!:string;

    @IsString()
    @IsNotEmpty()
    nombreCliente!:string;

    @IsString()
    @IsNotEmpty()
    referenciaPago!:string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    monto_pagar?: number;

    @IsNumber()
    @IsPositive()
    monto_pagado!: number;
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

import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateProductoDto {

    @IsString()
    @IsNotEmpty()
    codigo_producto: string;

    @IsString()
    @IsNotEmpty()
    nombre_producto: string;

    @IsString()
    @IsNotEmpty()
    categoria_producto: string;

    @IsString()
    @IsNotEmpty()
    @IsNumber()
    precio_compra: number;

    @IsString()
    @IsNotEmpty()
    @IsNumber()
    precio_venta: number;

    @IsString()
    @IsNotEmpty()
    @IsNumber()
    stock_inicial: number;

    @IsString()
    @IsNotEmpty()
    @IsNumber()
    stock_minimo: number;

    @IsString()
    @IsNotEmpty()
    estado: string;
}

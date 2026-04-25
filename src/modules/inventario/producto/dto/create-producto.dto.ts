import { IsMongoId, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateProductoDto {

    @IsString()
    @IsNotEmpty()
    codigo_producto!: string;

    @IsString()
    @IsNotEmpty()
    nombre_producto!: string;

    @IsMongoId()
    @IsNotEmpty()
    categoria_producto!: string;


    @IsNotEmpty()
    @IsNumber()
    precio_compra!: number;


    @IsNotEmpty()
    @IsNumber()
    precio_venta!: number;


    @IsNotEmpty()
    @IsNumber()
    stock_inicial!: number;


    @IsNotEmpty()
    @IsNumber()
    stock_minimo!: number;

    @IsMongoId()
    @IsNotEmpty()
    estado!: string;
}

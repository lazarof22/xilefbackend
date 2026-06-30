import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";

export class CreateProductoDto {

    @IsString()
    @IsNotEmpty()
    codigo_producto!: string;

    @IsString()
    @IsNotEmpty()
    nombre_producto!: string;

    @IsMongoId()
    @IsNotEmpty()
    categoria_producto!: Types.ObjectId;


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
    estado!: Types.ObjectId;

    @IsOptional()
    @IsMongoId()
    almacen?: Types.ObjectId;

    @IsOptional()
    @IsMongoId()
    contenedor?: Types.ObjectId;
}

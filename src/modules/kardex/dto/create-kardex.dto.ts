import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsNumber, ValidateNested, IsDate, IsEnum } from "class-validator";
import { CreateProductoDto } from "src/modules/producto/dto/create-producto.dto";
import { KardexTipo } from "../schema/kardex.schema";



export class CreateKardexDto {


    @IsString()
    @IsNotEmpty()
    productoId: string;

    @IsDate()
    fecha?: Date;

    @IsEnum(KardexTipo)
    tipo: KardexTipo;

    @IsNotEmpty()
    @IsNumber()
    cantidad: number;


    @IsNotEmpty()
    @IsString()
    motivo: string;



}

import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsNumber, ValidateNested, IsDate, IsEnum, IsMongoId, IsPositive } from "class-validator";
import { KardexTipo } from "../schema/kardex.schema";



export class CreateKardexDto {


    @IsMongoId()
    @IsNotEmpty()
    productoId!: string;

    @IsDate()
    fecha?: Date;

    @IsEnum(KardexTipo)
    tipo!: KardexTipo;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    cantidad!: number;


    @IsNotEmpty()
    @IsString()
    motivo!: string;



}

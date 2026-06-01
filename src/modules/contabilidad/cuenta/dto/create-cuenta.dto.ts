import { IsMongoId, IsNotEmpty, IsString } from "class-validator";
import { Types } from "mongoose";

export class CreateCuentaDto {

    @IsString()
    @IsNotEmpty()
    codigoCuenta!: string;

    @IsString()
    @IsNotEmpty()
    nombreCuenta!: string;

    @IsString()
    @IsNotEmpty()
    tipoCuenta!: string;

    @IsString()
    @IsNotEmpty()
    naturalezaCuenta!: string;

    @IsMongoId()
    @IsNotEmpty()
    estado!: Types.ObjectId;
}



import { IsEmail, IsNotEmpty, isNotEmpty, IsString, isString } from "class-validator";

export class CreateClienteDto {

    @IsString()
    @IsNotEmpty()
    id_cliente: string;

    @IsString()
    @IsNotEmpty()
    nombre_cliente: string;

    @IsString()
    @IsNotEmpty()
    telefono_cliente: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email_cliente: string;

    @IsString()
    @IsNotEmpty()
    direccion_cliente: string;

    @IsString()
    @IsNotEmpty()
    tipo_cliente: string;
}

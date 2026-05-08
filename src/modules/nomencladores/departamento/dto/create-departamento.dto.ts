import { Prop } from "@nestjs/mongoose";
import { IsNotEmpty, IsString } from "class-validator";


export class CreateDepartamentoDto {

    @IsString()
    @IsNotEmpty()
    nombre_departamento! : string;
    
}

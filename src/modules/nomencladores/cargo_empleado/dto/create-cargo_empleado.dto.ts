import { IsNotEmpty, IsString } from "class-validator";

export class CreateCargoEmpleadoDto {

    @IsString()
    @IsNotEmpty()
    nombre_cargo! : string;
}

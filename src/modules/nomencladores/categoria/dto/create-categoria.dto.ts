import { IsNotEmpty, IsString } from "class-validator";

export class CreateCategoriaDto {

    @IsString()
    @IsNotEmpty()
    nombre_categoria!: string;

}

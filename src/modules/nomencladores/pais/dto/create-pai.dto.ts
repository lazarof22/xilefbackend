import { IsNotEmpty, IsString } from "class-validator";

export class CreatePaiDto {

    @IsString()
    @IsNotEmpty()
    nombrePais!: string;
}

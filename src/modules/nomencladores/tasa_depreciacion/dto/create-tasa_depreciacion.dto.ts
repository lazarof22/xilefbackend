import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateTasaDepreciacionDto {

    @IsString()
    @IsNumber()
    tasa_depreciacion!:number
}

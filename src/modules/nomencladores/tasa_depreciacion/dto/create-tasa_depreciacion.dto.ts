import { IsNotEmpty, IsNumber, Min, Max } from "class-validator";

export class CreateTasaDepreciacionDto {

    @IsNumber()
    @Min(0)
    @Max(100)
    tasa_depreciacion!:number
}

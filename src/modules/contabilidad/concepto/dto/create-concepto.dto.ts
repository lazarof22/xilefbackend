import { IsNotEmpty, IsString } from "class-validator";

export class CreateConceptoDto {

    @IsNotEmpty()
    @IsString()
    nombreConcepto!: string;
}

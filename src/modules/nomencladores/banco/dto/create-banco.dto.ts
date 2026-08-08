import { IsNotEmpty, IsString } from "class-validator";

export class CreateBancoDto {

    @IsString()
        @IsNotEmpty()
        nombreBanco!: string;
}

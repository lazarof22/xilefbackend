import { IsNotEmpty, IsString } from "class-validator";


export class CreateEstadoDto {


  @IsString()
  @IsNotEmpty()
  estado!: string;
}

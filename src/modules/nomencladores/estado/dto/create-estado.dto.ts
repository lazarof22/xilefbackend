import { IsEnum } from "class-validator";
import { EstadoTipo } from "../schema/estado.schema";

export class CreateEstadoDto {
      @IsEnum(EstadoTipo)
        estado!: EstadoTipo;
}

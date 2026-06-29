import { PartialType } from '@nestjs/swagger';
import { CreatePosicionMonetariaDto } from './create-posicion.dto';

export class UpdatePosicionMonetariaDto extends PartialType(
  CreatePosicionMonetariaDto,
) {}

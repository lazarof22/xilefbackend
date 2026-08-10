import { PartialType } from '@nestjs/swagger';
import { CreateGastoIndirectoDto } from './create-gasto-indirecto.dto';

export class UpdateGastoIndirectoDto extends PartialType(
  CreateGastoIndirectoDto,
) {}

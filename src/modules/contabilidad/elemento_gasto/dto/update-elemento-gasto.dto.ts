import { PartialType } from '@nestjs/swagger';
import { CreateElementoGastoDto } from './create-elemento-gasto.dto';

export class UpdateElementoGastoDto extends PartialType(
  CreateElementoGastoDto,
) {}

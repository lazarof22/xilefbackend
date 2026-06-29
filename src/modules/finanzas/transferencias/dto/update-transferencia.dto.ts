import { PartialType } from '@nestjs/swagger';
import { CreateTransferenciaDto } from './create-transferencia.dto';

export class UpdateTransferenciaDto extends PartialType(
  CreateTransferenciaDto,
) {}

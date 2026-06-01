import { PartialType } from '@nestjs/swagger';
import { CreateCuentaDto } from './create-cuenta.dto';

export class UpdateCuentaDto extends PartialType(CreateCuentaDto) {}

import { PartialType } from '@nestjs/swagger';
import { CreateCuentaCajaDto } from './create-cuenta-caja.dto';

export class UpdateCuentaCajaDto extends PartialType(CreateCuentaCajaDto) {}

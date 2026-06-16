import { PartialType } from '@nestjs/swagger';
import { CreateMovimientoDto } from './create-movimiento.dto';

export class UpdateMovimientoDto extends PartialType(CreateMovimientoDto) {}

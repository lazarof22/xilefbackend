import { PartialType } from '@nestjs/swagger';
import { CreateActivoFijoDto } from './create-activo_fijo.dto';

export class UpdateActivoFijoDto extends PartialType(CreateActivoFijoDto) {}

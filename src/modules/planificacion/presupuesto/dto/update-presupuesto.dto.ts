import { PartialType } from '@nestjs/swagger';
import { CreatePresupuestoDto } from './create-presupuesto.dto';

export class UpdatePresupuestoDto extends PartialType(CreatePresupuestoDto) {}

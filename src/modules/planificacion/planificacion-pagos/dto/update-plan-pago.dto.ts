import { PartialType } from '@nestjs/swagger';
import { CreatePlanPagoDto } from './create-plan-pago.dto';

export class UpdatePlanPagoDto extends PartialType(CreatePlanPagoDto) {}

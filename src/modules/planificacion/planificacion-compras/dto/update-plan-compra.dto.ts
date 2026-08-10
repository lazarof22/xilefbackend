import { PartialType } from '@nestjs/swagger';
import { CreatePlanCompraDto } from './create-plan-compra.dto';

export class UpdatePlanCompraDto extends PartialType(CreatePlanCompraDto) {}

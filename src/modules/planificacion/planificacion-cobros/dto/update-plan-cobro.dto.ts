import { PartialType } from '@nestjs/swagger';
import { CreatePlanCobroDto } from './create-plan-cobro.dto';

export class UpdatePlanCobroDto extends PartialType(CreatePlanCobroDto) {}

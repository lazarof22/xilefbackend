import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanCuentaDto } from './create-plan_cuenta.dto';

export class UpdatePlanCuentaDto extends PartialType(CreatePlanCuentaDto) {}

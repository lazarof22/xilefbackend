import { PartialType } from '@nestjs/swagger';
import { CreateOperacionFinancieraDto } from './create-operacion-financiera.dto';

export class UpdateOperacionFinancieraDto extends PartialType(
  CreateOperacionFinancieraDto,
) {}

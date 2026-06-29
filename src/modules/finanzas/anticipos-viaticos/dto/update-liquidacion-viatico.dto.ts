import { PartialType } from '@nestjs/swagger';
import { CreateLiquidacionViaticoDto } from './create-liquidacion-viatico.dto';

export class UpdateLiquidacionViaticoDto extends PartialType(
  CreateLiquidacionViaticoDto,
) {}

import { PartialType } from '@nestjs/swagger';
import { CreateClasificacionIGDto } from './create-clasificacion-ig.dto';

export class UpdateClasificacionIGDto extends PartialType(
  CreateClasificacionIGDto,
) {}

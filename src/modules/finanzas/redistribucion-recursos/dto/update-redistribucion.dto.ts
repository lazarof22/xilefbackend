import { PartialType } from '@nestjs/swagger';
import { CreateRedistribucionDto } from './create-redistribucion.dto';

export class UpdateRedistribucionDto extends PartialType(
  CreateRedistribucionDto,
) {}

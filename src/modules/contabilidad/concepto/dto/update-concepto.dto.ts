import { PartialType } from '@nestjs/swagger';
import { CreateConceptoDto } from './create-concepto.dto';

export class UpdateConceptoDto extends PartialType(CreateConceptoDto) {}

import { PartialType } from '@nestjs/swagger';
import { CreateConciliacionDto } from './create-conciliacion.dto';

export class UpdateConciliacionDto extends PartialType(CreateConciliacionDto) {}

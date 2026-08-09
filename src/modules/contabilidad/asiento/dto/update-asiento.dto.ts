import { PartialType } from '@nestjs/swagger';
import { CreateAsientoDto } from './create-asiento.dto';

export class UpdateAsientoDto extends PartialType(CreateAsientoDto) {}

import { PartialType } from '@nestjs/swagger';
import { CreateCuentaCobrarDto } from './create-cuenta-cobrar.dto';

export class UpdateCuentaCobrarDto extends PartialType(CreateCuentaCobrarDto) {}

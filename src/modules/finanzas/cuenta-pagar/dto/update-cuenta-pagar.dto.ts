import { PartialType } from '@nestjs/swagger';
import { CreateCuentaPagarDto } from './create-cuenta-pagar.dto';

export class UpdateCuentaPagarDto extends PartialType(CreateCuentaPagarDto) {}

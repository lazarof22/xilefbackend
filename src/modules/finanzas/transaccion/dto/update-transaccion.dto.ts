import { PartialType } from '@nestjs/swagger';
import { CreateTransaccionDto } from './create-transaccion.dto';

export class UpdateTransaccionDto extends PartialType(CreateTransaccionDto) {}

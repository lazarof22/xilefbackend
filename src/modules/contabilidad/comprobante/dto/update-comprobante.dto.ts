import { PartialType } from '@nestjs/swagger';
import { CreateComprobanteDto } from './create-comprobante.dto';

export class UpdateComprobanteDto extends PartialType(CreateComprobanteDto) {}

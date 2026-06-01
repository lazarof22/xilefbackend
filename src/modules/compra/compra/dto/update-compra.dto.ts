import { PartialType } from '@nestjs/swagger';
import { CreateCompraDto } from './create-compra.dto';

export class UpdateCompraDto extends PartialType(CreateCompraDto) {}

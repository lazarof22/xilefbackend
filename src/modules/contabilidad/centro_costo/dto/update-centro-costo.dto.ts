import { PartialType } from '@nestjs/swagger';
import { CreateCentroCostoDto } from './create-centro-costo.dto';

export class UpdateCentroCostoDto extends PartialType(CreateCentroCostoDto) {}

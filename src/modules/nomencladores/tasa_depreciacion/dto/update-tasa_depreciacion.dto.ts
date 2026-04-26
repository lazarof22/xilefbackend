import { PartialType } from '@nestjs/mapped-types';
import { CreateTasaDepreciacionDto } from './create-tasa_depreciacion.dto';

export class UpdateTasaDepreciacionDto extends PartialType(CreateTasaDepreciacionDto) {}

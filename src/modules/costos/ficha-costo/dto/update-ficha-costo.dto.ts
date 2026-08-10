import { PartialType } from '@nestjs/swagger';
import { CreateFichaCostoDto } from './create-ficha-costo.dto';

export class UpdateFichaCostoDto extends PartialType(CreateFichaCostoDto) {}

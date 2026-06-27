import { PartialType } from '@nestjs/swagger';
import { CreateConteoFisicoDto } from './create-conteo_fisico.dto';

export class UpdateConteoFisicoDto extends PartialType(CreateConteoFisicoDto) {}

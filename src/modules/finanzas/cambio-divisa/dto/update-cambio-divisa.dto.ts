import { PartialType } from '@nestjs/swagger';
import { CreateCambioDivisaDto } from './create-cambio-divisa.dto';

export class UpdateCambioDivisaDto extends PartialType(CreateCambioDivisaDto) {}

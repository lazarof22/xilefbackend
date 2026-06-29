import { PartialType } from '@nestjs/swagger';
import { CreateAnticipoDto } from './create-anticipo.dto';

export class UpdateAnticipoDto extends PartialType(CreateAnticipoDto) {}

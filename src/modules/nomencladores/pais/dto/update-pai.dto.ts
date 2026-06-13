import { PartialType } from '@nestjs/swagger';
import { CreatePaiDto } from './create-pai.dto';

export class UpdatePaiDto extends PartialType(CreatePaiDto) {}

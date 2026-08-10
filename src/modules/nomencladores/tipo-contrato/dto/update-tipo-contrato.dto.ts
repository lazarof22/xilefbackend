import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoContratoDto } from './create-tipo-contrato.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTipoContratoDto extends PartialType(CreateTipoContratoDto) {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}

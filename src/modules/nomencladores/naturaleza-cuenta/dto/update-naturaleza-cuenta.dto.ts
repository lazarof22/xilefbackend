import { PartialType } from '@nestjs/mapped-types';
import { CreateNaturalezaCuentaDto } from './create-naturaleza-cuenta.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateNaturalezaCuentaDto extends PartialType(
  CreateNaturalezaCuentaDto,
) {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}

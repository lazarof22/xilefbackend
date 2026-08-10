import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoGastoDto } from './create-tipo-gasto.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTipoGastoDto extends PartialType(CreateTipoGastoDto) {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  codigo?: string;
}

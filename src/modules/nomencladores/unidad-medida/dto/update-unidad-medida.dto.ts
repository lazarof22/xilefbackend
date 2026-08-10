import { PartialType } from '@nestjs/mapped-types';
import { CreateUnidadMedidaDto } from './create-unidad-medida.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUnidadMedidaDto extends PartialType(CreateUnidadMedidaDto) {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  abreviatura?: string;
}

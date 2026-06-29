import { PartialType } from '@nestjs/mapped-types';
import { CreateTasaCambioDto } from './create-tasa-cambio.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTasaCambioDto extends PartialType(CreateTasaCambioDto) {
  @IsString()
  @IsNotEmpty()
  monedaOrigen: string;

  @IsString()
  @IsNotEmpty()
  monedaDestino: string;

  @IsString()
  @IsNotEmpty()
  fecha: string;
}

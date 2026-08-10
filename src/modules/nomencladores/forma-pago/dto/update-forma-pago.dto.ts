import { PartialType } from '@nestjs/mapped-types';
import { CreateFormaPagoDto } from './create-forma-pago.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFormaPagoDto extends PartialType(CreateFormaPagoDto) {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}

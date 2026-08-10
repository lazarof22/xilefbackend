import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFormaPagoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;
}

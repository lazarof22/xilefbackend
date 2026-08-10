import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTipoContratoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;
}

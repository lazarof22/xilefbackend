import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNaturalezaCuentaDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;
}

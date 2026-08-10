import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTipoProveedorDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoProveedorDto } from './create-tipo-proveedor.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTipoProveedorDto extends PartialType(
  CreateTipoProveedorDto,
) {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}

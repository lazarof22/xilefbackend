import { IsString, IsEmail, IsNumber, IsOptional, IsEnum, MinLength, MaxLength, IsPositive, IsMongoId } from 'class-validator';
import { UsuarioRol } from '../schemas/empleado.schema';
import { Types } from 'mongoose';

export class CreateAuthDto {
  @IsString()
  @MinLength(11)
  @MaxLength(11)
  ci_empleado!: string;

  @IsString()
  @MinLength(2)
  nombre_empleado!: string;

  @IsEmail()
  correo_empleado!: string;

  @IsString()
  @MinLength(6)
  contraseña!: string;

  @IsMongoId()
  departamento!: Types.ObjectId;

  @IsMongoId()
  cargo!: Types.ObjectId;

  @IsNumber()
  @IsPositive()
  salario!: number;

  @IsOptional()
  @IsEnum(UsuarioRol)
  rol?: UsuarioRol;
}

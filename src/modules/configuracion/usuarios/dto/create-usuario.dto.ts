import {
  IsString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { UsuarioRol } from '../../../auth/schemas/empleado.schema';

export class CreateUsuarioDto {
  @ApiProperty({ example: '12345678901' })
  @IsString()
  @MinLength(11)
  @MaxLength(11)
  ci_empleado!: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  nombre_empleado!: string;

  @ApiProperty({ example: 'juan@xilef.com' })
  @IsEmail()
  @MaxLength(200)
  correo_empleado!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(6)
  contraseña!: string;

  @ApiProperty({ example: 'Ventas', description: 'Nombre del departamento o ObjectId' })
  @IsString()
  departamento!: string;

  @ApiProperty({ example: 'Vendedor', description: 'Nombre del cargo o ObjectId' })
  @IsString()
  cargo!: string;

  @ApiProperty({ example: 2500 })
  @IsNumber()
  @IsPositive()
  salario!: number;

  @ApiPropertyOptional({ enum: UsuarioRol, default: UsuarioRol.EMPLEADO })
  @IsOptional()
  @IsEnum(UsuarioRol)
  rol?: UsuarioRol;
}

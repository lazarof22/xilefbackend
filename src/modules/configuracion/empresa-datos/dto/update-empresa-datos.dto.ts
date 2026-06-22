import {
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEmpresaDatosDto {
  @ApiPropertyOptional({ example: 'Mi Empresa S.A.' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombre?: string;

  @ApiPropertyOptional({ example: 'Innovación y calidad' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  eslogan?: string;

  @ApiPropertyOptional({ example: 'Av. Principal 123' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  direccion?: string;

  @ApiPropertyOptional({ example: '+58 212 555 0000' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefono?: string;

  @ApiPropertyOptional({ example: 'contacto@miempresa.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @ApiPropertyOptional({ example: 'J-123456789-0' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ruc_nit?: string;

  @ApiPropertyOptional({ example: 'Caracas' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudad?: string;

  @ApiPropertyOptional({ example: 'Venezuela' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pais?: string;

  @ApiPropertyOptional({ description: 'Logo en base64' })
  @IsOptional()
  @IsString()
  logo?: string;
}

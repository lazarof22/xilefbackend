import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { CondicionPago, EstadoProveedor } from '../types/proveedor.types';

export class CreateProveedorDto {
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  nit!: string;

  @IsString()
  @IsNotEmpty()
  codigoREU!: string;

  @IsString()
  @IsNotEmpty()
  empresa!: string;

  @IsString()
  @IsNotEmpty()
  tipo!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoriasProducto?: string[];

  @IsEnum(CondicionPago)
  @IsNotEmpty()
  condicionPago!: CondicionPago;

  @IsOptional()
  @IsString()
  monedaPreferida?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  descuentoHabitual?: number;

  @IsOptional()
  @IsString()
  cuentaBancariaMLC?: string;

  @IsOptional()
  @IsString()
  cuentaBancariaCUP?: string;

  @IsOptional()
  @IsEnum(EstadoProveedor)
  estado?: EstadoProveedor;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  calificacion?: number;

  @IsOptional()
  @IsString()
  contactoNombre?: string;

  @IsOptional()
  @IsString()
  contactoTelefono?: string;

  @IsOptional()
  @IsString()
  contactoEmail?: string;

  @IsOptional()
  @IsString()
  contratoVigente?: string;

  @IsOptional()
  fechaVencimientoContrato?: Date;

  @IsOptional()
  @IsString()
  tipoContrato?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}

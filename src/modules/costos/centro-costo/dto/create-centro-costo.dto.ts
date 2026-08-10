import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsMongoId,
} from 'class-validator';
import { TipoCentroCosto } from '../schema/centro-costo.schema';

export class CreateCentroCostoDto {
  @IsNotEmpty()
  @IsString()
  codigo!: string;

  @IsNotEmpty()
  @IsString()
  nombre!: string;

  @IsNotEmpty()
  @IsEnum(TipoCentroCosto)
  tipo!: TipoCentroCosto;

  @IsOptional()
  @IsMongoId()
  departamento?: string;

  @IsOptional()
  @IsMongoId()
  centroPadre?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsString()
  descripcion?: string;
}

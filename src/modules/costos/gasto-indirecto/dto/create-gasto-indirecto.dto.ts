import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsMongoId,
  IsDateString,
  Min,
} from 'class-validator';
import { MetodoProrrateo } from '../schema/gasto-indirecto.schema';

export class CreateGastoIndirectoDto {
  @IsNotEmpty()
  @IsString()
  codigo!: string;

  @IsNotEmpty()
  @IsString()
  descripcion!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  monto!: number;

  @IsNotEmpty()
  @IsMongoId()
  centroCosto!: string;

  @IsOptional()
  @IsMongoId()
  tipoGasto?: string;

  @IsNotEmpty()
  @IsEnum(MetodoProrrateo)
  metodoProrrateo!: MetodoProrrateo;

  @IsOptional()
  @IsNumber()
  @Min(0)
  porcentajeProrrateo?: number;

  @IsOptional()
  @IsBoolean()
  distribuido?: boolean;

  @IsNotEmpty()
  @IsString()
  periodo!: string;

  @IsOptional()
  @IsMongoId()
  moneda?: string;

  @IsOptional()
  @IsDateString()
  fechaRegistro?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

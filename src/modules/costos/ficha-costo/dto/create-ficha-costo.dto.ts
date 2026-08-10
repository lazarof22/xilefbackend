import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsMongoId,
  Min,
} from 'class-validator';

export class CreateFichaCostoDto {
  @IsNotEmpty()
  @IsString()
  codigo!: string;

  @IsNotEmpty()
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsMongoId()
  producto?: string;

  @IsNotEmpty()
  @IsMongoId()
  centroCosto!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  materiaPrima?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  manoObraDirecta?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costosIndirectos?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  otrosCostos?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unidadesProducidas?: number;

  @IsOptional()
  @IsMongoId()
  moneda?: string;

  @IsNotEmpty()
  @IsString()
  periodo!: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

import { Type } from 'class-transformer';
import {
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateReportePlusDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fecha?: Date;

  @IsMongoId()
  @IsNotEmpty()
  productoId!: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  cantidad!: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stockfinal!: number;

  @IsNumber()
  @Type(() => Number)
  descuento!: number;

  @IsString()
  @IsNotEmpty()
  impuesto!: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalPagado!: number;
}


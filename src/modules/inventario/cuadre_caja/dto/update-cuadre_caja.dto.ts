import { PartialType } from '@nestjs/mapped-types';
import {
  CreateCuadreCajaDto,
  DesgloseBilletesDto,
  OtroMotivoDto,
} from './create-cuadre_caja.dto';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsMongoId,
  Min,
  IsDateString,
  ValidateNested,
  IsArray,
  IsString,
} from 'class-validator';

export class UpdateCuadreCajaDto extends PartialType(CreateCuadreCajaDto) {
  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe ser una fecha válida' })
  fecha?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'El empleado es obligatorio' })
  @IsMongoId({ message: 'El empleado debe ser un ID de MongoDB válido' })
  empleado?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Los créditos son obligatorios' })
  @IsNumber({}, { message: 'Los créditos deben ser un número' })
  @Min(0, { message: 'Los créditos no pueden ser negativos' })
  creditos?: number;

  @IsOptional()
  @IsNotEmpty({ message: 'El total de ventas del día es obligatorio' })
  @IsNumber({}, { message: 'El total de ventas del día debe ser un número' })
  @Min(0, { message: 'El total de ventas del día no puede ser negativo' })
  total_ventas_dia?: number;

  @IsOptional()
  @IsNotEmpty({ message: 'El total de extracciones del día es obligatorio' })
  @IsNumber(
    {},
    { message: 'El total de extracciones del día debe ser un número' },
  )
  @Min(0, { message: 'El total de extracciones del día no puede ser negativo' })
  total_extracciones_dia?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => DesgloseBilletesDto)
  desglose_billetes?: DesgloseBilletesDto;

  @IsOptional()
  @IsNotEmpty({ message: 'El valor de las transferencias es obligatorio' })
  @IsNumber(
    {},
    { message: 'El valor de las transferencias debe ser un número' },
  )
  @Min(0, { message: 'El valor de las transferencias no puede ser negativo' })
  valor_transferencias?: number;

  @IsOptional()
  @IsNotEmpty({ message: 'Los recargos son obligatorios' })
  @IsNumber({}, { message: 'Los recargos deben ser un número' })
  @Min(0, { message: 'Los recargos no pueden ser negativos' })
  recargos?: number;

  @IsOptional()
  @IsNotEmpty({ message: 'Los descuentos son obligatorios' })
  @IsNumber({}, { message: 'Los descuentos deben ser un número' })
  @Min(0, { message: 'Los descuentos no pueden ser negativos' })
  descuentos?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OtroMotivoDto)
  otros_motivos?: OtroMotivoDto[];

  @IsOptional()
  @IsNotEmpty({ message: 'El total de efectivo es obligatorio' })
  @IsNumber({}, { message: 'El total de efectivo debe ser un número' })
  @Min(0, { message: 'El total de efectivo no puede ser negativo' })
  total_efectivo?: number;

  @IsOptional()
  @IsString()
  realizadoPor?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

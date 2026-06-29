import { PartialType } from '@nestjs/mapped-types';
import { CreateCuadreCajaDto, DesgloseBilletesDto } from './create-cuadre_caja.dto';
import { Type } from "class-transformer";
import { IsOptional, IsNotEmpty, IsNumber, IsMongoId, Min, IsDateString, IsString, ValidateNested } from 'class-validator';

export class UpdateCuadreCajaDto extends PartialType(CreateCuadreCajaDto) {
    @IsOptional()
    @IsDateString({}, { message: 'La fecha debe ser una fecha válida' })
    fecha?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'El empleado es obligatorio' })
    @IsMongoId({ message: 'El empleado debe ser un ID de MongoDB válido' })
    empleado?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'Las cuentas por cobrar son obligatorias' })
    @IsNumber({}, { message: 'Las cuentas por cobrar deben ser un número' })
    @Min(0, { message: 'Las cuentas por cobrar no pueden ser negativas' })
    cuentas_por_cobrar?: number;

    @IsOptional()
    @IsNotEmpty({ message: 'El CxC cobrado es obligatorio' })
    @IsNumber({}, { message: 'El CxC cobrado debe ser un número' })
    @Min(0, { message: 'El CxC cobrado no puede ser negativo' })
    cxc_cobrado?: number;

    @IsOptional()
    @IsNotEmpty({ message: 'El total de ventas del día es obligatorio' })
    @IsNumber({}, { message: 'El total de ventas del día debe ser un número' })
    @Min(0, { message: 'El total de ventas del día no puede ser negativo' })
    total_ventas_dia?: number;

    @IsOptional()
    @IsNotEmpty({ message: 'El total de extracciones del día es obligatorio' })
    @IsNumber({}, { message: 'El total de extracciones del día debe ser un número' })
    @Min(0, { message: 'El total de extracciones del día no puede ser negativo' })
    total_extracciones_dia?: number;

    @IsOptional()
    @ValidateNested()
    @Type(() => DesgloseBilletesDto)
    desglose_billetes?: DesgloseBilletesDto;

    @IsOptional()
    @IsNotEmpty({ message: 'El valor de las transferencias es obligatorio' })
    @IsNumber({}, { message: 'El valor de las transferencias debe ser un número' })
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
    @IsNotEmpty({ message: 'Otros motivos es obligatorio' })
    @IsString({ message: 'Otros motivos debe ser una cadena de texto' })
    otros_motivos?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'El monto de otros motivos es obligatorio' })
    @IsNumber({}, { message: 'El monto de otros motivos debe ser un número' })
    @Min(0, { message: 'El monto de otros motivos no puede ser negativo' })
    otros_motivos_monto?: number;

    @IsOptional()
    @IsNotEmpty({ message: 'El tipo de otros motivos es obligatorio' })
    @IsString({ message: 'El tipo debe ser ingreso o egreso' })
    otros_motivos_tipo?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'El total de efectivo es obligatorio' })
    @IsNumber({}, { message: 'El total de efectivo debe ser un número' })
    @Min(0, { message: 'El total de efectivo no puede ser negativo' })
    total_efectivo?: number;
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateReporteCajaDto, DesgloseBilletesDto } from './create-reporte_caja.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from "class-transformer";
import { IsOptional, IsNotEmpty, IsNumber, IsMongoId, Min, IsDateString, ValidateNested, IsString } from 'class-validator';

export class UpdateReporteCajaDto extends PartialType(CreateReporteCajaDto) {
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

    @IsString()
    otros_motivos?: number;

    @IsOptional()
    @IsNotEmpty({ message: 'El monto es obligatorio' })
    @IsNumber({}, { message: 'El monto debe ser un número' })
    @Min(0, { message: 'El monto no puede ser negativo' })
    monto?: number;
}

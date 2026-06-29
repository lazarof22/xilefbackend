import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsMongoId, Min, IsOptional, IsDateString, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DesgloseBilletesDto {

    @ApiPropertyOptional({ default: 0 })
    @IsNumber()
    @IsOptional()
    billete5000?: number = 0;

    @ApiPropertyOptional({ default: 0 })
    @IsNumber()
    @IsOptional()
    billete2000?: number = 0;

    @ApiPropertyOptional({ default: 0 })
    @IsNumber()
    @IsOptional()
    billete1000?: number = 0;

    @ApiPropertyOptional({ default: 0 })
    @IsNumber()
    @IsOptional()
    billete500?: number = 0;

    @ApiPropertyOptional({ default: 0 })
    @IsNumber()
    @IsOptional()
    billete200?: number = 0;

    @ApiPropertyOptional({ default: 0 })
    @IsNumber()
    @IsOptional()
    billete100?: number = 0;

    @ApiPropertyOptional({ default: 0 })
    @IsNumber()
    @IsOptional()
    billete50?: number = 0;

    @ApiPropertyOptional({ default: 0 })
    @IsNumber()
    @IsOptional()
    billete20?: number = 0;

    @ApiPropertyOptional({ default: 0 })
    @IsNumber()
    @IsOptional()
    billete10?: number = 0;

    @ApiPropertyOptional({ default: 0 })
    @IsNumber()
    @IsOptional()
    billete5?: number = 0;

    @ApiPropertyOptional({ default: 0 })
    @IsNumber()
    @IsOptional()
    billete3?: number = 0;

    @ApiPropertyOptional({ default: 0 })
    @IsNumber()
    @IsOptional()
    billete1?: number = 0;
}

export class CreateCuadreCajaDto {
    @ApiPropertyOptional({ description: 'Fecha del cuadre (por defecto la fecha actual)' })
    @IsOptional()
    @IsDateString({}, { message: 'La fecha debe ser una fecha válida' })
    fecha?: string;

    @ApiProperty({ description: 'ID del empleado' })
    @IsNotEmpty({ message: 'El empleado es obligatorio' })
    @IsMongoId({ message: 'El empleado debe ser un ID de MongoDB válido' })
    empleado!: string;

    @ApiProperty({ description: 'Cuentas por cobrar', minimum: 0 })
    @IsNotEmpty({ message: 'Las cuentas por cobrar son obligatorias' })
    @IsNumber({}, { message: 'Las cuentas por cobrar deben ser un número' })
    @Min(0, { message: 'Las cuentas por cobrar no pueden ser negativas' })
    cuentas_por_cobrar!: number;

    @ApiProperty({ description: 'CxC cobrado', minimum: 0 })
    @IsNotEmpty({ message: 'El CxC cobrado es obligatorio' })
    @IsNumber({}, { message: 'El CxC cobrado debe ser un número' })
    @Min(0, { message: 'El CxC cobrado no puede ser negativo' })
    cxc_cobrado!: number;

    @ApiProperty({ description: 'Total de ventas del día', minimum: 0 })
    @IsNotEmpty({ message: 'El total de ventas del día es obligatorio' })
    @IsNumber({}, { message: 'El total de ventas del día debe ser un número' })
    @Min(0, { message: 'El total de ventas del día no puede ser negativo' })
    total_ventas_dia!: number;

    @ApiProperty({ description: 'Total de extracciones del día', minimum: 0 })
    @IsNotEmpty({ message: 'El total de extracciones del día es obligatorio' })
    @IsNumber({}, { message: 'El total de extracciones del día debe ser un número' })
    @Min(0, { message: 'El total de extracciones del día no puede ser negativo' })
    total_extracciones_dia!: number;

    @ApiProperty({ description: 'Desglose de billetes' })
    @ValidateNested()
    @Type(() => DesgloseBilletesDto)
    desglose_billetes!: DesgloseBilletesDto;

    @ApiProperty({ description: 'Valor de las transferencias', minimum: 0 })
    @IsNotEmpty({ message: 'El valor de las transferencias es obligatorio' })
    @IsNumber({}, { message: 'El valor de las transferencias debe ser un número' })
    @Min(0, { message: 'El valor de las transferencias no puede ser negativo' })
    valor_transferencias!: number;

    @ApiProperty({ description: 'Recargos', minimum: 0 })
    @IsNotEmpty({ message: 'Los recargos son obligatorios' })
    @IsNumber({}, { message: 'Los recargos deben ser un número' })
    @Min(0, { message: 'Los recargos no pueden ser negativos' })
    recargos!: number;

    @ApiProperty({ description: 'Descuentos', minimum: 0 })
    @IsNotEmpty({ message: 'Los descuentos son obligatorios' })
    @IsNumber({}, { message: 'Los descuentos deben ser un número' })
    @Min(0, { message: 'Los descuentos no pueden ser negativos' })
    descuentos!: number;

    @ApiProperty({ description: 'Descripción de otros motivos' })
    @IsNotEmpty({ message: 'Otros motivos es obligatorio' })
    @IsString({ message: 'Otros motivos debe ser una cadena de texto' })
    otros_motivos!: string;

    @ApiProperty({ description: 'Monto de otros motivos', minimum: 0 })
    @IsNotEmpty({ message: 'El monto de otros motivos es obligatorio' })
    @IsNumber({}, { message: 'El monto de otros motivos debe ser un número' })
    @Min(0, { message: 'El monto de otros motivos no puede ser negativo' })
    otros_motivos_monto!: number;

    @ApiProperty({ description: 'Tipo: ingreso (+) o egreso (-)', enum: ['ingreso', 'egreso'] })
    @IsNotEmpty({ message: 'El tipo de otros motivos es obligatorio' })
    @IsString({ message: 'El tipo debe ser ingreso o egreso' })
    otros_motivos_tipo!: string;
}

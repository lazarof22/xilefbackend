import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsMongoId, Min, IsOptional, IsDateString, ValidateNested, IsString } from 'class-validator';
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

export class CreateReporteCajaDto {
    @ApiPropertyOptional({ description: 'Fecha del reporte (por defecto la fecha actual)' })
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

    @IsString()
    otros_motivos!: number;

    @ApiProperty({ description: 'Monto total del reporte', minimum: 0 })
    @IsNotEmpty({ message: 'El monto es obligatorio' })
    @IsNumber({}, { message: 'El monto debe ser un número' })
    @Min(0, { message: 'El monto no puede ser negativo' })
    monto!: number;
}

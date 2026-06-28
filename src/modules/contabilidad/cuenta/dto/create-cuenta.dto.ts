import { IsMongoId, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoCuenta, NaturalezaCuenta } from '../schema/cuenta.schema';

export class CreateCuentaDto {

    @ApiProperty({ description: 'Código único de la cuenta contable' })
    @IsString()
    @IsNotEmpty()
    codigoCuenta!: string;

    @ApiProperty({ description: 'Nombre de la cuenta contable' })
    @IsString()
    @IsNotEmpty()
    nombreCuenta!: string;

    @ApiProperty({ enum: TipoCuenta, description: 'Tipo de cuenta' })
    @IsEnum(TipoCuenta)
    @IsNotEmpty()
    tipoCuenta!: TipoCuenta;

    @ApiProperty({ enum: NaturalezaCuenta, description: 'Naturaleza de la cuenta' })
    @IsEnum(NaturalezaCuenta)
    @IsNotEmpty()
    naturalezaCuenta!: NaturalezaCuenta;

    @ApiProperty({ description: 'ID del estado' })
    @IsMongoId()
    @IsNotEmpty()
    estado!: string;
}



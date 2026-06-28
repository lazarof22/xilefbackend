import { PartialType } from '@nestjs/mapped-types';
import { CreateTransferenciaDto } from './create-transferencia.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsNumber, IsMongoId, Min, IsDateString } from 'class-validator';

export class UpdateTransferenciaDto extends PartialType(CreateTransferenciaDto) {
    @IsOptional()
    @IsNotEmpty({ message: 'El almacén de origen es obligatorio' })
    @IsMongoId({ message: 'El almacén de origen debe ser un ID de MongoDB válido' })
    almacen_origen?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'El almacén de destino es obligatorio' })
    @IsMongoId({ message: 'El almacén de destino debe ser un ID de MongoDB válido' })
    almacen_destino?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'El contenedor de origen es obligatorio' })
    @IsMongoId({ message: 'El contenedor de origen debe ser un ID de MongoDB válido' })
    contenedor_origen?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'El contenedor de destino es obligatorio' })
    @IsMongoId({ message: 'El contenedor de destino debe ser un ID de MongoDB válido' })
    contenedor_destino?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'El producto es obligatorio' })
    @IsMongoId({ message: 'El producto debe ser un ID de MongoDB válido' })
    producto?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'La cantidad es obligatoria' })
    @IsNumber({}, { message: 'La cantidad debe ser un número' })
    @Min(1, { message: 'La cantidad debe ser al menos 1' })
    cantidad?: number;

    @IsOptional()
    @IsDateString({}, { message: 'La fecha debe ser una fecha válida' })
    fecha?: string;
}

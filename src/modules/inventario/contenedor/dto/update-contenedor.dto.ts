import { PartialType } from '@nestjs/mapped-types';
import { CreateContenedorDto } from './create-contenedor.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsString, IsNumber, Min, IsMongoId } from 'class-validator';

export class UpdateContenedorDto extends PartialType(CreateContenedorDto) {

    @IsOptional()
    @IsNotEmpty({ message: 'El nombre del contenedor no puede estar vacío' })
    @IsString({ message: 'El nombre del contenedor debe ser una cadena de texto' })
    nombreContenedor?: string;

    
    @IsOptional()
    @IsNumber({}, { message: 'La cantidad de productos debe ser un número' })
    @Min(0, { message: 'La cantidad de productos no puede ser negativa' })
    cantidadProductos?: number;

    
    @IsOptional()
    @IsMongoId({ message: 'El almacén debe ser un ID de MongoDB válido' })
    almacen?: string;
}

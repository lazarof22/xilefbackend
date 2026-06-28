import { IsNotEmpty, IsString, IsNumber, Min, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateContenedorDto {

    
    @IsNotEmpty({ message: 'El nombre del contenedor no puede estar vacío' })
    @IsString({ message: 'El nombre del contenedor debe ser una cadena de texto' })
    nombreContenedor!: string;

   
    @IsOptional()
    @IsNumber({}, { message: 'La cantidad de productos debe ser un número' })
    @Min(0, { message: 'La cantidad de productos no puede ser negativa' })
    cantidadProductos?: number;

    
    @IsNotEmpty({ message: 'El almacén es obligatorio' })
    @IsMongoId({ message: 'El almacén debe ser un ID de MongoDB válido' })
    almacen!: string;
}



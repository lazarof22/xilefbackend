import { IsNotEmpty, IsNumber, IsMongoId, Min, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransferenciaDto {
    @ApiProperty({ description: 'ID del almacén de origen' })
    @IsNotEmpty({ message: 'El almacén de origen es obligatorio' })
    @IsMongoId({ message: 'El almacén de origen debe ser un ID de MongoDB válido' })
    almacen_origen!: string;

    @ApiProperty({ description: 'ID del almacén de destino' })
    @IsNotEmpty({ message: 'El almacén de destino es obligatorio' })
    @IsMongoId({ message: 'El almacén de destino debe ser un ID de MongoDB válido' })
    almacen_destino!: string;

    @ApiProperty({ description: 'ID del contenedor de origen' })
    @IsNotEmpty({ message: 'El contenedor de origen es obligatorio' })
    @IsMongoId({ message: 'El contenedor de origen debe ser un ID de MongoDB válido' })
    contenedor_origen!: string;

    @ApiProperty({ description: 'ID del contenedor de destino' })
    @IsNotEmpty({ message: 'El contenedor de destino es obligatorio' })
    @IsMongoId({ message: 'El contenedor de destino debe ser un ID de MongoDB válido' })
    contenedor_destino!: string;

    @ApiProperty({ description: 'ID del producto' })
    @IsNotEmpty({ message: 'El producto es obligatorio' })
    @IsMongoId({ message: 'El producto debe ser un ID de MongoDB válido' })
    producto!: string;

    @ApiProperty({ description: 'Cantidad a transferir', minimum: 1 })
    @IsNotEmpty({ message: 'La cantidad es obligatoria' })
    @IsNumber({}, { message: 'La cantidad debe ser un número' })
    @Min(1, { message: 'La cantidad debe ser al menos 1' })
    cantidad!: number;

    @ApiPropertyOptional({ description: 'Fecha de la transferencia (por defecto la fecha actual)' })
    @IsOptional()
    @IsDateString({}, { message: 'La fecha debe ser una fecha válida' })
    fecha?: string;
}

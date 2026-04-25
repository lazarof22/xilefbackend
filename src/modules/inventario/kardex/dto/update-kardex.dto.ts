import { PartialType } from '@nestjs/swagger';
import { CreateKardexDto } from './create-kardex.dto';
import { IsString, IsNotEmpty, IsNumber, IsDate, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductoDto } from 'src/modules/inventario/producto/dto/create-producto.dto';
import { KardexTipo } from '../schema/kardex.schema';


export class UpdateKardexDto extends PartialType(CreateKardexDto) {  

    @IsNotEmpty()
    @IsNumber()
    cantidad!: number;
}

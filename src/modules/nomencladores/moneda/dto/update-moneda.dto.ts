import { PartialType } from '@nestjs/mapped-types';
import { CreateMonedaDto } from './create-moneda.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateMonedaDto extends PartialType(CreateMonedaDto) {
    @IsString()
    @IsNotEmpty()
    tipo_moneda: string;
}

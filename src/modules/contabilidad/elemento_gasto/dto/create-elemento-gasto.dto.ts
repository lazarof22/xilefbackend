import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateElementoGastoDto {
  @ApiProperty({ description: 'Código del elemento de gasto (ej: E01)' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ description: 'Nombre del elemento de gasto' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;
}

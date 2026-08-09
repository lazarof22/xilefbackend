import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCentroCostoDto {
  @ApiProperty({ description: 'Código del centro de costo (ej: CC01)' })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ description: 'Nombre del centro de costo' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;
}

import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoClasificacionIG } from '../schema/clasificacion-ig.schema';

export class CreateClasificacionIGDto {
  @ApiProperty({ description: 'ID de la cuenta contable a clasificar' })
  @IsMongoId()
  @IsNotEmpty()
  cuentaId!: string;

  @ApiProperty({ description: 'Nombre de la cuenta (denormalizado)' })
  @IsString()
  @IsNotEmpty()
  cuentaNombre!: string;

  @ApiProperty({
    enum: TipoClasificacionIG,
    description: 'Tipo de clasificación',
  })
  @IsEnum(TipoClasificacionIG)
  @IsNotEmpty()
  tipo!: TipoClasificacionIG;
}

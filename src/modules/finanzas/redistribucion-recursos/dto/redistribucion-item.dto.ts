import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsMongoId,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RedistribucionItemDto {
  @ApiProperty({ enum: ['banco', 'caja'], description: 'Tipo de cuenta' })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['banco', 'caja'])
  tipo!: 'banco' | 'caja';

  @ApiProperty({ description: 'ID de la cuenta (Banco o Caja)' })
  @IsMongoId()
  @IsNotEmpty()
  cuentaId!: string;

  @ApiProperty({ description: 'Monto a redistribuir' })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  monto!: number;

  @ApiProperty({
    enum: ['ORIGEN', 'DESTINO'],
    description: 'Acción: ORIGEN (decrementa) o DESTINO (incrementa)',
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['ORIGEN', 'DESTINO'])
  accion!: 'ORIGEN' | 'DESTINO';
}

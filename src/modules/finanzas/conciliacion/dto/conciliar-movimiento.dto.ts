import { IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConciliarMovimientoDto {
  @ApiProperty({ description: 'ID de la transacción a vincular' })
  @IsMongoId()
  @IsNotEmpty()
  transaccionId!: string;
}

import { IsNumber, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AbonarCuentaPagarDto {
  @ApiProperty({ description: 'Monto del pago' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  monto!: number;
}

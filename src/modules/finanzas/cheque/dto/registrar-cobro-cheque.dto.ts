import { IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrarCobroChequeDto {
  @ApiProperty({ description: 'Fecha de cobro (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  fechaCobro!: string;
}

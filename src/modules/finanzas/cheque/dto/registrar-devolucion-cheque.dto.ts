import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrarDevolucionChequeDto {
  @ApiProperty({ description: 'Motivo de la devolución' })
  @IsString()
  @IsNotEmpty()
  motivo!: string;
}

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerarQrEstaticoDto {
  @ApiProperty({ description: 'Telefono del comerciante asociado al QR' })
  @IsString()
  @IsNotEmpty()
  telefono!: string;

  @ApiProperty({ description: 'Identificador del comerciante' })
  @IsString()
  @IsNotEmpty()
  identificadorComerciante!: string;
}

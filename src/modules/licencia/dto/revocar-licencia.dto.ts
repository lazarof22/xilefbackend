import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RevocarLicenciaDto {
  @ApiProperty({
    description: 'Motivo de la revocación',
    example: 'Violación de términos',
  })
  @IsString()
  @IsNotEmpty({ message: 'El motivo de revocación es obligatorio' })
  @MaxLength(500, { message: 'El motivo no puede exceder 500 caracteres' })
  motivo: string;
}

import { IsString, IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AprobarRedistribucionDto {
  @ApiProperty({ description: 'ID del empleado que aprueba' })
  @IsMongoId()
  @IsNotEmpty()
  aprobadoPor!: string;
}

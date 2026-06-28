import { IsString, IsNotEmpty, IsNumber, IsDateString, IsMongoId, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCargaDto {
  @ApiProperty({ description: 'Código de la carga' })
  @IsString() @IsNotEmpty()
  codigo!: string;

  @ApiProperty({ description: 'ID de la tarjeta' })
  @IsMongoId() @IsNotEmpty()
  tarjeta!: string;

  @ApiProperty({ description: 'ID del vehículo' })
  @IsMongoId() @IsNotEmpty()
  vehiculo!: string;

  @ApiProperty({ description: 'Fecha de la carga' })
  @IsDateString() @IsNotEmpty()
  fecha!: string;

  @ApiProperty({ description: 'Litros' })
  @IsNumber() @IsNotEmpty() @Min(0)
  litros!: number;

  @ApiProperty({ description: 'Monto total' })
  @IsNumber() @IsNotEmpty() @Min(0)
  monto!: number;

  @ApiProperty({ description: 'Precio por litro' })
  @IsNumber() @IsNotEmpty() @Min(0)
  precioPorLitro!: number;

  @ApiProperty({ description: 'Servicentro' })
  @IsString() @IsNotEmpty()
  servicentro!: string;

  @ApiProperty({ description: 'Kilometraje actual' })
  @IsNumber() @IsNotEmpty() @Min(0)
  kilometraje!: number;
}

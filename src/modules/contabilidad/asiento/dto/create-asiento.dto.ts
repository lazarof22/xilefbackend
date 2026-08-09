import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAsientoDto {
  @ApiProperty({ description: 'Fecha del asiento (ISO)' })
  @IsDateString()
  @IsNotEmpty()
  fecha!: string;

  @ApiProperty({ description: 'Número del asiento (ej: A-001)' })
  @IsString()
  @IsNotEmpty()
  numero!: string;

  @ApiProperty({ description: 'Concepto del asiento' })
  @IsString()
  @IsNotEmpty()
  concepto!: string;

  @ApiProperty({ description: 'Cuenta contable (código - nombre)' })
  @IsString()
  @IsNotEmpty()
  cuenta!: string;

  @ApiProperty({ description: 'Débito' })
  @IsNumber()
  @Min(0)
  debe!: number;

  @ApiProperty({ description: 'Haber' })
  @IsNumber()
  @Min(0)
  haber!: number;
}

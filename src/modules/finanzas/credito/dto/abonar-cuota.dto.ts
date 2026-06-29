import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AbonarCuotaDto {
  @ApiProperty({ description: 'Monto total del abono' })
  @IsNumber()
  @Min(0)
  monto!: number;

  @ApiPropertyOptional({ description: 'Monto destinado a capital' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  capital?: number;

  @ApiPropertyOptional({ description: 'Monto destinado a interés' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  interes?: number;

  @ApiPropertyOptional({ description: 'Fecha del pago' })
  @IsString()
  @IsOptional()
  fechaPago?: string;

  @ApiPropertyOptional({ description: 'Referencia del pago' })
  @IsString()
  @IsOptional()
  referencia?: string;
}

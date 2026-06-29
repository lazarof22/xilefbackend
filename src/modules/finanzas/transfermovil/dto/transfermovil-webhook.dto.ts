import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransfermovilEvento } from '../types/transfermovil.types';

export class TransfermovilWebhookDto {
  @ApiProperty({
    enum: TransfermovilEvento,
    description: 'Tipo de evento de Transfermovil',
  })
  @IsEnum(TransfermovilEvento)
  @IsNotEmpty()
  evento!: TransfermovilEvento;

  @ApiProperty({ description: 'ID de la operacion en Transfermovil' })
  @IsString()
  @IsNotEmpty()
  id_operacion!: string;

  @ApiProperty({ description: 'Monto del pago' })
  @IsNumber()
  @IsNotEmpty()
  monto!: number;

  @ApiProperty({ description: 'Moneda del pago (ej: CUP, USD)' })
  @IsString()
  @IsNotEmpty()
  moneda!: string;

  @ApiProperty({ description: 'Fecha del pago (ISO 8601)' })
  @IsString()
  @IsNotEmpty()
  fecha!: string;

  @ApiPropertyOptional({ description: 'Telefono del pagador' })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({ description: 'Identificador del cliente' })
  @IsString()
  @IsOptional()
  identificador_cliente?: string;

  @ApiPropertyOptional({
    description: 'Referencia del pago (ej: codigo de CxC)',
  })
  @IsString()
  @IsOptional()
  referencia?: string;

  @ApiPropertyOptional({ description: 'Metadatos adicionales' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, string>;
}

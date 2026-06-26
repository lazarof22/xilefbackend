import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnzonaEvento } from '../types/enzona.types';

export class EnzonaWebhookDto {
  @ApiProperty({ enum: EnzonaEvento, description: 'Tipo de evento' })
  @IsEnum(EnzonaEvento) @IsNotEmpty()
  evento!: EnzonaEvento;

  @ApiProperty({ description: 'ID de la transaccion en Enzona' })
  @IsString() @IsNotEmpty()
  id_transaccion!: string;

  @ApiProperty({ description: 'Referencia del pago (ej: codigo de CxC)' })
  @IsString() @IsNotEmpty()
  referencia!: string;

  @ApiProperty({ description: 'Monto del pago' })
  @IsNumber() @IsNotEmpty()
  monto!: number;

  @ApiProperty({ description: 'Moneda del pago' })
  @IsString() @IsNotEmpty()
  moneda!: string;

  @ApiProperty({ description: 'Fecha del pago' })
  @IsString() @IsNotEmpty()
  fecha!: string;

  @ApiPropertyOptional({ description: 'Nombre del cliente' })
  @IsString() @IsOptional()
  cliente_nombre?: string;

  @ApiPropertyOptional({ description: 'Identificador del cliente' })
  @IsString() @IsOptional()
  cliente_identificador?: string;

  @ApiPropertyOptional({ description: 'Metadatos adicionales' })
  @IsObject() @IsOptional()
  metadata?: Record<string, string>;
}

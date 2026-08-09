import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ItemFacturaDto {
  @ApiProperty({ description: 'Identificador local del item' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ description: 'ID del producto' })
  @IsString()
  @IsNotEmpty()
  productoId!: string;

  @ApiProperty({ description: 'Nombre del producto' })
  @IsString()
  @IsNotEmpty()
  productoNombre!: string;

  @ApiPropertyOptional({ description: 'Unidad de medida' })
  @IsString()
  @IsOptional()
  unidadMedida?: string;

  @ApiProperty({ description: 'Cantidad vendida' })
  @IsNumber()
  cantidad!: number;

  @ApiProperty({ description: 'Precio unitario' })
  @IsNumber()
  precio!: number;

  @ApiProperty({ description: 'Costo unitario' })
  @IsNumber()
  costo!: number;

  @ApiProperty({ description: 'Descuento porcentual' })
  @IsNumber()
  descuentoPct!: number;

  @ApiProperty({ description: 'Descuento en monto' })
  @IsNumber()
  descuentoMonto!: number;

  @ApiProperty({ description: 'Recargo' })
  @IsNumber()
  recargo!: number;

  @ApiProperty({ description: 'Total del item' })
  @IsNumber()
  total!: number;
}

export class ImpuestoDto {
  @ApiPropertyOptional({ description: 'Tipo de impuesto (ej: ISV)' })
  @IsString()
  @IsOptional()
  tipo?: string;

  @ApiPropertyOptional({ description: 'Porciento del impuesto' })
  @IsNumber()
  @IsOptional()
  porciento?: number;

  @ApiPropertyOptional({ description: 'Importe del impuesto' })
  @IsNumber()
  @IsOptional()
  importe?: number;
}

export class EmisorDatosDto {
  @ApiPropertyOptional({ description: 'Nombre del emisor' })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({ description: 'NIT del emisor' })
  @IsString()
  @IsOptional()
  nit?: string;

  @ApiPropertyOptional({ description: 'Direccion del emisor' })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiPropertyOptional({ description: 'Telefono del emisor' })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({ description: 'Email del emisor' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Codigo REEUP del emisor' })
  @IsString()
  @IsOptional()
  reeup?: string;

  @ApiPropertyOptional({ description: 'Numero de cuenta bancaria del emisor' })
  @IsString()
  @IsOptional()
  numeroCuenta?: string;

  @ApiPropertyOptional({ description: 'Sucursal bancaria del emisor' })
  @IsString()
  @IsOptional()
  sucursalBancaria?: string;

  @ApiPropertyOptional({ description: 'Registro comercial del emisor' })
  @IsString()
  @IsOptional()
  registroComercial?: string;
}

export class CreateFacturaDto {
  @ApiPropertyOptional({
    description:
      'Identificador de la factura (ej: FAC-000001). Si no se envia, el servidor lo genera',
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: 'Numero correlativo. Si no se envia, el servidor lo genera',
  })
  @IsNumber()
  @IsOptional()
  numero?: number;

  @ApiPropertyOptional({ description: 'Fecha de emision' })
  @IsString()
  @IsOptional()
  fecha?: string;

  @ApiPropertyOptional({ description: 'Nombre del cliente / comprador' })
  @IsString()
  @IsOptional()
  cliente?: string;

  @ApiPropertyOptional({
    description: 'NIT del comprador (obligatorio por Res. 162/2025 ONAT)',
  })
  @IsString()
  @IsOptional()
  nit?: string;

  @ApiPropertyOptional({ description: 'Direccion del comprador' })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiPropertyOptional({ description: 'Telefono del comprador' })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({ description: 'Email del comprador' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Moneda de pago (default CUP)' })
  @IsString()
  @IsOptional()
  moneda?: string;

  @ApiPropertyOptional({
    description: 'Concepto / descripcion general de la factura',
  })
  @IsString()
  @IsOptional()
  concepto?: string;

  @ApiPropertyOptional({
    type: EmisorDatosDto,
    description: 'Datos del emisor (si no se envian, se toman de EmpresaDatos)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmisorDatosDto)
  emisor?: EmisorDatosDto;

  @ApiPropertyOptional({
    type: ImpuestoDto,
    description: 'Impuesto aplicado (tipo impositivo y porciento)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ImpuestoDto)
  impuesto?: ImpuestoDto;

  @ApiProperty({ description: 'Metodo de pago' })
  @IsString()
  @IsNotEmpty()
  metodoPago!: string;

  @ApiProperty({ description: 'Items de la factura', type: [ItemFacturaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemFacturaDto)
  items!: ItemFacturaDto[];

  @ApiPropertyOptional({ description: 'Subtotal' })
  @IsNumber()
  @IsOptional()
  subtotal?: number;

  @ApiPropertyOptional({ description: 'Descuento total' })
  @IsNumber()
  @IsOptional()
  descuentoTotal?: number;

  @ApiPropertyOptional({ description: 'Recargo total' })
  @IsNumber()
  @IsOptional()
  recargoTotal?: number;

  @ApiPropertyOptional({ description: 'Total de la factura' })
  @IsNumber()
  @IsOptional()
  total?: number;

  @ApiPropertyOptional({ enum: ['confirmada', 'ajustada', 'anulada'] })
  @IsEnum(['confirmada', 'ajustada', 'anulada'])
  @IsOptional()
  estado?: string;

  @ApiPropertyOptional({ enum: ['factura_normal', 'ajuste'] })
  @IsEnum(['factura_normal', 'ajuste'])
  @IsOptional()
  tipo?: string;

  @ApiPropertyOptional({ description: 'Si ya fue impresa' })
  @IsBoolean()
  @IsOptional()
  impreso?: boolean;
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FacturaDocument = HydratedDocument<Factura>;

@Schema({ _id: false })
class ItemFactura {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  productoId!: string;

  @Prop({ required: true })
  productoNombre!: string;

  @Prop()
  unidadMedida?: string;

  @Prop({ required: true })
  cantidad!: number;

  @Prop({ required: true })
  precio!: number;

  @Prop({ required: true })
  costo!: number;

  @Prop({ required: true })
  descuentoPct!: number;

  @Prop({ required: true })
  descuentoMonto!: number;

  @Prop({ required: true })
  recargo!: number;

  @Prop({ required: true })
  total!: number;
}

@Schema({ _id: false })
class Impuesto {
  @Prop()
  tipo?: string;

  @Prop()
  porciento?: number;

  @Prop()
  importe?: number;
}

@Schema({ _id: false })
class EmisorDatos {
  @Prop()
  nombre?: string;

  @Prop()
  nit?: string;

  @Prop()
  direccion?: string;

  @Prop()
  telefono?: string;

  @Prop()
  email?: string;

  @Prop()
  reeup?: string;

  @Prop()
  numeroCuenta?: string;

  @Prop()
  sucursalBancaria?: string;

  @Prop()
  registroComercial?: string;
}

@Schema({ timestamps: true, id: false })
export class Factura {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true, unique: true })
  numero!: number;

  @Prop({ required: true })
  fecha!: string;

  @Prop({ required: true, default: 'Venta al público' })
  cliente!: string;

  @Prop({ default: '' })
  nit?: string;

  @Prop({ default: '' })
  direccion?: string;

  @Prop({ default: '' })
  telefono?: string;

  @Prop({ default: '' })
  email?: string;

  @Prop({ required: true, default: 'CUP' })
  moneda!: string;

  @Prop()
  concepto?: string;

  @Prop({ type: Types.ObjectId, ref: 'Cliente' })
  clienteId?: Types.ObjectId;

  @Prop({ type: EmisorDatos, _id: false })
  emisor?: EmisorDatos;

  @Prop({ type: Impuesto, _id: false })
  impuesto?: Impuesto;

  @Prop({ required: true })
  metodoPago!: string;

  @Prop({ type: [ItemFactura], required: true })
  items!: ItemFactura[];

  @Prop({ required: true })
  subtotal!: number;

  @Prop({ required: true })
  descuentoTotal!: number;

  @Prop({ required: true })
  recargoTotal!: number;

  @Prop({ required: true })
  total!: number;

  @Prop({
    required: true,
    enum: ['confirmada', 'ajustada', 'anulada'],
    default: 'confirmada',
  })
  estado!: string;

  @Prop({
    required: true,
    enum: ['factura_normal', 'ajuste'],
    default: 'factura_normal',
  })
  tipo!: string;

  @Prop({ required: true, default: false })
  impreso!: boolean;
}

export const FacturaSchema = SchemaFactory.createForClass(Factura);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  TipoTransaccion,
  MetodoPago,
  TipoOperacionCambio,
} from '../types/transaccion.types';

export type TransaccionDocument = HydratedDocument<Transaccion>;

@Schema({ timestamps: true })
export class Transaccion {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true, enum: TipoTransaccion, index: true })
  tipo!: TipoTransaccion;

  @Prop({ type: Types.ObjectId, ref: 'Concepto' })
  categoria?: Types.ObjectId;

  @Prop({ required: true })
  monto!: number;

  @Prop({ type: Types.ObjectId, ref: 'Moneda' })
  moneda?: Types.ObjectId;

  @Prop({ required: true, index: true })
  fecha!: Date;

  @Prop({ required: true, enum: MetodoPago })
  metodoPago!: MetodoPago;

  @Prop()
  referencia?: string;

  @Prop()
  descripcion?: string;

  @Prop({ type: Types.ObjectId, ref: 'Banco' })
  cuentaBancaria?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Cliente' })
  cliente?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Empresa' })
  proveedor?: Types.ObjectId;

  @Prop()
  tipoCambio?: number;

  @Prop({ type: Types.ObjectId, ref: 'Moneda' })
  monedaOrigen?: Types.ObjectId;

  @Prop({ enum: TipoOperacionCambio })
  tipoOperacionCambio?: TipoOperacionCambio;
}

export const TransaccionSchema = SchemaFactory.createForClass(Transaccion);

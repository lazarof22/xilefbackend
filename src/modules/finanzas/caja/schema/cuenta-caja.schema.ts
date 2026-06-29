import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TipoCuentaCaja } from '../types/caja.types';

export type CuentaCajaDocument = HydratedDocument<CuentaCaja>;

@Schema({ timestamps: true })
export class CuentaCaja {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true })
  nombre!: string;

  @Prop({ required: true, enum: TipoCuentaCaja, default: TipoCuentaCaja.OTRA })
  tipo!: TipoCuentaCaja;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Moneda' })
  moneda!: Types.ObjectId;

  @Prop({ default: 0 })
  saldoInicial!: number;

  @Prop({ default: 0 })
  saldoActual!: number;

  @Prop()
  montoFondoFijo?: number;

  @Prop()
  montoMinimo?: number;

  @Prop({ default: true })
  activa!: boolean;

  @Prop()
  responsable?: string;

  @Prop({ type: Types.ObjectId, ref: 'Banco' })
  cuentaBancariaReposicion?: Types.ObjectId;
}

export const CuentaCajaSchema = SchemaFactory.createForClass(CuentaCaja);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EstadoPlanCobro } from '../types/plan-cobro.types';

export type PlanCobroDocument = HydratedDocument<PlanCobro>;

@Schema({ timestamps: true })
export class PlanCobro {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Cliente', index: true })
  cliente!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CuentaCobrar' })
  cuentaCobrar?: Types.ObjectId;

  @Prop({ required: true })
  montoProgramado!: number;

  @Prop({ default: 0 })
  montoCobrado!: number;

  @Prop({ required: true })
  saldoProgramado!: number;

  @Prop({ required: true, index: true })
  fechaProgramada!: Date;

  @Prop()
  fechaCobro?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Banco' })
  cuentaBancaria?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CuentaCaja' })
  cajaDestino?: Types.ObjectId;

  @Prop({
    required: true,
    enum: EstadoPlanCobro,
    default: EstadoPlanCobro.PROGRAMADO,
    index: true,
  })
  estado!: EstadoPlanCobro;

  @Prop()
  metodoPago?: string;

  @Prop({ default: 100, min: 0, max: 100 })
  probabilidad!: number;

  @Prop()
  observaciones?: string;
}

export const PlanCobroSchema = SchemaFactory.createForClass(PlanCobro);

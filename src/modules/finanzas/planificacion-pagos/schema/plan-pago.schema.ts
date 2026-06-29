import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EstadoPlanPago } from '../types/plan-pago.types';

export type PlanPagoDocument = HydratedDocument<PlanPago>;

@Schema({ timestamps: true })
export class PlanPago {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Empresa', index: true })
  proveedor!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CuentaPagar' })
  cuentaPagar?: Types.ObjectId;

  @Prop({ required: true })
  montoProgramado!: number;

  @Prop({ default: 0 })
  montoPagado!: number;

  @Prop({ required: true })
  saldoProgramado!: number;

  @Prop({ required: true, index: true })
  fechaProgramada!: Date;

  @Prop()
  fechaEjecucion?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Banco' })
  cuentaBancaria?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CuentaCaja' })
  cajaOrigen?: Types.ObjectId;

  @Prop({
    required: true,
    enum: EstadoPlanPago,
    default: EstadoPlanPago.PROGRAMADO,
    index: true,
  })
  estado!: EstadoPlanPago;

  @Prop()
  metodoPago?: string;

  @Prop()
  prioridad?: number;

  @Prop()
  observaciones?: string;
}

export const PlanPagoSchema = SchemaFactory.createForClass(PlanPago);

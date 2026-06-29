import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  TipoOperacionFinanciera,
  EstadoOperacion,
} from '../types/operacion-financiera.types';

export type OperacionFinancieraDocument = HydratedDocument<OperacionFinanciera>;

@Schema({ timestamps: true })
export class OperacionFinanciera {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true, enum: TipoOperacionFinanciera })
  tipo!: TipoOperacionFinanciera;

  @Prop({ required: true, index: true })
  periodo!: string;

  @Prop({ required: true })
  monto!: number;

  @Prop({ default: 0 })
  montoPagado!: number;

  @Prop({ required: true })
  saldoPendiente!: number;

  @Prop({ required: true, index: true })
  fechaLimite!: Date;

  @Prop()
  fechaPago?: Date;

  @Prop({
    required: true,
    enum: EstadoOperacion,
    default: EstadoOperacion.PENDIENTE,
  })
  estado!: EstadoOperacion;

  @Prop({ type: Types.ObjectId, ref: 'Banco' })
  cuentaBancaria?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CuentaCaja' })
  cajaOrigen?: Types.ObjectId;

  @Prop()
  comprobante?: string;

  @Prop()
  observaciones?: string;
}

export const OperacionFinancieraSchema =
  SchemaFactory.createForClass(OperacionFinanciera);

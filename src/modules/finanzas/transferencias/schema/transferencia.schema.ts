import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  TipoTransferencia,
  TipoCuentaRef,
  EstadoTransferencia,
} from '../types/transferencia.types';

export type TransferenciaDocument = HydratedDocument<Transferencia>;

@Schema({ timestamps: true })
export class Transferencia {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true, enum: TipoTransferencia, index: true })
  tipo!: TipoTransferencia;

  @Prop({ required: true, enum: TipoCuentaRef })
  origenCuentaTipo!: TipoCuentaRef;

  @Prop({ required: true, type: Types.ObjectId })
  origenCuentaId!: Types.ObjectId;

  @Prop({ required: true, enum: TipoCuentaRef })
  destinoCuentaTipo!: TipoCuentaRef;

  @Prop({ required: true, type: Types.ObjectId })
  destinoCuentaId!: Types.ObjectId;

  @Prop({ required: true })
  monto!: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Moneda' })
  moneda!: Types.ObjectId;

  @Prop({ default: 0 })
  comision!: number;

  @Prop({
    required: true,
    enum: EstadoTransferencia,
    default: EstadoTransferencia.PENDIENTE,
  })
  estado!: EstadoTransferencia;

  @Prop({ required: true, index: true })
  fecha!: Date;

  @Prop()
  fechaAplicacion?: Date;

  @Prop()
  descripcion?: string;

  @Prop()
  comprobante?: string;

  @Prop()
  motivoRechazo?: string;
}

export const TransferenciaSchema = SchemaFactory.createForClass(Transferencia);

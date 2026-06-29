import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EstadoCuota } from '../types/credito.types';

export type CuotaCreditoDocument = HydratedDocument<CuotaCredito>;

@Schema({ timestamps: true })
export class CuotaCredito {
  @Prop({ required: true, unique: true })
  numeroCuota!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Credito', index: true })
  credito!: Types.ObjectId;

  @Prop({ required: true })
  numero!: number;

  @Prop({ required: true })
  fechaVencimiento!: Date;

  @Prop({ required: true })
  capital!: number;

  @Prop({ required: true })
  interes!: number;

  @Prop({ required: true })
  cuotaTotal!: number;

  @Prop({ default: 0 })
  capitalPagado!: number;

  @Prop({ default: 0 })
  interesPagado!: number;

  @Prop({ required: true })
  saldoPendiente!: number;

  @Prop({ required: true, enum: EstadoCuota, default: EstadoCuota.PENDIENTE })
  estado!: EstadoCuota;

  @Prop()
  fechaPago?: Date;

  @Prop()
  mora?: number;

  @Prop()
  interesMora?: number;
}

export const CuotaCreditoSchema = SchemaFactory.createForClass(CuotaCredito);

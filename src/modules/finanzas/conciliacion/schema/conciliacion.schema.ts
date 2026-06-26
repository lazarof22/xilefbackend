import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EstadoConciliacion } from '../types/conciliacion.types';

export type ConciliacionDocument = HydratedDocument<Conciliacion>;

@Schema({ timestamps: true })
export class Conciliacion {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Banco', index: true })
  cuentaBancaria!: Types.ObjectId;

  @Prop({ required: true })
  periodo!: string;

  @Prop({ required: true })
  saldoBanco!: number;

  @Prop({ required: true })
  saldoLibros!: number;

  @Prop({ required: true })
  diferencia!: number;

  @Prop({ required: true })
  fechaInicio!: Date;

  @Prop({ required: true })
  fechaFin!: Date;

  @Prop({ required: true, enum: EstadoConciliacion, default: EstadoConciliacion.PENDIENTE })
  estado!: EstadoConciliacion;

  @Prop()
  observaciones?: string;
}

export const ConciliacionSchema = SchemaFactory.createForClass(Conciliacion);

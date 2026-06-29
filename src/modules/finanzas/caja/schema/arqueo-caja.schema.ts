import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EstadoArqueo } from '../types/caja.types';

export type ArqueoCajaDocument = HydratedDocument<ArqueoCaja>;

@Schema({ timestamps: true })
export class ArqueoCaja {
  @Prop({ type: Types.ObjectId, ref: 'CuentaCaja', index: true })
  cajaId?: Types.ObjectId;

  @Prop({ required: true })
  fecha!: Date;

  @Prop({ required: true })
  saldoEsperado!: number;

  @Prop({ required: true })
  efectivoContado!: number;

  @Prop({ required: true })
  diferencia!: number;

  @Prop({ required: true, enum: EstadoArqueo, default: EstadoArqueo.PENDIENTE })
  estado!: EstadoArqueo;

  @Prop()
  observaciones?: string;

  @Prop()
  realizadoPor?: string;
}

export const ArqueoCajaSchema = SchemaFactory.createForClass(ArqueoCaja);

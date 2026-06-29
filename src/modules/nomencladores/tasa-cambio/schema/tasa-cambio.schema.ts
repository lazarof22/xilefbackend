import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TipoTasa } from '../types/tasa-cambio.types';

export type TasaCambioDocument = HydratedDocument<TasaCambio>;

@Schema({ timestamps: true })
export class TasaCambio {
  @Prop({ type: Types.ObjectId, ref: 'Moneda', required: true })
  monedaOrigen!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Moneda', required: true })
  monedaDestino!: Types.ObjectId;

  @Prop({ required: true, type: Number })
  tasa!: number;

  @Prop({ required: true, index: true, type: Date })
  fecha!: Date;

  @Prop({ enum: TipoTasa, default: TipoTasa.OFICIAL })
  tipo!: TipoTasa;

  @Prop({ required: false })
  fuente?: string;
}

export const TasaCambioSchema = SchemaFactory.createForClass(TasaCambio);

TasaCambioSchema.index({ monedaOrigen: 1, monedaDestino: 1, fecha: -1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PosicionItem } from '../types/posicion-monetaria.types';

export type PosicionMonetariaDocument = HydratedDocument<PosicionMonetaria>;

@Schema({ timestamps: true })
export class PosicionMonetaria {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true, index: true })
  fecha!: Date;

  @Prop({ type: Array })
  posiciones!: PosicionItem[];

  @Prop({ required: true })
  totalMonedaBase!: number;

  @Prop()
  observaciones?: string;
}

export const PosicionMonetariaSchema =
  SchemaFactory.createForClass(PosicionMonetaria);

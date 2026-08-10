import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TipoGastoDocument = HydratedDocument<TipoGasto>;

@Schema()
export class TipoGasto {
  @Prop({ required: true, unique: true })
  nombre!: string;

  @Prop()
  codigo?: string;
}

export const TipoGastoSchema = SchemaFactory.createForClass(TipoGasto);

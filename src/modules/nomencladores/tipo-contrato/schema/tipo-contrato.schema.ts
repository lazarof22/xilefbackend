import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TipoContratoDocument = HydratedDocument<TipoContrato>;

@Schema()
export class TipoContrato {
  @Prop({ required: true, unique: true })
  nombre!: string;
}

export const TipoContratoSchema = SchemaFactory.createForClass(TipoContrato);

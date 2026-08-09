import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ElementoGastoDocument = HydratedDocument<ElementoGasto>;

@Schema({ timestamps: true })
export class ElementoGasto {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true })
  nombre!: string;
}

export const ElementoGastoSchema = SchemaFactory.createForClass(ElementoGasto);

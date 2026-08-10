import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FormaPagoDocument = HydratedDocument<FormaPago>;

@Schema()
export class FormaPago {
  @Prop({ required: true, unique: true })
  nombre!: string;
}

export const FormaPagoSchema = SchemaFactory.createForClass(FormaPago);

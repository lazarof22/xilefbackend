import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NaturalezaCuentaDocument = HydratedDocument<NaturalezaCuenta>;

@Schema()
export class NaturalezaCuenta {
  @Prop({ required: true, unique: true })
  nombre!: string;
}

export const NaturalezaCuentaSchema =
  SchemaFactory.createForClass(NaturalezaCuenta);

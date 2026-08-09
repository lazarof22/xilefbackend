import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CentroCostoDocument = HydratedDocument<CentroCosto>;

@Schema({ timestamps: true })
export class CentroCosto {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true })
  nombre!: string;
}

export const CentroCostoSchema = SchemaFactory.createForClass(CentroCosto);

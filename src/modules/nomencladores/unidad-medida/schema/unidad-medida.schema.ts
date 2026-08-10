import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UnidadMedidaDocument = HydratedDocument<UnidadMedida>;

@Schema()
export class UnidadMedida {
  @Prop({ required: true, unique: true })
  nombre!: string;

  @Prop()
  abreviatura?: string;
}

export const UnidadMedidaSchema = SchemaFactory.createForClass(UnidadMedida);

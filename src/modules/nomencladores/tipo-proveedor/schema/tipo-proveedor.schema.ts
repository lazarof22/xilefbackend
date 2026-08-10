import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TipoProveedorDocument = HydratedDocument<TipoProveedor>;

@Schema()
export class TipoProveedor {
  @Prop({ required: true, unique: true })
  nombre!: string;
}

export const TipoProveedorSchema = SchemaFactory.createForClass(TipoProveedor);

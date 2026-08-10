import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FichaCostoDocument = HydratedDocument<FichaCosto>;

@Schema({ timestamps: true })
export class FichaCosto {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true })
  nombre!: string;

  @Prop({ type: Types.ObjectId, ref: 'Producto', index: true })
  producto?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CentroCosto', required: true })
  centroCosto!: Types.ObjectId;

  @Prop({ default: 0 })
  materiaPrima!: number;

  @Prop({ default: 0 })
  manoObraDirecta!: number;

  @Prop({ default: 0 })
  costosIndirectos!: number;

  @Prop({ default: 0 })
  otrosCostos!: number;

  @Prop({ default: 0 })
  costoTotal!: number;

  @Prop({ default: 0 })
  unidadesProducidas!: number;

  @Prop({ default: 0 })
  costoUnitario!: number;

  @Prop({ type: Types.ObjectId, ref: 'Moneda' })
  moneda?: Types.ObjectId;

  @Prop({ required: true, index: true })
  periodo!: string;

  @Prop()
  observaciones?: string;
}

export const FichaCostoSchema = SchemaFactory.createForClass(FichaCosto);

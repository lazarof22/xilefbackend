import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EstadoPlanCompra, PrioridadCompra } from '../types/plan-compra.types';

export type PlanCompraDocument = HydratedDocument<PlanCompra>;

@Schema({ timestamps: true })
export class PlanCompra {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ type: Types.ObjectId, ref: 'Producto', required: true })
  producto!: Types.ObjectId;

  @Prop({ required: true })
  cantidadPlanificada!: number;

  @Prop({ default: 0 })
  cantidadComprada!: number;

  @Prop({ required: true })
  precioEstimado!: number;

  @Prop({ type: Types.ObjectId, ref: 'Proveedor', index: true })
  proveedorPreferido?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CentroCosto' })
  centroCosto?: Types.ObjectId;

  @Prop({
    required: true,
    enum: PrioridadCompra,
    default: PrioridadCompra.MEDIA,
  })
  prioridad!: PrioridadCompra;

  @Prop({ required: true, index: true })
  fechaPlanificada!: Date;

  @Prop()
  fechaCompra?: Date;

  @Prop({
    required: true,
    enum: EstadoPlanCompra,
    default: EstadoPlanCompra.PLANIFICADO,
  })
  estado!: EstadoPlanCompra;

  @Prop({ type: Types.ObjectId, ref: 'Moneda' })
  moneda?: Types.ObjectId;

  @Prop()
  notas?: string;
}

export const PlanCompraSchema = SchemaFactory.createForClass(PlanCompra);

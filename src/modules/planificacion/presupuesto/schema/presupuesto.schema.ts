import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EstadoPresupuesto, TipoPresupuesto } from '../types/presupuesto.types';

export type PresupuestoDocument = HydratedDocument<Presupuesto>;

@Schema({ timestamps: true })
export class Presupuesto {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true })
  nombre!: string;

  @Prop({ required: true, index: true })
  periodo!: string;

  @Prop({ required: true, enum: TipoPresupuesto })
  tipo!: TipoPresupuesto;

  @Prop({
    type: Types.ObjectId,
    ref: 'CentroCosto',
    required: true,
    index: true,
  })
  centroCosto!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TipoGasto' })
  tipoGasto?: Types.ObjectId;

  @Prop({ required: true })
  planAnual!: number;

  @Prop({ type: [Number], default: [] })
  planMensual!: number[];

  @Prop({ default: 0 })
  ejecutado!: number;

  @Prop({ type: [Number], default: [] })
  ejecutadoMensual!: number[];

  @Prop({
    required: true,
    enum: EstadoPresupuesto,
    default: EstadoPresupuesto.BORRADOR,
  })
  estado!: EstadoPresupuesto;

  @Prop({ type: Types.ObjectId, ref: 'Moneda' })
  moneda?: Types.ObjectId;

  @Prop()
  observaciones?: string;
}

export const PresupuestoSchema = SchemaFactory.createForClass(Presupuesto);

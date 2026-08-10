import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TipoPeriodoFlujo, EstadoFlujo } from '../types/flujo-efectivo.types';

export type ProyeccionFlujoDocument = HydratedDocument<ProyeccionFlujo>;

@Schema({ timestamps: true })
export class ProyeccionFlujo {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true, index: true })
  fecha!: Date;

  @Prop({ required: true })
  periodo!: string;

  @Prop({
    required: true,
    enum: TipoPeriodoFlujo,
    default: TipoPeriodoFlujo.MENSUAL,
  })
  tipoPeriodo!: TipoPeriodoFlujo;

  @Prop({ required: true })
  saldoInicial!: number;

  @Prop({ required: true })
  ingresosProyectados!: number;

  @Prop({ required: true })
  egresosProyectados!: number;

  @Prop({ required: true })
  flujoNetoProyectado!: number;

  @Prop({ required: true })
  saldoProyectado!: number;

  @Prop({ default: 0 })
  ingresosReales!: number;

  @Prop({ default: 0 })
  egresosReales!: number;

  @Prop({ default: 0 })
  flujoNetoReal!: number;

  @Prop({ required: true, enum: EstadoFlujo, default: EstadoFlujo.PROYECTADO })
  estado!: EstadoFlujo;

  @Prop()
  observaciones?: string;

  @Prop({ type: [Types.ObjectId], ref: 'CuentaCobrar' })
  cuentasCobrarVinculadas?: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'CuentaPagar' })
  cuentasPagarVinculadas?: Types.ObjectId[];
}

export const ProyeccionFlujoSchema =
  SchemaFactory.createForClass(ProyeccionFlujo);

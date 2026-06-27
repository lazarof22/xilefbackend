import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ConteoFisicoDocument = HydratedDocument<ConteoFisico>;

export enum EstadoConteo {
  PROGRAMADO = 'programado',
  EN_PROCESO = 'en_proceso',
  COMPLETADO = 'completado',
  CONCILIADO = 'conciliado',
}

@Schema({ timestamps: true })
export class ConteoFisico {
  @Prop({ required: true, unique: true })
  codigoConteo!: string;

  @Prop({ required: true })
  fechaProgramada!: Date;

  @Prop()
  fechaRealizacion?: Date;

  @Prop({ required: true, enum: EstadoConteo, default: EstadoConteo.PROGRAMADO })
  estado!: EstadoConteo;

  @Prop({ type: Types.ObjectId, ref: 'Area' })
  area?: Types.ObjectId;

  @Prop()
  observaciones?: string;

  @Prop()
  totalActivosSistema!: number;

  @Prop({ default: 0 })
  totalActivosContados!: number;

  @Prop({ default: 0 })
  totalCoincidentes!: number;

  @Prop({ default: 0 })
  totalDiscrepancias!: number;

  @Prop({ default: 0 })
  totalSobrantes!: number;

  @Prop({ default: 0 })
  totalFaltantes!: number;

  @Prop()
  realizadoPor?: string;

  @Prop()
  autorizadoPor?: string;
}

export const ConteoFisicoSchema = SchemaFactory.createForClass(ConteoFisico);

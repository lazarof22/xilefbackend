import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TipoCredito, EstadoCredito, ClasificacionRiesgo } from '../types/credito.types';
export type CreditoDocument = HydratedDocument<Credito>;
@Schema({ timestamps: true })
export class Credito {
  @Prop({ required: true, unique: true }) codigo!: string;
  @Prop({ required: true, type: Types.ObjectId, ref: 'Banco' }) banco!: Types.ObjectId;
  @Prop({ required: true, enum: TipoCredito }) tipo!: TipoCredito;
  @Prop({ required: true }) montoSolicitado!: number;
  @Prop({ default: 0 }) montoDesembolsado!: number;
  @Prop({ default: 0 }) saldoPendiente!: number;
  @Prop({ required: true }) tasaInteres!: number;
  @Prop({ required: true }) plazoMeses!: number;
  @Prop({ required: true }) fechaSolicitud!: Date;
  @Prop() fechaAprobacion?: Date;
  @Prop() fechaDesembolso?: Date;
  @Prop() fechaVencimiento?: Date;
  @Prop({ required: true, enum: EstadoCredito, default: EstadoCredito.SOLICITADO }) estado!: EstadoCredito;
  @Prop({ required: true, enum: ClasificacionRiesgo, default: ClasificacionRiesgo.NORMAL }) clasificacionRiesgo!: ClasificacionRiesgo;
  @Prop() garantia?: string;
}
export const CreditoSchema = SchemaFactory.createForClass(Credito);

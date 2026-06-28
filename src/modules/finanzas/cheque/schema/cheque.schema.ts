import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TipoCheque, EstadoCheque } from '../types/cheque.types';
export type ChequeDocument = HydratedDocument<Cheque>;
@Schema({ timestamps: true })
export class Cheque {
  @Prop({ required: true, unique: true }) numeroCheque!: string;
  @Prop({ required: true, enum: TipoCheque }) tipo!: TipoCheque;
  @Prop({ required: true }) beneficiario!: string;
  @Prop({ required: true, type: Types.ObjectId, ref: 'Banco' }) cuentaBancaria!: Types.ObjectId;
  @Prop({ required: true }) monto!: number;
  @Prop({ required: true }) fechaEmision!: Date;
  @Prop() fechaCobro?: Date;
  @Prop() fechaDevolucion?: Date;
  @Prop({ required: true, enum: EstadoCheque, default: EstadoCheque.EMITIDO }) estado!: EstadoCheque;
  @Prop() concepto?: string;
  @Prop() motivoDevolucion?: string;
}
export const ChequeSchema = SchemaFactory.createForClass(Cheque);

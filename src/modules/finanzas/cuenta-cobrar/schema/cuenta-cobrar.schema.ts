import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EstadoCxC } from '../types/cuenta-cobrar.types';

export type CuentaCobrarDocument = HydratedDocument<CuentaCobrar>;

@Schema({ timestamps: true })
export class CuentaCobrar {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Cliente', index: true })
  cliente!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Concepto' })
  concepto!: Types.ObjectId;

  @Prop({ required: true })
  montoOriginal!: number;

  @Prop({ required: true })
  saldoPendiente!: number;

  @Prop({ required: true })
  fechaEmision!: Date;

  @Prop({ required: true, index: true })
  fechaVencimiento!: Date;

  @Prop({
    required: true,
    enum: EstadoCxC,
    default: EstadoCxC.PENDIENTE,
    index: true,
  })
  estado!: EstadoCxC;

  @Prop()
  notas?: string;
}

export const CuentaCobrarSchema = SchemaFactory.createForClass(CuentaCobrar);

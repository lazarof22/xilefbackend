import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EstadoCxP } from '../types/cuenta-pagar.types';

export type CuentaPagarDocument = HydratedDocument<CuentaPagar>;

@Schema({ timestamps: true })
export class CuentaPagar {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Empresa', index: true })
  proveedor!: Types.ObjectId;

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

  @Prop({ required: true, enum: EstadoCxP, default: EstadoCxP.PENDIENTE, index: true })
  estado!: EstadoCxP;

  @Prop()
  notas?: string;
}

export const CuentaPagarSchema = SchemaFactory.createForClass(CuentaPagar);

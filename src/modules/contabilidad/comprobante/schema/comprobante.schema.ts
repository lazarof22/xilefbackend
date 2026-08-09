import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LineaComprobanteDocument = HydratedDocument<LineaComprobante>;

@Schema({ _id: false })
export class LineaComprobante {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Cuenta' })
  cuentaId!: Types.ObjectId;

  @Prop({ required: true })
  cuentaNombre!: string;

  @Prop({ type: Types.ObjectId, ref: 'ElementoGasto', default: null })
  elementoGastoId?: Types.ObjectId | null;

  @Prop()
  elementoGastoNombre?: string;

  @Prop({ type: Types.ObjectId, ref: 'CentroCosto', default: null })
  centroCostoId?: Types.ObjectId | null;

  @Prop()
  centroCostoNombre?: string;

  @Prop({ required: true, default: 0 })
  debe!: number;

  @Prop({ required: true, default: 0 })
  haber!: number;

  @Prop()
  descripcion?: string;
}

export const LineaComprobanteSchema =
  SchemaFactory.createForClass(LineaComprobante);

export type ComprobanteDocument = HydratedDocument<Comprobante>;

@Schema({ timestamps: true })
export class Comprobante {
  @Prop({ required: true })
  fecha!: Date;

  @Prop({ required: true, unique: true })
  numero!: string;

  @Prop({ required: true })
  concepto!: string;

  @Prop({ type: [LineaComprobanteSchema], default: [] })
  lineas!: LineaComprobante[];

  @Prop({ required: true, default: 0 })
  totalDebito!: number;

  @Prop({ required: true, default: 0 })
  totalCredito!: number;

  @Prop({ required: true, default: false })
  equilibrado!: boolean;
}

export const ComprobanteSchema = SchemaFactory.createForClass(Comprobante);

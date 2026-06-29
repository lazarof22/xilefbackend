import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  TipoAnticipo,
  EstadoAnticipo,
} from '../types/anticipos-viaticos.types';

export type AnticipoDocument = HydratedDocument<Anticipo>;

@Schema({ timestamps: true })
export class Anticipo {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true, enum: TipoAnticipo, index: true })
  tipo!: TipoAnticipo;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Usuario', index: true })
  beneficiario!: Types.ObjectId;

  @Prop({ required: true })
  monto!: number;

  @Prop({ required: true, index: true })
  fecha!: Date;

  @Prop({
    required: true,
    enum: EstadoAnticipo,
    default: EstadoAnticipo.ENTREGADO,
  })
  estado!: EstadoAnticipo;

  @Prop({ type: Types.ObjectId, ref: 'CuentaCaja' })
  cajaOrigen?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Banco' })
  cuentaBancariaOrigen?: Types.ObjectId;

  @Prop()
  descripcion?: string;

  @Prop({ type: Types.ObjectId, ref: 'LiquidacionViatico' })
  liquidacion?: Types.ObjectId;

  @Prop({ default: 0 })
  montoLiquidado!: number;

  @Prop()
  montoReembolsado?: number;

  @Prop()
  montoDevuelto?: number;
}

export const AnticipoSchema = SchemaFactory.createForClass(Anticipo);

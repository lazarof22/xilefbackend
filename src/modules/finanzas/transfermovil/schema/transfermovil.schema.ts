import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EstadoTransfermovil } from '../types/transfermovil.types';

export type TransfermovilPagoDocument = HydratedDocument<TransfermovilPago>;

@Schema({ timestamps: true })
export class TransfermovilPago {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true, unique: true })
  idOperacion!: string;

  @Prop({ required: true, index: true })
  fecha!: Date;

  @Prop({ required: true })
  monto!: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Moneda' })
  moneda!: Types.ObjectId;

  @Prop({
    required: true,
    enum: EstadoTransfermovil,
    default: EstadoTransfermovil.PENDIENTE,
  })
  estado!: EstadoTransfermovil;

  @Prop()
  telefono?: string;

  @Prop()
  identificadorCliente?: string;

  @Prop()
  referencia?: string;

  @Prop({ type: Types.ObjectId, ref: 'CuentaCobrar' })
  cuentaCobrarVinculada?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Transaccion' })
  transaccionCreada?: Types.ObjectId;

  @Prop()
  descripcion?: string;

  @Prop({ type: Object })
  metadata?: Record<string, string>;
}

export const TransfermovilPagoSchema =
  SchemaFactory.createForClass(TransfermovilPago);

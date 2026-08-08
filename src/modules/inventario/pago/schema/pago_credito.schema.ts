import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Pago } from './pago.schema';

export type PagoCreditoDocument = HydratedDocument<PagoCredito>;

@Schema()
export class PagoCredito extends Pago {
  @Prop({ type: Types.ObjectId, ref: 'Cliente', required: true })
  clienteId!: Types.ObjectId;

  @Prop()
  monto_pagar?: number;
}

export const PagoCreditoSchema = SchemaFactory.createForClass(PagoCredito);

import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Pago } from './pago.schema';

export type PagoTransferenciaDocument = HydratedDocument<PagoTransferencia>;

@Schema()
export class PagoTransferencia extends Pago {
  @Prop()
  numeroCuenta!: string;

  @Prop()
  banco?: string;

  @Prop()
  notas?: string;

  @Prop()
  montoPagar!: number;

  // Compatibilidad con el contrato del frontend (ventaService)
  @Prop()
  ciCliente?: string;

  @Prop()
  nombreCliente?: string;

  @Prop()
  referenciaPago?: string;

  @Prop({ type: Types.ObjectId, ref: 'Cliente', required: false })
  clienteId?: Types.ObjectId;
}

export const PagoTransferenciaSchema =
  SchemaFactory.createForClass(PagoTransferencia);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Pago } from './pago.schema';

export type PagoEfectivoDocument = HydratedDocument<PagoEfectivo>;

@Schema()
export class DesgloseBilletes {
  @Prop({ required: true, default: 0 })
  billete5000!: number;

  @Prop({ required: true, default: 0 })
  billete2000!: number;

  @Prop({ required: true, default: 0 })
  billete1000!: number;

  @Prop({ required: true, default: 0 })
  billete500!: number;

  @Prop({ required: true, default: 0 })
  billete200!: number;

  @Prop({ required: true, default: 0 })
  billete100!: number;

  @Prop({ required: true, default: 0 })
  billete50!: number;

  @Prop({ required: true, default: 0 })
  billete20!: number;

  @Prop({ required: true, default: 0 })
  billete10!: number;

  @Prop({ required: true, default: 0 })
  billete5!: number;

  @Prop({ required: true, default: 0 })
  billete3!: number;

  @Prop({ required: true, default: 0 })
  billete1!: number;
}

export enum TipoCliente {
  CLIENTEESTANDAR = 'cliente-estandar',
  CLIENTEPORDESCUENTO = 'cliente-por-descuento',
  CLIENTECUENTACASA = 'cliente-cuenta-casa',
}

@Schema()
export class DatosClienteDescuento {
  @Prop({ required: true })
  nombre!: string;

  @Prop({ required: true })
  ci!: string;

  @Prop({ required: true })
  telefono!: string;
}

@Schema()
export class PagoEfectivo extends Pago {
  @Prop({ type: DesgloseBilletes, required: false })
  desglose?: DesgloseBilletes;

  @Prop({})
  monto_pagar_CUP!: number;

  @Prop({})
  monto_pagar_alCambio!: number;

  @Prop({ required: false })
  cambio?: number;

  @Prop({
    required: false,
    enum: TipoCliente,
    default: TipoCliente.CLIENTEESTANDAR,
  })
  cliente?: TipoCliente;

  @Prop()
  monto_pagado!: number;

  @Prop({ type: Types.ObjectId, ref: 'Moneda', required: false })
  moneda?: Types.ObjectId | string;

  // ✅ NUEVO: Datos del cliente cuando es "cliente-por-descuento"
  @Prop({ type: DatosClienteDescuento, required: false })
  datosClienteDescuento?: DatosClienteDescuento;

  // ✅ NUEVO: Indica si es cliente cuenta casa (monto pagado = 0)
  @Prop({ required: true, default: false })
  esCuentaCasa!: boolean;
}

export const PagoEfectivoSchema = SchemaFactory.createForClass(PagoEfectivo);

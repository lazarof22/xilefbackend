import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


export type VentaDocument = HydratedDocument<Venta>;

export enum VentaTipoPago {
    EFECTIVO = 'efectivo',
    TRANSFERENCIA = 'transferencia',
}

@Schema()
class ItemVenta {
    @Prop({ type: Types.ObjectId, ref: 'Producto', required: true })
    productoId!: Types.ObjectId;

    @Prop({ required: true })
    cantidad!: number;

    @Prop({ default: 0 })
    descuentoMonto!: number;

}



@Schema()
export class Venta {

    @Prop({ type: Types.ObjectId, ref: 'Cliente', required: true })
    clienteId!: Types.ObjectId;

    @Prop({ required: true })
    subtotal_venta!: number;

    @Prop({ required: true })
    descuento_total!: number;

    @Prop({ type: [ItemVenta], required: true })
    productos!: ItemVenta[];

    @Prop({ required: true })
    efectivo_pagado!: number;

    @Prop({ required: true })
    cambio_devuelto!: number;

    @Prop({ required: true })
    impuesto!: number;

    @Prop({ required: true, enum: VentaTipoPago })
    tipo_pago!: VentaTipoPago;

}

export const VentaSchema = SchemaFactory.createForClass(Venta);
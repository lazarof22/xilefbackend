import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


export type VentaDocument = HydratedDocument<Venta>;



@Schema()
class ItemVenta {
    @Prop({ type: Types.ObjectId, ref: 'Producto', required: true })
    productoId!: Types.ObjectId;

    @Prop({ required: true })
    cantidad!: number;

    @Prop({ default: 0 })
    descuentoMonto!: number;

}



@Schema({ timestamps: true })
export class Venta {

    @Prop({ required: true })
    subtotal_venta!: number;

    @Prop({ required: true })
    descuento_total!: number;

    @Prop({ type: [ItemVenta], required: true })
    productos!: ItemVenta[];

    @Prop({ required: true })
    impuesto!: number;

    @Prop({ required: true,type: Types.ObjectId, ref: 'Pago' })
    pago!: Types.ObjectId;

}

export const VentaSchema = SchemaFactory.createForClass(Venta);
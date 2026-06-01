import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type CompraDocument = HydratedDocument<Compra>;


export enum Pago {
    EFECTIVO = 'efectivo',
    TRANSFERENCIA= 'transferencia',
    CREDITO = 'credito'
}

@Schema()
class ItemCompra {
    @Prop({ type: Types.ObjectId, ref: 'Producto', required: true })
    productoId!: Types.ObjectId;

    @Prop({ required: true })
    cantidad!: number;

    @Prop({ required: true })
    precioCompra!: number;

}


@Schema()
export class Compra {

    @Prop({ type: [ItemCompra], required: true })
    productos!: ItemCompra[];

    @Prop({ required: true })
    subtotalCompra!: number;

    @Prop({ required: true })
    descuentoTotal!: number;

    @Prop({ type: Types.ObjectId, ref: 'Moneda', required: true })
    moneda!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Empresa', required: true })
    empresa!: Types.ObjectId;

    @Prop({ required: true, enum: Pago })
    modoPago!:Pago;

    @Prop()
    tasaBancoCentral!: number;  //????

    @Prop()
    tasaBancoInformal!: number; //????

    @Prop()
    fluctuacion!: number; //????

    @Prop({required: true})
    recargo!: number; // ???? 

}


export const CompraSchema = SchemaFactory.createForClass(Compra); 
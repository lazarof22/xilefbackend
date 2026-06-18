import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Pago } from "./pago.schema";


export type PagoTransferenciaDocument = HydratedDocument<PagoTransferencia>;

@Schema()
export class PagoTransferencia extends Pago {
    @Prop({ required: true, unique: true })
    ciCliente!: string;

    @Prop({ required: true })
    nombreCliente!: string;

    @Prop({ required: true, unique: true })
    referenciaPago!: string;

    @Prop()
    monto_pagado!: number;

}

export const PagoTransferenciaSchema = SchemaFactory.createForClass(PagoTransferencia);
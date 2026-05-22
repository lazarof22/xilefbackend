import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type PagoDocument = HydratedDocument<Pago>;

@Schema({
    discriminatorKey: 'tipoPago',
    timestamps: true
})

export class Pago {

    @Prop({ required: true })
    monto_pagado!: number;

    @Prop({ required: true, enum: ['efectivo', 'transferencia', 'credito'] })
    metodoPago!: string;
}

export const PagoSchema = SchemaFactory.createForClass(Pago);
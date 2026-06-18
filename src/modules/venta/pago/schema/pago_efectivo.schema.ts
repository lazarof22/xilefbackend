import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Pago } from "./pago.schema";

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




@Schema()
export class PagoEfectivo extends Pago {

    @Prop({ required: true, type: DesgloseBilletes })
    desglose!: DesgloseBilletes;

    @Prop({ required: true })
    monto_pagar!: number;

    @Prop({ required: true})
    cambio!:number;
    
    @Prop()
    monto_pagado!: number;
}

export const PagoEfectivoSchema = SchemaFactory.createForClass(PagoEfectivo);
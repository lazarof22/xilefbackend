import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Pago } from "./pago.schema";

export type PagoCreditoDocument = HydratedDocument<PagoCredito>;

@Schema()
export class PagoCredito extends Pago {

}

export const PagoCreditoSchema = SchemaFactory.createForClass(PagoCredito);
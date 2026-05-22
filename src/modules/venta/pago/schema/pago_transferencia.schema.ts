import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Pago } from "./pago.schema";


export type PagoTransferenciaDocument = HydratedDocument<PagoTransferencia>;

@Schema()
export class PagoTransferencia extends Pago{

}

export const PagoTransferenciaSchema = SchemaFactory.createForClass(PagoTransferencia);
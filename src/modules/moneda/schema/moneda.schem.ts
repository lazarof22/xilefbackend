import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type MonedaDocument = HydratedDocument<Moneda>;

@Schema()
export class Moneda {


    @Prop({required:true, unique: true })
    tipo_moneda: string;
}

export const MonedaSchema = SchemaFactory.createForClass(Moneda);
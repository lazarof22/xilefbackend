import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type PaisDocument = HydratedDocument<Concepto>;

@Schema()
export class Concepto {


    @Prop({required:true, unique: true })
    nombreConcepto!: string;
}

export const ConceptoSchema = SchemaFactory.createForClass(Concepto);
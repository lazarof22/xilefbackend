import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type PaisDocument = HydratedDocument<Pais>;

@Schema()
export class Pais {


    @Prop({required:true, unique: true })
    nombrePais!: string;
}

export const PaisSchema = SchemaFactory.createForClass(Pais);
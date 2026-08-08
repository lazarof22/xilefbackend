import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


export type BancoDocument = HydratedDocument<Banco>;


@Schema()
export class Banco {
    
    @Prop({required:true, unique:true})
    nombreBanco!: string;
}


export const BancoSchema = SchemaFactory.createForClass(Banco);
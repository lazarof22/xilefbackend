import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


export type DepartamentoDocument = HydratedDocument<Departamento>;



@Schema()
export class Departamento {

    @Prop({ required: true ,unique:true})
    nombre_departamento!: string;
}

export const DepartamentoSchema = SchemaFactory.createForClass(Departamento);
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


export type ClienteDocument = HydratedDocument<Cliente>;

@Schema()
export class Cliente {
    @Prop({required:true, unique: true })
    id_cliente: string;

    @Prop({ required: true})
    nombre_cliente: string;

    @Prop({required:true})
    telefono_cliente: string;

    @Prop({required:true})
    email_cliente:string;

    @Prop({required:true})
    direccion_cliente:string;

    @Prop({required:true})
    tipo_cliente:string;

}

export const ClienteSchema = SchemaFactory.createForClass(Cliente);
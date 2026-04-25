import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type EstadoDocument = HydratedDocument<Estado>;


export enum EstadoTipo {
    ACTIVO = 'activo',
    INACTIVO = 'inactivo',
}

@Schema()
export class Estado {

    @Prop({ required: true, enum: EstadoTipo })
    estado!: EstadoTipo;
}

export const EstadoSchema = SchemaFactory.createForClass(Estado);
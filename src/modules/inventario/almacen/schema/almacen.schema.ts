import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type AlmacenDocument = HydratedDocument<Almacen>;

@Schema({
    timestamps: true
})

export class Almacen {

    @Prop({ required: true })
    nombreAlmacen!: string;

    @Prop({ required: true, min: 0, default: 0 })
    cantidadContenedores!: number;
}

export const AlmacenSchema = SchemaFactory.createForClass(Almacen);
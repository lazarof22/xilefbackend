import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Date, HydratedDocument, Types } from "mongoose";

export type KardexDocument = HydratedDocument<Kardex>;

export enum KardexTipo {
    ENTRADA = 'entrada',
    SALIDA = 'salida',
}

@Schema()

export class Kardex {

    @Prop({ type: Date, default: Date.now })
    fecha: Date;

    
    @Prop({ type: Types.ObjectId, ref: 'Producto', required: true })
    productoId: Types.ObjectId;


    @Prop({ required: true, enum: KardexTipo })
    tipo: KardexTipo;

    @Prop({ required: true })
    cantidad: number;

    @Prop({ required: true })
    motivo: string;
}

export const KardexSchema = SchemaFactory.createForClass(Kardex);
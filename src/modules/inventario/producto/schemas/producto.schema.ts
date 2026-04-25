import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


export type ProductoDocument = HydratedDocument<Producto>;

@Schema()
export class Producto {
    @Prop({ required: true, unique: true })
    codigo_producto!: string;

    @Prop({ required: true })
    nombre_producto!: string;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Categoria', })
    categoria_producto!: Types.ObjectId;

    @Prop({ required: true })
    precio_compra!: number;

    @Prop({ required: true })
    precio_venta!: number;

    @Prop({ required: true })
    stock_inicial!: number; //cantidad inicial

    @Prop({ required: true })
    stock_minimo!: number; // cantidad minima que debe haber

    @Prop({ required: true,type:Types.ObjectId, ref: 'Estado' })
    estado!: Types.ObjectId;

}

export const ProductoSchema = SchemaFactory.createForClass(Producto);
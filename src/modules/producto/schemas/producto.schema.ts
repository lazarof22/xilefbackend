import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


export type ProductoDocument = HydratedDocument<Producto>;

export enum ProductoEstado {
    ACTIVO = 'activo',
    INACTIVO = 'inactivo',
}

export enum ProductoCategoria {
    TECNOLOGÍAS = 'tecnologías',
    ELECTRODOMÉSTICOS = 'electrodomésticos',
    ACCESORIOS = 'accesorios',
    OFICINA = 'oficina',
}

@Schema()
export class Producto {
    @Prop({ required: true, unique: true })
    codigo_producto: string;

    @Prop({ required: true })
    nombre_producto: string;

    @Prop({ required: true, enum:ProductoCategoria })
    categoria_producto: ProductoCategoria;

    @Prop({ required: true })
    precio_compra: number;

    @Prop({ required: true })
    precio_venta: number;

    @Prop({ required: true })
    stock_inicial: number; //cantidad inicial

    @Prop({ required: true })
    stock_minimo: number; // cantidad minima que debe haber

    @Prop({ required: true, enum: ProductoEstado })
    estado: ProductoEstado;


}

export const ProductoSchema = SchemaFactory.createForClass(Producto);
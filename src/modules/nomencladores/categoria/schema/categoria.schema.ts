import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CategoriaDocument = HydratedDocument<Categoria>;

export enum ProductoCategoria {
    TECNOLOGÍAS = 'tecnologías',
    ELECTRODOMÉSTICOS = 'electrodomésticos',
    ACCESORIOS = 'accesorios',
    OFICINA = 'oficina'
}

@Schema()
export class Categoria {

    @Prop({ required: true , enum:ProductoCategoria})
    nombre_categoria!: ProductoCategoria;
}

export const CategoriaSchema = SchemaFactory.createForClass(Categoria);
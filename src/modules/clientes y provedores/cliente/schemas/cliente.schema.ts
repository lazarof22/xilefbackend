import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


export type ClienteDocument = HydratedDocument<Cliente>;

export enum TipoCliente {
    ESTANDAR = 'cliente_estandar',
    DESCUENTO = 'cliente_descuento',
    CUENTA_CASA = 'cliente_cuenta_casa',
}

@Schema()
export class Cliente {
    @Prop({ required: true, unique: true })
    id_cliente!: string; //ci???

    @Prop({ required: true })
    nombre_cliente!: string;

    @Prop({ required: true, unique: true })
    telefono_cliente!: string;

    @Prop({ required: true, unique: true })
    email_cliente!: string;

    @Prop({ required: true })
    direccion_cliente!: string;

    @Prop({
        required: true,
        enum: Object.values(TipoCliente),
        default: TipoCliente.ESTANDAR
    })
    tipo_cliente!: TipoCliente;

}

export const ClienteSchema = SchemaFactory.createForClass(Cliente);
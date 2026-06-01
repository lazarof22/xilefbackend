import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export enum NaturalezaCuenta {
    DEUDORA = 'deudora',
    ACREDORA = 'acredora',
}

export enum TipoCuenta {
    ACTIVO = 'activo',
    PASIVO = 'pasivo',
    GASTO = 'gasto',
}

export type CuentaDocument = HydratedDocument<Cuenta>;

@Schema()
export class Cuenta {

    @Prop({ required: true, unique: true })
    codigoCuenta!: string;

    @Prop({ required: true })
    nombreCuenta!: string;

    @Prop({ required: true, enum: TipoCuenta })
    tipoCuenta!: TipoCuenta;

    @Prop({ required: true, enum: NaturalezaCuenta })
    naturalezaCuenta!: NaturalezaCuenta;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Estado' })
    estadoCuenta!: Types.ObjectId;

}

export const CuentaSchema = SchemaFactory.createForClass(Cuenta);
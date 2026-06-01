import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {HydratedDocument, Types } from "mongoose";

export enum MovimientoActivoFijo {
  ALTA = 'ALTA',
  BAJA = 'BAJA',
}

export type ActivoFijoDocument = HydratedDocument<ActivoFijo>;


@Schema()
export class ActivoFijo {

    @Prop({ required:true, unique:true})
    codigoActivo!: string;

    @Prop({ required: true })
    descripcionActivo!: string;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Empresa' })
    proveedor!: Types.ObjectId;

    @Prop({required:true, type: Types.ObjectId, ref: 'Area'})
    area!:Types.ObjectId

    @Prop({ type: Date})
    fechaCompra!: Date;
    
    @Prop({ required: true })
    valor!: number;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Tasa_Depreciacion' })
    depreciacionActivo!:number;

    @Prop({ required: true })
    depreciacionAcumulada!: number;

    @Prop({ required: true })
    vidaUtil!: number; //años

    @Prop({ required: true })
    compra!: string;

    @Prop({ required: true })
    ajusteValor!: number;

    @Prop({ required: true, enum: MovimientoActivoFijo, default: MovimientoActivoFijo.ALTA })
    movimiento!: MovimientoActivoFijo;

    @Prop({ type: Types.ObjectId, ref: 'Estado', required: true })
    estadoActivo!: Types.ObjectId;
}

export const Activo_FijoSchema = SchemaFactory.createForClass(ActivoFijo);
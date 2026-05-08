import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {HydratedDocument, Types } from "mongoose";

export type Activo_FijoDocument = HydratedDocument<Activo_Fijo>;


@Schema()

export class Activo_Fijo {

    @Prop({ required:true, unique:true})
    codigo_activo!: string;

    @Prop({ required: true })
    descripcion_activo!: string;

    @Prop({required:true, type: Types.ObjectId, ref: 'Area'})
    area!:Types.ObjectId

    @Prop({ type: Date})
    fecha_compra!: Date;
    
    @Prop({ required: true })
    valor!: number;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Tasa_Depreciacion' })
    depreciacion_activo!: number;

    @Prop({ required: true })
    altas_activo!: number; //??

    @Prop({ required: true })
    bajas_activo!: number; //??

    @Prop({ required: true })
    compra!: string;

    @Prop({ required: true })
    ajuste_valor!: number;

    @Prop({ required: true })
    movimiento!:string;

    @Prop({ type: Types.ObjectId, ref: 'Estado', required: true })
    estado_activo!: Types.ObjectId;
}

export const Activo_FijoSchema = SchemaFactory.createForClass(Activo_Fijo);
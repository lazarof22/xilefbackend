import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {HydratedDocument, Types } from "mongoose";

export type ReportePlusDocument = HydratedDocument<ReportePlus>;

@Schema({ timestamps: true })

export class ReportePlus {

    @Prop({ type: Date, default: Date.now })
    fecha!: Date;

    @Prop({ type: Types.ObjectId, ref: 'Producto', required: true })
    productoId!: Types.ObjectId;

    @Prop({ required: true, min: 1 })
    cantidad!: number;

    @Prop({ required: true, min: 0 })
    stockfinal!: number;

    @Prop({ required: true })
    descuento!: number;

    @Prop({ required: true })
    impuesto!: string;

    @Prop({ required: true })
    totalPagado!: number;
}

export const ReportePlusSchema = SchemaFactory.createForClass(ReportePlus);
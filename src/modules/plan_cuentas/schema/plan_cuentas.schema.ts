import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


export type Plan_CuentasDocument = HydratedDocument<Plan_Cuentas>;

@Schema()
export class Plan_Cuentas {

    @Prop({ required: true, unique: true })
    codigo_plan_cuentas: string;

    @Prop({required:true })
    nombre_plan_cuentas: string;

    @Prop({required:true})
    tipo_plan : string;

    @Prop({required:true})
    naturaleza_plan : string;

    @Prop({required:true})
    estado_plan;

}

export const Plan_CuentasSchema = SchemaFactory.createForClass(Plan_Cuentas);
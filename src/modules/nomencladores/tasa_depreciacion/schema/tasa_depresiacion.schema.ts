import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type Tasa_DepreciacionDocument = HydratedDocument<Tasa_Depreciacion>;

@Schema()
export class Tasa_Depreciacion{
    
    @Prop()
    tasa_depreciacion!:number;
}

export const Tasa_DepreciacionSchema = SchemaFactory.createForClass(Tasa_Depreciacion);
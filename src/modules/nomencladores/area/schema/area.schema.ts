import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


export type AreaDocument = HydratedDocument<Area>;


@Schema()
export class Area {
    
    @Prop({required:true, unique:true})
    nombre_area!: string;
}


export const AreaSchema = SchemaFactory.createForClass(Area);



import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
export class Area {
    
    @Prop({required:true, unique:true})
    nombre_area!: string;
}
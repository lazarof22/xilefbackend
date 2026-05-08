import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CargoEmpleadoDocument = HydratedDocument<CargoEmpleado>;

@Schema()
export class CargoEmpleado {

    @Prop({required:true})
    nombre_cargo! : string;

}

export const CargoEmpleadoSchema = SchemaFactory.createForClass(CargoEmpleado);
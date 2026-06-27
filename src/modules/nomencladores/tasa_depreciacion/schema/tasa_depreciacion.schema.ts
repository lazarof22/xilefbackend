import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type Tasa_DepreciacionDocument = HydratedDocument<Tasa_Depreciacion>;

@Schema({ timestamps: true })
export class Tasa_Depreciacion {
  @Prop({ required: true })
  tasa_depreciacion!: number;

  @Prop({ required: true })
  descripcion!: string;
}

export const Tasa_DepreciacionSchema = SchemaFactory.createForClass(Tasa_Depreciacion);

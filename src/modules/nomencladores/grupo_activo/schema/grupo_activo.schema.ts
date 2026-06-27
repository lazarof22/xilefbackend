import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GrupoActivoDocument = HydratedDocument<GrupoActivo>;

@Schema({ timestamps: true })
export class GrupoActivo {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true })
  nombre!: string;

  @Prop()
  descripcion?: string;

  @Prop({ required: true })
  vidaUtilMinima!: number;

  @Prop({ required: true })
  vidaUtilMaxima!: number;

  @Prop({ required: true })
  tasaDepreciacionMinima!: number;

  @Prop({ required: true })
  tasaDepreciacionMaxima!: number;

  @Prop({ default: true })
  activo!: boolean;
}

export const GrupoActivoSchema = SchemaFactory.createForClass(GrupoActivo);

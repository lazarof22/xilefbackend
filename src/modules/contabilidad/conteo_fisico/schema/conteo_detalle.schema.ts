import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ConteoDetalleDocument = HydratedDocument<ConteoDetalle>;

export enum ResultadoConteo {
  COINCIDE = 'coincide',
  SOBRANTE = 'sobrante',
  FALTANTE = 'faltante',
  DANADO = 'danado',
  MAL_UBICADO = 'mal_ubicado',
}

@Schema({ timestamps: true })
export class ConteoDetalle {
  @Prop({ required: true, type: Types.ObjectId, ref: 'ConteoFisico', index: true })
  conteoFisico!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ActivoFijo' })
  activoFijo?: Types.ObjectId;

  @Prop()
  codigoActivoSistema?: string;

  @Prop()
  descripcionActivoSistema?: string;

  @Prop()
  ubicacionSistema?: string;

  @Prop()
  ubicacionReal?: string;

  @Prop({ required: true, enum: ResultadoConteo })
  resultado!: ResultadoConteo;

  @Prop()
  observaciones?: string;

  @Prop()
  cantidadSistema!: number;

  @Prop({ default: 1 })
  cantidadReal!: number;
}

export const ConteoDetalleSchema = SchemaFactory.createForClass(ConteoDetalle);

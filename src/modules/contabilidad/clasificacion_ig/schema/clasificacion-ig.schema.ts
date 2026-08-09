import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum TipoClasificacionIG {
  INGRESO = 'Ingreso',
  GASTO = 'Gasto',
}

export type ClasificacionIGDocument = HydratedDocument<ClasificacionIG>;

@Schema({ timestamps: true })
export class ClasificacionIG {
  @Prop({ required: true, unique: true, type: Types.ObjectId, ref: 'Cuenta' })
  cuentaId!: Types.ObjectId;

  @Prop({ required: true })
  cuentaNombre!: string;

  @Prop({ required: true, enum: TipoClasificacionIG })
  tipo!: TipoClasificacionIG;
}

export const ClasificacionIGSchema =
  SchemaFactory.createForClass(ClasificacionIG);

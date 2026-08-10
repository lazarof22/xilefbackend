import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CentroCostoDocument = HydratedDocument<CentroCosto>;

export enum TipoCentroCosto {
  ADMINISTRACION = 'administracion',
  PRODUCCION = 'produccion',
  VENTAS = 'ventas',
  SERVICIOS = 'servicios',
  LOGISTICA = 'logistica',
  OTRO = 'otro',
}

@Schema({ timestamps: true })
export class CentroCosto {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true })
  nombre!: string;

  @Prop({
    required: true,
    enum: TipoCentroCosto,
    default: TipoCentroCosto.OTRO,
  })
  tipo!: TipoCentroCosto;

  @Prop({ type: Types.ObjectId, ref: 'Departamento' })
  departamento?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CentroCosto', default: null })
  centroPadre?: Types.ObjectId;

  @Prop({ default: true })
  activo!: boolean;

  @Prop()
  descripcion?: string;
}

export const CentroCostoSchema = SchemaFactory.createForClass(CentroCosto);

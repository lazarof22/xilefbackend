import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GastoIndirectoDocument = HydratedDocument<GastoIndirecto>;

export enum MetodoProrrateo {
  HORAS_DIRECTAS = 'horas_directas',
  UNIDADES_PRODUCIDAS = 'unidades_producidas',
  VALOR_MATERIA_PRIMA = 'valor_materia_prima',
  MANO_OBRA_DIRECTA = 'mano_obra_directa',
  PORCENTAJE = 'porcentaje',
}

@Schema({ timestamps: true })
export class GastoIndirecto {
  @Prop({ required: true, unique: true })
  codigo!: string;

  @Prop({ required: true })
  descripcion!: string;

  @Prop({ required: true })
  monto!: number;

  @Prop({
    type: Types.ObjectId,
    ref: 'CentroCosto',
    required: true,
    index: true,
  })
  centroCosto!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TipoGasto' })
  tipoGasto?: Types.ObjectId;

  @Prop({
    required: true,
    enum: MetodoProrrateo,
    default: MetodoProrrateo.PORCENTAJE,
  })
  metodoProrrateo!: MetodoProrrateo;

  @Prop({ default: 0 })
  porcentajeProrrateo?: number;

  @Prop({ default: false })
  distribuido!: boolean;

  @Prop({ required: true, index: true })
  periodo!: string;

  @Prop({ type: Types.ObjectId, ref: 'Moneda' })
  moneda?: Types.ObjectId;

  @Prop()
  fechaRegistro!: Date;

  @Prop()
  observaciones?: string;
}

export const GastoIndirectoSchema =
  SchemaFactory.createForClass(GastoIndirecto);

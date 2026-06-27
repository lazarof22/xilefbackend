import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ActivoFijoDocument = HydratedDocument<ActivoFijo>;

export enum MetodoDepreciacion {
  LINEA_RECTA = 'linea_recta',
}

@Schema({ timestamps: true })
export class ActivoFijo {
  @Prop({ required: true, unique: true })
  codigoActivo!: string;

  @Prop({ required: true })
  descripcionActivo!: string;

  @Prop()
  marca?: string;

  @Prop()
  modelo?: string;

  @Prop()
  numeroSerie?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Empresa' })
  proveedor!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Area' })
  area!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Categoria' })
  grupoActivo?: Types.ObjectId;

  @Prop({ required: true })
  fechaCompra!: Date;

  @Prop()
  fechaPuestaMarcha?: Date;

  @Prop({ required: true })
  valorAdquisicion!: number;

  @Prop({ required: true })
  valorResidual!: number;

  @Prop({ required: true })
  vidaUtil!: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Tasa_Depreciacion' })
  tasaDepreciacion!: Types.ObjectId;

  @Prop({
    required: true,
    enum: MetodoDepreciacion,
    default: MetodoDepreciacion.LINEA_RECTA,
  })
  metodoDepreciacion!: MetodoDepreciacion;

  @Prop({ required: true, default: 0 })
  depreciacionAnual!: number;

  @Prop({ required: true, default: 0 })
  depreciacionMensual!: number;

  @Prop({ required: true, default: 0 })
  depreciacionAcumulada!: number;

  @Prop({ required: true, default: 0 })
  valorEnLibros!: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Moneda' })
  moneda!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Pais' })
  pais?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Concepto' })
  concepto?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Estado', required: true })
  estadoActivo!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Cuenta' })
  cuentaDebe?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Cuenta' })
  cuentaHaber?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Cuenta' })
  cuentaDepreciacion?: Types.ObjectId;

  @Prop()
  numeroFactura?: string;

  @Prop()
  ordenCompra?: string;

  @Prop()
  observaciones?: string;

  @Prop({ default: 0 })
  ajusteValor!: number;

  @Prop()
  fechaUltimaDepreciacion?: Date;

  @Prop({ default: true })
  activo!: boolean;

  @Prop()
  fechaBaja?: Date;

  @Prop()
  motivoBaja?: string;

  @Prop()
  valorBaja?: number;

  @Prop()
  tipoBaja?: string;

  @Prop()
  documentoBaja?: string;

  @Prop()
  gananciaPerdidaBaja?: number;

  @Prop({ default: 0 })
  revaluacionAcumulada!: number;

  @Prop()
  fechaUltimaRevaluacion?: Date;

  @Prop()
  valorAvaluo?: number;

  @Prop()
  entidadAvaluadora?: string;
}

export const ActivoFijoSchema = SchemaFactory.createForClass(ActivoFijo);

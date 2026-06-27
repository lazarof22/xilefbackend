import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum TipoMovimiento {
  ALTA = 'alta',
  MODIFICACION = 'modificacion',
  TRASLADO = 'traslado',
  BAJA_PARCIAL = 'baja_parcial',
  BAJA_TOTAL = 'baja_total',
  REVALUACION = 'revaluacion',
  DEPRECIACION = 'depreciacion',
  REPARACION = 'reparacion',
}

export type MovimientoDocument = HydratedDocument<Movimiento>;

@Schema({ timestamps: true })
export class Movimiento {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'ActivoFijo',
    index: true,
  })
  activoFijo!: Types.ObjectId;

  @Prop({ required: true, enum: TipoMovimiento, index: true })
  tipo!: TipoMovimiento;

  @Prop({ required: true })
  fechaMovimiento!: Date;

  @Prop({ required: true })
  descripcion!: string;

  @Prop({ type: Types.ObjectId, ref: 'Area' })
  areaOrigen?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Area' })
  areaDestino?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Estado' })
  estadoAnterior?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Estado' })
  estadoNuevo?: Types.ObjectId;

  @Prop()
  valorAnterior?: number;

  @Prop()
  valorNuevo?: number;

  @Prop()
  depreciacionAcumuladaAnterior?: number;

  @Prop()
  depreciacionAcumuladaNueva?: number;

  @Prop()
  valorBaja?: number;

  @Prop()
  motivoBaja?: string;

  @Prop()
  costoReparacion?: number;

  @Prop({ type: Types.ObjectId, ref: 'Empresa' })
  proveedorReparacion?: Types.ObjectId;

  @Prop()
  documentoReferencia?: string;
}

export const MovimientoSchema = SchemaFactory.createForClass(Movimiento);

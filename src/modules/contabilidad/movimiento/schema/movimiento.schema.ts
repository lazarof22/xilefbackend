import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum TipoMovimiento {
  TRASLADO = 'traslado',                  // Cambio de área/ubicación
  ENVIADO_REPARAR = 'enviado_a_reparar', // A taller  
  BAJA = 'baja',                          // Retiro del activo
  ACTIVO_OSCIOSO = 'activo_oscioso',      // Inactivo temporalmente  
}

export type MovimientoDocument = HydratedDocument<Movimiento>;

@Schema()
export class Movimiento {

  @Prop({ required: true, type: Types.ObjectId, ref: 'ActivoFijo', index: true })
  activoFijo!: Types.ObjectId;

  @Prop({ required: true, enum: TipoMovimiento })
  tipo!: TipoMovimiento;

  @Prop({ required: true })
  fechaMovimiento!: Date;

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
  descripcion!: string;
}

export const MovimientoSchema = SchemaFactory.createForClass(Movimiento);